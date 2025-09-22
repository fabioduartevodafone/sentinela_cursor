// Mock database with cursor-like functionality
export interface DatabaseUser {
  id: string
  email: string
  password: string
  role: 'citizen' | 'agent' | 'admin' | 'master'
  full_name: string
  phone?: string
  is_approved: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export class MockDatabase {
  private static STORAGE_KEY = 'sentinela_users_db'

  static async getAllUsers(): Promise<DatabaseUser[]> {
    await MockDatabase.simulateDelay()
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  static async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    await this.simulateDelay()
    const users = await this.getAllUsers()
    return users.find(user => user.email === email) || null
  }

  static async createUser(userData: DatabaseUser): Promise<DatabaseUser> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email)
    if (existingUser) {
      throw new Error('Este email já está em uso')
    }

    const newUser: DatabaseUser = {
      ...userData,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: userData.updated_at || new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    
    return newUser
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    return this.findUserByEmail(email);
  }

  static async updateUser(userId: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    return users[userIndex]
  }

  static async deleteUser(userId: string): Promise<void> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    const filteredUsers = users.filter(user => user.id !== userId)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredUsers))
  }

  // Método para aprovar/rejeitar usuário
  static async updateUserApprovalStatus(
    email: string, 
    status: 'approved' | 'rejected', 
    approvedBy: string
  ): Promise<DatabaseUser> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    const userIndex = users.findIndex(user => user.email === email)
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    users[userIndex] = {
      ...users[userIndex],
      is_approved: status === 'approved',
      approval_status: status,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    return users[userIndex]
  }

  // Método para buscar usuários pendentes de aprovação
  static async getPendingUsers(): Promise<DatabaseUser[]> {
    await this.simulateDelay()
    const users = await this.getAllUsers()
    return users.filter(user => user.approval_status === 'pending')
  }

  // Método para atualizar senha do usuário
  static async updateUserPassword(email: string, newPassword: string): Promise<void> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    const userIndex = users.findIndex(user => user.email === email)
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }

    users[userIndex].password = newPassword
    users[userIndex].updated_at = new Date().toISOString()
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
  }

  static async clearDatabase(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  private static async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Initialize with master users if database is empty
  static async initializeDatabase(): Promise<void> {
    const users = await this.getAllUsers()
    
    if (users.length === 0) {
      // Create master admin users
      const masterUsers: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          email: 'master@master.com',
          password: '09092019Rose!',
          role: 'master',
          full_name: 'Master User',
          phone: '',
          is_approved: true,
          approval_status: 'approved'
        },
        {
          email: 'admin@sentinela.com',
          password: 'Admin123!',
          role: 'admin',
          full_name: 'Administrador',
          phone: '',
          is_approved: true,
          approval_status: 'approved'
        },
        {
          email: 'agente@sentinela.com',
          password: 'Agente123!',
          role: 'agent',
          full_name: 'Agente',
          phone: '',
          is_approved: true,
          approval_status: 'approved'
        },
        {
          email: 'cidadao@exemplo.com',
          password: 'Cidadao123!',
          role: 'citizen',
          full_name: 'Cidadão',
          phone: '',
          is_approved: true,
          approval_status: 'approved'
        }
      ]

      for (const masterUser of masterUsers) {
        await this.createUser({
          ...masterUser,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }
  }
}