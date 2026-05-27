import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Ana Souza',
    role: 'Head of Product · TechNova',
    avatar: 'AS',
    content: 'O Flowdesk transformou a forma como nosso time trabalha. Reduzimos reuniões de alinhamento em 40% só nas primeiras duas semanas.',
  },
  {
    name: 'Carlos Mendes',
    role: 'CTO · Buildly',
    avatar: 'CM',
    content: 'A visibilidade que o Flowdesk nos dá sobre prazos e gargalos é incomparável. Nossos clientes perceberam a melhora nas entregas.',
  },
  {
    name: 'Rafaela Lima',
    role: 'Engineering Manager · Infraco',
    avatar: 'RL',
    content: 'Migramos de três ferramentas diferentes para o Flowdesk. A equipe adorou a simplicidade sem abrir mão do poder.',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#F9FAFB] dark:bg-[#111827]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Depoimentos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Times que confiam no Flowdesk
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto text-base">
            Mais de 2.000 times usam o Flowdesk para entregar projetos com mais consistência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-[#374151] dark:text-[#D1D5DB] leading-relaxed mb-6">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-xs font-semibold text-[#059669]">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">{t.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
