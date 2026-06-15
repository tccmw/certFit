import { createContext } from 'react'

import type { User } from '../types'

export interface AuthContextValue {
  token: string | null
  user: User | null
  booting: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
