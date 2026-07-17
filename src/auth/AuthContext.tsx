import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { api } from '../api/client'
import { queryClient } from '../lib/query-client'
import type { AuthResponse, User } from '../types'
import { AuthContext } from './authState'
import type { AuthContextValue } from './authState'

const TOKEN_KEY = 'certfit-token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(true)

  const applyAuth = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    setToken(response.token)
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    queryClient.clear()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return null
    }
    const refreshed = await api.me(token)
    setUser(refreshed)
    return refreshed
  }, [token])

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setBooting(false)
        return
      }

      try {
        const restored = await api.me(token)
        setUser(restored)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setBooting(false)
      }
    }

    restoreSession()
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      booting,
      isAuthenticated: Boolean(token && user),
      login: async (email, password) => {
        const response = await api.login(email, password)
        applyAuth(response)
      },
      register: async (email, password, name) => {
        const response = await api.register(email, password, name)
        applyAuth(response)
      },
      logout,
      refreshUser,
    }),
    [applyAuth, booting, logout, refreshUser, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
