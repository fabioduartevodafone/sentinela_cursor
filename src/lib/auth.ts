import { MockDatabase, DatabaseUser } from './database';
import { SecurityService } from './security';
import { canPerformAction } from './permissions';

export type UserRole = 'citizen' | 'agent' | 'admin' | 'master'

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
    // Initialize mock database with default users
    await MockDatabase.initializeDatabase();
  }
  
  // Verifica se o usuário tem permissão para realizar uma ação específica
  static canPerformAction(user: AuthUser | null, action: string): boolean {
    if (!user) return false;
    
    // Definição de permissões por nível de acesso
    const permissions = {
      master: ['manage_admins', 'manage_agents', 'manage_citizens', 'approve_users', 'manage_protective_measures', 'manage_incidents', 'view_all_data'],
      admin: ['manage_agents', 'manage_citizens', 'approve_users', 'manage_protective_measures', 'manage_incidents', 'view_all_data'],
      agent: ['manage_citizens', 'manage_protective_measures', 'manage_incidents', 'view_assigned_data'],
      citizen: ['create_protective_measure_request', 'view_own_data']
    };
    
    // Verifica se o usuário tem a permissão necessária
    switch (user.role) {
      case 'master':
        return permissions.master.includes(action);
      case 'admin':
        return permissions.admin.includes(action);
      case 'agent':
        return permissions.agent.includes(action);
      case 'citizen':
        return permissions.citizen.includes(action);
      default:
        return false;
    }
  }

  // Função para verificar hierarquia de papéis
  static canPerformActionByRole(userRole: UserRole, requiredLevel: 'master' | 'admin' | 'agent' | 'citizen'): boolean {
    const roleHierarchy = {
      master: 4,
      admin: 3,
      agent: 2,
      citizen: 1
    };

    const userLevel = roleHierarchy[userRole];
    const requiredRoleLevel = roleHierarchy[requiredLevel];

    return userLevel >= requiredRoleLevel;
  }

  static async register(data: RegisterData): Promise<AuthUser> {
    try {
      // Sanitizar entradas
      const sanitizedData = {
        ...data,
        full_name: SecurityService.sanitizeInput(data.full_name),
        email: SecurityService.sanitizeInput(data.email),
        phone: data.phone ? SecurityService.sanitizeInput(data.phone) : undefined
      };

      // Validar dados de registro
      this.validateRegistrationData(sanitizedData);

      // Verificar se o email já existe
      const existingUser = await MockDatabase.getUserByEmail(sanitizedData.email);
      if (existingUser) {
        throw new Error('Este email já está cadastrado no sistema');
      }

      // Hash da senha (em produção, usar SecurityService.hashPassword)
      const hashedPassword = sanitizedData.password; // Temporário - usar hash em produção

      // Determinar se a conta deve ser aprovada automaticamente
      const autoApprove = this.shouldAutoApprove(sanitizedData.role);
      const approvalStatus = autoApprove ? 'approved' : 'pending';

      // Criar usuário no banco de dados
      const newUser: DatabaseUser = {
        id: crypto.randomUUID(),
        email: sanitizedData.email,
        password: hashedPassword,
        full_name: sanitizedData.full_name,
        role: sanitizedData.role,
        phone: sanitizedData.phone,
        is_approved: autoApprove,
        approval_status: approvalStatus,
        approved_by: autoApprove ? 'system' : undefined,
        approved_at: autoApprove ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await MockDatabase.createUser(newUser);

      // Converter para AuthUser
      const authUser = this.convertToAuthUser(newUser);

      return authUser;
    } catch (error) {
      throw error;
    }
  }

  // Método para atualizar status de aprovação de usuários
  static async updateUserApprovalStatus(email: string, status: 'approved' | 'rejected', approvedBy: string): Promise<void> {
    try {
      await MockDatabase.updateUserApprovalStatus(email, status, approvedBy);
    } catch (error) {
      console.error('Erro ao atualizar status de aprovação:', error);
      throw new Error('Falha ao atualizar status de aprovação');
    }
  }

  // Método para buscar usuários pendentes de aprovação
  static async getPendingUsers(): Promise<DatabaseUser[]> {
    try {
      return await MockDatabase.getPendingUsers();
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      throw new Error('Falha ao buscar usuários pendentes');
    }
  }

  // Método para solicitar redefinição de senha
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      // Verificar se o email existe no sistema
      const user = await MockDatabase.getUserByEmail(email);
      if (!user) {
        throw new Error('Email não encontrado no sistema');
      }

      // Em produção, aqui seria enviado um email real
      // Por enquanto, simularemos o processo
      const resetToken = crypto.randomUUID();
      
      // Armazenar token temporariamente (em produção, seria no banco de dados)
      localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify({
        email: email,
        expires: Date.now() + 3600000 // 1 hora
      }));

      console.log(`Link de recuperação: ${window.location.origin}/reset-password?token=${resetToken}`);
      
      // Simular delay de envio de email
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      throw error;
    }
  }

  // Método para redefinir senha
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verificar token
      const tokenData = localStorage.getItem(`reset_token_${token}`);
      if (!tokenData) {
        throw new Error('Token de recuperação inválido ou expirado');
      }

      const { email, expires } = JSON.parse(tokenData);
      
      if (Date.now() > expires) {
        localStorage.removeItem(`reset_token_${token}`);
        throw new Error('Token de recuperação expirado');
      }

      // Validar nova senha
      if (!SecurityService.isValidPassword(newPassword)) {
        throw new Error('A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo');
      }

      // Atualizar senha no banco de dados
      await MockDatabase.updateUserPassword(email, newPassword);
      
      // Remover token usado
      localStorage.removeItem(`reset_token_${token}`);
    } catch (error) {
      throw error;
    }
  }

  // Validações específicas por tipo de usuário
  private static validateRegistrationData(data: RegisterData): void {
    // Validação de email
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Validação de senha
    const passwordValidation = SecurityService.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Validação de nome
    if (!data.full_name || data.full_name.trim().length < 2) {
      throw new Error('Nome completo deve ter pelo menos 2 caracteres');
    }

    // Validações específicas por tipo
    switch (data.role) {
      case 'admin':
        this.validateAdminRegistration(data);
        break;
      case 'agent':
        this.validateAgentRegistration(data);
        break;
      case 'citizen':
        this.validateCitizenRegistration(data);
        break;
      default:
        throw new Error('Tipo de usuário inválido');
    }
  }

  private static validateAdminRegistration(data: RegisterData): void {
    // Administradores devem usar email institucional
    if (!SecurityService.isInstitutionalEmail(data.email)) {
      throw new Error('Administradores devem usar email institucional (@gov.br, @prefeitura.*, etc.)');
    }

    // Nome deve ter formato profissional
    if (!/^[A-Za-zÀ-ÿ\s]{2,50}$/.test(data.full_name)) {
      throw new Error('Nome deve conter apenas letras e espaços (2-50 caracteres)');
    }

    // Telefone obrigatório para administradores
    if (!data.phone || !SecurityService.validatePhoneBR(data.phone)) {
      throw new Error('Telefone brasileiro válido é obrigatório para administradores');
    }
  }

  private static validateAgentRegistration(data: RegisterData): void {
    // Agentes devem usar email institucional
    if (!SecurityService.isInstitutionalEmail(data.email)) {
      throw new Error('Agentes devem usar email institucional (@gov.br, @prefeitura.*, etc.)');
    }

    // Nome deve ter formato profissional
    if (!/^[A-Za-zÀ-ÿ\s]{2,50}$/.test(data.full_name)) {
      throw new Error('Nome deve conter apenas letras e espaços (2-50 caracteres)');
    }

    // Telefone obrigatório para agentes
    if (!data.phone || !SecurityService.validatePhoneBR(data.phone)) {
      throw new Error('Telefone brasileiro válido é obrigatório para agentes');
    }
  }

  private static validateCitizenRegistration(data: RegisterData): void {
    // Cidadãos podem usar qualquer email válido
    // Nome deve ter formato básico
    if (!/^[A-Za-zÀ-ÿ\s]{2,100}$/.test(data.full_name)) {
      throw new Error('Nome deve conter apenas letras e espaços (2-100 caracteres)');
    }

    // Telefone opcional, mas se fornecido deve ser válido
    if (data.phone && !SecurityService.validatePhoneBR(data.phone)) {
      throw new Error('Formato de telefone inválido');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sistema de aprovação de contas
  private static shouldAutoApprove(role: string): boolean {
    // Apenas cidadãos são aprovados automaticamente
    if (role === 'citizen') {
      return true;
    }

    // Agentes precisam de aprovação por administrador ou master
    // Administradores precisam de aprovação por master
    return false;
  }

  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Verificar rate limiting
    const loginCheck = SecurityService.checkLoginAttempts(credentials.email);
    if (!loginCheck.allowed) {
      const lockoutTime = SecurityService.formatLockoutTime(loginCheck.lockoutTime || 0);
      throw new Error(`Muitas tentativas de login. Tente novamente em ${lockoutTime}.`);
    }

    try {
      // Buscar usuário no banco de dados
      const user = await MockDatabase.findUserByEmail(credentials.email);
      if (!user) {
        SecurityService.recordFailedLogin(credentials.email);
        throw new Error('Email ou senha incorretos');
      }

      // Verificar senha (em produção, usar SecurityService.verifyPassword)
      if (user.password !== credentials.password) {
        SecurityService.recordFailedLogin(credentials.email);
        throw new Error('Email ou senha incorretos');
      }

      // Verificar se a conta está aprovada
      if (!user.is_approved) {
        throw new Error('Sua conta ainda não foi aprovada. Aguarde a análise.');
      }

      // Login bem-sucedido - limpar tentativas
      SecurityService.clearLoginAttempts(credentials.email);

      // Converter para AuthUser
      const authUser = this.convertToAuthUser(user);

      // Definir como usuário atual
      this.setCurrentUser(authUser);

      return authUser;
    } catch (error) {
      // Se não foi erro de rate limiting, registrar tentativa falhada
      if (!(error as Error).message.includes('Muitas tentativas')) {
        SecurityService.recordFailedLogin(credentials.email);
      }
      throw error;
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }
  
  static async loginWithGoogle(): Promise<AuthUser> {
    try {
      // Simulação de login com Google
      const mockUser: DatabaseUser = {
        id: `google_${Date.now()}`,
        email: `user_${Date.now()}@gmail.com`,
        password: '',
        role: 'citizen',
        full_name: 'Usuário Google',
        phone: '',
        is_approved: true,
        approval_status: 'approved',
        approved_by: 'system',
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Salvar usuário no banco de dados mock
      await MockDatabase.createUser(mockUser)
      
      // Converter para AuthUser
      const authUser = this.convertToAuthUser(mockUser)
      
      // Definir como usuário atual
      this.setCurrentUser(authUser)
      
      return authUser
    } catch (error) {
      throw error
    }
  }
  
  static async loginWithFacebook(): Promise<AuthUser> {
    try {
      // Simulação de login com Facebook
      const mockUser: DatabaseUser = {
        id: `facebook_${Date.now()}`,
        email: `user_${Date.now()}@facebook.com`,
        password: '',
        role: 'citizen',
        full_name: 'Usuário Facebook',
        phone: '',
        is_approved: true,
        approval_status: 'approved',
        approved_by: 'system',
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Salvar usuário no banco de dados mock
      await MockDatabase.createUser(mockUser)
      
      // Converter para AuthUser
      const authUser = this.convertToAuthUser(mockUser)
      
      // Definir como usuário atual
      this.setCurrentUser(authUser)
      
      return authUser
    } catch (error) {
      throw error
    }
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

  /**
   * Verifica se a aplicação está executando em modo mock (desenvolvimento)
   * @returns true se estiver em modo mock, false caso contrário
   */
  static isMockMode(): boolean {
    // Acessa as variáveis de ambiente de forma compatível com testes
    let supabaseUrl: string
    let supabaseKey: string
    
    try {
      // Em ambiente de teste, usa o mock; em produção, usa import.meta.env
      if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
        supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
        supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
      } else {
        // Fallback para ambiente de teste
        supabaseUrl = 'https://placeholder.supabase.co'
        supabaseKey = 'placeholder-key'
      }
    } catch (error) {
      // Em caso de erro (ambiente de teste), usa valores placeholder
      supabaseUrl = 'https://placeholder.supabase.co'
      supabaseKey = 'placeholder-key'
    }
    
    // Verifica se as configurações são placeholders ou inválidas
    return (
      supabaseUrl.includes('placeholder') ||
      supabaseKey.includes('placeholder') ||
      !supabaseUrl.startsWith('https://') ||
      supabaseKey.length <= 20
    )
  }
}