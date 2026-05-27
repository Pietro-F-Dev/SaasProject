import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'Preciso de cartão de crédito para o plano gratuito?',
    a: 'Não. O plano Free é 100% gratuito e você não precisa inserir nenhum dado de pagamento para começar.',
  },
  {
    q: 'Posso mudar de plano a qualquer momento?',
    a: 'Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O ajuste é feito de forma proporcional no próximo ciclo de cobrança.',
  },
  {
    q: 'Como funciona a colaboração em tempo real?',
    a: 'Todas as atualizações de tarefas, comentários e status são sincronizadas instantaneamente para todos os membros do projeto, sem necessidade de recarregar a página.',
  },
  {
    q: 'Flowdesk tem aplicativo mobile?',
    a: 'Sim! Flowdesk possui aplicativos nativos para iOS e Android, disponíveis para todos os planos, incluindo o Free.',
  },
  {
    q: 'Como é feita a migração de outras ferramentas?',
    a: 'Oferecemos importação direta de CSV, Trello, Asana e Jira. Para planos Enterprise, nosso time de onboarding faz a migração completa sem custo adicional.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 bg-white dark:bg-[#1F2937]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Perguntas frequentes
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-[#E5E7EB] dark:divide-[#374151]">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                className="w-full flex items-center justify-between gap-4 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-[#1F2937] dark:text-[#F9FAFB] text-sm">{faq.q}</span>
                {openIndex === i ? (
                  <Minus size={16} className="text-[#059669] shrink-0" />
                ) : (
                  <Plus size={16} className="text-[#9CA3AF] shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
