import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthService, AuthUser } from '@/lib/auth'
import { getRedirectPath } from '@/lib/utils'

interface AuthContextType {
  user: User | AuthUser | null
  profile: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  forceRefresh: () => Promise<void>
  loginAndRedirect: (credentials: { email: string; password: string }, expectedRole?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | AuthUser | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refreshProfile = async () => {
    if (AuthService.isMockMode()) {
      // Mock system - refresh from AuthService
      const currentUser = await AuthService.refreshUser()
      if (currentUser) {
        setProfile(currentUser)
        setUser(currentUser)
      } else {
        setProfile(null)
        setUser(null)
      }
      return
    }

    // Real Supabase system
    if (!user || !('id' in user)) return

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
  }

  // Função para forçar atualização do estado após login
  const forceRefresh = async () => {
    if (AuthService.isMockMode()) {
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setProfile(currentUser)
      } else {
        setUser(null)
        setProfile(null)
      }
    }
  }

  // Função para login com redirecionamento automático
  const loginAndRedirect = async (credentials: { email: string; password: string }, expectedRole?: string) => {
    try {
      const user = await AuthService.login(credentials)
      
      // Verificar se o usuário tem o role esperado (se especificado)
      if (expectedRole && user.role !== expectedRole) {
        throw new Error(`Esta área é exclusiva para ${expectedRole === 'citizen' ? 'cidadãos' : 'administradores'}`)
      }
      
      // Atualizar estado de autenticação
      await forceRefresh()
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      setTimeout(() => {
        const redirectPath = getRedirectPath(user.role)
        navigate(redirectPath)
      }, 100)
      
    } catch (error) {
      throw error // Re-throw para que o componente possa tratar
    }
  }

  const signOut = async () => {
    if (AuthService.isMockMode()) {
      // Mock system - use AuthService
      await AuthService.logout()
      setUser(null)
      setProfile(null)
      return
    }

    // Real Supabase system
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      if (AuthService.isMockMode()) {
        // Initialize mock database
        await AuthService.initialize()
        
        // Check for current user
        const currentUser = AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setProfile(currentUser)
        }
        setLoading(false)
        return
      }

      // Real Supabase system
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
          
          if (session?.user) {
            await refreshProfile()
          } else {
            setProfile(null)
          }
        }
      )

      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (AuthService.isMockMode()) {
      return // Profile is set together with user in mock mode
    }

    if (user && 'id' in user) {
      refreshProfile()
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, forceRefresh, loginAndRedirect }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}