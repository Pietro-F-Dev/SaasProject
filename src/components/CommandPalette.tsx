import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, LayoutDashboard, FolderOpen, Settings, Sun, Moon, LogOut, X } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: string
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { projects } = useProjectStore()
  const { toggle, theme } = useTheme()
  const { logout } = useAuth()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const go = (path: string) => { navigate(path); onClose() }

  const commands: Command[] = [
    { id: 'overview', label: 'Visão geral', description: 'Ir para o dashboard principal', icon: <LayoutDashboard size={15} />, action: () => go('/dashboard'), category: 'Navegação' },
    { id: 'projects', label: 'Projetos', description: 'Ver todos os projetos', icon: <FolderOpen size={15} />, action: () => go('/dashboard/projects'), category: 'Navegação' },
    { id: 'settings', label: 'Configurações', description: 'Preferências da conta', icon: <Settings size={15} />, action: () => go('/dashboard/settings'), category: 'Navegação' },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro',
      icon: theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
      action: () => { toggle(); onClose() },
      category: 'Ações',
    },
    { id: 'logout', label: 'Sair da conta', description: 'Encerrar sessão atual', icon: <LogOut size={15} />, action: () => { logout(); navigate('/'); onClose() }, category: 'Ações' },
    ...projects.map(p => ({
      id: p.id,
      label: p.name,
      description: 'Abrir quadro Kanban',
      icon: <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />,
      action: () => go(`/dashboard/kanban/${p.id}`),
      category: 'Projetos',
    })),
  ]

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  // Build grouped map and flat list with stable indices
  const groupOrder = ['Navegação', 'Projetos', 'Ações']
  const grouped: Record<string, Command[]> = {}
  filtered.forEach(cmd => {
    if (!grouped[cmd.category]) grouped[cmd.category] = []
    grouped[cmd.category].push(cmd)
  })
  const flatList = groupOrder.flatMap(cat => grouped[cat] ?? [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flatList.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); flatList[selected]?.action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, flatList, selected])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7EB] dark:border-[#374151]">
              <Search size={16} className="text-[#9CA3AF] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar páginas, projetos, ações..."
                className="flex-1 bg-transparent text-sm text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[#9CA3AF] hover:text-[#6B7280]">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto py-1.5">
              {flatList.length === 0 ? (
                <p className="text-center text-sm text-[#9CA3AF] py-8">Nenhum resultado para "{query}"</p>
              ) : (
                groupOrder.map(category => {
                  const cmds = grouped[category]
                  if (!cmds) return null
                  return (
                    <div key={category}>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">{category}</p>
                      {cmds.map(cmd => {
                        const idx = flatList.findIndex(c => c.id === cmd.id)
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelected(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selected ? 'bg-[#F3F4F6] dark:bg-[#374151]' : 'hover:bg-[#F9FAFB] dark:hover:bg-[#374151]/50'}`}
                          >
                            <span className="text-[#6B7280] dark:text-[#9CA3AF] shrink-0 flex items-center">{cmd.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1F2937] dark:text-[#F9FAFB] font-medium truncate">{cmd.label}</p>
                              {cmd.description && <p className="text-xs text-[#9CA3AF] truncate">{cmd.description}</p>}
                            </div>
                            {idx === selected && (
                              <kbd className="text-[10px] text-[#9CA3AF] bg-[#E5E7EB] dark:bg-[#4B5563] px-1.5 py-0.5 rounded">↵</kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-[#E5E7EB] dark:border-[#374151] flex items-center gap-4 text-[10px] text-[#9CA3AF]">
              <span className="flex items-center gap-1">
                <kbd className="bg-[#F3F4F6] dark:bg-[#374151] px-1.5 py-0.5 rounded font-mono">↑↓</kbd> navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-[#F3F4F6] dark:bg-[#374151] px-1.5 py-0.5 rounded font-mono">↵</kbd> selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-[#F3F4F6] dark:bg-[#374151] px-1.5 py-0.5 rounded font-mono">Esc</kbd> fechar
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
