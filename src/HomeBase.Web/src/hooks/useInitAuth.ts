import { useEffect, useRef } from 'react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'

/**
 * On app startup, if we have a persisted "isAuthenticated" flag, attempt to
 * silently refresh the access token using the HTTP-only refresh cookie.
 * If the refresh fails the user is logged out.
 */
export function useInitAuth() {
  const { isAuthenticated, setToken, setEmail, logout } = useAuthStore()
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    if (!isAuthenticated) return

    authApi
      .refresh()
      .then((data) => {
        setToken(data.accessToken, data.expiresAt)
        // Decode email from token (simple base64 decode of payload)
        try {
          const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
          const email: string =
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
            payload.email ??
            ''
          if (email) setEmail(email)
        } catch {
          // ignore decode errors
        }
      })
      .catch(() => {
        logout()
      })
  }, [isAuthenticated, setToken, setEmail, logout])
}
