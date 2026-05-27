import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Kanban, FolderOpen, AtSign, Info } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import type { NotificationType } from '../store/notificationStore'

const typeIcons: Record<NotificationType, React.ReactNode> = {
  task: <Kanban size={14} className="text-[#6366F1]" />,
  project: <FolderOpen size={14} className="text-[#059669]" />,
  mention: <AtSign size={14} className="text-[#F59E0B]" />,
  system: <Info size={14} className="text-[#9CA3AF]" />,
}

export default function NotificationBell() {
  const { notifications, markAllRead, markRead } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length

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
                    onClick={markAllRead}
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
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] dark:hover:bg-[#374151]/60 transition-colors ${!n.read ? 'bg-[#F0FDF4] dark:bg-[#064E3B]/20' : ''}`}
                >
                  {n.avatar ? (
                    <div className="w-8 h-8 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-[10px] font-bold text-[#059669] shrink-0">
                      {n.avatar}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#374151] flex items-center justify-center shrink-0">
                      {typeIcons[n.type]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{n.title}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-[#059669] rounded-full mt-1.5 shrink-0" />}
                </button>
              ))}
            </div>

            {notifications.every(n => n.read) && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-[#9CA3AF]">Tudo em dia! 🎉</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
