import { createClient } from '@supabase/supabase-js'

// For development - these will be replaced when Supabase is properly connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data for development when Supabase is not connected
export const createMockUser = async (email: string, password: string, role: UserRole, full_name: string, phone?: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Check if user already exists
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
  const existingUser = users.find((u: any) => u.email === email)
  if (existingUser) {
    return { user: null, error: { message: 'Este email já está em uso' } }
  }
  
  const mockUser = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    password, // Store password for mock login validation
    role,
    full_name,
    phone,
    is_approved: role === 'citizen' || (role === 'admin' && email === 'master') || email === 'master@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Check if master user
  if (email === 'master@example.com' || (email === 'master' && password === '09092019')) {
    mockUser.role = 'admin'
    mockUser.is_approved = true
  }
  
  users.push(mockUser)
  localStorage.setItem('mock_users', JSON.stringify(users))
  localStorage.setItem('current_user', JSON.stringify(mockUser))
  
  return { user: mockUser, error: null }
}

export const loginMockUser = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
  
  // Check for master users
  if ((email === 'master' || email === 'master@example.com') && password === '09092019') {
    const masterUser = {
      id: 'master-user-id',
      email: 'master@example.com',
      role: 'admin' as UserRole,
      full_name: 'Master User',
      phone: '',
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    localStorage.setItem('current_user', JSON.stringify(masterUser))
    return { user: masterUser, error: null }
  }
  
  // Check for new master user
  if (email === 'master@master.com' && password === '1234') {
    const masterUser = {
      id: 'master-user-id-2',
      email: 'master@master.com',
      role: 'admin' as UserRole,
      full_name: 'Master Admin',
      phone: '',
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    localStorage.setItem('current_user', JSON.stringify(masterUser))
    return { user: masterUser, error: null }
  }
  
  // Find user by email first
  const user = users.find((u: any) => u.email === email)
  
  if (user) {
    // Check if user has password stored (new users)
    if (user.password) {
      // Validate password for new users
      if (user.password === password) {
        const { password: _, ...userWithoutPassword } = user
        localStorage.setItem('current_user', JSON.stringify(userWithoutPassword))
        return { user: userWithoutPassword, error: null }
      } else {
        return { user: null, error: { message: 'Email ou senha incorretos' } }
      }
    } else {
      // Legacy user without password - migrate by adding the provided password
      user.password = password
      
      // Update the users array with the new password
      const updatedUsers = users.map((u: any) => 
        u.email === email ? user : u
      )
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers))
      
      // Remove password from user object before storing and returning
      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem('current_user', JSON.stringify(userWithoutPassword))
      return { user: userWithoutPassword, error: null }
    }
  }
  
  return { user: null, error: { message: 'Email ou senha incorretos' } }
}

export type UserRole = 'citizen' | 'agent' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface ProtectiveMeasure {
  id: string
  citizen_id: string
  protected_person_name: string
  restricted_person_name: string
  restriction_details: string
  document_url?: string
  is_approved: boolean
  is_active: boolean
  valid_until: string
  created_at: string
  approved_by?: string
  approved_at?: string
}

export interface Incident {
  id: string
  type: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  is_anonymous: boolean
  reporter_id?: string
  reporter_name?: string
  reporter_phone?: string
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  assigned_agent_id?: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  badge_number: string
  is_online: boolean
  current_latitude?: number
  current_longitude?: number
  district: string
  last_seen: string
}

export interface Vehicle {
  id: string
  plate: string
  model: string
  type: 'fixed' | 'rotating'
  assigned_agents?: string[]
  district: string
  status: 'available' | 'in_use' | 'maintenance'
  created_at: string
  updated_at: string
}