import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useVCStore } from '../store/useVCStore';
import { apiClient } from '../utils/apiClient';
import { auth } from '../services/firebase';

/**
 * Hook for managing structured AI VC Simulator conversation
 */
export function useChat() {
  const { 
    messages, 
    setMessages,
    addMessage, 
    setTyping, 
    setSpeaking, 
    setListening,
    isTyping,
    isSpeaking,
    isListening 
  } = useChatStore();

  const { setScore, setEvaluating, setStatus } = useVCStore();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const sessionIdRef = useRef(0);

  /**
   * Start Session
   */
  const startSession = useCallback(async (persona = 'yc') => {
    const currentSessionId = ++sessionIdRef.current;
    setTyping(true);
    setStatus('pitching');
    try {
      const response = await apiClient.post('/vc/start-session', { persona });
      if (currentSessionId !== sessionIdRef.current) return;
      const data = response.data;
      
      setMessages([{ role: 'assistant', content: data.response, tone: data.tone }]);
      
      // Auto-TTS for introduction
      handleTTS(data.response, persona);
    } catch (err) {
      if (currentSessionId !== sessionIdRef.current) return;
      console.error("Start Session Error:", err);
    } finally {
      if (currentSessionId === sessionIdRef.current) {
        setTyping(false);
      }
    }
  }, [setMessages, setTyping, setStatus]);

  /**
   * Send Message
   */
  const sendMessage = useCallback(async (text, persona = 'yc') => {
    if (!text.trim()) return;

    addMessage({ role: 'user', content: text });
    setTyping(true);

    try {
      const response = await apiClient.post('/vc/chat', { 
        message: text, 
        history: messages,
        persona: persona
      });
      
      const data = response.data;
      addMessage({ 
        role: 'assistant', 
        content: data.response, 
        tone: data.tone,
        confidence: data.confidence,
        metrics: data.metrics 
      });

      // Sync partial metrics to store if available
      if (data.metrics) {
        setScore({ breakdown: data.metrics, overallScore: data.confidence / 10 });
      }

      handleTTS(data.response, persona);
      return data.response;
    } catch (err) {
      console.error("Chat error:", err);
      addMessage({ role: 'assistant', content: "Sorry, I'm losing connection. Can you repeat that?" });
    } finally {
      setTyping(false);
    }
  }, [messages, addMessage, setTyping, setScore]);

  /**
   * Final Evaluation
   */
  const evaluatePitch = useCallback(async (persona = 'yc') => {
    setEvaluating(true);
    setStatus('evaluating');
    try {
      const response = await apiClient.post('/vc/evaluate', { 
        history: messages,
        persona: persona
      });
      setScore(response.data);
      setStatus('finished');

      // Save VC session to PostgreSQL (non-blocking)
      try {
        await apiClient.post('/vc/save-session', {
          firebaseUid: auth?.currentUser?.uid,
          email: auth?.currentUser?.email,
          persona,
          history: messages,
          score: response.data
        });
      } catch (dbErr) {
        console.warn("VC session DB save (non-critical):", dbErr.message);
      }

      return response.data;
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  }, [messages, setScore, setEvaluating, setStatus]);

  /**
   * Stop TTS
   */
  const stopTTS = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, [setSpeaking]);

  /**
   * TTS using Sarvam
   */
  const handleTTS = useCallback(async (text, persona = 'yc') => {
    if (isSpeaking) return;
    setSpeaking(true);
    try {
      const response = await apiClient.post('/vc/text-to-speech', { text, persona });
      if (response.data?.audioContent) {
        const audioUrl = `data:audio/mp3;base64,${response.data.audioContent}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => { setSpeaking(false); currentAudioRef.current = null; };
        audio.onerror = () => { setSpeaking(false); currentAudioRef.current = null; };
        audio.play();
      } else {
        // Browser Web Speech API fallback
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeaking(false);
        }
      }
    } catch (err) {
      console.error('TTS Error:', err);
      // Fallback to browser TTS on error too
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setSpeaking(false);
      }
    }
  }, [isSpeaking, setSpeaking]);

  /**
   * Voice STT — uses browser Web Speech Recognition API (free, no key needed)
   * CONTINUOUS mode: builds up transcript while user speaks.
   * When user stops recording, transcript is returned via onTranscript callback.
   * The user then clicks Send when ready — NO auto-sending.
   */
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const onTranscriptRef = useRef(null);

  const startRecording = useCallback(async (persona = 'yc', onTranscript) => {
    stopTTS();
    transcriptRef.current = '';
    onTranscriptRef.current = onTranscript || null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;  // Show live transcription
      recognition.maxAlternatives = 1;
      recognition.continuous = true;      // Don't stop after one sentence

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const fullText = (finalTranscript + interimTranscript).trim();
        transcriptRef.current = fullText;
        
        // Update the input field in real-time via callback
        if (onTranscriptRef.current) {
          onTranscriptRef.current(fullText);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setListening(false);
        }
      };

      recognition.onend = () => {
        // Don't auto-restart — user explicitly stops via button
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      return;
    }

    // Fallback: record audio blob and send to Sarvam server-side STT
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.wav');
        setListening(false);
        try {
          const sttRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/vc/speech-to-text`, { method: 'POST', body: formData });
          const sttData = await sttRes.json();
          if (sttData.data?.transcript && onTranscriptRef.current) {
            onTranscriptRef.current(sttData.data.transcript);
          }
        } catch (err) {
          console.error("STT error:", err);
        }
      };
      mediaRecorderRef.current.start();
      setListening(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  }, [setListening, stopTTS]);

  const stopRecording = useCallback(() => {
    // Stop browser speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    messages,
    isTyping,
    isSpeaking,
    isListening,
    startSession,
    sendMessage,
    evaluatePitch,
    handleTTS,
    startRecording,
    stopRecording,
    stopTTS
  };
}
