import { motion } from 'framer-motion'
import { Kanban, Users, BarChart2, Plug, Bell, Shield } from 'lucide-react'

const features = [
  {
    icon: Kanban,
    title: 'Kanban inteligente',
    description: 'Visualize o progresso de cada tarefa em tempo real com arraste e solte intuitivo.',
  },
  {
    icon: Users,
    title: 'Colaboração em tempo real',
    description: 'Times sincronizados e alinhados, sem reuniões desnecessárias ou e-mails perdidos.',
  },
  {
    icon: BarChart2,
    title: 'Relatórios automáticos',
    description: 'Acompanhe métricas, velocidade de entrega e gargalos com dashboards claros.',
  },
  {
    icon: Plug,
    title: 'Integrações nativas',
    description: 'Conecte com Slack, GitHub, Figma e mais de 50 ferramentas em poucos cliques.',
  },
  {
    icon: Bell,
    title: 'Gestão de prazos',
    description: 'Alertas automáticos e lembretes inteligentes para manter entregas no prazo.',
  },
  {
    icon: Shield,
    title: 'Permissões por função',
    description: 'Controle granular de quem visualiza, edita ou aprova cada projeto.',
  },
]

export default function Features() {
  return (
    <section id="funcionalidades" className="py-24 px-6 bg-[#F9FAFB] dark:bg-[#111827]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Funcionalidades</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Tudo que seu time precisa para entregar
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto text-base">
            Ferramentas poderosas, interface simples. Flowdesk remove a complexidade para que sua equipe foque no que importa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-10 h-10 bg-[#ECFDF5] dark:bg-[#064E3B] rounded-lg flex items-center justify-center mb-4">
                <f.icon size={20} className="text-[#059669]" />
              </div>
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
