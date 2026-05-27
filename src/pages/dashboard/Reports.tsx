import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, TrendingUp, CheckCircle2, Clock, Target, BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, LabelList,
} from 'recharts'
import { useProjectStore } from '../../store/projectStore'
import toast from 'react-hot-toast'

const COLORS = { todo: '#9CA3AF', in_progress: '#F59E0B', in_review: '#6366F1', done: '#059669' }
const LABELS = { todo: 'A fazer', in_progress: 'Em andamento', in_review: 'Em revisão', done: 'Concluído' }

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-xl px-3 py-2.5 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-[#6B7280] dark:text-[#9CA3AF]">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
      <BarChart2 size={28} className="text-[#E5E7EB] dark:text-[#374151]" />
      <p className="text-xs text-[#9CA3AF]">{message}</p>
    </div>
  )
}

type Period = '7d' | '30d' | '90d'

const PERIOD_MONTHS: Record<Period, number> = { '7d': 1, '30d': 3, '90d': 6 }

export default function Reports() {
  const { projects, tasks } = useProjectStore()
  const [period, setPeriod] = useState<Period>('30d')

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const statusDist = (['todo', 'in_progress', 'in_review', 'done'] as const).map(s => ({
    name: LABELS[s],
    value: tasks.filter(t => t.status === s).length,
    color: COLORS[s],
  }))

  const projectProgress = projects.map(p => {
    const pt = tasks.filter(t => t.projectId === p.id)
    const done = pt.filter(t => t.status === 'done').length
    return {
      name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
      progresso: pt.length > 0 ? Math.round((done / pt.length) * 100) : 0,
      fill: p.color,
    }
  })

  // Monthly chart: tasks created vs completed — derived from createdAt / updatedAt
  const monthlyData = useMemo(() => {
    const numMonths = PERIOD_MONTHS[period]
    const months = Array.from({ length: numMonths }, (_, i) => {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - (numMonths - 1 - i))
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        mes: d.toLocaleString('pt-BR', { month: 'short' }),
      }
    })
    return months.map(({ year, month, mes }) => {
      const criadas = tasks.filter(t => {
        if (!t.createdAt) return false
        const d = new Date(t.createdAt)
        return d.getFullYear() === year && d.getMonth() === month
      }).length
      const concluídas = tasks.filter(t => {
        if (t.status !== 'done' || !t.updatedAt) return false
        const d = new Date(t.updatedAt)
        return d.getFullYear() === year && d.getMonth() === month
      }).length
      return { mes, criadas, concluídas }
    })
  }, [tasks, period])

  // Velocity chart: tasks completed per week (last 6 weeks)
  const velocityData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      end.setDate(end.getDate() - (5 - i) * 7 + 6)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)

      const concluídas = tasks.filter(t => {
        if (t.status !== 'done' || !t.updatedAt) return false
        const d = new Date(t.updatedAt)
        return d >= start && d <= end
      }).length

      return { semana: `S${i + 1}`, concluídas }
    })
  }, [tasks])

  const hasMonthlyData = monthlyData.some(d => d.criadas > 0 || d.concluídas > 0)
  const hasVelocityData = velocityData.some(d => d.concluídas > 0)

  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify({ projects, tasks }, null, 2)], { type: 'application/json' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'flowdesk-report.json'; a.click()
    } else {
      const header = 'id,title,status,priority,projectId,dueDate\n'
      const rows = tasks.map(t => `${t.id},"${t.title}",${t.status},${t.priority},${t.projectId},${t.dueDate ?? ''}`).join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'flowdesk-tasks.csv'; a.click()
    }
    toast.success(`Exportado como ${format.toUpperCase()}`)
  }

  const kpis = [
    { label: 'Total de tarefas', value: totalTasks, icon: Target, color: 'text-[#6366F1]', bg: 'bg-[#EFF6FF] dark:bg-[#1e1b4b]' },
    { label: 'Concluídas', value: doneTasks, icon: CheckCircle2, color: 'text-[#059669]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]' },
    { label: 'Em andamento', value: inProgressTasks, icon: Clock, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7] dark:bg-[#451a03]' },
    { label: 'Taxa de conclusão', value: `${completionRate}%`, icon: TrendingUp, color: 'text-[#059669]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">Relatórios</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Análise de desempenho e progresso dos projetos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F3F4F6] dark:bg-[#374151] rounded-lg p-0.5">
            {(['7d', '30d', '90d'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937]'}`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
          <div className="relative group">
            <motion.button
              className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            >
              <Download size={15} /> Exportar
            </motion.button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg shadow-lg py-1 z-10 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button onClick={() => handleExport('csv')} className="w-full text-left px-3 py-1.5 text-sm text-[#374151] dark:text-[#D1D5DB] hover:bg-[#F9FAFB] dark:hover:bg-[#374151]">CSV</button>
              <button onClick={() => handleExport('json')} className="w-full text-left px-3 py-1.5 text-sm text-[#374151] dark:text-[#D1D5DB] hover:bg-[#F9FAFB] dark:hover:bg-[#374151]">JSON</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
            <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon size={20} className={k.color} />
            </div>
            <p className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">{k.value}</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
          <h2 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB] mb-1">Tarefas criadas vs concluídas</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Baseado em datas reais de criação e conclusão</p>
          <div style={{ height: 180 }}>
            {hasMonthlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCriadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradConcluidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(156,163,175,0.2)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="criadas" name="Criadas" stroke="#6366F1" strokeWidth={2.5} fill="url(#gradCriadas)" dot={false} activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2.5 }} />
                  <Area type="monotone" dataKey="concluídas" name="Concluídas" stroke="#059669" strokeWidth={2.5} fill="url(#gradConcluidas)" dot={false} activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2.5 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma tarefa criada no período selecionado" />
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
          <h2 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB] mb-1">Distribuição por status</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Todas as tarefas</p>
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-[#1F2937] dark:text-[#F9FAFB] leading-none">{totalTasks}</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">total</p>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {statusDist.map(s => (
                <div key={s.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-[#F3F4F6] dark:bg-[#374151] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${totalTasks > 0 ? Math.round((s.value / totalTasks) * 100) : 0}%`, backgroundColor: s.color }} />
                    </div>
                    <span className="text-xs font-semibold text-[#1F2937] dark:text-[#F9FAFB] w-4 text-right">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
          <h2 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB] mb-1">Progresso por projeto</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">% de tarefas concluídas</p>
          <div style={{ height: 160 }}>
            {projectProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgress} margin={{ top: 18, right: 4, left: -24, bottom: 0 }} barSize={26} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(156,163,175,0.08)', radius: 6 }} />
                  <Bar dataKey="progresso" name="Progresso" radius={[6, 6, 0, 0]}>
                    {projectProgress.map((p, i) => <Cell key={i} fill={p.fill} fillOpacity={0.9} />)}
                    <LabelList dataKey="progresso" position="top" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhum projeto encontrado" />
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
          <h2 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB] mb-1">Tarefas concluídas por semana</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Baseado na data de conclusão real</p>
          <div style={{ height: 160 }}>
            {hasVelocityData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradVel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(156,163,175,0.2)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="concluídas"
                    name="Concluídas"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#gradVel)"
                    dot={{ fill: '#059669', r: 3.5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5.5, fill: '#059669', stroke: '#fff', strokeWidth: 2.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Nenhuma tarefa concluída nas últimas 6 semanas" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
