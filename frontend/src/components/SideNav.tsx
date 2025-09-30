import { Link, useLocation } from 'react-router-dom'

type Item = { to: string; label: string }

const items: Item[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/candidates', label: 'Candidates' },
  { to: '/shortlist', label: 'Pipeline' },
  { to: '/reports', label: 'Reports' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/admin', label: 'Admin' },
]

export default function SideNav() {
  const { pathname } = useLocation()
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <nav className="sticky top-20 space-y-1">
        {items.map(item => {
          const active = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={[
                'block rounded-lg px-3 py-2 text-sm',
                active ? 'bg-[#E8F3FF] text-[#004182] border-l-4 border-[#0A66C2]' : 'text-gray-700 hover:bg-gray-50'
              ].join(' ')}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


