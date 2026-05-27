import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Abrir command palette' },
  { keys: ['?'], description: 'Mostrar atalhos de teclado' },
  { keys: ['Esc'], description: 'Fechar modal aberto' },
  { keys: ['↑', '↓'], description: 'Navegar resultados (command palette)' },
  { keys: ['↵'], description: 'Confirmar seleção' },
  { keys: ['N'], description: 'Novo projeto (na página Projetos)' },
  { keys: ['Enter'], description: 'Adicionar tarefa (inline)' },
]

export default function KeyboardShortcuts({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            className="relative bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-sm shadow-2xl border border-[#E5E7EB] dark:border-[#374151]"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center gap-2">
                <Keyboard size={16} className="text-[#6B7280]" />
                <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Atalhos de teclado</h2>
              </div>
              <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] flex-1">{s.description}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.keys.map(k => (
                      <kbd
                        key={k}
                        className="text-xs bg-[#F3F4F6] dark:bg-[#374151] text-[#374151] dark:text-[#D1D5DB] px-2 py-1 rounded-md font-mono border border-[#E5E7EB] dark:border-[#4B5563]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 text-center">
              <p className="text-xs text-[#9CA3AF]">Pressione <kbd className="bg-[#F3F4F6] dark:bg-[#374151] px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd> para fechar</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
