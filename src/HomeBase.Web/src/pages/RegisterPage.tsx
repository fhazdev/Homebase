import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { getErrorMessage } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { Input } from '../components/Input'
import { Button } from '../components/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setToken, setEmail } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [email, setEmailInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const data = await authApi.register({ email, password })
      setToken(data.accessToken, data.expiresAt)
      setEmail(email)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-4">
      <div className="w-full max-w-sm">
        {/* Theme toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-edge bg-card transition-colors hover:bg-card-hover"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="var(--hb-toggle-icon)" stroke="var(--hb-toggle-icon)" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="var(--hb-toggle-icon)" stroke="var(--hb-toggle-icon)" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mb-8 text-center">
          <span className="text-5xl">🏠</span>
          <h1 className="mt-4 text-2xl font-bold text-ink">
            HOMEBASE<span className="text-accent">_</span>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-xl bg-danger-dim px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:opacity-80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
