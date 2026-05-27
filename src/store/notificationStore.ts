import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'task' | 'project' | 'mention' | 'system'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  time: string
  avatar?: string
}

interface NotificationStore {
  notifications: Notification[]
  markAllRead: () => void
  markRead: (id: string) => void
}

const initialNotifications: Notification[] = [
  { id: 'n1', title: 'Nova tarefa atribuída', message: 'Carlos Mendes atribuiu "Integração com Stripe" para você', type: 'task', read: false, time: '2 min atrás', avatar: 'CM' },
  { id: 'n2', title: 'Projeto atualizado', message: 'Ana Souza moveu "Layout do dashboard" para Em revisão', type: 'project', read: false, time: '1h atrás', avatar: 'AS' },
  { id: 'n3', title: 'Menção em comentário', message: 'Rafaela Lima mencionou você em "Telas de onboarding"', type: 'mention', read: false, time: '3h atrás', avatar: 'RL' },
  { id: 'n4', title: 'Prazo se aproximando', message: '"Website Redesign" vence em 5 dias', type: 'system', read: true, time: '1d atrás' },
  { id: 'n5', title: 'Tarefa concluída', message: 'Rafaela Lima concluiu "Telas de onboarding"', type: 'task', read: true, time: '1d atrás', avatar: 'RL' },
]

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: initialNotifications,
      markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      markRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
    }),
    { name: 'flowdesk-notifications' }
  )
)
