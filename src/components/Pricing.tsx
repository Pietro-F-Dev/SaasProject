import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    description: 'Para freelancers e projetos pessoais.',
    cta: 'Começar grátis',
    highlighted: false,
    features: [
      'Até 3 projetos ativos',
      'Até 5 membros',
      'Kanban básico',
      'Integrações limitadas',
      'Suporte por e-mail',
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    description: 'Para times que precisam de mais poder.',
    cta: 'Começar com Pro',
    highlighted: true,
    badge: 'Mais popular',
    features: [
      'Projetos ilimitados',
      'Até 20 membros',
      'Relatórios e métricas',
      'Todas as integrações',
      'Alertas automáticos',
      'Suporte prioritário',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    description: 'Para grandes times com necessidades avançadas.',
    cta: 'Falar com vendas',
    highlighted: false,
    features: [
      'Tudo do plano Pro',
      'Membros ilimitados',
      'SSO / SAML',
      'API pública',
      'Auditoria e logs',
      'SLA garantido',
      'Gerente de conta dedicado',
    ],
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const navigate = useNavigate()

  const getPrice = (monthly: number) => {
    if (monthly === 0) return 'R$0'
    const price = annual ? Math.round(monthly * 0.8) : monthly
    return `R$${price}`
  }

  return (
    <section id="preços" className="py-24 px-6 bg-white dark:bg-[#1F2937]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">Preços</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-3 mb-4">
            Simples e transparente
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto text-base mb-8">
            Sem taxas escondidas. Cancele a qualquer momento. Todos os planos incluem 14 dias grátis.
          </p>

          <div className="inline-flex items-center bg-[#F3F4F6] dark:bg-[#111827] rounded-lg p-1 gap-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                !annual
                  ? 'bg-white dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF]'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                annual
                  ? 'bg-white dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF]'
              }`}
            >
              Anual
              <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? 'border-[#059669] shadow-lg shadow-[#059669]/10 bg-white dark:bg-[#111827]'
                  : 'border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-[#059669] text-white px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <motion.span
                    key={`${plan.name}-${annual}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB]"
                  >
                    {getPrice(plan.monthlyPrice)}
                  </motion.span>
                  <span className="text-[#9CA3AF] text-sm mb-1">/mês</span>
                </div>
                {annual && plan.monthlyPrice > 0 && (
                  <p className="text-xs text-[#059669] mt-1">Cobrado anualmente · você economiza R${Math.round(plan.monthlyPrice * 12 * 0.2)}/ano</p>
                )}
              </div>

              {plan.name === 'Enterprise' ? (
                <button
                  onClick={() => navigate(`/checkout?plan=enterprise${annual ? '&annual=true' : ''}`)}
                  className="block w-full text-center text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mb-8 border border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] hover:bg-[#F9FAFB] dark:hover:bg-[#374151]"
                >
                  {plan.cta}
                </button>
              ) : plan.name === 'Pro' ? (
                <Link
                  to={`/checkout?plan=pro${annual ? '&annual=true' : ''}`}
                  className="block text-center text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mb-8 bg-[#059669] hover:bg-[#047857] text-white"
                >
                  {plan.cta}
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block text-center text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mb-8 border border-[#E5E7EB] dark:border-[#374151] text-[#1F2937] dark:text-[#F9FAFB] hover:bg-[#F9FAFB] dark:hover:bg-[#374151]"
                >
                  {plan.cta}
                </Link>
              )}

              <ul className="flex flex-col gap-3">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    <Check size={16} className="text-[#059669] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
