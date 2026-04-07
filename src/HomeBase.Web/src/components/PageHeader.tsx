import { useThemeStore } from '../stores/themeStore'

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="mb-5 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        {title}<span className="text-accent">_</span>
      </h1>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="var(--hb-toggle-icon)" stroke="var(--hb-toggle-icon)" strokeWidth={2}>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="var(--hb-toggle-icon)" stroke="var(--hb-toggle-icon)" strokeWidth={2}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
