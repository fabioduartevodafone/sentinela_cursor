import { MockDatabase, DatabaseUser } from './database'

export type UserRole = 'citizen' | 'agent' | 'admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  role: UserRole
}

export class AuthService {
  private static CURRENT_USER_KEY = 'sentinela_current_user'

  static async initialize(): Promise<void> {
    await MockDatabase.initializeDatabase()
  }

  static async register(data: RegisterData): Promise<AuthUser> {
    try {
      // Validate password
      if (data.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      // Create user in database
      const newUser = await MockDatabase.createUser({
        email: data.email,
        password: data.password,
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        is_approved: data.role === 'citizen' // Citizens are auto-approved
      })

      // Convert to AuthUser (without password)
      const authUser = this.convertToAuthUser(newUser)
      
      // Set as current user
      this.setCurrentUser(authUser)
      
      return authUser
    } catch (error) {
      throw error
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // Find user by email
      const user = await MockDatabase.findUserByEmail(credentials.email)
      
      if (!user) {
        throw new Error('Email ou senha incorretos')
      }

      // Validate password
      if (user.password !== credentials.password) {
        throw new Error('Email ou senha incorretos')
      }

      // Check if user is approved
      if (!user.is_approved) {
        throw new Error('Sua conta ainda não foi aprovada por um administrador')
      }

      // Convert to AuthUser (without password)
      const authUser = this.convertToAuthUser(user)
      
      // Set as current user
      this.setCurrentUser(authUser)
      
      return authUser
    } catch (error) {
      throw error
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  static getCurrentUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.CURRENT_USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  static setCurrentUser(user: AuthUser): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
  }

  static async refreshUser(): Promise<AuthUser | null> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null

    try {
      // Fetch updated user data
      const updatedUser = await MockDatabase.findUserByEmail(currentUser.email)
      if (!updatedUser) {
        this.logout()
        return null
      }

      const authUser = this.convertToAuthUser(updatedUser)
      this.setCurrentUser(authUser)
      return authUser
    } catch {
      this.logout()
      return null
    }
  }

  private static convertToAuthUser(dbUser: DatabaseUser): AuthUser {
    const { password, ...userWithoutPassword } = dbUser
    return userWithoutPassword
  }

  // Utility method to check if running in mock mode
  static isMockMode(): boolean {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
    return supabaseUrl.includes('placeholder')
  }
}