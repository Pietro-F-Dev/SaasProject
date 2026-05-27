import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, FolderOpen, Kanban, Check, ArrowRight, X } from 'lucide-react'

const steps = [
  {
    icon: Zap,
    title: 'Bem-vindo ao Flowdesk! 🎉',
    description: 'Em menos de 2 minutos você estará gerenciando projetos como um profissional. Vou te mostrar os fundamentos rapidinho.',
    color: '#059669',
  },
  {
    icon: FolderOpen,
    title: 'Organize em Projetos',
    description: 'Cada projeto tem seu próprio quadro Kanban. Crie um projeto para cada iniciativa — produto, marketing, desenvolvimento.',
    color: '#6366F1',
  },
  {
    icon: Kanban,
    title: 'Mova tarefas no Kanban',
    description: 'Arraste tarefas entre colunas, defina prioridade, adicione etiquetas e comentários. Tudo em tempo real.',
    color: '#F59E0B',
  },
]

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = () => {
    if (step < steps.length - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      onComplete()
    }
  }

  const s = steps[step]
  const Icon = s.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        className="bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-md shadow-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{ width: i === step ? 24 : 8, backgroundColor: i <= step ? '#059669' : '#E5E7EB' }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            <button onClick={onComplete} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              <X size={18} />
            </button>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4"
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{ backgroundColor: `${s.color}18` }}
              >
                <Icon size={28} style={{ color: s.color }} />
              </div>
              <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mb-3">{s.title}</h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{s.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onComplete}
              className="flex-1 py-2.5 border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors"
            >
              Pular
            </button>
            <button
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {step < steps.length - 1 ? (
                <>Próximo <ArrowRight size={14} /></>
              ) : (
                <>Começar <Check size={14} /></>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-2.5 bg-[#F9FAFB] dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-[#374151]">
          <p className="text-xs text-center text-[#9CA3AF]">Passo {step + 1} de {steps.length}</p>
        </div>
      </motion.div>
    </div>
  )
}
