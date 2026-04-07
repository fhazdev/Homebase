import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/',
    label: 'Dash',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" strokeWidth={1.8} fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    end: true,
  },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" strokeWidth={1.8} fill="none" stroke="currentColor">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    to: '/lists',
    label: 'Lists',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" strokeWidth={1.8} fill="none" stroke="currentColor">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" strokeWidth={1.8} fill="none" stroke="currentColor">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" strokeWidth={1.8} fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-start justify-around border-t border-nav-edge bg-nav pt-3 pb-[env(safe-area-inset-bottom,12px)] backdrop-blur-xl">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 ${
              isActive ? 'text-nav-active' : 'text-nav-inactive'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-3 h-[3px] w-[18px] rounded-b bg-nav-active" />
              )}
              {item.icon}
              <span className="text-[9px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
