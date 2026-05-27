import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, CheckCircle2, Users, ArrowRight, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, LabelList,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useProjectStore } from '../../store/projectStore'

const statusColors = { active: 'bg-[#ECFDF5] text-[#059669]', on_hold: 'bg-[#FEF3C7] text-[#D97706]', completed: 'bg-[#EFF6FF] text-[#6366F1]' }
const statusLabels = { active: 'Ativo', on_hold: 'Em espera', completed: 'Concluído' }

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#059669]">{p.value} {p.dataKey === 'concluídas' ? 'concluídas' : 'tarefas'}</p>
      ))}
    </div>
  )
}

export default function Overview() {
  const { user } = useAuth()
  const { projects, tasks } = useProjectStore()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const stats = [
    { label: 'Projetos ativos', value: projects.filter(p => p.status === 'active').length, icon: FolderOpen, color: 'text-[#6366F1]', bg: 'bg-[#EFF6FF] dark:bg-[#1e1b4b]' },
    { label: 'Tarefas em andamento', value: tasks.filter(t => t.status === 'in_progress').length, icon: TrendingUp, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7] dark:bg-[#451a03]' },
    { label: 'Tarefas concluídas', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-[#059669]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]' },
    { label: 'Total de membros', value: projects.reduce((acc, p) => acc + p.memberCount, 0), icon: Users, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2] dark:bg-[#450a0a]' },
  ]

  const statusData = [
    { name: 'A fazer', tarefas: tasks.filter(t => t.status === 'todo').length, fill: '#9CA3AF' },
    { name: 'Andamento', tarefas: tasks.filter(t => t.status === 'in_progress').length, fill: '#F59E0B' },
    { name: 'Revisão', tarefas: tasks.filter(t => t.status === 'in_review').length, fill: '#6366F1' },
    { name: 'Concluído', tarefas: tasks.filter(t => t.status === 'done').length, fill: '#059669' },
  ]

  const weekData = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      const concluídas = tasks.filter(t => {
        if (t.status !== 'done' || !t.updatedAt) return false
        const u = new Date(t.updatedAt)
        return u >= d && u <= end
      }).length
      const isToday = i === 6
      return { day: isToday ? 'Hoje' : DAY_LABELS[d.getDay()], concluídas }
    })
  }, [tasks])

  const activities = useMemo(() => {
    if (tasks.length === 0) return []
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())
      .slice(0, 4)
      .map(task => {
        const project = projects.find(p => p.id === task.projectId)
        const name = task.assignee || user?.name || 'Você'
        const avatar = name.split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
        const createdTs = new Date(task.createdAt ?? 0).getTime()
        const updatedTs = new Date(task.updatedAt ?? task.createdAt ?? 0).getTime()
        const isNew = Math.abs(updatedTs - createdTs) < 10000
        let action = 'atualizou'
        if (isNew) action = 'criou'
        else if (task.status === 'done') action = 'concluiu'
        else if (task.status === 'in_review') action = 'enviou para revisão'
        else if (task.status === 'in_progress') action = 'iniciou'
        const diffMs = Date.now() - updatedTs
        const diffMin = Math.floor(diffMs / 60000)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)
        const time = diffDay > 0 ? `${diffDay}d` : diffHour > 0 ? `${diffHour}h` : diffMin > 1 ? `${diffMin} min` : 'agora'
        return { avatar, name, action, target: `"${task.title}"`, project: project?.name ?? '', time }
      })
  }, [tasks, projects, user])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Aqui está o resumo de hoje.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">{stat.value}</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5"
        >
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-1 text-sm">Tarefas concluídas — últimos 7 dias</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Progresso semanal</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(156,163,175,0.2)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="concluídas"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={{ fill: '#059669', r: 3.5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5.5, fill: '#059669', stroke: '#fff', strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5"
        >
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-1 text-sm">Distribuição por status</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Todas as tarefas</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={statusData} margin={{ top: 16, right: 4, left: -24, bottom: 0 }} barSize={32} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(156,163,175,0.08)', radius: 6 }} />
              <Bar dataKey="tarefas" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.9} />
                ))}
                <LabelList dataKey="tarefas" position="top" style={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Projetos recentes</h2>
            <Link to="/dashboard/projects" className="text-xs text-[#059669] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-8 text-center">
              <FolderOpen size={32} className="text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Nenhum projeto ainda</p>
              <Link to="/dashboard/projects" className="text-xs text-[#059669] hover:underline mt-1 block">Criar primeiro projeto →</Link>
            </div>
          ) : (
            projects.slice(0, 3).map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id)
              const doneTasks = projectTasks.filter(t => t.status === 'done').length
              const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
              return (
                <Link
                  key={project.id}
                  to={`/dashboard/kanban/${project.id}`}
                  className="block bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <div>
                        <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">{project.name}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{projectTasks.length} tarefas · {project.memberCount} membros</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#E5E7EB] dark:bg-[#374151] rounded-full">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                    </div>
                    <span className="text-xs text-[#9CA3AF] shrink-0">{progress}%</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        <div>
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Atividade recente</h2>
          <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl divide-y divide-[#F3F4F6] dark:divide-[#374151]">
            {activities.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-[#9CA3AF]">Nenhuma atividade ainda</p>
              </div>
            ) : activities.map((a, i) => (
              <div key={i} className="flex gap-3 p-3">
                <div className="w-7 h-7 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-[10px] font-bold text-[#059669] shrink-0">
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed">
                    <span className="font-medium">{a.name}</span> {a.action} {a.target}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {a.project && <span className="text-[10px] text-[#9CA3AF]">{a.project} ·</span>}
                    <span className="text-[10px] text-[#9CA3AF]">{a.time} atrás</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
