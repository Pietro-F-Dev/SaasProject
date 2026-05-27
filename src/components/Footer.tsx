import { Zap } from 'lucide-react'

const links = {
  Produto: ['Funcionalidades', 'Preços', 'Roadmap', 'Changelog'],
  Empresa: ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa'],
  Suporte: ['Documentação', 'Status', 'Comunidade', 'Contato'],
  Legal: ['Privacidade', 'Termos de uso', 'Cookies'],
}

export default function Footer() {
  return (
    <footer className="bg-[#111827] dark:bg-[#0D1117] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Zap size={20} className="text-[#059669]" />
              Flowdesk
            </a>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Gestão de projetos simples para times que entregam.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[#D1D5DB] hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#374151] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B7280]">© 2025 Flowdesk. Todos os direitos reservados.</p>
          <p className="text-xs text-[#6B7280]">Feito com foco em produtividade.</p>
        </div>
      </div>
    </footer>
  )
}
