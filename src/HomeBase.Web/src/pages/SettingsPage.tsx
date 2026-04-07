import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { authApi } from '../api/auth'
import { PageHeader } from '../components/PageHeader'

export function SettingsPage() {
  const { email, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div>
      <PageHeader title="SETTINGS" />

      {/* Appearance */}
      <div className="mb-7">
        <div className="mb-2.5 pl-0.5 text-[11px] font-bold uppercase tracking-[1.2px] text-ink-muted">
          Appearance
        </div>
        <div className="overflow-hidden rounded-[14px] border border-edge bg-card">
          <div className="flex items-center gap-3 border-b border-divider px-4 py-3.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-info-dim text-base">
              🌙
            </span>
            <span className="flex-1 text-sm font-medium text-ink">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative h-[26px] w-[44px] rounded-full transition-colors ${
                theme === 'dark' ? 'bg-accent-dim' : 'bg-edge-input'
              }`}
            >
              <span
                className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${
                  theme === 'dark'
                    ? 'left-[21px] bg-accent'
                    : 'left-[3px] bg-ink-muted'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-7">
        <div className="mb-2.5 pl-0.5 text-[11px] font-bold uppercase tracking-[1.2px] text-ink-muted">
          Categories
        </div>
        <div className="overflow-hidden rounded-[14px] border border-edge bg-card">
          <Link
            to="/categories"
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-done-dim text-base">
              📁
            </span>
            <span className="flex-1 text-sm font-medium text-ink">Manage Categories</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-ink-muted" strokeWidth={2} fill="none">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Account */}
      <div className="mb-7">
        <div className="mb-2.5 pl-0.5 text-[11px] font-bold uppercase tracking-[1.2px] text-ink-muted">
          Account
        </div>
        <div className="overflow-hidden rounded-[14px] border border-edge bg-card">
          <div className="flex items-center gap-3 border-b border-divider px-4 py-3.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-info-dim text-base">
              📧
            </span>
            <span className="flex-1 text-sm font-medium text-ink">Email</span>
            <span className="font-mono text-[13px] text-ink-muted">{email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5"
          >
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-danger-dim text-base">
              🚪
            </span>
            <span className="flex-1 text-left text-sm font-medium text-danger">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="py-5 text-center font-mono text-xs text-ink-muted">
        HOMEBASE v1.0.0
      </div>
    </div>
  )
}
