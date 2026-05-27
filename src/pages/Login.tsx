import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const ok = await login(data.email, data.password)
    setLoading(false)
    if (ok) navigate('/dashboard')
  }

  const handleDemo = () => {
    setValue('email', 'admin@flowdesk.com')
    setValue('password', 'admin@flowdesk2026')
    handleSubmit(onSubmit)()
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#111827] flex items-center justify-center px-4">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-[#1F2937] dark:text-[#F9FAFB]">
            <Zap size={24} className="text-[#059669]" />
            Flowdesk
          </Link>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-6 mb-1">Entrar na sua conta</h1>
          <p className="text-sm text-[#6B7280]">Bem-vindo de volta!</p>
        </div>

        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full mb-4 py-2.5 border-2 border-dashed border-[#059669]/50 text-[#059669] rounded-lg text-sm font-medium hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 transition-colors disabled:opacity-50"
        >
          ✨ Continuar como demo
        </button>

        <div className="relative flex items-center mb-4">
          <div className="flex-1 border-t border-[#E5E7EB] dark:border-[#374151]" />
          <span className="px-3 text-xs text-[#9CA3AF]">ou</span>
          <div className="flex-1 border-t border-[#E5E7EB] dark:border-[#374151]" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="seu@email.com"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-[#9CA3AF]"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-[#9CA3AF]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#059669] hover:bg-[#047857] disabled:opacity-70 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-[#059669] hover:underline font-medium">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
