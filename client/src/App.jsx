import React from 'react'
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BrainCircuit, 
  Users, 
  Calendar, 
  Mail, 
  FileText, 
  Menu, 
  X, 
  Sparkles,
  Settings,
  LogOut,
  Bell,
  Loader2
} from 'lucide-react'
import { useState, useEffect, lazy, Suspense, memo, useMemo, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'

// --- Auth & Services ---
import { auth, signInWithGoogle, logout, handleRedirectResult } from './services/firebase'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'

// --- Performance: Lazy Loading Pages ---
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analyzer = lazy(() => import('./pages/Analyzer'))
const AIRoadmap = lazy(() => import('./pages/AIRoadmap'))
const InvestorMap = lazy(() => import('./pages/InvestorMap'))
const VCSimulator = lazy(() => import('./pages/VCSimulator'))
const Meetings = lazy(() => import('./pages/Meetings'))
const PitchDeck = lazy(() => import('./pages/PitchDeck'))

import { useAppStore } from './store/useAppStore'
import { AILoader } from './components/ui/Loader'
import { Badge } from './components/ui/index.jsx'
import CustomCursor from './components/ui/CustomCursor'

// --- Optimized Components ---
const SidebarItem = memo(({ item, isActive, isSidebarOpen }) => (
  <Link
    to={item.path}
    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-accent/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}
  >
    <item.icon size={20} className={isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'} />
    {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
    {isActive && (
      <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    )}
  </Link>
))

SidebarItem.displayName = 'SidebarItem'

function App() {
  // --- Centralized Auth State ---
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  const location = useLocation()
  const subscribeToHistory = useAppStore(useCallback(state => state.subscribeToHistory, []))
  const subscribeToMeetings = useAppStore(useCallback(state => state.subscribeToMeetings, []))

  // --- ELITE AUTH LISTENER ---
  useEffect(() => {
    const handleDemoLogin = () => {
      const mockUser = {
        uid: 'demo-user',
        email: 'founder@startwise.ai',
        displayName: 'Elite Founder',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=founder'
      };
      setUser(mockUser);
      setIsAuthReady(true);
    };

    window.addEventListener('demo-login', handleDemoLogin);

    if (!auth) {
      console.warn("Firebase Auth not initialized. Enabling Demo Mode.");
      setIsAuthReady(true);
      return;
    }

    // Handle redirect sign-in result (if user was redirected back after Google sign-in)
    handleRedirectResult().catch(err => console.warn('Redirect result check:', err));

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("MAANG Auth Sync - Current User:", u?.email || "Guest");
      setUser(u);
      setIsAuthReady(true);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('demo-login', handleDemoLogin);
    };
  }, []);

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (user) {
      const unsubHistory = subscribeToHistory(user)
      const unsubMeetings = subscribeToMeetings(user)
      return () => {
        unsubHistory()
        unsubMeetings()
      }
    }
  }, [user, subscribeToHistory, subscribeToMeetings])

  // --- Toast Initialization ---
  useEffect(() => {
    if (isAuthReady && user) {
      import('react-hot-toast').then(({ toast }) => {
        toast.success(`Welcome back, ${user.displayName || 'Founder'}`, {
          icon: '🚀',
          duration: 4000
        });
      });
    }
  }, [isAuthReady, user]);

  const navItems = useMemo(() => [
    { path: '/', icon: LayoutDashboard, label: 'Control Tower' },
    { path: '/analyzer', icon: Sparkles, label: 'Strategy Engine' },
    { path: '/roadmap', icon: MapIcon, label: 'Execution Roadmap' },
    { path: '/simulator', icon: BrainCircuit, label: 'VC Simulator' },
    { path: '/investors', icon: Users, label: 'Investor Scout' },
    { path: '/meetings', icon: Calendar, label: 'Meeting Hub' },
    { path: '/pitch-deck', icon: FileText, label: 'Capital Deck' },
  ], [])

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), [])

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  return (
    <AuthProvider value={{ user, isAuthReady }}>
      <CustomCursor />
      
      {!isAuthReady ? (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Initializing OS...</p>
          </div>
        </div>
      ) : !user ? (
        <Login />
      ) : (
        <div className="flex h-screen bg-[#050505] text-gray-300 font-sans selection:bg-accent/30 selection:text-white overflow-hidden">
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 bg-[#0A0A0A] border-r border-white/5 transition-all duration-500 ease-[0.2,0.8,0.2,1] ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full lg:w-20'}`}>
            <div className="flex flex-col h-full">
              <div className="p-6 flex items-center justify-between">
                {(isSidebarOpen || !window.matchMedia('(min-width: 1024px)').matches) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                      <BrainCircuit className="text-white" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase italic">StartWise<span className="text-accent">.</span></span>
                  </motion.div>
                )}
                <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2 no-scrollbar overflow-y-auto">
                {navItems.map((item) => (
                  <SidebarItem 
                    key={item.path} 
                    item={item} 
                    isActive={location.pathname === item.path} 
                    isSidebarOpen={isSidebarOpen} 
                  />
                ))}
              </nav>

              <div className="p-6 border-t border-white/5">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden shrink-0">
                        <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="" />
                      </div>
                      {isSidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Founder'}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">Alpha Pro</p>
                        </div>
                      )}
                    </div>
                    {isSidebarOpen && (
                      <div className="flex gap-2">
                        <button className="flex-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex justify-center"><Settings size={16} /></button>
                        <button onClick={handleLogout} className="flex-1 p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex justify-center"><LogOut size={16} /></button>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-500 ease-[0.2,0.8,0.2,1] ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} ml-0 overflow-y-auto no-scrollbar relative`}>
            {/* Top Header Bar */}
            <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
               <div className="flex items-center gap-3 lg:gap-4">
                  <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-white/5 rounded-xl"><Menu size={18} /></button>
                  <Badge variant="success" className="hidden sm:inline-flex">System Online</Badge>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Network: Production Mainnet</p>
               </div>
               <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-500 hover:text-white transition-colors relative">
                     <Bell size={18} />
                     <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full" />
                  </button>
                  <div className="h-8 w-32 bg-white/5 rounded-xl border border-white/10 flex items-center px-3 gap-2">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sync Active</span>
                  </div>
               </div>
            </header>

            {/* Background Ambient Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
               <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="p-10 relative z-10 min-h-full">
              <AnimatePresence mode="wait">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <AILoader text="Booting Strategy Engine..." subtext="Accessing startup intelligence archives" />
                  </div>
                }>
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analyzer" element={<Analyzer />} />
                    <Route path="/roadmap" element={<AIRoadmap />} />
                    <Route path="/simulator" element={<VCSimulator />} />
                    <Route path="/investors" element={<InvestorMap />} />
                    <Route path="/meetings" element={<Meetings />} />
                    <Route path="/pitch-deck" element={<PitchDeck />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </AuthProvider>
  )
}

export default memo(App)
