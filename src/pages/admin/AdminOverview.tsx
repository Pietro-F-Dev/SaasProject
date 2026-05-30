import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, TrendingUp, DollarSign, UserCheck, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, LabelList,
} from 'recharts'
import { api } from '../../lib/api'

const planColors: Record<string, string> = {
  free: 'text-white/50 bg-white/5',
  pro: 'text-[#059669] bg-[#059669]/10',
  enterprise: 'text-[#6366F1] bg-[#6366F1]/10',
}

interface Stats {
  totalUsers: number
  activeUsers: number
  totalMRR: number
  planDist: { name: string; plan: string; count: number; fill: string }[]
  recentUsers: { id: string; name: string; email: string; avatar: string; plan: string; createdAt: string }[]
  monthlySignups: { month: string; cadastros: number }[]
}

function AdminTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-white">{label}</p>
      <p className="text-[#059669] mt-0.5">{payload[0].value} cadastros</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-white">{label}</p>
      <p className="text-white/60 mt-0.5">{payload[0].value} contas</p>
    </div>
  )
}

function AnimatedCounter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || to === 0) { setValue(to); return }
    const duration = 1200
    const steps = 60
    const increment = to / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= to) { setValue(to); clearInterval(timer) }
      else setValue(Math.round(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, to])

  return <span ref={ref}>{prefix}{value.toLocaleString('pt-BR')}{suffix}</span>
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Stats>('/api/admin/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalMRR = stats?.totalMRR ?? 0
  const conversionRate = stats && stats.totalUsers > 0
    ? Math.round(((stats.planDist.find(p => p.plan !== 'free')?.count ?? 0) / stats.totalUsers) * 100)
    : 0

  const kpis = [
    { label: 'Total de contas', to: stats?.totalUsers ?? 0, prefix: '', suffix: '', icon: Users, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
    { label: 'MRR', to: totalMRR, prefix: 'R$', suffix: '', icon: DollarSign, color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
    { label: 'Usuários ativos', to: stats?.activeUsers ?? 0, prefix: '', suffix: '', icon: TrendingUp, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
    { label: 'Contas pagas', to: conversionRate, prefix: '', suffix: '%', icon: UserCheck, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
  ]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-56 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-white">Visão geral da plataforma</h1>
        <p className="text-sm text-white/40 mt-1">Dados reais do banco de dados</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white overflow-hidden text-ellipsis whitespace-nowrap">
              <AnimatedCounter to={stat.to} prefix={stat.prefix} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight size={10} className="text-[#059669]" />
              <p className="text-[10px] text-[#059669]">dados em tempo real</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 overflow-hidden"
        >
          <h2 className="font-semibold text-white mb-1 text-sm">Novos cadastros</h2>
          <p className="text-xs text-white/40 mb-4">Últimos 6 meses</p>
          <div className="overflow-hidden">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={stats?.monthlySignups ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<AdminTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="cadastros" stroke="#059669" strokeWidth={2.5} fill="url(#adminAreaGrad)" dot={{ fill: '#059669', r: 3.5, strokeWidth: 2, stroke: '#0F172A' }} activeDot={{ r: 5.5, fill: '#059669', stroke: '#0F172A', strokeWidth: 2.5 }} />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5 overflow-hidden"
        >
          <h2 className="font-semibold text-white mb-1 text-sm">Distribuição de planos</h2>
          <p className="text-xs text-white/40 mb-4">Total de contas</p>
          <div className="overflow-hidden">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stats?.planDist ?? []} margin={{ top: 16, right: 4, left: -5, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(stats?.planDist ?? []).map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.9} />)}
                <LabelList dataKey="count" position="top" style={{ fontSize: 10, fontWeight: 600, fill: 'rgba(255,255,255,0.4)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {(stats?.planDist ?? []).map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                  <span className="text-white/60">{p.name}</span>
                </div>
                <span className="text-white font-medium">{p.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white text-sm">Cadastros recentes</h2>
        </div>
        <div className="divide-y divide-white/5">
          {(stats?.recentUsers ?? []).map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-white/40 truncate">{u.email}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${planColors[u.plan] ?? ''}`}>
                {u.plan}
              </span>
              <span className="text-xs text-white/30 shrink-0 hidden sm:block">
                {new Date(u.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
          {(stats?.recentUsers ?? []).length === 0 && (
            <div className="py-8 text-center text-sm text-white/30">Nenhum usuário cadastrado ainda</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
