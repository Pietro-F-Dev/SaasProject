import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CTABanner() {
  return (
    <section className="py-24 px-6 bg-[#F9FAFB] dark:bg-[#111827]">
      <motion.div
        className="max-w-4xl mx-auto bg-[#059669] rounded-3xl px-8 py-16 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -right-10 w-80 h-80 rounded-full bg-white" />
        </div>

        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Pronto para transformar a forma como seu time trabalha?
          </h2>
          <p className="text-green-100 text-base mb-8 max-w-xl mx-auto">
            Comece gratuitamente hoje. Sem cartão de crédito, sem burocracia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#059669] hover:bg-green-50 px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Começar gratuitamente
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => toast.success('Mensagem recebida! Nossa equipe entrará em contato.', { duration: 4000 })}
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              Falar com a equipe
            </button>
          </div>
          <p className="mt-5 text-xs text-green-100/70">
            Grátis por 14 dias · Cancele quando quiser
          </p>
        </div>
      </motion.div>
    </section>
  )
}
