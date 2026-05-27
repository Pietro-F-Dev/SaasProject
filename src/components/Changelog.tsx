import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, Bug, Shield } from 'lucide-react'

const LATEST_VERSION = '2.3'
const LS_KEY = 'flowdesk_changelog_seen'

const releases = [
  {
    version: '2.3',
    date: 'Maio 2026',
    badge: 'Novo',
    badgeColor: 'bg-[#059669] text-white',
    items: [
      { icon: <Sparkles size={13} />, text: 'Command palette global com busca (⌘K)', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Vista Calendário e Lista no Kanban', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Etiquetas e comentários nas tarefas', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Painel super-admin da plataforma', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Notificações em tempo real', type: 'feature' },
      { icon: <Zap size={13} />, text: 'Transições de página mais suaves', type: 'improvement' },
    ],
  },
  {
    version: '2.1',
    date: 'Abril 2026',
    badge: null,
    badgeColor: '',
    items: [
      { icon: <Sparkles size={13} />, text: 'Gerenciamento de equipe com roles', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Indicadores de prazo vencido nas tarefas', type: 'feature' },
      { icon: <Zap size={13} />, text: 'Skeleton loaders nas listagens', type: 'improvement' },
      { icon: <Bug size={13} />, text: 'Correção no cálculo de preço anual', type: 'fix' },
    ],
  },
  {
    version: '2.0',
    date: 'Março 2026',
    badge: null,
    badgeColor: '',
    items: [
      { icon: <Sparkles size={13} />, text: 'Dashboard com gráficos de progresso', type: 'feature' },
      { icon: <Sparkles size={13} />, text: 'Drag & drop no quadro Kanban', type: 'feature' },
      { icon: <Shield size={13} />, text: 'Autenticação com validação de formulários', type: 'feature' },
      { icon: <Zap size={13} />, text: 'Dark mode em toda a aplicação', type: 'improvement' },
    ],
  },
]

const typeColors: Record<string, string> = {
  feature: 'text-[#059669]',
  improvement: 'text-[#6366F1]',
  fix: 'text-[#F59E0B]',
}

export function hasUnseenChangelog() {
  return localStorage.getItem(LS_KEY) !== LATEST_VERSION
}

export function markChangelogSeen() {
  localStorage.setItem(LS_KEY, LATEST_VERSION)
}

export default function Changelog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#059669]" />
                <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">O que há de novo</h2>
              </div>
              <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh] p-5 space-y-6">
              {releases.map(release => (
                <div key={release.version}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-[#1F2937] dark:text-[#F9FAFB]">v{release.version}</span>
                    {release.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${release.badgeColor}`}>
                        {release.badge}
                      </span>
                    )}
                    <span className="text-xs text-[#9CA3AF] ml-auto">{release.date}</span>
                  </div>
                  <ul className="space-y-2">
                    {release.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 shrink-0 ${typeColors[item.type]}`}>{item.icon}</span>
                        <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  {release !== releases[releases.length - 1] && (
                    <div className="border-t border-[#F3F4F6] dark:border-[#374151] mt-5" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-[#F9FAFB] dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#059669] inline-block" /> Novo</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6366F1] inline-block" /> Melhoria</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block" /> Correção</span>
              </div>
              <button onClick={onClose} className="text-xs text-[#059669] font-medium hover:underline">Fechar</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
