import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { useNavigate } from 'react-router-dom'
import { 
  Rocket, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  ChevronRight,
  BrainCircuit,
  Info
} from 'lucide-react'
import { useIdeaAnalysis } from '../hooks/useIdeaAnalysis'
import { AILoader } from '../components/ui/Loader'
import { pageVariants, childVariants } from '../animations/pageTransitions'

export default function Analyzer() {
  const navigate = useNavigate()
  const { 
    idea, 
    setIdea, 
    selectedCity, 
    setSelectedCity, 
    selectedSkills,
    setSelectedSkills,
    isAnalyzing, 
    analyzeIdea 
  } = useIdeaAnalysis()

  const cities = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune']
  const availableSkills = [
    // Technical
    'Full-Stack Development', 'Frontend (React/Next.js)', 'Backend (Node/Python)', 'Mobile (React Native)',
    'Flutter / Dart', 'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning / NLP',
    'Data Analytics', 'DevOps / CI-CD', 'Cloud (AWS/GCP/Azure)', 'Cybersecurity', 'Blockchain / Web3',
    'Database Management', 'API Development',
    // Design
    'UI/UX Design', 'Graphic Design', 'Video Editing / Motion',
    // Business
    'Product Management', 'Digital Marketing', 'SEO / SEM', 'Content Writing', 'Sales & BD',
    'Financial Modeling', 'Legal & Compliance', 'Growth Hacking', 'Social Media Marketing',
    // Domain
    'E-commerce', 'Healthcare / Medtech', 'Fintech', 'Edtech'
  ]

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="min-h-[60vh] flex items-center justify-center"
          >
            <AILoader 
              text="Analyzing Market Opportunity..." 
              subtext="Running simulations on local demand and competition" 
            />
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-12">
            <motion.div variants={childVariants} className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest mb-4">
                <Sparkles size={12} /> AI Strategy Engine
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight">
                Pitch your <span className="text-accent italic">Vision.</span>
              </h1>
              <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
                Describe your startup idea and select a target market. Our AI will analyze viability, competition, and local potential.
              </p>
            </motion.div>

            <motion.div variants={childVariants} className="bg-gray-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit size={160} />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Rocket size={12} /> Your Core Innovation
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g., An AI-powered personal health assistant for elderly care in urban India..."
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-gray-700 focus:border-accent focus:bg-white/10 outline-none transition-all min-h-[160px] resize-none text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <MapPin size={12} /> Target Launch City
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`py-4 px-6 rounded-2xl text-sm font-bold border transition-all ${
                          selectedCity === city
                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap size={12} /> Your Current Skills
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`py-3 px-5 rounded-2xl text-sm font-bold border transition-all ${
                          selectedSkills?.includes(skill)
                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzeIdea}
                  disabled={!idea || isAnalyzing}
                  className="w-full bg-accent text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/40 flex items-center justify-center gap-3 transition-all group disabled:opacity-30"
                >
                  Start AI Analysis <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Viability Score', desc: 'Instant calculation of market potential.', icon: TrendingUp },
                { title: 'Local Insights', desc: 'Data specific to your chosen city.', icon: MapPin },
                { title: 'Strategy Build', desc: 'A custom roadmap for execution.', icon: Zap },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                  <item.icon className="text-accent mb-4" size={24} />
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
