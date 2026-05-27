import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function Signup() {
  const { signup } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const ok = await signup(data.name, data.email, data.password)
    setLoading(false)
    if (ok) {
      localStorage.setItem('flowdesk_onboarding_needed', 'true')
      navigate('/dashboard')
    }
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
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-6 mb-1">Criar sua conta</h1>
          <p className="text-sm text-[#6B7280]">Grátis por 14 dias, sem cartão de crédito</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Nome completo</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Seu nome"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-[#9CA3AF]"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

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
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-[#9CA3AF]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Confirmar senha</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Repita a senha"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent placeholder:text-[#9CA3AF]"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#059669] hover:bg-[#047857] disabled:opacity-70 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Criando conta...' : 'Criar conta grátis'}
          </button>
        </form>

        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="#" className="text-[#059669] hover:underline">Termos de Uso</a>
        </p>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-[#059669] hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
