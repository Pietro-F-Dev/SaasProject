import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Lock, Check, Zap, CheckCircle2, ShieldCheck, Star,
  CreditCard, Calendar, Users, QrCode, FileText, Copy, CheckCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

const PLANS = {
  pro: {
    name: 'Pro',
    monthlyPrice: 49,
    annualMonthly: 39,
    annualSavings: 120,
    badgeLabel: 'Mais popular',
    badgeClass: 'bg-[#059669] text-white',
    accentColor: '#059669',
    features: [
      'Projetos ilimitados',
      'Até 20 membros',
      'Relatórios e métricas avançadas',
      'Todas as integrações',
      'Alertas automáticos',
      'Suporte prioritário',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 149,
    annualMonthly: 119,
    annualSavings: 360,
    badgeLabel: 'Para grandes times',
    badgeClass: 'bg-[#6366F1] text-white',
    accentColor: '#6366F1',
    features: [
      'Tudo do plano Pro',
      'Membros ilimitados',
      'SSO / SAML',
      'API pública',
      'Auditoria e logs',
      'SLA garantido',
      'Gerente de conta dedicado',
    ],
  },
} as const

type PlanKey = keyof typeof PLANS
type PayMethod = 'card' | 'pix' | 'boleto'

const PROC_STEPS: Record<PayMethod, string[]> = {
  card: [
    'Verificando dados do cartão...',
    'Processando pagamento com segurança...',
    'Ativando plano na sua conta...',
  ],
  pix: [
    'Verificando pagamento PIX...',
    'Confirmando transação...',
    'Ativando plano na sua conta...',
  ],
  boleto: [
    'Gerando boleto bancário...',
    'Registrando no sistema...',
    'Ativando plano na sua conta...',
  ],
}

function detectBrand(n: string): 'visa' | 'mastercard' | null {
  const d = n.replace(/\s/g, '')
  if (d.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(d)) return 'mastercard'
  return null
}

function fmtCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

function finderCell(r: number, c: number): boolean {
  if (r === 0 || r === 6 || c === 0 || c === 6) return true
  if (r === 1 || r === 5 || c === 1 || c === 5) return false
  return true
}

function isQRFilled(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return finderCell(r, c)
  if (r < 7 && c >= size - 7) return finderCell(r, c - (size - 7))
  if (r >= size - 7 && c < 7) return finderCell(r - (size - 7), c)
  if (r === 6 && c > 7 && c < size - 7) return c % 2 === 0
  if (c === 6 && r > 7 && r < size - 7) return r % 2 === 0
  return ((r * 23 + c * 17 + r * c * 3) % 11) < 5
}

function FakeQR() {
  const size = 21
  return (
    <div className="p-3 bg-white rounded-xl border border-[#E5E7EB] shadow-sm inline-block">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 9px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const r = Math.floor(idx / size)
          const c = idx % size
          return (
            <div
              key={idx}
              style={{ width: 9, height: 9, background: isQRFilled(r, c, size) ? '#111827' : '#ffffff' }}
            />
          )
        })}
      </div>
    </div>
  )
}

function PixTimer() {
  const [seconds, setSeconds] = useState(15 * 60)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')

  return (
    <span className={`font-mono font-semibold text-sm ${seconds < 60 ? 'text-red-500' : 'text-[#1F2937] dark:text-[#F9FAFB]'}`}>
      {mins}:{secs}
    </span>
  )
}

