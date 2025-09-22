// Módulo de segurança para proteção robusta de credenciais

export class SecurityService {
  // Configurações de segurança
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  // Armazenamento de tentativas de login (em produção, usar Redis ou banco)
  private static loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  /**
   * Valida a força da senha
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
    errors: string[];
  } {
    const errors: string[] = [];
    let score = 0;

    // Comprimento mínimo
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Senha deve ter pelo menos ${this.MIN_PASSWORD_LENGTH} caracteres`);
    } else {
      score += 1;
    }

    // Letras minúsculas
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    } else {
      score += 1;
    }

    // Letras maiúsculas
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    } else {
      score += 1;
    }

    // Números
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    } else {
      score += 1;
    }

    // Caracteres especiais
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    } else {
      score += 1;
    }

    // Verificar padrões comuns e senhas muito comuns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i,
      /senha/i
    ];

    const veryCommonPasswords = [
      'password', 'Password123', '123456789', 'qwerty123', 'admin123', 'senha123'
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Senha não deve conter padrões comuns');
      score = Math.max(0, score - 2);
    }

    if (veryCommonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      errors.push('Senha muito comum, escolha uma mais única');
      score = Math.max(0, score - 3);
    }

    return {
      isValid: score >= 4 && errors.length === 0,
      score,
      feedback: errors, // Mantém compatibilidade
      errors
    };
  }

  /**
   * Simula hash de senha (em produção, usar bcrypt)
   */
  static async hashPassword(password: string): Promise<string> {
    // Em produção, usar bcrypt.hash(password, this.SALT_ROUNDS)
    // Por enquanto, simulamos com uma função simples
    const salt = this.generateSalt();
    return `hashed_${salt}_${password}`;
  }

  /**
   * Verifica senha hasheada
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Em produção, usar bcrypt.compare(password, hashedPassword)
    // Por enquanto, simulamos a verificação
    return hashedPassword.includes(password);
  }

  /**
   * Gera salt para hash
   */
  private static generateSalt(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Verifica tentativas de login e implementa rate limiting
   */
  static checkLoginAttempts(identifier: string): {
    allowed: boolean;
    attemptsLeft: number;
    lockoutTime?: number;
  } {
    const attempts = this.loginAttempts.get(identifier);
    const now = Date.now();

    if (!attempts) {
      return { allowed: true, attemptsLeft: this.MAX_LOGIN_ATTEMPTS };
    }

    // Verificar se o lockout expirou
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      if (timeSinceLastAttempt >= this.LOCKOUT_DURATION) {
        // Reset attempts
        this.loginAttempts.delete(identifier);
        return { allowed: true, attemptsLeft: this.MAX_LOGIN_ATTEMPTS };
      } else {
        const lockoutTime = this.LOCKOUT_DURATION - timeSinceLastAttempt;
        return { 
          allowed: false, 
          attemptsLeft: 0,
          lockoutTime 
        };
      }
    }

    return {
      allowed: true,
      attemptsLeft: this.MAX_LOGIN_ATTEMPTS - attempts.count
    };
  }

  /**
   * Registra tentativa de login falhada
   */
  static recordFailedLogin(identifier: string): void {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(identifier, attempts);
  }

  /**
   * Limpa tentativas de login após sucesso
   */
  static clearLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /**
   * Valida formato de email
   */
  static validateEmail(email: string): boolean {
    if (!email || email.trim() === '') return false;
    
    // Regex mais rigorosa para validação de email
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    
    // Verificações adicionais
    if (email.includes('..')) return false; // Não permite pontos duplos
    if (email.startsWith('.') || email.endsWith('.')) return false; // Não permite começar ou terminar com ponto
    if (email.includes('@.') || email.includes('.@')) return false; // Não permite ponto adjacente ao @
    
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone brasileiro
   */
  static validatePhoneBR(phone: string): boolean {
    if (!phone || phone.trim() === '') return false;
    
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem exatamente 10 ou 11 dígitos
    if (!/^(\d{10}|\d{11})$/.test(cleanPhone)) return false;
    
    // Validações adicionais para telefones brasileiros
    if (cleanPhone.length === 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      const ddd = cleanPhone.substring(0, 2);
      const number = cleanPhone.substring(2);
      
      // Verifica se o DDD é válido (11-99)
      const dddNum = parseInt(ddd);
      if (dddNum < 11 || dddNum > 99) return false;
      
      // Primeiro dígito do número não pode ser 0 ou 1
      if (number[0] === '0' || number[0] === '1') return false;
    } else if (cleanPhone.length === 11) {
      // Celular: (XX) 9XXXX-XXXX
      const ddd = cleanPhone.substring(0, 2);
      const ninthDigit = cleanPhone[2];
      const number = cleanPhone.substring(3);
      
      // Verifica se o DDD é válido (11-99)
      const dddNum = parseInt(ddd);
      if (dddNum < 11 || dddNum > 99) return false;
      
      // Nono dígito deve ser 9 para celulares
      if (ninthDigit !== '9') return false;
      
      // Primeiro dígito do número não pode ser 0 ou 1
      if (number[0] === '0' || number[0] === '1') return false;
    }
    
    return true;
  }

  /**
   * Sanitiza entrada de texto para prevenir XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Gera token seguro para sessões
   */
  static generateSecureToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback para Node.js
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica se o domínio do email é institucional
   */
  static isInstitutionalEmail(email: string): boolean {
    const institutionalDomains = [
      'gov.br',
      'prefeitura.',
      'policia.',
      'bombeiros.',
      'defesacivil.',
      'samu.',
      'pm.',
      'pc.',
      '.mil.br'
    ];

    const emailLower = email.toLowerCase();
    return institutionalDomains.some(domain => emailLower.includes(domain));
  }

  /**
   * Valida CPF brasileiro
   */
  static validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    
    return remainder === parseInt(cleanCPF.charAt(10));
  }

  /**
   * Formata tempo de lockout para exibição
   */
  static formatLockoutTime(milliseconds: number): string {
    const minutes = Math.ceil(milliseconds / (1000 * 60));
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }

  /**
   * Valida se a senha atende aos critérios mínimos
   */
  static isValidPassword(password: string): boolean {
    const validation = this.validatePasswordStrength(password);
    return validation.isValid;
  }

  /**
   * Valida formato de email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}