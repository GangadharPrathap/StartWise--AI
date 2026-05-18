import { motion } from 'framer-motion'
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
import { pageVariants, childVariants } from '../animations/pageTransitions'

const mockChartData = [
  { name: 'Week 1', value: 400 },
  { name: 'Week 2', value: 300 },
  { name: 'Week 3', value: 600 },
  { name: 'Week 4', value: 800 },
  { name: 'Week 5', value: 700 },
  { name: 'Week 6', value: 900 },
]

const scoreData = [
  { name: 'Market', value: 85, color: '#3b82f6' },
  { name: 'Product', value: 70, color: '#f59e0b' },
  { name: 'Team', value: 90, color: '#10b981' },
  { name: 'Scale', value: 65, color: '#8b5cf6' },
]

export default function Dashboard() {
  const { history, meetings } = useAppStore()

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
          { label: 'Market Readiness', value: '84%', icon: Target, trend: '+12%', color: 'text-blue-400' },
          { label: 'Active Meetings', value: meetings.length, icon: Users, trend: 'Next: 2h', color: 'text-orange-400' },
          { label: 'Analyses Run', value: history.length, icon: BrainCircuit, trend: 'Last: 5m', color: 'text-purple-400' },
          { label: 'Growth Score', value: '72/100', icon: Zap, trend: '+5.2', color: 'text-green-400' },
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
                <span className="text-[10px] text-gray-500 font-bold uppercase">Real-time</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" aspect={2}>
                <AreaChart data={mockChartData}>
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
                    <span className="text-xs font-black text-white">{item.value}%</span>
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
                  "Your market validation is elite. Focus on tightening the team narrative before the next VC simulation."
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
              {[
                "New investor detected in Delhi NCR market.",
                "Pitch deck alignment score improved by 15%.",
                "Competitor 'StartupX' updated their pricing model.",
              ].map((insight, i) => (
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
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'New Analysis', icon: BrainCircuit, path: '/analyzer' },
                { label: 'VC Session', icon: Zap, path: '/simulator' },
                { label: 'Update Roadmap', icon: Activity, path: '/roadmap' },
                { label: 'Find Investors', icon: Users, path: '/investors' },
              ].map((action, i) => (
                <button key={i} onClick={() => window.location.href = action.path} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-accent/10 hover:border-accent/30 transition-all group text-left">
                  <action.icon className="text-gray-500 group-hover:text-accent mb-4 transition-colors" size={24} />
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