function PixSection() {
  const pixKey = 'flowdesk@pix.com.br'
  const [copied, setCopied] = useState(false)

  const copyKey = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    toast.success('Chave PIX copiada!')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-[#F9FAFB] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-lg px-3 py-2">
        <Star size={12} className="text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          Escaneie o QR Code com o app do seu banco ou copie a chave PIX abaixo
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        <FakeQR />
        <div className="text-center">
          <p className="text-xs text-[#9CA3AF]">Expira em</p>
          <PixTimer />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Chave PIX (e-mail)</p>
        <div className="flex items-center gap-2 bg-[#F9FAFB] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-lg px-3 py-2.5">
          <span className="flex-1 text-sm font-mono text-[#1F2937] dark:text-[#F9FAFB]">{pixKey}</span>
          <button
            onClick={copyKey}
            className="shrink-0 text-[#059669] hover:text-[#047857] transition-colors"
            title="Copiar chave"
          >
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function BarcodeVisual() {
  return (
    <div className="flex items-end gap-[2px] py-2 px-4 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-lg">
      {Array.from({ length: 58 }, (_, i) => {
        const w = [1, 1, 2, 1, 3, 1, 2][(i * 7 + i * i * 3) % 7]
        const h = 36 + ((i * 13 + 7) % 16)
        return (
          <div
            key={i}
            style={{ width: w, height: h }}
            className="bg-[#111827] dark:bg-[#F9FAFB] rounded-[1px] shrink-0"
          />
        )
      })}
    </div>
  )
}

function BoletoSection() {
  const boletoCode = '34191.79001 01043.510073 61834.560005 4 92690000004900'
  const [copied, setCopied] = useState(false)

  const dueDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })()

  const copyCode = () => {
    navigator.clipboard.writeText(boletoCode.replace(/\s/g, ''))
    setCopied(true)
    toast.success('Código do boleto copiado!')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-[#FEF3C7] dark:bg-[#451a03]/40 border border-[#FDE68A] dark:border-[#92400e]/40 rounded-lg px-3 py-2">
        <Star size={12} className="text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400E] dark:text-[#FDE68A]">
          Boleto com vencimento em {dueDate}. A compensação pode levar até 3 dias úteis.
        </p>
      </div>

      <div className="flex justify-center">
        <BarcodeVisual />
      </div>

      <div>
        <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">Linha digitável</p>
        <div className="flex items-start gap-2 bg-[#F9FAFB] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-lg px-3 py-2.5">
          <span className="flex-1 text-xs font-mono text-[#1F2937] dark:text-[#F9FAFB] leading-relaxed break-all">
            {boletoCode}
          </span>
          <button
            onClick={copyCode}
            className="shrink-0 text-[#059669] hover:text-[#047857] transition-colors mt-0.5"
            title="Copiar código"
          >
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const [params] = useSearchParams()
  const rawPlan = params.get('plan') ?? 'pro'
  const planKey: PlanKey = rawPlan in PLANS ? (rawPlan as PlanKey) : 'pro'
  const plan = PLANS[planKey]

  const [annual, setAnnual] = useState(params.get('annual') === 'true')
  const price = annual ? plan.annualMonthly : plan.monthlyPrice

  const { user, isAuthenticated, updatePlan } = useAuth()
  const navigate = useNavigate()

  const [payMethod, setPayMethod] = useState<PayMethod>('card')
  const [email, setEmail] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [procStep, setProcStep] = useState(0)

  useEffect(() => { if (user?.email) setEmail(user.email) }, [user])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (payMethod === 'card') {
      if (cardNum.replace(/\s/g, '').length !== 16) e.cardNum = 'Número do cartão inválido (16 dígitos)'
      if (expiry.length < 5) e.expiry = 'Use o formato MM/AA'
      if (cvv.length < 3) e.cvv = 'CVV deve ter 3 dígitos'
      if (!cardName.trim()) e.cardName = 'Informe o nome do titular'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const handlePay = async () => {
    if (!validate()) return
    setStep('processing')
    const steps = PROC_STEPS[payMethod]
    for (let i = 0; i < steps.length; i++) {
      setProcStep(i)
      await new Promise(r => setTimeout(r, 950))
    }
    await new Promise(r => setTimeout(r, 350))
    if (isAuthenticated) updatePlan(planKey)
    setStep('success')
  }

  const brand = detectBrand(cardNum)

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      <header className="sticky top-0 z-10 h-14 bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-[#1F2937] dark:text-[#F9FAFB]">
          <Zap size={18} className="text-[#059669]" />
          Flowdesk
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <Lock size={12} />
          Pagamento seguro com SSL 256-bit
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FormStep
              plan={plan}
              planKey={planKey}
              annual={annual}
              setAnnual={setAnnual}
              price={price}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              email={email}
              setEmail={setEmail}
              cardNum={cardNum}
              setCardNum={v => setCardNum(fmtCard(v))}
              expiry={expiry}
              setExpiry={v => setExpiry(fmtExpiry(v))}
              cvv={cvv}
              setCvv={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
              cardName={cardName}
              setCardName={setCardName}
              errors={errors}
              brand={brand}
              isAuthenticated={isAuthenticated}
              onPay={handlePay}
            />
          </motion.div>
        )}

        {step === 'processing' && (
          <ProcessingStep
            key="processing"
            currentStep={procStep}
            steps={PROC_STEPS[payMethod]}
          />
        )}

        {step === 'success' && (
          <SuccessStep
            key="success"
            plan={plan}
            annual={annual}
            price={price}
            payMethod={payMethod}
            isAuthenticated={isAuthenticated}
            onNavigate={() => navigate(isAuthenticated ? '/dashboard/settings' : '/signup')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

type PlanData = typeof PLANS[PlanKey]

const PAY_TABS = [
  { key: 'card' as PayMethod, label: 'Cartão', icon: CreditCard },
  { key: 'pix' as PayMethod, label: 'PIX', icon: QrCode },
  { key: 'boleto' as PayMethod, label: 'Boleto', icon: FileText },
]

const PAY_BUTTON: Record<PayMethod, string> = {
  card: 'Começar 14 dias grátis',
  pix: 'Já realizei o pagamento PIX',
  boleto: 'Gerar boleto e ativar plano',
}

const PAY_FOOTER: Record<PayMethod, string> = {
  card: 'Após o trial: R${price}/mês · Cancele antes sem cobrança · Sem taxa de cancelamento',
  pix: 'Clique após concluir o pagamento PIX · 14 dias grátis incluídos · Cancele quando quiser',
  boleto: 'Plano ativado após compensação do boleto (1–3 dias úteis) · 14 dias grátis incluídos',
}

function FormStep({
  plan, planKey: _planKey, annual, setAnnual, price, payMethod, setPayMethod,
  email, setEmail, cardNum, setCardNum, expiry, setExpiry, cvv, setCvv,
  cardName, setCardName, errors, brand, isAuthenticated, onPay,
}: {
  plan: PlanData; planKey: PlanKey; annual: boolean; setAnnual: (v: boolean) => void;
  price: number; payMethod: PayMethod; setPayMethod: (m: PayMethod) => void;
  email: string; setEmail: (v: string) => void;
  cardNum: string; setCardNum: (v: string) => void;
  expiry: string; setExpiry: (v: string) => void;
  cvv: string; setCvv: (v: string) => void;
  cardName: string; setCardName: (v: string) => void;
  errors: Record<string, string>; brand: 'visa' | 'mastercard' | null;
  isAuthenticated: boolean; onPay: () => void;
}) {
  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#059669] transition-colors ${
      errors[field]
        ? 'border-red-400 dark:border-red-600'
        : 'border-[#E5E7EB] dark:border-[#374151]'
    }`

  const footerText = PAY_FOOTER[payMethod].replace('${price}', String(price))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left — form */}
      <div className="lg:col-span-3 space-y-6">
        <Link
          to="/#preços"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#059669] transition-colors"
        >
          <ArrowLeft size={15} /> Voltar aos planos
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">Finalize sua assinatura</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Plano</span>
            <span className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{plan.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.badgeClass}`}>
              {plan.badgeLabel}
            </span>
          </div>
        </div>

        {/* Billing cycle toggle */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] dark:text-[#D1D5DB] uppercase tracking-wider mb-2">
            Ciclo de cobrança
          </label>
          <div className="flex items-center bg-[#F3F4F6] dark:bg-[#374151] rounded-xl p-1 gap-1 w-fit">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual
                  ? 'bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937]'
              }`}
            >
              Mensal — R${plan.monthlyPrice}/mês
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                annual
                  ? 'bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937]'
              }`}
            >
              Anual — R${plan.annualMonthly}/mês
              <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
          {annual && (
            <p className="text-xs text-[#059669] mt-2">
              Cobrado anualmente · Você economiza R${plan.annualSavings}/ano
            </p>
          )}
        </div>

        {/* Email */}
        <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] uppercase tracking-wider">
            Conta
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isAuthenticated}
              placeholder="seu@email.com"
              className={`${inputClass('email')} ${isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] uppercase tracking-wider">
            Método de pagamento
          </h2>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#F3F4F6] dark:bg-[#374151] rounded-xl p-1">
            {PAY_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPayMethod(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  payMethod === key
                    ? 'bg-white dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F9FAFB]'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {payMethod === 'card' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Test card hint */}
                <div className="flex items-center gap-2 bg-[#F9FAFB] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] rounded-lg px-3 py-2">
                  <Star size={12} className="text-[#F59E0B] shrink-0" />
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    Cartão de teste: <span className="font-mono font-semibold text-[#1F2937] dark:text-[#F9FAFB]">4242 4242 4242 4242</span> · Validade: 12/28 · CVV: 123
                  </p>
                </div>

                {/* Card number */}
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                    Número do cartão *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNum}
                      onChange={e => setCardNum(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className={inputClass('cardNum')}
                      inputMode="numeric"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {brand === 'visa' && (
                        <span className="text-[10px] font-black tracking-widest text-[#1A1F71] dark:text-blue-300 bg-[#EEF2FF] dark:bg-blue-900/30 px-2 py-0.5 rounded">VISA</span>
                      )}
                      {brand === 'mastercard' && (
                        <div className="flex items-center opacity-90">
                          <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block" />
                          <span className="w-5 h-5 rounded-full bg-[#F79E1B] inline-block -ml-2" />
                        </div>
                      )}
                      {!brand && <CreditCard size={16} className="text-[#D1D5DB]" />}
                    </div>
                  </div>
                  {errors.cardNum && <p className="text-xs text-red-500 mt-1">{errors.cardNum}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
                      Validade *
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
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
                      onChange={e => setCvv(e.target.value)}
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
              </motion.div>
            )}

            {payMethod === 'pix' && (
              <motion.div
                key="pix"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <PixSection />
              </motion.div>
            )}

            {payMethod === 'boleto' && (
              <motion.div
                key="boleto"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <BoletoSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pay button */}
        <button
          onClick={onPay}
          className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-[#059669]/20"
        >
          {payMethod === 'card' && <Lock size={16} />}
          {payMethod === 'pix' && <QrCode size={16} />}
          {payMethod === 'boleto' && <FileText size={16} />}
          {PAY_BUTTON[payMethod]}
        </button>

        <p className="text-center text-xs text-[#9CA3AF]">{footerText}</p>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <ShieldCheck size={13} className="text-[#059669]" />
            SSL 256-bit
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Lock size={13} className="text-[#059669]" />
            PCI DSS
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Check size={13} className="text-[#059669]" />
            Dados protegidos
          </div>
        </div>
      </div>

      {/* Right — order summary */}
      <div className="lg:col-span-2">
        <div className="sticky top-20 space-y-4">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold">Resumo do pedido</p>
                  <p className="text-lg font-bold text-[#1F2937] dark:text-[#F9FAFB] mt-0.5">
                    Plano {plan.name}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${plan.badgeClass}`}>
                  {plan.badgeLabel}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2.5">
              {plan.features.map(f => (
                <div key={f} className="flex items-start gap-2.5">
                  <Check size={14} className="text-[#059669] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{f}</span>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 bg-[#F9FAFB] dark:bg-[#111827] border-t border-[#E5E7EB] dark:border-[#374151] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                  {annual ? 'Plano anual' : 'Plano mensal'}
                </span>
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">
                  {annual ? `R$${plan.annualMonthly}/mês` : `R$${plan.monthlyPrice}/mês`}
                </span>
              </div>
              {annual && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#059669]">Desconto anual (-20%)</span>
                  <span className="text-[#059669]">-R${plan.monthlyPrice - plan.annualMonthly}/mês</span>
                </div>
              )}
              <div className="border-t border-[#E5E7EB] dark:border-[#374151] pt-2 flex justify-between font-semibold">
                <span className="text-[#1F2937] dark:text-[#F9FAFB]">Total</span>
                <span className="text-[#1F2937] dark:text-[#F9FAFB]">R${price}/mês</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#ECFDF5] dark:bg-[#064E3B]/30 border-t border-[#D1FAE5] dark:border-[#059669]/20 flex items-start gap-2.5">
              <Calendar size={15} className="text-[#059669] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#059669]">14 dias grátis incluídos</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                  Você não será cobrado agora. Cobranças iniciam após o período de teste.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { icon: Check, text: 'Cancele quando quiser, sem taxa' },
              { icon: ShieldCheck, text: 'Garantia de reembolso em 30 dias' },
              { icon: Users, text: 'Suporte incluso no plano' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <Icon size={13} className="text-[#059669] shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingStep({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4"
    >
      <div className="text-center max-w-sm w-full">
        <div className="relative w-16 h-16 mx-auto mb-8">
          <motion.div className="absolute inset-0 rounded-full border-4 border-[#E5E7EB] dark:border-[#374151]" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#059669]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={18} className="text-[#059669]" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-1">
          Processando sua assinatura
        </h2>
        <p className="text-sm text-[#9CA3AF] mb-8">Aguarde um momento...</p>

        <div className="space-y-3 text-left bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
          {steps.map((text, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  done ? 'bg-[#059669]' : active ? 'bg-[#059669]/10 border-2 border-[#059669]' : 'bg-[#F3F4F6] dark:bg-[#374151]'
                }`}>
                  {done ? (
                    <Check size={12} className="text-white" />
                  ) : active ? (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-[#059669]"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#D1D5DB] dark:bg-[#4B5563]" />
                  )}
                </div>
                <span className={`text-sm transition-colors ${
                  done ? 'text-[#059669]' : active ? 'text-[#1F2937] dark:text-[#F9FAFB] font-medium' : 'text-[#9CA3AF]'
                }`}>
                  {text}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-[#9CA3AF] mt-6 flex items-center justify-center gap-1.5">
          <Lock size={11} />
          Transação segura · Dados criptografados
        </p>
      </div>
    </motion.div>
  )
}

const METHOD_LABEL: Record<PayMethod, string> = {
  card: 'cartão de crédito',
  pix: 'PIX',
  boleto: 'boleto bancário',
}

function SuccessStep({ plan, annual, price, payMethod, isAuthenticated, onNavigate }: {
  plan: PlanData; annual: boolean; price: number; payMethod: PayMethod;
  isAuthenticated: boolean; onNavigate: () => void;
}) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#059669', '#10B981', '#6EE7B7', '#34D399', '#A7F3D0'] })
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 } }), 300)
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 } }), 550)
  }, [])

  const nextBillingDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  })()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4"
    >
      <div className="text-center max-w-md w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-[#059669]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mb-2">
            Plano ativado com sucesso!
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-8">
            Bem-vindo ao Flowdesk {plan.name}. Seu período de 14 dias grátis começa agora.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5 text-left mb-6 space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Plano</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{plan.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.badgeClass}`}>{plan.badgeLabel}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Método</span>
            <span className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] capitalize">{METHOD_LABEL[payMethod]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Período grátis até</span>
            <span className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">{nextBillingDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Após o trial</span>
            <span className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB]">
              R${price}/mês {annual ? '(anual)' : ''}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <button
            onClick={onNavigate}
            className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {isAuthenticated ? 'Ir para o dashboard' : 'Criar minha conta'}
            <Zap size={16} />
          </button>

          {!isAuthenticated && (
            <p className="text-xs text-[#9CA3AF]">
              Crie sua conta para acessar o plano {plan.name} que você acabou de assinar.
            </p>
          )}

          <p className="text-xs text-[#9CA3AF] flex items-center justify-center gap-1.5 pt-1">
            <Check size={11} className="text-[#059669]" />
            Você receberá um e-mail de confirmação em breve
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
