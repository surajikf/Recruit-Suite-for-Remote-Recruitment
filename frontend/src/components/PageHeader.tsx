export default function PageHeader({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}


