import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon, Check, Zap, CreditCard, Download, Calendar, X, Lock, Star } from 'lucide-react'
import toast from 'react-hot-toast'


const planDetails = {
  free: { label: 'Free', color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6] dark:bg-[#374151]', features: ['3 projetos', '5 membros', 'Kanban básico'] },
  pro: { label: 'Pro', color: 'text-[#059669]', bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]', features: ['Projetos ilimitados', '20 membros', 'Relatórios', 'Integrações', 'Suporte prioritário'] },
  enterprise: { label: 'Enterprise', color: 'text-[#6366F1]', bg: 'bg-[#EFF6FF] dark:bg-[#1e1b4b]', features: ['Tudo do Pro', 'SSO/SAML', 'API pública', 'SLA garantido', 'Gerente dedicado'] },
}

interface CardInfo {
  brand: 'visa' | 'mastercard' | 'other'
  last4: string
  name: string
  expiry: string
}

function detectBrand(n: string): 'visa' | 'mastercard' | 'other' {
  const d = n.replace(/\s/g, '')
  if (d.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(d)) return 'mastercard'
  return 'other'
}

function fmtCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

function BrandBadge({ brand }: { brand: 'visa' | 'mastercard' | 'other' }) {
  if (brand === 'visa') {
    return <span className="text-[10px] font-black tracking-widest text-[#1A1F71] dark:text-blue-300 bg-[#EEF2FF] dark:bg-blue-900/30 px-2 py-0.5 rounded">VISA</span>
  }
  if (brand === 'mastercard') {
    return (
      <div className="flex items-center opacity-90">
        <span className="w-4 h-4 rounded-full bg-[#EB001B] inline-block" />
        <span className="w-4 h-4 rounded-full bg-[#F79E1B] inline-block -ml-1.5" />
      </div>
    )
  }
  return <CreditCard size={15} className="text-[#9CA3AF]" />
}

function BrandLabel({ brand }: { brand: 'visa' | 'mastercard' | 'other' }) {
  if (brand === 'visa') return <span>Visa</span>
  if (brand === 'mastercard') return <span>Mastercard</span>
  return <span>Cartão</span>
}

interface CardEditModalProps {
  card: CardInfo
  onClose: () => void
  onSave: (card: CardInfo) => void
}

function CardEditModal({ card, onClose, onSave }: CardEditModalProps) {
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState(card.expiry)
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState(card.name)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const brand = cardNum.replace(/\s/g, '').length > 0 ? detectBrand(cardNum) : card.brand

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#059669] transition-colors ${
      errors[field] ? 'border-red-400 dark:border-red-600' : 'border-[#E5E7EB] dark:border-[#374151]'
    }`

  const validate = () => {
    const e: Record<string, string> = {}
    if (cardNum.replace(/\s/g, '').length !== 16) e.cardNum = 'Número inválido (16 dígitos)'
    if (expiry.length < 5) e.expiry = 'Use o formato MM/AA'
    if (cvv.length < 3) e.cvv = 'CVV deve ter 3 dígitos'
    if (!cardName.trim()) e.cardName = 'Informe o nome do titular'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    const last4 = cardNum.replace(/\s/g, '').slice(-4)
    onSave({ brand: detectBrand(cardNum), last4, name: cardName.trim(), expiry })
    setSaving(false)
    toast.success('Cartão atualizado com sucesso!')
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md bg-white dark:bg-[#1F2937] rounded-2xl border border-[#E5E7EB] dark:border-[#374151] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#374151]">
            <div>
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Editar método de pagamento</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Atualize os dados do seu cartão</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] dark:hover:text-[#D1D5DB] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Current card display */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-[#374151]">
              <BrandBadge brand={card.brand} />
              <div className="flex-1">
                <p className="text-xs text-[#9CA3AF]">Cartão atual</p>
                <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">
                  <BrandLabel brand={card.brand} /> •••• {card.last4}
                </p>
              </div>
            </div>

            {/* Test card hint */}
            <div className="flex items-center gap-2 bg-[#FFFBEB] dark:bg-[#451a03]/30 border border-[#FDE68A] dark:border-[#92400e]/40 rounded-lg px-3 py-2">
              <Star size={12} className="text-[#F59E0B] shrink-0" />
              <p className="text-xs text-[#92400E] dark:text-[#FDE68A]">
                Teste: <span className="font-mono font-semibold">4242 4242 4242 4242</span> · 12/28 · 123
              </p>
            </div>

            {/* Card number */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Novo número do cartão *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNum}
                  onChange={e => setCardNum(fmtCard(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className={inputClass('cardNum')}
                  inputMode="numeric"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <BrandBadge brand={brand} />
                </div>
              </div>
              {errors.cardNum && <p className="text-xs text-red-500 mt-1">{errors.cardNum}</p>}
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                  Validade *
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={e => setExpiry(fmtExpiry(e.target.value))}
                  placeholder="MM/AA"
                  className={inputClass('expiry')}
                  inputMode="numeric"
                />
                {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                  CVV *
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className={inputClass('cvv')}
                  inputMode="numeric"
                />
                {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
              </div>
            </div>

            {/* Card name */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                Nome no cartão *
              </label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Nome como aparece no cartão"
                className={inputClass('cardName')}
              />
              {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-70 text-white py-2.5 rounded-xl font-semibold text-sm transition-all"
            >
              {saving ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Salvando...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Salvar cartão
                </>
              )}
            </button>
            <p className="text-center text-xs text-[#9CA3AF] flex items-center justify-center gap-1">
              <Lock size={10} />
              Dados criptografados com SSL 256-bit
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const plan = planDetails[user?.plan || 'free']

  const [cardInfo, setCardInfo] = useState<CardInfo>({
    brand: 'visa',
    last4: '4242',
    name: user?.name || '',
    expiry: '12/28',
  })
  const [editCardOpen, setEditCardOpen] = useState(false)

  const nextPlan = user?.plan === 'free' ? 'pro' : 'enterprise'
  const goToCheckout = () => navigate(`/checkout?plan=${nextPlan}`)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    toast.success('Perfil atualizado!')
    setSaving(false)
  }

  return (
    <>
      {editCardOpen && (
        <CardEditModal
          card={cardInfo}
          onClose={() => setEditCardOpen(false)}
          onSave={setCardInfo}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">Configurações</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Gerencie sua conta e preferências</p>
        </div>

        <section className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-6 space-y-5">
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-xl font-bold text-[#059669]">
              {user?.avatar}
            </div>
            <div>
              <p className="font-medium text-[#1F2937] dark:text-[#F9FAFB]">{user?.name}</p>
              <p className="text-sm text-[#9CA3AF]">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Nome</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#374151] text-[#9CA3AF] text-sm cursor-not-allowed"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </section>

        <section className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-6 space-y-4">
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Aparência</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">Tema</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Alterne entre modo claro e escuro</p>
            </div>
            <button
              onClick={toggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-[#059669]' : 'bg-[#E5E7EB]'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
            {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
            Modo {theme === 'dark' ? 'escuro' : 'claro'} ativo
          </p>
        </section>

        <section className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Plano atual</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.bg} ${plan.color}`}>
              {plan.label}
            </span>
          </div>
          <ul className="space-y-2">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                <Check size={15} className="text-[#059669] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {user?.plan !== 'enterprise' && (
            <button
              onClick={goToCheckout}
              className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Zap size={15} />
              Fazer upgrade
            </button>
          )}
        </section>

        <section className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-6 space-y-5">
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Faturamento</h2>

          {user?.plan === 'free' ? (
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <CreditCard size={32} className="text-[#D1D5DB]" />
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Você está no plano gratuito. Faça upgrade para acessar recursos avançados.
              </p>
              <button
                onClick={goToCheckout}
                className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Zap size={15} />
                Ver planos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-[#374151]">
                  <BrandBadge brand={cardInfo.brand} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#9CA3AF]">Método de pagamento</p>
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] mt-0.5">
                      <BrandLabel brand={cardInfo.brand} /> •••• {cardInfo.last4}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditCardOpen(true)}
                    className="ml-auto text-xs text-[#059669] hover:underline shrink-0 font-medium"
                  >
                    Editar
                  </button>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] dark:bg-[#111827] rounded-xl border border-[#E5E7EB] dark:border-[#374151]">
                  <Calendar size={20} className="text-[#6B7280] shrink-0" />
                  <div>
                    <p className="text-xs text-[#9CA3AF]">Próxima cobrança</p>
                    <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] mt-0.5">
                      {(() => {
                        const d = new Date()
                        d.setMonth(d.getMonth() + 1, 1)
                        return d.toLocaleDateString('pt-BR')
                      })()} — R$49,00
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-3">Histórico de faturas</p>
                <div className="flex flex-col items-center py-6 gap-2 text-center">
                  <Download size={24} className="text-[#D1D5DB]" />
                  <p className="text-sm text-[#9CA3AF]">Nenhuma fatura disponível ainda</p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}
