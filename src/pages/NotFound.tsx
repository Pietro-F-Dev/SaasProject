import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#111827] flex flex-col items-center justify-center px-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap size={22} className="text-[#059669]" />
          <span className="font-bold text-xl text-[#1F2937] dark:text-[#F9FAFB]">Flowdesk</span>
        </div>

        <motion.div
          className="text-[120px] font-black text-[#E5E7EB] dark:text-[#374151] leading-none mb-4 select-none"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          404
        </motion.div>

        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mb-3">
          Página não encontrada
        </h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm leading-relaxed mb-8">
          A página que você está procurando não existe ou foi movida. Verifique o endereço ou volte para o início.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] dark:border-[#374151] px-5 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-white dark:hover:bg-[#1F2937] transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Home size={16} /> Ir para o início
          </Link>
        </div>

        <motion.div
          className="mt-12 text-xs text-[#9CA3AF]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Erro 404 · Flowdesk
        </motion.div>
      </motion.div>
    </div>
  )
}
