import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, ChevronRight, CheckCircle2, Target, Briefcase, Zap, DollarSign } from 'lucide-react'
import { useRoadmap } from '../hooks/useRoadmap'
import { pageVariants, childVariants, cardVariants } from '../animations/pageTransitions'
import { SkeletonCard, SkeletonList } from '../components/ui/Skeleton'

export default function AIRoadmap() {
  const navigate = useNavigate()
  const { 
    data, 
    activeTab, 
    setActiveTab, 
    stages, 
    skills, 
    roadmap, 
    domainAnalysis,
    isGenerating
  } = useRoadmap()

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <div className="h-20 w-1/3 bg-white/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />)}
        </div>
        <SkeletonCard />
        <SkeletonList count={5} />
      </div>
    )
  }

  if (!data) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto py-24 px-4 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="bg-gray-900/50 p-6 rounded-full border border-white/5 shadow-2xl shadow-orange-500/10">
          <MapIcon size={48} className="text-orange-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">No Roadmap Generated Yet</h2>
          <p className="text-gray-400 font-medium max-w-md mx-auto">
            Run an AI analysis on your startup idea to generate a personalized execution roadmap.
          </p>
        </div>
        <button
          onClick={() => navigate('/analyzer')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          Launch Strategy Engine <ChevronRight size={20} />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <motion.div variants={childVariants} className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Startup <span className="text-orange-500">Roadmap</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Your AI-generated execution strategy</p>
        </div>
        <button onClick={() => navigate('/analyzer')} className="text-[10px] text-orange-500 font-black uppercase tracking-widest border border-orange-500/30 px-6 py-2.5 rounded-xl hover:bg-orange-500/10 transition-all">New Analysis</button>
      </motion.div>

      <motion.div variants={childVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Viability', value: `${roadmap.idea_viability_score}/10`, color: 'text-green-400', icon: Target },
          { label: 'Timeline', value: `${roadmap.total_estimated_weeks}w`, color: 'text-blue-400', icon: Zap },
          { label: 'Stages', value: stages.length, color: 'text-orange-400', icon: Briefcase },
          { label: 'Domains', value: domainAnalysis?.domains?.length || 0, color: 'text-purple-400', icon: MapIcon },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className="bg-gray-900/50 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <stat.icon className={`w-5 h-5 mx-auto mb-3 ${stat.color}`} />
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={childVariants} className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8 mb-8 flex gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Zap size={100} className="text-blue-400" />
        </div>
        <Zap className="text-blue-400 shrink-0 mt-1" />
        <p className="text-gray-300 text-sm leading-relaxed relative z-10">{roadmap.viability_reasoning}</p>
      </motion.div>

      <motion.div variants={childVariants} className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'roadmap', label: 'Roadmap', icon: MapIcon },
          { id: 'skills', label: 'Skill Gaps', icon: Zap },
          { id: 'funding', label: 'Funding', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'roadmap' && (
            <motion.div 
              key="roadmap-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {stages.map((stage, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  {i < stages.length - 1 && <div className="absolute left-[20px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/30 to-transparent" />}
                  <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-gray-900 border-2 border-orange-500 flex items-center justify-center font-black text-orange-500 text-sm z-10 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    {stage.stage_number}
                  </div>
                  <div className="bg-gray-900/40 border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all backdrop-blur-md group">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{stage.stage_name}</h3>
                        <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mt-1">{stage.stage_title}</p>
                      </div>
                      <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] text-gray-500 font-black uppercase tracking-widest">{stage.duration_weeks} weeks</div>
                    </div>
                    <div className="space-y-4">
                      {stage.tasks?.map((task, j) => (
                        <div key={j} className="flex gap-4 bg-black/30 p-5 rounded-2xl border border-white/5 hover:bg-black/50 transition-all">
                          <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-200 text-sm font-bold">{task.task}</p>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{task.how_to_do_it}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              key="skills-grid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {skills.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-8">
                  No skill gap analysis available. Please run a new analysis.
                </div>
              ) : skills.map((skill, i) => (
                <motion.div 
                  key={i} 
                  variants={cardVariants}
                  className="bg-gray-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-white text-lg">{skill.skill_needed}</h4>
                    {skill.student_has_it ? 
                      <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Mastered</span> :
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Priority Gap</span>
                    }
                  </div>
                  {!skill.student_has_it && (
                    <div className="space-y-4">
                      <p className="text-xs text-gray-400 leading-relaxed"><span className="text-gray-600 font-black uppercase tracking-widest text-[9px] mr-2">Resource:</span> {skill.how_to_learn}</p>
                      <div className="flex items-center gap-2 text-blue-400">
                        <Zap size={14} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Est. {skill.time_to_learn_weeks} weeks</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'funding' && (
            <motion.div 
              key="funding-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
               <div className="bg-gradient-to-br from-green-500/10 via-transparent to-transparent border border-green-500/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                  <DollarSign className="w-16 h-16 text-green-400 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">Estimated Bootstrap Cost</h3>
                  <div className="text-5xl font-black text-white mb-4 tracking-tight">{roadmap.funding_path?.bootstrap_cost_estimate}</div>
                  <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recommended Stage for Funding:</span>
                    <span className="text-orange-400 font-black uppercase tracking-widest">{roadmap.funding_path?.stage_for_funding}</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {roadmap.funding_path?.indian_grants_and_programs?.map((grant, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5 }}
                      className="bg-gray-900/40 border border-white/5 rounded-3xl p-8 hover:bg-gray-800/40 transition-all"
                    >
                      <h4 className="font-bold text-white mb-2 text-lg">{grant.name}</h4>
                      <div className="text-2xl font-black text-green-400 mb-4">{grant.amount}</div>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">{grant.eligibility}</p>
                      {grant.url && <a href={grant.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">Visit Platform <ChevronRight size={14} /></a>}
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
