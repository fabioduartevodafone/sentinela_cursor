import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityService } from '../lib/security';

describe('SecurityService', () => {

  describe('Validação de Senha', () => {
    it('deve aceitar senha forte válida', () => {
      const result = SecurityService.validatePasswordStrength('MinhaSenh@123');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = SecurityService.validatePasswordStrength('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos 8 caracteres');
    });

    it('deve rejeitar senha sem letras minúsculas', () => {
      const result = SecurityService.validatePasswordStrength('MINHASENHA123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra minúscula');
    });

    it('deve rejeitar senha sem letras maiúsculas', () => {
      const result = SecurityService.validatePasswordStrength('minhasenha123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve rejeitar senha sem números', () => {
      const result = SecurityService.validatePasswordStrength('MinhaSenh@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um número');
    });

    it('deve rejeitar senha sem caracteres especiais', () => {
      const result = SecurityService.validatePasswordStrength('MinhaSenh123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um caractere especial');
    });

    it('deve rejeitar senhas com padrões comuns', () => {
      const commonPatterns = ['password123!', 'Qwerty123!', 'Admin123!'];
      
      commonPatterns.forEach(password => {
        const result = SecurityService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha não deve conter padrões comuns');
      });
    });

    it('deve rejeitar senhas muito comuns', () => {
      const veryCommonPasswords = ['password', 'Password123', '123456789', 'qwerty123', 'admin123', 'senha123'];
      
      veryCommonPasswords.forEach(password => {
        const result = SecurityService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Senha muito comum, escolha uma mais única');
      });
    });
  });

  describe('Hash e Verificação de Senha', () => {
    it('deve gerar hash de senha', async () => {
      const password = 'MinhaSenh@123';
      const hash = await SecurityService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).toContain('hashed_');
      expect(hash).toContain(password);
    });

    it('deve verificar senha correta', async () => {
      const password = 'MinhaSenh@123';
      const hash = await SecurityService.hashPassword(password);
      const isValid = await SecurityService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const password = 'MinhaSenh@123';
      const wrongPassword = 'SenhaErrada@456';
      const hash = await SecurityService.hashPassword(password);
      const isValid = await SecurityService.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    const testEmail = 'test@example.com';

    beforeEach(() => {
      // Limpar tentativas antes de cada teste
      SecurityService.clearLoginAttempts(testEmail);
    });

    it('deve permitir login inicial', () => {
      const result = SecurityService.checkLoginAttempts(testEmail);
      expect(result.allowed).toBe(true);
      expect(result.attemptsLeft).toBe(5);
    });

    it('deve decrementar tentativas após falha', () => {
      SecurityService.recordFailedLogin(testEmail);
      const result = SecurityService.checkLoginAttempts(testEmail);
      expect(result.allowed).toBe(true);
      expect(result.attemptsLeft).toBe(4);
    });

    it('deve bloquear após 5 tentativas falhadas', () => {
      // Registrar 5 tentativas falhadas
      for (let i = 0; i < 5; i++) {
        SecurityService.recordFailedLogin(testEmail);
      }
      
      const result = SecurityService.checkLoginAttempts(testEmail);
      expect(result.allowed).toBe(false);
      expect(result.attemptsLeft).toBe(0);
      expect(result.lockoutTime).toBeGreaterThan(0);
    });

    it('deve limpar tentativas após sucesso', () => {
      SecurityService.recordFailedLogin(testEmail);
      SecurityService.recordFailedLogin(testEmail);
      
      let result = SecurityService.checkLoginAttempts(testEmail);
      expect(result.attemptsLeft).toBe(3);
      
      SecurityService.clearLoginAttempts(testEmail);
      result = SecurityService.checkLoginAttempts(testEmail);
      expect(result.attemptsLeft).toBe(5);
    });
  });

  describe('Validação de Email', () => {
    it('deve aceitar emails válidos', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'admin@prefeitura.sp.gov.br'
      ];

      validEmails.forEach(email => {
        expect(SecurityService.validateEmail(email)).toBe(true);
      });
    });

    it('deve rejeitar emails inválidos', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..double.dot@example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(SecurityService.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Validação de Telefone Brasileiro', () => {
    it('deve aceitar telefones válidos', () => {
      const validPhones = [
        '11999999999',
        '1199999999',
        '(11) 99999-9999',
        '(11) 9999-9999',
        '11 99999-9999'
      ];

      validPhones.forEach(phone => {
        expect(SecurityService.validatePhoneBR(phone)).toBe(true);
      });
    });

    it('deve rejeitar telefones inválidos', () => {
      const invalidPhones = [
        '123',
        '999999999',
        '119999999999',
        'abc1234567890',
        ''
      ];

      invalidPhones.forEach(phone => {
        expect(SecurityService.validatePhoneBR(phone)).toBe(false);
      });
    });
  });

  describe('Sanitização de Entrada', () => {
    it('deve remover tags HTML', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toBe('scriptalert("xss")/scriptHello World');
    });

    it('deve remover javascript:', () => {
      const input = 'javascript:alert("xss")';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss")');
    });

    it('deve remover event handlers', () => {
      const input = 'onclick=alert("xss") Hello';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toBe('alert("xss") Hello');
    });

    it('deve fazer trim do texto', () => {
      const input = '  Hello World  ';
      const sanitized = SecurityService.sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('Geração de Token Seguro', () => {
    it('deve gerar token com 64 caracteres', () => {
      const token = SecurityService.generateSecureToken();
      expect(token).toHaveLength(64);
    });

    it('deve gerar tokens únicos', () => {
      const token1 = SecurityService.generateSecureToken();
      const token2 = SecurityService.generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('deve gerar token hexadecimal', () => {
      const token = SecurityService.generateSecureToken();
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  describe('Validação de Email Institucional', () => {
    it('deve identificar emails institucionais', () => {
      const institutionalEmails = [
        'admin@prefeitura.sp.gov.br',
        'user@gov.br',
        'agent@policia.sp.gov.br',
        'medic@samu.sp.gov.br',
        'officer@pm.sp.gov.br'
      ];

      institutionalEmails.forEach(email => {
        expect(SecurityService.isInstitutionalEmail(email)).toBe(true);
      });
    });

    it('deve rejeitar emails não institucionais', () => {
      const regularEmails = [
        'user@gmail.com',
        'test@yahoo.com',
        'admin@company.com',
        'user@example.org'
      ];

      regularEmails.forEach(email => {
        expect(SecurityService.isInstitutionalEmail(email)).toBe(false);
      });
    });
  });

  describe('Validação de CPF', () => {
    it('deve aceitar CPFs válidos', () => {
      const validCPFs = [
        '11144477735',
        '111.444.777-35',
        '123.456.789-09'
      ];

      validCPFs.forEach(cpf => {
        expect(SecurityService.validateCPF(cpf)).toBe(true);
      });
    });

    it('deve rejeitar CPFs inválidos', () => {
      const invalidCPFs = [
        '11111111111',
        '123456789',
        '123.456.789-00',
        'abc.def.ghi-jk',
        ''
      ];

      invalidCPFs.forEach(cpf => {
        expect(SecurityService.validateCPF(cpf)).toBe(false);
      });
    });
  });

  describe('Formatação de Tempo de Lockout', () => {
    it('deve formatar minutos corretamente', () => {
      expect(SecurityService.formatLockoutTime(60000)).toBe('1 minuto');
      expect(SecurityService.formatLockoutTime(120000)).toBe('2 minutos');
      expect(SecurityService.formatLockoutTime(300000)).toBe('5 minutos');
    });

    it('deve arredondar para cima', () => {
      expect(SecurityService.formatLockoutTime(90000)).toBe('2 minutos');
      expect(SecurityService.formatLockoutTime(30000)).toBe('1 minuto');
    });
  });
});