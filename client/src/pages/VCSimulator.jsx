import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  BrainCircuit, 
  Mic, 
  Send, 
  TrendingUp, 
  Target, 
  Users, 
  Award, 
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Volume2,
  Square,
  Sparkles,
  Info,
  AlertCircle,
  Activity
} from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { useVCStore } from '../store/useVCStore'

function Waveform({ isActive }) {
  return (
    <div className="flex items-center gap-1 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={isActive ? {
            height: [10, 40, 15, 35, 10],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#3b82f6']
          } : {
            height: 4,
            backgroundColor: '#1f2937'
          }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
          className="w-1 rounded-full"
        />
      ))}
    </div>
  )
}

export default function VCSimulator() {
  const { 
    messages, 
    isTyping, 
    isSpeaking,
    isListening,
    startSession,
    sendMessage, 
    handleTTS,
    evaluatePitch,
    startRecording,
    stopRecording,
    stopTTS
  } = useChat()
  
  const { 
    sessionScore, 
    isEvaluating,
    sessionStatus 
  } = useVCStore()

  const [input, setInput] = useState('')
  const [persona, setPersona] = useState('yc')
  const [hasStarted, setHasStarted] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-start session once on first mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true)
      startSession(persona)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      // Stop all audio when navigating away from VC Simulator
      stopTTS()
      stopRecording()
    }
  }, [stopTTS, stopRecording])

  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona)
    startSession(newPersona)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setInput('')
    stopTTS()
    await sendMessage(userMsg, persona)
  }

  const PERSONAS = [
    { id: 'yc', name: 'Paul Graham', style: 'Lean & Technical', icon: Zap },
    { id: 'sequoia', name: 'Roelof Botha', style: 'Moats & Scale', icon: TrendingUp },
    { id: 'angel', name: 'Naval Ravikant', style: 'Insight-driven', icon: BrainCircuit },
    { id: 'aggressive', name: 'Kevin O\'Leary', style: 'Cold & Blunt', icon: Activity },
    { id: 'analytical', name: 'Data Analyst', style: 'Metrics-driven', icon: ShieldCheck },
  ]

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 h-[calc(100vh-120px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
            <BrainCircuit className="text-accent w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              AI VC <span className="text-accent">Simulator</span>
              <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Enterprise Engine</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">High-Fidelity Pitch Simulation</p>
          </div>
        </div>

        <div className="flex gap-2 bg-gray-900/40 p-1 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePersonaChange(p.id)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-2 ${persona === p.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <p.icon size={12} /> {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-8 flex flex-col bg-gray-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md relative shadow-2xl">
          {/* Tone Overlay */}
          <AnimatePresence>
            {isTyping && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/60 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                  <Sparkles size={12} className="text-accent animate-pulse" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">AI Investor is thinking...</span>
               </motion.div>
            )}
          </AnimatePresence>

          <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare size={14} className="text-accent" />
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Session Active — {PERSONAS.find(p => p.id === persona)?.name}
              </span>
            </div>
            
            <button onClick={() => evaluatePitch(persona)} disabled={isEvaluating || messages.length < 4} className="px-6 py-2 rounded-xl bg-accent text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-accent/20">
              {isEvaluating ? 'Simulating Decision...' : 'Finish Pitch'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar scroll-smooth">
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-xs font-black border ${m.role === 'user' ? 'bg-accent/20 border-accent/30 text-accent' : 'bg-white/10 border-white/10 text-gray-400'}`}>
                      {m.role === 'user' ? 'F' : 'VC'}
                    </div>
                    <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-gray-800/80 text-gray-100 border border-white/10 rounded-tl-none'}`}>
                      {m.content}
                    </div>
                  </div>
                  {m.tone && (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      Tone: <span className="text-accent">{m.tone}</span>
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5 relative">
            <div className="flex items-center gap-6">
              <div className="flex-1 flex items-center gap-4 bg-white/5 rounded-3xl px-6 py-1 border border-white/10 min-h-[72px] transition-all focus-within:border-accent/50 focus-within:bg-white/10">
                {isListening && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                    <Waveform isActive={true} />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] animate-pulse">Speaking... Click Stop when done</span>
                  </div>
                )}
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Speak now — your words appear here..." : "Provide a detailed answer or defend your numbers..."}
                  className={`flex-1 bg-transparent border-none text-sm text-white placeholder:text-gray-600 outline-none py-4 ${isListening ? 'text-green-400' : ''}`}
                  readOnly={isListening}
                />
                {!isListening && (
                   <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
                     <Send size={20} />
                   </button>
                )}
                {isListening && (
                   <button onClick={handleSend} disabled={!input.trim()} className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
                     <Send size={20} />
                   </button>
                )}
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? () => { stopRecording(); } : () => { stopTTS(); startRecording(persona, (text) => setInput(text)); }}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all relative group ${isListening ? 'bg-red-500 shadow-red-500/30' : 'bg-accent shadow-accent/30'}`}
              >
                {isListening ? <Square size={24} className="text-white fill-white" /> : <Mic size={24} className="text-white" />}
                <div className={`absolute inset-[-8px] rounded-[2.5rem] border border-white/10 ${isListening ? 'animate-ping border-red-500/50' : 'group-hover:border-accent/50'}`} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Evaluation & Decision Panel */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto no-scrollbar pb-10">
          {/* Decision Status */}
          <div className={`rounded-[2.5rem] p-8 border text-center relative overflow-hidden transition-all duration-500 ${sessionScore?.verdict === 'Invest' ? 'bg-green-500/10 border-green-500/30' : sessionScore?.verdict === 'Reject' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/60 border-white/10'}`}>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Investment Verdict</h3>
            {sessionScore ? (
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className={`text-5xl font-black mb-2 ${sessionScore.verdict === 'Invest' ? 'text-green-400' : sessionScore.verdict === 'Reject' ? 'text-red-400' : 'text-amber-400'}`}>
                    {sessionScore.verdict}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Score: {sessionScore.overallScore}/10
                  </div>
                  <p className="mt-6 text-xs text-gray-400 leading-relaxed italic line-clamp-3">
                    "{sessionScore.reasoning}"
                  </p>
               </motion.div>
            ) : (
               <div className="py-10">
                  <ShieldCheck size={40} className="mx-auto text-gray-800 mb-4" />
                  <p className="text-[10px] text-gray-600 uppercase font-black leading-relaxed">
                    Analyzing conversation for decision metrics...
                  </p>
               </div>
            )}
          </div>

          {/* Deep Metrics */}
          <div className="glass-card-glow rounded-[2.5rem] p-8 border border-white/10">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Activity className="text-accent" size={16} /> Strategic Audit
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Market Potential', key: 'market', color: 'from-blue-500 to-cyan-400' },
                { label: 'Scalability', key: 'scalability', color: 'from-purple-500 to-pink-500' },
                { label: 'Product/Tech', key: 'product', color: 'from-amber-500 to-orange-400' },
                { label: 'Feasibility', key: 'feasibility', color: 'from-green-500 to-emerald-400' },
                { label: 'Founder Clarity', key: 'clarity', color: 'from-orange-500 to-red-400' },
              ].map((m, i) => {
                const val = sessionScore?.breakdown?.[m.key] || 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{m.label}</span>
                      <span className="text-xs font-black text-white">{val > 0 ? val : '--'}/10</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${val * 10}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-3xl p-6">
             <div className="flex gap-4 items-start">
                <AlertCircle className="text-accent shrink-0" size={18} />
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Investor Strategy</h4>
                   <p className="text-[10px] text-gray-500 leading-relaxed">
                     The AI is tracking your logic consistency. If you change your market size or CAC claims mid-pitch, expect the investor to call it out.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
