import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Kanban, AlertCircle, Info } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import { useProjectStore } from '../store/projectStore'

type NotifType = 'task_done' | 'task_review' | 'deadline' | 'system'

interface Notif {
  id: string
  title: string
  message: string
  type: NotifType
  time: string
}

function relativeTime(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m} min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

const typeConfig: Record<NotifType, { icon: React.ReactNode; bg: string }> = {
  task_done:   { icon: <Check size={14} className="text-[#059669]" />,       bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]' },
  task_review: { icon: <Kanban size={14} className="text-[#6366F1]" />,      bg: 'bg-[#EEF2FF] dark:bg-[#1e1b4b]' },
  deadline:    { icon: <AlertCircle size={14} className="text-[#EF4444]" />, bg: 'bg-[#FEF2F2] dark:bg-[#450a0a]' },
  system:      { icon: <Info size={14} className="text-[#9CA3AF]" />,        bg: 'bg-[#F3F4F6] dark:bg-[#374151]' },
}

export default function NotificationBell() {
  const { readIds, markRead, markAllRead } = useNotificationStore()
  const { tasks } = useProjectStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const notifications = useMemo<Notif[]>(() => {
    const list: Notif[] = []
    const now = Date.now()
    const threeDays = 3 * 24 * 60 * 60 * 1000

    tasks
      .filter(t => t.dueDate && t.status !== 'done')
      .forEach(t => {
        const diff = new Date(t.dueDate!).getTime() - now
        if (diff > 0 && diff < threeDays) {
          const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
          list.push({
            id: `deadline-${t.id}`,
            title: 'Prazo se aproximando',
            message: `"${t.title}" vence em ${days} dia${days > 1 ? 's' : ''}`,
            type: 'deadline',
            time: relativeTime(t.updatedAt ?? t.createdAt),
          })
        }
      })

    tasks
      .filter(t => t.status === 'done')
      .slice(0, 4)
      .forEach(t => {
        list.push({
          id: `done-${t.id}`,
          title: 'Tarefa concluída',
          message: `"${t.title}" foi marcada como concluída`,
          type: 'task_done',
          time: relativeTime(t.updatedAt ?? t.createdAt),
        })
      })

    tasks
      .filter(t => t.status === 'in_review')
      .slice(0, 3)
      .forEach(t => {
        list.push({
          id: `review-${t.id}`,
          title: 'Aguardando revisão',
          message: `"${t.title}" está aguardando revisão`,
          type: 'task_review',
          time: relativeTime(t.updatedAt ?? t.createdAt),
        })
      })

    return list.slice(0, 8)
  }, [tasks])

  const readSet = new Set(readIds)
  const unread = notifications.filter(n => !readSet.has(n.id)).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB]">Notificações</h3>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-[#EF4444] text-white px-1.5 py-0.5 rounded-full">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={() => markAllRead(notifications.map(n => n.id))}
                    className="text-xs text-[#059669] hover:underline flex items-center gap-1"
                  >
                    <Check size={12} /> Marcar todas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#F3F4F6] dark:divide-[#374151]">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#9CA3AF]">Nenhuma notificação</p>
                  <p className="text-xs text-[#D1D5DB] mt-1">Atividades das tarefas aparecem aqui</p>
                </div>
              ) : notifications.map(n => {
                const isRead = readSet.has(n.id)
                const cfg = typeConfig[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] dark:hover:bg-[#374151]/60 transition-colors ${!isRead ? 'bg-[#F0FDF4] dark:bg-[#064E3B]/20' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{n.title}</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      {n.time && <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>}
                    </div>
                    {!isRead && <div className="w-2 h-2 bg-[#059669] rounded-full mt-1.5 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {notifications.length > 0 && unread === 0 && (
              <div className="px-4 py-3 border-t border-[#E5E7EB] dark:border-[#374151] text-center">
                <p className="text-xs text-[#9CA3AF]">Tudo em dia 🎉</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
