import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthService, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: User | AuthUser | null
  profile: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | AuthUser | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

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
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
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