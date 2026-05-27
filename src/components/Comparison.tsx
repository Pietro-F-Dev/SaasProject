import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'

const features = [
  { name: 'Quadro Kanban', flowdesk: true, trello: true, asana: true },
  { name: 'Vista Calendário', flowdesk: true, trello: false, asana: true },
  { name: 'Vista Lista', flowdesk: true, trello: false, asana: true },
  { name: 'Relatórios e gráficos', flowdesk: true, trello: false, asana: 'pago' },
  { name: 'Etiquetas de tarefas', flowdesk: true, trello: true, asana: true },
  { name: 'Comentários em tarefas', flowdesk: true, trello: true, asana: true },
  { name: 'Command palette (⌘K)', flowdesk: true, trello: false, asana: false },
  { name: 'Gestão de equipe e roles', flowdesk: true, trello: 'pago', asana: 'pago' },
  { name: 'Painel admin da plataforma', flowdesk: true, trello: false, asana: false },
  { name: 'Modo escuro nativo', flowdesk: true, trello: false, asana: false },
  { name: 'Notificações em tempo real', flowdesk: true, trello: true, asana: true },
  { name: 'Grátis para começar', flowdesk: true, trello: true, asana: true },
]

type CellValue = boolean | 'pago'

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (value === true)
    return <Check size={16} className={highlight ? 'text-[#059669] mx-auto' : 'text-[#059669] mx-auto'} />
  if (value === 'pago')
    return (
      <span className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#F59E0B]">
        <Minus size={12} /> Pago
      </span>
    )
  return <X size={15} className="text-[#D1D5DB] mx-auto" />
}

export default function Comparison() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-[#1F2937]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Comparativo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Por que escolher o Flowdesk?
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto text-base">
            Mais recursos no plano gratuito, interface mais limpa e funcionalidades que a concorrência cobra à parte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-4 bg-[#F9FAFB] dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#374151]">
            <div className="p-4 text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">Funcionalidade</div>
            {[
              { name: 'Flowdesk', highlight: true },
              { name: 'Trello', highlight: false },
              { name: 'Asana', highlight: false },
            ].map(tool => (
              <div
                key={tool.name}
                className={`p-4 text-center ${tool.highlight ? 'bg-[#059669]/5 border-l border-[#059669]/20' : ''}`}
              >
                <p className={`text-sm font-bold ${tool.highlight ? 'text-[#059669]' : 'text-[#1F2937] dark:text-[#F9FAFB]'}`}>
                  {tool.name}
                </p>
                {tool.highlight && (
                  <span className="text-[9px] font-semibold bg-[#059669] text-white px-1.5 py-0.5 rounded-full">
                    VOCÊ ESTÁ AQUI
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {features.map((feature, i) => (
            <div
              key={feature.name}
              className={`grid grid-cols-4 border-b last:border-b-0 border-[#F3F4F6] dark:border-[#374151] ${i % 2 === 0 ? '' : 'bg-[#FAFAFA] dark:bg-[#111827]/50'}`}
            >
              <div className="px-4 py-3 text-sm text-[#374151] dark:text-[#D1D5DB]">{feature.name}</div>
              <div className="px-4 py-3 flex items-center justify-center bg-[#059669]/5 border-l border-[#059669]/20">
                <Cell value={feature.flowdesk as CellValue} highlight />
              </div>
              <div className="px-4 py-3 flex items-center justify-center">
                <Cell value={feature.trello as CellValue} />
              </div>
              <div className="px-4 py-3 flex items-center justify-center">
                <Cell value={feature.asana as CellValue} />
              </div>
            </div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          Comparativo baseado nos planos gratuitos/básicos de cada ferramenta · Atualizado em maio 2026
        </p>
      </div>
    </section>
  )
}
