import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MoreVertical, CheckCircle2, XCircle, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

type Plan = 'free' | 'pro' | 'enterprise'

interface Account {
  id: string
  name: string
  email: string
  avatar: string
  plan: Plan
  suspended: boolean
  members: number
  mrr: number
  createdAt: string
}

const planConfig: Record<Plan, { label: string; color: string; bg: string }> = {
  free: { label: 'Free', color: 'text-white/50', bg: 'bg-white/5' },
  pro: { label: 'Pro', color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
  enterprise: { label: 'Enterprise', color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
}

export default function AdminUsers() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState<Plan | 'all'>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false)

  useEffect(() => {
    api.get<Account[]>('/api/admin/users')
      .then(setAccounts)
      .catch(() => toast.error('Erro ao carregar usuários'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = accounts.filter(a => {
    const matchQuery = a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase())
    const matchPlan = filterPlan === 'all' || a.plan === filterPlan
    return matchQuery && matchPlan
  })

  const changePlan = async (id: string, plan: Plan) => {
    const prev = accounts.find(a => a.id === id)?.plan
    setAccounts(cur => cur.map(a => a.id === id ? { ...a, plan } : a))
    setOpenMenu(null)
    try {
      await api.patch(`/api/admin/users/${id}/plan`, { plan })
      toast.success(`Plano atualizado para ${plan}`)
    } catch {
      setAccounts(cur => cur.map(a => a.id === id ? { ...a, plan: prev! } : a))
      toast.error('Erro ao atualizar plano')
    }
  }

  const toggleSuspend = async (account: Account) => {
    const next = !account.suspended
    setAccounts(cur => cur.map(a => a.id === account.id ? { ...a, suspended: next } : a))
    setOpenMenu(null)
    try {
      await api.patch(`/api/admin/users/${account.id}/suspend`, {})
      toast.success(next ? `${account.name} suspenso` : `${account.name} reativado`)
    } catch {
      setAccounts(cur => cur.map(a => a.id === account.id ? { ...a, suspended: !next } : a))
      toast.error('Erro ao alterar status')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(a => a.id)))
    }
  }

  const bulkChangePlan = async (plan: Plan) => {
    const ids = Array.from(selectedIds)
    const prevPlans = Object.fromEntries(ids.map(id => [id, accounts.find(a => a.id === id)?.plan]))
    setAccounts(cur => cur.map(a => selectedIds.has(a.id) ? { ...a, plan } : a))
    setSelectedIds(new Set())
    setBulkPlanOpen(false)
    try {
      await Promise.all(ids.map(id => api.patch(`/api/admin/users/${id}/plan`, { plan })))
      toast.success(`${ids.length} conta(s) atualizadas para ${plan}`)
    } catch {
      setAccounts(cur => cur.map(a => prevPlans[a.id] ? { ...a, plan: prevPlans[a.id] as Plan } : a))
      toast.error('Erro ao atualizar planos')
    }
  }

  const bulkSuspend = async () => {
    const ids = Array.from(selectedIds)
    setAccounts(cur => cur.map(a => selectedIds.has(a.id) ? { ...a, suspended: true } : a))
    setSelectedIds(new Set())
    try {
      await Promise.all(
        ids
          .filter(id => !accounts.find(a => a.id === id)?.suspended)
          .map(id => api.patch(`/api/admin/users/${id}/suspend`, {}))
      )
      toast.success(`${ids.length} conta(s) suspensas`)
    } catch {
      toast.error('Erro ao suspender contas')
    }
  }

  const totalMRR = accounts.filter(a => !a.suspended).reduce((sum, a) => sum + a.mrr, 0)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-sm text-white/40 mt-1">{accounts.length} contas · MRR total: R${totalMRR.toLocaleString('pt-BR')}</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative sm:flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 shrink-0">
          {(['all', 'free', 'pro', 'enterprise'] as const).map(plan => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterPlan === plan ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {plan === 'all' ? 'Todos' : plan.charAt(0).toUpperCase() + plan.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 accent-[#059669] cursor-pointer"
                  />
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Conta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-24">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">MRR</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-20">Membros</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-24 hidden md:table-cell">Cadastro</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((account, i) => {
                const pc = planConfig[account.plan]
                return (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(account.id)}
                        onChange={() => toggleSelect(account.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 accent-[#059669] cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {account.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{account.name}</p>
                          <p className="text-xs text-white/30 truncate">{account.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.color}`}>
                        {pc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {account.suspended ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-[#EF4444]">
                          <XCircle size={12} /> Suspenso
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-[#059669]">
                          <CheckCircle2 size={12} /> Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-medium text-white">
                        {account.mrr > 0 ? `R$${account.mrr}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-white/60">{account.members}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-xs text-white/30">
                        {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === account.id ? null : account.id)}
                          className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === account.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                            <p className="px-3 py-1.5 text-[10px] text-white/30 uppercase tracking-wider font-semibold">Mudar plano</p>
                            {(['free', 'pro', 'enterprise'] as Plan[]).map(plan => (
                              <button
                                key={plan}
                                onClick={() => changePlan(account.id, plan)}
                                disabled={account.plan === plan}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors ${account.plan === plan ? 'opacity-40 pointer-events-none' : 'text-white/70 hover:text-white'}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${plan === 'enterprise' ? 'bg-[#6366F1]' : plan === 'pro' ? 'bg-[#059669]' : 'bg-white/30'}`} />
                                {planConfig[plan].label}
                                {account.plan === plan && <span className="ml-auto text-[10px] text-white/30">atual</span>}
                              </button>
                            ))}
                            <div className="border-t border-white/10 my-1" />
                            <button
                              onClick={() => toggleSuspend(account)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${account.suspended ? 'text-[#059669] hover:bg-[#059669]/10' : 'text-[#EF4444] hover:bg-[#EF4444]/10'}`}
                            >
                              {account.suspended ? <><CheckCircle2 size={13} /> Reativar conta</> : <><XCircle size={13} /> Suspender conta</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-white/30">
              {query ? `Nenhuma conta encontrada para "${query}"` : 'Nenhum usuário cadastrado ainda'}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] border border-white/15 rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-2xl"
          >
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>

            <div className="h-4 w-px bg-white/10" />

            <div className="relative">
              <button
                onClick={() => setBulkPlanOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Mudar plano <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {bulkPlanOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-2 left-0 w-36 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl py-1 overflow-hidden"
                  >
                    {(['free', 'pro', 'enterprise'] as Plan[]).map(plan => (
                      <button
                        key={plan}
                        onClick={() => bulkChangePlan(plan)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plan === 'enterprise' ? 'bg-[#6366F1]' : plan === 'pro' ? 'bg-[#059669]' : 'bg-white/30'}`} />
                        {planConfig[plan].label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={bulkSuspend}
              className="px-3 py-1.5 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-medium rounded-lg transition-colors"
            >
              Suspender todos
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              title="Desmarcar tudo"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
