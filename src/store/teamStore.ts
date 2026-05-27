import { create } from 'zustand'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

export interface TeamMember {
  memberId: string
  id: string
  name: string
  email: string
  avatar: string
  role: TeamRole
  joinedAt: string
}

export interface Invitation {
  id: string
  email: string
  role: TeamRole
  sentAt: string
  status: InviteStatus
}

interface TeamStore {
  members: TeamMember[]
  invitations: Invitation[]
  loaded: boolean
  init: () => Promise<void>
  reset: () => void
  updateRole: (memberId: string, role: TeamRole) => void
  removeMember: (memberId: string) => void
  inviteMember: (email: string, role: TeamRole) => void
  cancelInvitation: (id: string) => void
  resendInvitation: (id: string) => void
}

type ApiInvitation = { id: string; email: string; role: string; status: string; createdAt: string }

export const useTeamStore = create<TeamStore>()((set, get) => ({
  members: [],
  invitations: [],
  loaded: false,

  init: async () => {
    if (get().loaded) return
    try {
      const [members, invitations] = await Promise.all([
        api.get<TeamMember[]>('/api/team'),
        api.get<ApiInvitation[]>('/api/team/invitations'),
      ])
      set({
        members,
        invitations: invitations.map(i => ({
          id: i.id,
          email: i.email,
          role: i.role as TeamRole,
          sentAt: i.createdAt.split('T')[0],
          status: i.status as InviteStatus,
        })),
        loaded: true,
      })
    } catch {
      set({ loaded: true })
    }
  },

  reset: () => set({ members: [], invitations: [], loaded: false }),

  updateRole: (memberId, role) => {
    set(s => ({ members: s.members.map(m => m.memberId === memberId ? { ...m, role } : m) }))
    api.patch(`/api/team/${memberId}/role`, { role }).catch(() => {
      toast.error('Erro ao atualizar permissão')
      set(s => ({ members: s.members.map(m => m.memberId === memberId ? { ...m, role: m.role } : m) }))
    })
  },

  removeMember: (memberId) => {
    const backup = get().members.find(m => m.memberId === memberId)
    set(s => ({ members: s.members.filter(m => m.memberId !== memberId) }))
    api.delete(`/api/team/${memberId}`).catch(() => {
      if (backup) set(s => ({ members: [...s.members, backup] }))
      toast.error('Erro ao remover membro')
    })
  },

  inviteMember: (email, role) => {
    const tempId = `temp-${Date.now()}`
    const temp: Invitation = { id: tempId, email, role, sentAt: new Date().toISOString().split('T')[0], status: 'pending' }
    set(s => ({ invitations: [...s.invitations, temp] }))
    api.post<ApiInvitation>('/api/team/invitations', { email, role }).then(created => {
      set(s => ({
        invitations: s.invitations.map(i => i.id === tempId
          ? { ...temp, id: created.id, sentAt: created.createdAt.split('T')[0] }
          : i
        ),
      }))
    }).catch(() => {
      set(s => ({ invitations: s.invitations.filter(i => i.id !== tempId) }))
      toast.error('Erro ao enviar convite')
    })
  },

  cancelInvitation: (id) => {
    const backup = get().invitations.find(i => i.id === id)
    set(s => ({ invitations: s.invitations.filter(i => i.id !== id) }))
    api.delete(`/api/team/invitations/${id}`).catch(() => {
      if (backup) set(s => ({ invitations: [...s.invitations, backup] }))
      toast.error('Erro ao cancelar convite')
    })
  },

  resendInvitation: (id) => {
    set(s => ({
      invitations: s.invitations.map(i =>
        i.id === id ? { ...i, sentAt: new Date().toISOString().split('T')[0] } : i
      ),
    }))
    api.post(`/api/team/invitations/${id}/resend`).catch(() => toast.error('Erro ao reenviar convite'))
  },
}))
