import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { api, setToken, clearToken } from '../lib/api'

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: 'free' | 'pro' | 'enterprise'
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updatePlan: (plan: User['plan']) => void
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

const ADMIN_EMAIL = 'admin@flowdesk.com'
const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('flowdesk_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const persist = (u: User) => {
    setUser(u)
    localStorage.setItem('flowdesk_user', JSON.stringify(u))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password })
      setToken(res.token)
      const u: User = { ...res.user, role: (email === ADMIN_EMAIL ? 'owner' : res.user.role) as UserRole }
      persist(u)
      toast.success(`Bem-vindo, ${u.name}!`)
      return true
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Email ou senha inválidos')
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/register', { name, email, password })
      setToken(res.token)
      const u: User = { ...res.user, role: 'owner' }
      persist(u)
      toast.success(`Conta criada! Bem-vindo, ${name}!`)
      return true
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    clearToken()
    localStorage.removeItem('flowdesk_user')
    toast.success('Você saiu da conta')
  }

  const updatePlan = async (plan: User['plan']) => {
    if (!user) return
    try {
      await api.patch('/api/auth/plan', { plan })
      persist({ ...user, plan })
    } catch {
      toast.error('Erro ao atualizar plano')
    }
  }

  const isSuperAdmin = user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updatePlan, isAuthenticated: !!user, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
