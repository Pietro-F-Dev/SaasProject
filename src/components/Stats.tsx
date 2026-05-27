import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const stats = [
  { target: 2000, suffix: '+', label: 'Times ativos', display: (n: number) => n.toLocaleString('pt-BR') },
  { target: 98, suffix: '%', label: 'Satisfação dos usuários', display: (n: number) => String(n) },
  { target: 50, suffix: '+', label: 'Integrações disponíveis', display: (n: number) => String(n) },
  { target: 49, suffix: '', label: 'Rating médio', display: (n: number) => (n / 10).toFixed(1) + ' ★' },
]

function Counter({ target, suffix, display }: { target: number; suffix: string; display: (n: number) => string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let current = 0
    const duration = 1600
    const steps = 60
    const increment = target / steps
    const interval = duration / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{display(count)}{suffix === '★' ? '' : suffix}</span>
}

export default function Stats() {
  return (
    <section className="py-16 px-6 bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mb-1">
              <Counter target={stat.target} suffix={stat.suffix} display={stat.display} />
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
