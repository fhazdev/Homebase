import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Access token is stored only in memory (this store).
// The refresh token is in an HTTP-only cookie managed by the browser.
// We persist a minimal auth indicator (email) in localStorage so the
// user appears "logged in" across page refreshes; the token itself is
// re-fetched via the refresh endpoint on mount (see useInitAuth hook).

interface AuthState {
  accessToken: string | null
  expiresAt: string | null   // ISO string
  email: string | null
  isAuthenticated: boolean

  // Actions
  setToken: (accessToken: string, expiresAt: string) => void
  setEmail: (email: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      expiresAt: null,
      email: null,
      isAuthenticated: false,

      setToken: (accessToken, expiresAt) =>
        set({ accessToken, expiresAt, isAuthenticated: true }),

      setEmail: (email) =>
        set({ email }),

      logout: () =>
        set({ accessToken: null, expiresAt: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'homebase-auth',
      // Only persist non-sensitive fields to localStorage
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist accessToken — it lives in memory only
      }),
    },
  ),
)
