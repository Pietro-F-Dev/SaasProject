import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const links = ['Produto', 'Funcionalidades', 'Preços', 'FAQ']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1F2937]/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#374151]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold text-xl text-[#1F2937] dark:text-[#F9FAFB]">
          <Zap size={22} className="text-[#059669]" />
          Flowdesk
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors">
            Entrar
          </Link>
          <Link to="/signup" className="text-sm bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg transition-colors font-medium">
            Começar grátis
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="text-[#6B7280] dark:text-[#9CA3AF]" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] px-6 pb-4 flex flex-col gap-4">
          {links.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F9FAFB] transition-colors"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
          <Link to="/signup" className="text-sm bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg transition-colors font-medium text-center">
            Começar grátis
          </Link>
        </div>
      )}
    </header>
  )
}
