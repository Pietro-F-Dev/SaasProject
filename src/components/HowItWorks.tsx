import { motion } from 'framer-motion'
import { FolderPlus, UserPlus, TrendingUp } from 'lucide-react'

const steps = [
  {
    n: '01',
    icon: FolderPlus,
    title: 'Crie seu projeto',
    description: 'Configure em segundos, defina membros e estruture as etapas do seu fluxo de trabalho.',
  },
  {
    n: '02',
    icon: UserPlus,
    title: 'Convide seu time',
    description: 'Adicione colaboradores com um link. Cada pessoa vê exatamente o que precisa ver.',
  },
  {
    n: '03',
    icon: TrendingUp,
    title: 'Acompanhe entregas',
    description: 'Visualize progresso em tempo real, identifique bloqueios e celebre cada entrega concluída.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-[#1F2937]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Como funciona</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Comece em menos de 5 minutos
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto text-base">
            Sem configuração complexa. Sem treinamento necessário. Só você, seu time e os projetos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-[#E5E7EB] dark:bg-[#374151]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center">
                  <step.icon size={32} className="text-[#059669]" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#059669] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
