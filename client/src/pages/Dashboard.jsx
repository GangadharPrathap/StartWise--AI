import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../utils/apiClient'
import { auth } from '../services/firebase'
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  BrainCircuit,
  ChevronRight,
  Activity,
  Award,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card, Badge, Button } from '../components/ui/index.jsx'
import { useAppStore } from '../store/useAppStore'
import { useRoadmapStore } from '../store/useRoadmapStore'
import { pageVariants, childVariants } from '../animations/pageTransitions'

export default function Dashboard() {
  const { history, meetings, result } = useAppStore()
  const { roadmapData } = useRoadmapStore()
  const navigate = useNavigate()

  const [dbData, setDbData] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (auth?.currentUser) {
          const res = await apiClient.get('/user/dashboard');
          setDbData(res.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch (non-critical):', err.message);
      }
    };
    fetchDashboard();
  }, []);

  // Roadmap calculations
  const stages = roadmapData?.roadmap?.stages || []
  const skills = roadmapData?.roadmap?.skill_gap_analysis || []
  const totalTasks = stages.reduce((acc, stage) => acc + (stage.tasks?.length || 0), 0)
  const estimatedWeeks = stages.reduce((acc, stage) => {
    const weeks = parseInt(stage.estimated_weeks || stage.duration || 0)
    return acc + (isNaN(weeks) ? 0 : weeks)
  }, 0)
  const recentAnalyses = history.slice(0, 3)

  // Derive real stats from latest analysis
  const latestResult = result || (history.length > 0 ? history[0]?.result : null)
  const opportunityScore = latestResult?.opportunityScore || 0
  const marketReadiness = opportunityScore ? `${opportunityScore * 10}%` : '—'
  const growthScore = opportunityScore ? `${opportunityScore * 10}/100` : '—'

  // Build chart data from real analysis history
  const chartData = useMemo(() => {
    if (history.length === 0) {
      return [
        { name: 'No data', value: 0 },
      ]
    }
    return history.slice(0, 6).reverse().map((item, i) => ({
      name: `Analysis ${i + 1}`,
      value: (item.result?.opportunityScore || 5) * 100
    }))
  }, [history])

  // Derive audit scores from latest result or use defaults
  const scoreData = useMemo(() => {
    if (!latestResult) {
      return [
        { name: 'Market', value: 0, color: '#3b82f6' },
        { name: 'Product', value: 0, color: '#f59e0b' },
        { name: 'Team', value: 0, color: '#10b981' },
        { name: 'Scale', value: 0, color: '#8b5cf6' },
      ]
    }
    const score = latestResult.opportunityScore || 5
    return [
      { name: 'Market', value: Math.min(score * 12, 100), color: '#3b82f6' },
      { name: 'Product', value: Math.min(score * 9, 100), color: '#f59e0b' },
      { name: 'Team', value: Math.min(score * 11, 100), color: '#10b981' },
      { name: 'Scale', value: Math.min(score * 8, 100), color: '#8b5cf6' },
    ]
  }, [latestResult])

  // Build dynamic insights from real data
  const insights = useMemo(() => {
    const items = []
    if (latestResult?.targetCustomer) {
      items.push(`Target customer: ${latestResult.targetCustomer}`)
    }
    if (latestResult?.revenueModel) {
      items.push(`Revenue model: ${latestResult.revenueModel}`)
    }
    if (latestResult?.marketSize) {
      items.push(`Market size: ${latestResult.marketSize}`)
    }
    if (meetings.length > 0) {
      items.push(`You have ${meetings.length} scheduled meeting${meetings.length > 1 ? 's' : ''}.`)
    }
    if (history.length > 0) {
      items.push(`${history.length} total analyses run. Latest for: ${history[0]?.idea?.substring(0, 50) || 'Unknown'}...`)
    }
    // Fallback
    if (items.length === 0) {
      items.push("Run your first analysis to see AI insights here.")
      items.push("Navigate to the Strategy Engine to get started.")
      items.push("Explore the VC Simulator for pitch practice.")
    }
    return items.slice(0, 3)
  }, [latestResult, meetings, history])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto space-y-10"
    >
      {/* Welcome Header */}
      <motion.div variants={childVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge>AI Operating System</Badge>
          <h1 className="text-4xl font-black text-white mt-4 tracking-tight uppercase italic">
            Startup <span className="text-accent">Control Tower.</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Real-time intelligence and execution monitoring.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Activity}>System Status: Optimal</Button>
          <Button icon={ArrowUpRight}>Expand Analytics</Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Market Readiness', value: marketReadiness, icon: Target, trend: opportunityScore ? `+${opportunityScore}` : '—', color: 'text-blue-400' },
          { label: 'Active Meetings', value: dbData?.meetingCount ?? meetings.length, icon: Users, trend: (dbData?.meetingCount > 0 || meetings.length > 0) ? 'Scheduled' : 'None', color: 'text-orange-400' },
          { label: 'Analyses Run', value: dbData?.analysisCount ?? history.length, icon: BrainCircuit, trend: (dbData?.analysisCount > 0 || history.length > 0) ? `Last: recent` : 'None', color: 'text-purple-400' },
          { label: 'Growth Score', value: growthScore, icon: Zap, trend: opportunityScore ? `Score: ${opportunityScore}/10` : '—', color: 'text-green-400' },
        ].map((stat, i) => (
          <motion.div key={i} variants={childVariants}>
            <Card className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Section */}
      <motion.div variants={childVariants}>
        <Card className="p-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Award size={16} className="text-accent" /> VC Pitch Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-6">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Avg VC Score</div>
                <div className="text-4xl font-black text-accent">{dbData?.avgVCScore || 0}<span className="text-lg text-gray-500">/100</span></div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Total Pitch Sessions</div>
                <div className="text-2xl font-black text-white">{dbData?.vcSessionCount || 0}</div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">Recent Sessions</div>
              <div className="space-y-3">
                {dbData?.recentVCSessions?.length > 0 ? (
                  dbData.recentVCSessions.slice(0, 3).map((session, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-white">{session.personaName || 'VC Investor'}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                          {new Date(session.createdAt || session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-accent">{session.score}/100</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 p-4 bg-white/5 rounded-2xl border border-white/5">
                    No recent VC sessions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <motion.div variants={childVariants} className="lg:col-span-2">
          <Card className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" /> Traction Projection
              </h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">{history.length > 0 ? 'Live Data' : 'No Data'}</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" aspect={2}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Audit Scores */}
        <motion.div variants={childVariants}>
          <Card className="p-8 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent" /> Investor Audit
            </h3>
            <div className="space-y-6">
              {scoreData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                    <span className="text-xs font-black text-white">{Math.round(item.value)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full bg-accent shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex gap-4 items-start bg-accent/5 p-4 rounded-2xl border border-accent/10">
                <Award className="text-accent shrink-0" size={18} />
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  {latestResult
                    ? `Market size: ${latestResult.marketSize || '—'}. Target: ${latestResult.targetCustomer || '—'}. Revenue: ${latestResult.revenueModel || '—'}.`
                    : "Run an analysis to see your personalized investor audit breakdown here."
                  }
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insight Feed */}
        <motion.div variants={childVariants}>
          <Card className="p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">AI Insight Stream</h3>
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4 items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="w-2 h-2 rounded-full bg-accent group-hover:scale-150 transition-transform" />
                  <p className="text-xs text-gray-400 font-medium">{insight}</p>
                  <ChevronRight className="ml-auto text-gray-600" size={14} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={childVariants}>
          <Card className="p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Execution Hub</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Strategy Engine', icon: BrainCircuit, path: '/analyzer' },
                { label: 'Roadmap', icon: Activity, path: '/roadmap' },
                { label: 'VC Simulator', icon: Zap, path: '/simulator' },
                { label: 'Pitch Deck', icon: Award, path: '/pitch-deck' },
                { label: 'Investor Scout', icon: Users, path: '/investors' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-accent/10 hover:border-accent/30 transition-all group text-left">
                  <action.icon className="text-gray-500 group-hover:text-accent mb-4 transition-colors" size={24} />
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* New Enhanced Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Analysis Summary */}
        <motion.div variants={childVariants}>
          <Card className="p-8 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Latest Analysis</h3>
            {latestResult ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Startup Idea</div>
                  <div className="text-sm text-white font-medium line-clamp-2">{history[0]?.idea || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Market Size</div>
                  <div className="text-sm text-white font-medium">{latestResult.marketSize || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Target Customer</div>
                  <div className="text-sm text-white font-medium">{latestResult.targetCustomer || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Revenue Model</div>
                  <div className="text-sm text-white font-medium">{latestResult.revenueModel || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Opportunity Score</div>
                  <div className="text-sm text-accent font-bold">{latestResult.opportunityScore || '—'}/10</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Run your first analysis to see the summary here.</p>
            )}
          </Card>
        </motion.div>

        {/* Roadmap Progress */}
        <motion.div variants={childVariants}>
          <Card className="p-8 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Roadmap Progress</h3>
            {stages.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Stages</span>
                  <span className="text-xl font-black text-white">{stages.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Tasks</span>
                  <span className="text-xl font-black text-white">{totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Estimated Time</span>
                  <span className="text-xl font-black text-white">{estimatedWeeks} <span className="text-sm text-gray-500">wks</span></span>
                </div>
                <Button variant="secondary" className="w-full mt-4 flex justify-center items-center" onClick={() => navigate('/roadmap')}>
                  View Roadmap
                </Button>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No roadmap generated yet. Start an analysis to create one.</div>
            )}
          </Card>
        </motion.div>

        {/* Skill Gaps */}
        <motion.div variants={childVariants}>
          <Card className="p-8 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Skill Gaps ({skills.length})</h3>
            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.slice(0, 5).map((gap, i) => {
                  const skillName = typeof gap === 'string' ? gap : (gap.missing_skill || gap.skill || 'Unknown Skill');
                  const desc = typeof gap === 'string' ? null : (gap.impact || gap.reason);
                  return (
                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-xs font-bold text-white mb-1">{skillName}</div>
                      {desc && (
                        <div className="text-[10px] text-gray-400 leading-tight">{desc}</div>
                      )}
                    </div>
                  );
                })}
                {skills.length > 5 && (
                  <div className="text-[10px] text-accent text-center mt-2 cursor-pointer hover:underline" onClick={() => navigate('/roadmap')}>
                    + {skills.length - 5} more skills
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No skill gaps identified yet.</div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Analyses List */}
      <motion.div variants={childVariants}>
        <Card className="p-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Recent Analyses</h3>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-4">
              {recentAnalyses.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="pr-4">
                    <div className="text-sm font-bold text-white line-clamp-1">{item.idea}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.city}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-accent">{item.result?.opportunityScore ? `${item.result.opportunityScore}/10` : '—'}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Score</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No analyses history available.</div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
