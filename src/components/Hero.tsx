import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

const rotatingWords = ['clareza', 'velocidade', 'consistência', 'eficiência']

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % rotatingWords.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-white dark:bg-[#1F2937] pt-20 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669] px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            Novo: Relatórios em tempo real disponíveis
          </span>

          <h1 className="text-5xl md:text-6xl font-bold text-[#1F2937] dark:text-[#F9FAFB] leading-tight tracking-tight mb-6">
            Gerencie projetos com{' '}
            <span className="inline-flex text-[#059669] relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="inline-block"
                >
                  {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-lg text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mb-10 max-w-2xl mx-auto">
            Flowdesk centraliza tarefas, times e prazos em um único lugar — para que sua equipe entregue mais, com menos esforço.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Começar gratuitamente
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] dark:border-[#374151] hover:border-[#D1D5DB] text-[#1F2937] dark:text-[#F9FAFB] px-6 py-3 rounded-lg font-medium transition-colors text-sm bg-white dark:bg-[#374151]"
            >
              <Play size={15} className="text-[#059669]" />
              Ver demonstração
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
            Grátis por 14 dias · Sem cartão de crédito · Cancele quando quiser
          </p>
        </motion.div>

        <motion.div
          className="mt-16 rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="bg-[#F3F4F6] dark:bg-[#111827] px-4 py-3 flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#374151]">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="ml-4 text-xs text-[#9CA3AF]">flowdesk.app/dashboard</span>
          </div>
          <div className="bg-white dark:bg-[#1F2937] p-6 min-h-[320px] flex items-center justify-center">
            <DashboardMockup />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const ALL_TASKS = [
  { id: 'mt1', title: 'Redesign da home' },
  { id: 'mt2', title: 'Revisar copy' },
  { id: 'mt3', title: 'API de autenticação' },
  { id: 'mt4', title: 'Dashboard v2' },
  { id: 'mt5', title: 'Setup CI/CD' },
  { id: 'mt6', title: 'Testes unitários' },
]

const TASK_MAP = Object.fromEntries(ALL_TASKS.map(t => [t.id, t]))

const DISTRIBUTIONS = [
  { todo: ['mt1', 'mt2'], in_progress: ['mt3', 'mt4'], done: ['mt5', 'mt6'] },
  { todo: ['mt2'], in_progress: ['mt1', 'mt3', 'mt4'], done: ['mt5', 'mt6'] },
  { todo: ['mt2'], in_progress: ['mt3', 'mt4'], done: ['mt1', 'mt5', 'mt6'] },
  { todo: ['mt1', 'mt2'], in_progress: ['mt3', 'mt4'], done: ['mt5', 'mt6'] },
]

function DashboardMockup() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => (t + 1) % DISTRIBUTIONS.length), 2800)
    return () => clearInterval(timer)
  }, [])

  const dist = DISTRIBUTIONS[tick]

  const cols = [
    { label: 'A fazer', bg: 'bg-[#F3F4F6] dark:bg-[#374151]', ids: dist.todo, barColor: '#E5E7EB', barWidth: '10%' },
    { label: 'Em andamento', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', ids: dist.in_progress, barColor: '#059669', barWidth: '65%' },
    { label: 'Concluído', bg: 'bg-[#EFF6FF] dark:bg-[#1E3A5F]', ids: dist.done, barColor: '#059669', barWidth: '100%' },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Sprint atual — Q2 2026</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">6 tarefas · 3 membros</p>
        </div>
        <div className="flex gap-2">
          {['AB', 'CF', 'MR'].map(initials => (
            <div key={initials} className="w-7 h-7 rounded-full bg-[#059669]/20 flex items-center justify-center text-[10px] font-medium text-[#059669]">
              {initials}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cols.map(col => (
          <div key={col.label}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">{col.label}</span>
              <motion.span
                key={col.ids.length}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-xs bg-[#F3F4F6] dark:bg-[#374151] text-[#9CA3AF] px-2 py-0.5 rounded-full"
              >
                {col.ids.length}
              </motion.span>
            </div>
            <div className="flex flex-col gap-2 min-h-[80px]">
              <AnimatePresence mode="popLayout">
                {col.ids.map(id => (
                  <motion.div
                    key={id}
                    layoutId={id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28, duration: 0.4 }}
                    className={`${col.bg} border border-[#E5E7EB] dark:border-[#374151] rounded-lg p-3`}
                  >
                    <p className="text-xs font-medium text-[#1F2937] dark:text-[#F9FAFB]">{TASK_MAP[id].title}</p>
                    <div className="mt-2">
                      <div className="w-full h-1 rounded-full bg-[#E5E7EB] dark:bg-[#4B5563]">
                        <div
                          className="h-1 rounded-full bg-[#059669] transition-all duration-700"
                          style={{ width: col.barWidth }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
