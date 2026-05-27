import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LayoutDashboard, Users, LogOut, ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Usuários', icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col h-full w-56 shrink-0 border-r border-white/10">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center">
              <Shield size={14} className="text-[#EF4444]" />
            </div>
            <span className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider">Super Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#059669]" />
            <span className="font-bold text-white text-lg">Flowdesk</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao dashboard
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#ECFDF5]/10 flex items-center justify-center text-[10px] font-bold text-[#059669] shrink-0">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#EF4444] font-semibold">Super Admin</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="text-white/30 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white/5 border-b border-white/10 flex items-center px-6 shrink-0">
          <p className="text-xs text-white/40 font-mono">
            flowdesk.app / <span className="text-white/70">admin</span>
            {location.pathname !== '/admin' && (
              <> / <span className="text-white/70">{location.pathname.split('/').pop()}</span></>
            )}
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
