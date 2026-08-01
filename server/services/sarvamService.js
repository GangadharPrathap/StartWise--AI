import { SARVAM_API_KEY } from "../config/env.js";
import fs from "fs";

/**
 * Sarvam AI Service for Real Voice Interaction
 */
export const sarvamService = {
  /**
   * Speech-to-Text: Converts audio file to text
   * @param {string} filePath - Path to the audio file
   * @param {string} model - 'saarika:v1' or similar
   */
  async speechToText(filePath, model = 'saarika:v1') {
    if (!SARVAM_API_KEY) {
      console.warn("SARVAM_API_KEY is not configured. Returning null.");
      return null;
    }

    const formData = new FormData();
    formData.append('file', new Blob([fs.readFileSync(filePath)]), 'audio.wav');
    formData.append('model', model);

    const response = await fetch('https://api.sarvam.ai/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam STT failed: ${err}`);
    }

    const data = await response.json();
    return data.transcript;
  },

  /**
   * Text-to-Speech: Converts text to realistic audio
   * @param {string} text - Text to convert
   * @param {string} targetLanguage - Language code (e.g., 'en-IN', 'hi-IN')
   * @param {string} speaker - Speaker persona
   */
  async textToSpeech(text, targetLanguage = 'en-IN', speaker = 'meera') {
    if (!SARVAM_API_KEY) {
      return { audioContent: null, provider: 'none', message: 'SARVAM_API_KEY is not configured. Using browser TTS fallback.' };
    }

    const response = await fetch('https://api.sarvam.ai/v1/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: targetLanguage,
        speaker: speaker,
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        enable_preprocessing: true,
        model: 'bulbul:v1'
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam TTS failed: ${err}`);
    }

    const data = await response.json();
    // Sarvam usually returns base64 or a link. Assuming base64 in 'audios' array
    return {
      audioContent: data.audios[0],
      provider: 'Sarvam AI'
    };
  }
};

export default sarvamService;
