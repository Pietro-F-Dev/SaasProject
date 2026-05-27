const logos = ['Acrion', 'Pathflow', 'Syncly', 'Buildly', 'TechNova', 'Infraco', 'Corevo', 'Nexlabs']

export default function Logos() {
  return (
    <section className="py-12 px-6 bg-[#F9FAFB] dark:bg-[#111827] border-y border-[#E5E7EB] dark:border-[#374151]">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs text-[#9CA3AF] dark:text-[#6B7280] uppercase tracking-widest mb-8 font-medium">
          Empresas que confiam no Flowdesk
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {logos.map(logo => (
            <span
              key={logo}
              className="text-lg font-bold text-[#D1D5DB] dark:text-[#374151] tracking-tight select-none hover:text-[#9CA3AF] dark:hover:text-[#4B5563] transition-colors cursor-default"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
