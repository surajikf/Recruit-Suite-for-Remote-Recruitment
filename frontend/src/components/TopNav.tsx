import { Link, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/candidates', label: 'Candidates' },
  { to: '/shortlist', label: 'Pipeline' },
  { to: '/reports', label: 'Reports' },
  { to: '/calendar', label: 'Calendar' },
]

export default function TopNav() {
  const location = useLocation()
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6"/></svg>
          </div>
          <span className="ml-2 hidden sm:block text-base font-semibold">IKF Recruit Suite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map(i => {
            const active = location.pathname === i.to
            return (
              <Link key={i.to} to={i.to} className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}>
                {i.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <input className="input w-64" placeholder="Search jobs, candidates…" />
          </div>
          <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Reminders</button>
        </div>
      </div>
    </header>
  )
}


