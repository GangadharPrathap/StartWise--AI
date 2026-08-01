import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Sparkles, ChevronRight, Zap, Target, Users, DollarSign } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { pageVariants, childVariants, cardVariants } from '../animations/pageTransitions'
import { Card, Badge, Button } from '../components/ui/index.jsx'
import { AILoader } from '../components/ui/Loader'
import { apiClient } from '../utils/apiClient'
import toast from 'react-hot-toast'

const SLIDE_ICONS = {
  Problem: Target,
  Solution: Zap,
  Market: Users,
  'Business Model': DollarSign,
  Revenue: DollarSign,
  Team: Users,
  Traction: Zap,
  Ask: DollarSign,
}

export default function PitchDeck() {
  const { result, idea } = useAppStore()
  const [slides, setSlides] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDeck = async () => {
    const ideaText = idea || 'Startup idea'
    if (!result && !idea) {
      toast.error('Please analyze an idea first to generate your pitch deck.')
      return
    }
    setIsGenerating(true)
    try {
      // Use /pitch-deck endpoint which supports AI generation with template fallback
      const response = await apiClient.post('/pitch-deck', {
        idea: ideaText,
        slideCount: 8,
        theme: 'Startup',
        language: 'English',
        type: 'investor'
      })
      // Handle both response formats: { slides: [...] } and { pitchSlides: [...] }
      const data = response.data || response
      const slideData = data.slides || data.pitchSlides || []
      setSlides(slideData)
      toast.success('Pitch deck generated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate deck. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-4xl mx-auto space-y-10"
    >
      <motion.div variants={childVariants} className="flex items-center justify-between">
        <div>
          <Badge>AI Deck Builder</Badge>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight uppercase italic">
            Capital <span className="text-accent">Deck.</span>
          </h1>
          <p className="text-gray-500 mt-2">Generate a polished investor-ready pitch deck from your analysis.</p>
        </div>
        <Button icon={Sparkles} onClick={generateDeck} isLoading={isGenerating} disabled={isGenerating}>
          Generate Deck
        </Button>
      </motion.div>

      {isGenerating ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <AILoader text="Building Your Pitch Deck..." subtext="Crafting narratives investors love" />
        </div>
      ) : slides && slides.length > 0 ? (
        <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide, i) => {
            const Icon = SLIDE_ICONS[slide.title] || FileText
            return (
              <motion.div key={i} variants={cardVariants}>
                <Card className="p-8 h-full hover:border-accent/20">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Icon className="text-accent" size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Slide {slide.slideNumber || i + 1}</p>
                      <h3 className="text-white font-black text-lg">{slide.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{slide.content}</p>
                  {slide.speakerNotes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Speaker Notes</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{slide.speakerNotes}</p>
                    </div>
                  )}
                  {slide.bullets && (
                    <ul className="mt-4 space-y-2">
                      {slide.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                          <ChevronRight size={14} className="text-accent shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <motion.div variants={childVariants}>
          <Card className="p-16 text-center">
            <FileText className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white mb-2">No Deck Yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
              Analyze your startup idea first, then generate a professional pitch deck in seconds.
            </p>
            <Button icon={Sparkles} onClick={generateDeck} disabled={!result && !idea}>
              {result || idea ? 'Generate Pitch Deck' : 'Analyze an Idea First'}
            </Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
