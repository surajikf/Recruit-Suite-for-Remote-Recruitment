import { Link, useLocation } from 'react-router-dom'

type Item = { to: string; label: string; icon: string }

const items: Item[] = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/candidates', label: 'Candidates', icon: '👥' },
  { to: '/shortlist', label: 'Pipeline', icon: '🔄' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/admin', label: 'Admin', icon: '⚙️' },
]

export default function SideNav() {
  const { pathname } = useLocation()
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <nav className="sticky top-20 space-y-1 p-4">
        {items.map(item => {
          const active = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></div>
              )}
            </Link>
          )
        })}
        
        {/* Quick Actions Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="nav-item nav-item-inactive w-full justify-start">
              <span className="mr-3">➕</span>
              <span>Add Candidate</span>
            </button>
            <button className="nav-item nav-item-inactive w-full justify-start">
              <span className="mr-3">📝</span>
              <span>Create Job</span>
            </button>
            <button className="nav-item nav-item-inactive w-full justify-start">
              <span className="mr-3">📊</span>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}


