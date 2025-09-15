// Mock database with cursor-like functionality
export interface DatabaseUser {
  id: string
  email: string
  password: string
  role: 'citizen' | 'agent' | 'admin'
  full_name: string
  phone?: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export class MockDatabase {
  private static STORAGE_KEY = 'sentinela_users_db'

  static async getAllUsers(): Promise<DatabaseUser[]> {
    await this.simulateDelay()
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  static async findUserByEmail(email: string): Promise<DatabaseUser | null> {
    await this.simulateDelay()
    const users = await this.getAllUsers()
    return users.find(user => user.email === email) || null
  }

  static async createUser(userData: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseUser> {
    await this.simulateDelay()
    
    const users = await this.getAllUsers()
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email)
    if (existingUser) {
      throw new Error('Este email já está em uso')
    }

    const newUser: DatabaseUser = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
    
    return newUser
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
          email: 'master@example.com',
          password: '09092019',
          role: 'admin',
          full_name: 'Master User',
          phone: '',
          is_approved: true
        },
        {
          email: 'master@master.com',
          password: '1234',
          role: 'admin',
          full_name: 'Master Admin',
          phone: '',
          is_approved: true
        }
      ]

      for (const masterUser of masterUsers) {
        await this.createUser(masterUser)
      }
    }
  }
}