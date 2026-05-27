import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Trash2, X, Mail, ChevronDown, Users, Clock, Shield, Crown, Eye, Loader2 } from 'lucide-react'
import { useTeamStore } from '../../store/teamStore'
import type { TeamRole, TeamMember } from '../../store/teamStore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const roleConfig: Record<TeamRole, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  owner: { label: 'Proprietário', icon: <Crown size={11} />, color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7] dark:bg-[#451a03]' },
  admin: { label: 'Admin', icon: <Shield size={11} />, color: 'text-[#6366F1]', bg: 'bg-[#EFF6FF] dark:bg-[#1e1b4b]' },
  member: { label: 'Membro', icon: <Users size={11} />, color: 'text-[#059669]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]' },
  viewer: { label: 'Visualizador', icon: <Eye size={11} />, color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6] dark:bg-[#374151]' },
}

const rolePermissions: Record<TeamRole, string[]> = {
  owner: ['Acesso total', 'Gerenciar membros', 'Gerenciar plano', 'Deletar workspace'],
  admin: ['Criar e editar projetos', 'Gerenciar tarefas', 'Convidar membros', 'Ver relatórios'],
  member: ['Criar e editar tarefas', 'Comentar', 'Ver projetos atribuídos'],
  viewer: ['Visualizar projetos', 'Visualizar tarefas', 'Sem edição'],
}

