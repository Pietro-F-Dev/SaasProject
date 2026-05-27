import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, LayoutDashboard, FolderOpen, Settings, LogOut, Menu, X, Sun, Moon, ChevronRight, Search, Users, Shield, Sparkles, BarChart2, Maximize2, Minimize2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useProjectStore } from '../../store/projectStore'
import { useTeamStore } from '../../store/teamStore'
import NotificationBell from '../../components/NotificationBell'
import Changelog, { hasUnseenChangelog, markChangelogSeen } from '../../components/Changelog'

const planColors = { free: 'bg-[#F3F4F6] text-[#6B7280]', pro: 'bg-[#ECFDF5] text-[#059669]', enterprise: 'bg-[#EFF6FF] text-[#6366F1]' }
const planLabels = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }

export default function DashboardLayout({ onOpenCmdPalette }: { onOpenCmdPalette?: () => void }) {
  const { user, logout, isSuperAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const { projects, init, reset } = useProjectStore()
  const resetTeam = useTeamStore(s => s.reset)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [hasUnseen] = useState(() => hasUnseenChangelog())
  const [focusMode, setFocusMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      const isInput = ['input', 'textarea', 'select'].includes(tag)
      if (e.key === 'f' && !isInput && !e.metaKey && !e.ctrlKey) {
        setFocusMode(prev => !prev)
      }
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusMode])

  const handleLogout = useCallback(() => {
    reset()
    resetTeam()
    logout()
    navigate('/')
  }, [logout, navigate, reset, resetTeam])

  useEffect(() => {
    init()
  }, [init])

  const navItems = [
    { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, end: true },
    { to: '/dashboard/projects', label: 'Projetos', icon: FolderOpen },
    { to: '/dashboard/team', label: 'Equipe', icon: Users },
    { to: '/dashboard/reports', label: 'Relatórios', icon: BarChart2 },
    { to: '/dashboard/settings', label: 'Configurações', icon: Settings },
  ]

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white dark:bg-[#1F2937] border-r border-[#E5E7EB] dark:border-[#374151] w-60">
      <div className="p-4 border-b border-[#E5E7EB] dark:border-[#374151]">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-[#1F2937] dark:text-[#F9FAFB]">
          <Zap size={20} className="text-[#059669]" />
          Flowdesk
        </NavLink>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <motion.div key={item.to} whileTap={{ scale: 0.97 }}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669] font-medium'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] hover:text-[#1F2937] dark:hover:text-[#F9FAFB]'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          </motion.div>
        ))}

        {projects.length > 0 && (
          <div className="pt-4">
            <p className="px-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Projetos</p>
            {projects.slice(0, 5).map(project => (
              <NavLink
                key={project.id}
                to={`/dashboard/kanban/${project.id}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#F9FAFB] dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB] font-medium'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151]'
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                <span className="truncate">{project.name}</span>
                <ChevronRight size={12} className="ml-auto shrink-0 opacity-40" />
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-[#E5E7EB] dark:border-[#374151] space-y-1">
        {isSuperAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <Shield size={17} />
            Painel Admin
          </NavLink>
        )}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-xs font-bold text-[#059669] shrink-0">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#1F2937] dark:text-[#F9FAFB] truncate">{user?.name}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${planColors[user?.plan || 'free']}`}>
              {planLabels[user?.plan || 'free']}
            </span>
          </div>
          <motion.button
            onClick={handleLogout}
            className="text-[#9CA3AF] hover:text-red-500 transition-colors"
            title="Sair"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-[#111827] overflow-hidden">
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            key="sidebar-desktop"
            className="hidden md:flex h-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <motion.div
              className="fixed inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="relative z-50 h-full"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <Sidebar />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence>
          {!focusMode && (
            <motion.header
              key="header"
              className="h-14 bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] flex items-center gap-3 px-4 shrink-0"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 56, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className="md:hidden text-[#6B7280] dark:text-[#9CA3AF] p-1.5 rounded-lg"
                onClick={() => setSidebarOpen(true)}
                whileTap={{ scale: 0.85 }}
              >
                <Menu size={20} />
              </motion.button>

              <button
                onClick={onOpenCmdPalette}
                className="hidden md:flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#111827] text-sm text-[#9CA3AF] hover:border-[#D1D5DB] dark:hover:border-[#4B5563] transition-colors"
              >
                <Search size={14} />
                <span className="flex-1 text-left">Buscar...</span>
                <kbd className="text-[10px] bg-white dark:bg-[#374151] border border-[#E5E7EB] dark:border-[#4B5563] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
              </button>

              <div className="flex-1 md:flex-none" />

              <motion.button
                onClick={() => { setChangelogOpen(true); markChangelogSeen() }}
                className="relative p-2 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
                title="O que há de novo"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
              >
                <Sparkles size={18} />
                {hasUnseen && (
                  <motion.span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#059669]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  />
                )}
              </motion.button>

              <NotificationBell />

              <motion.button
                className="md:hidden text-[#6B7280] dark:text-[#9CA3AF] p-2 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
                onClick={toggle}
                whileTap={{ scale: 0.85, rotate: 20 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {sidebarOpen && (
                <motion.button
                  className="md:hidden text-[#6B7280] p-1"
                  onClick={() => setSidebarOpen(false)}
                  whileTap={{ scale: 0.85 }}
                >
                  <X size={20} />
                </motion.button>
              )}
            </motion.header>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-6 relative">
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

          {/* Focus mode toggle button */}
          <motion.button
            onClick={() => setFocusMode(prev => !prev)}
            className="fixed bottom-5 right-5 z-50 p-2.5 rounded-full bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-md text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#059669] dark:hover:text-[#059669] transition-colors"
            title={focusMode ? 'Sair do modo foco (F)' : 'Modo foco (F)'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {focusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </motion.button>
        </main>
      </div>
      <Changelog open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  )
}