function RoleBadge({ role }: { role: TeamRole }) {
  const c = roleConfig[role]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.color}`}>
      {c.icon} {c.label}
    </span>
  )
}

export default function Team() {
  const { members, invitations, updateRole, removeMember, inviteMember, cancelInvitation, resendInvitation, init } = useTeamStore()
  const { user } = useAuth()

  useEffect(() => { init() }, [init])
  const [tab, setTab] = useState<'members' | 'invitations'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null)
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null)

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin'
  const pendingCount = invitations.filter(i => i.status === 'pending').length

  const handleRemove = (member: TeamMember) => {
    removeMember(member.memberId)
    toast.success(`${member.name} removido da equipe`)
    setConfirmRemove(null)
  }

  const handleRoleChange = (memberId: string, role: TeamRole) => {
    updateRole(memberId, role)
    toast.success('Permissão atualizada')
    setOpenRoleMenu(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">Equipe</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{members.length} membros · {pendingCount} convites pendentes</p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} /> Convidar membro
          </button>
        )}
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(roleConfig) as [TeamRole, typeof roleConfig[TeamRole]][]).map(([role, config]) => (
          <div key={role} className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`${config.color}`}>{config.icon}</span>
              <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
            </div>
            <ul className="space-y-0.5">
              {rolePermissions[role].map(p => (
                <li key={p} className="text-[10px] text-[#9CA3AF] leading-relaxed">· {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5E7EB] dark:border-[#374151]">
        <button
          onClick={() => setTab('members')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'members' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937] dark:hover:text-[#F9FAFB]'}`}
        >
          Membros <span className="ml-1.5 text-xs bg-[#F3F4F6] dark:bg-[#374151] text-[#6B7280] px-1.5 py-0.5 rounded-full">{members.length}</span>
        </button>
        <button
          onClick={() => setTab('invitations')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'invitations' ? 'border-[#059669] text-[#059669]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937] dark:hover:text-[#F9FAFB]'}`}
        >
          Convites pendentes
          {pendingCount > 0 && (
            <span className="ml-1.5 text-xs bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'members' ? (
          <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl overflow-hidden">
              <div className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                {members.map((member, i) => {
                  const isCurrentUser = member.email === user?.email
                  const canManage = isOwnerOrAdmin && !isCurrentUser && member.role !== 'owner'
                  const joinedAt = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : ''

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-xs font-bold text-[#059669]">
                          {member.avatar}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1F2937] ${isCurrentUser ? 'bg-[#059669]' : 'bg-[#9CA3AF]'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] truncate">{member.name}</p>
                          {isCurrentUser && <span className="text-[10px] text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#374151] px-1.5 py-0.5 rounded">Você</span>}
                        </div>
                        <p className="text-xs text-[#9CA3AF] truncate">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] shrink-0 hidden sm:flex">
                        <Clock size={11} /> entrou em {joinedAt}
                      </div>

                      {/* Role selector */}
                      <div className="relative shrink-0">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => setOpenRoleMenu(openRoleMenu === member.memberId ? null : member.memberId)}
                              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            >
                              <RoleBadge role={member.role} />
                              <ChevronDown size={12} className="text-[#9CA3AF]" />
                            </button>
                            <AnimatePresence>
                              {openRoleMenu === member.memberId && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] shadow-lg z-20 py-1"
                                >
                                  {(['admin', 'member', 'viewer'] as TeamRole[]).map(role => (
                                    <button
                                      key={role}
                                      onClick={() => handleRoleChange(member.memberId, role)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors ${member.role === role ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                      <RoleBadge role={role} />
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <RoleBadge role={member.role} />
                        )}
                      </div>

                      {canManage ? (
                        <button
                          onClick={() => setConfirmRemove(member)}
                          className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <div className="w-7 shrink-0" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="invitations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {invitations.filter(i => i.status === 'pending').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Mail size={32} className="text-[#D1D5DB]" />
                <p className="text-sm text-[#9CA3AF]">Nenhum convite pendente</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl overflow-hidden">
                <div className="divide-y divide-[#F3F4F6] dark:divide-[#374151]">
                  {invitations.filter(i => i.status === 'pending').map((inv, i) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F3F4F6] dark:bg-[#374151] flex items-center justify-center shrink-0">
                        <Mail size={16} className="text-[#9CA3AF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] truncate">{inv.email}</p>
                        <p className="text-xs text-[#9CA3AF]">Enviado em {inv.sentAt}</p>
                      </div>
                      <RoleBadge role={inv.role} />
                      <span className="text-[10px] font-medium text-[#F59E0B] bg-[#FEF3C7] dark:bg-[#451a03] px-2 py-0.5 rounded-full shrink-0">
                        Pendente
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { resendInvitation(inv.id); toast.success('Convite reenviado!') }}
                          className="text-xs text-[#059669] hover:underline font-medium"
                        >
                          Reenviar
                        </button>
                        <button
                          onClick={() => { cancelInvitation(inv.id); toast.success('Convite cancelado') }}
                          className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(email, role) => {
            inviteMember(email, role)
            toast.success(`Convite enviado para ${email}!`)
            setShowInviteModal(false)
          }}
        />
      )}

      {confirmRemove && (
        <ConfirmModal
          member={confirmRemove}
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  )
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: TeamRole) => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('member')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { toast.error('Email inválido'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    onInvite(email.trim(), role)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        className="bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-md shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] dark:border-[#374151]">
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Convidar membro</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colega@empresa.com"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Permissão</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'member', 'viewer'] as TeamRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${role === r ? 'border-[#059669] bg-[#F0FDF4] dark:bg-[#064E3B]/20' : 'border-[#E5E7EB] dark:border-[#374151] hover:border-[#D1D5DB]'}`}
                >
                  <span className={role === r ? roleConfig[r].color : 'text-[#9CA3AF]'}>{roleConfig[r].icon}</span>
                  <span className="text-xs font-medium text-[#374151] dark:text-[#D1D5DB]">{roleConfig[r].label}</span>
                  <span className="text-[9px] text-[#9CA3AF] leading-tight">{rolePermissions[r][0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              Enviar convite
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ConfirmModal({ member, onConfirm, onCancel }: { member: TeamMember; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        className="bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-sm shadow-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB] text-center mb-1">Remover membro?</h2>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] text-center mb-6">
          <span className="font-medium text-[#1F2937] dark:text-[#F9FAFB]">{member.name}</span> perderá acesso ao workspace imediatamente.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
            Remover
          </button>
        </div>
      </motion.div>
    </div>
  )
}
