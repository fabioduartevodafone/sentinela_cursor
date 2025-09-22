import { describe, it, beforeEach } from '@vitest/runner';
import { vi } from '@vitest/runner';
import { expect } from '@vitest/runner';
import { AuthService } from '../lib/auth';
import { SecurityService } from '../lib/security';
import { MockDatabase } from '../lib/database';
import { localStorageMock } from './setup';

describe('AuthService', () => {
  beforeEach(async () => {
    await AuthService.initialize();
  });

  describe('Registro de Usuários', () => {
    it('deve registrar um cidadão com dados válidos', async () => {
      const userData = {
        full_name: 'João Silva',
        email: 'joao@email.com',
        password: 'MinhaSenh@123',
        role: 'citizen' as const,
        phone: '(11) 99999-9999'
      };

      const result = await AuthService.register(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe('citizen');
      expect(result.is_approved).toBe(true); // Cidadãos são aprovados automaticamente
    });

    it('deve registrar um administrador com aprovação manual', async () => {
      const userData = {
        full_name: 'Maria Santos',
        email: 'maria@prefeitura.sp.gov.br',
        password: 'AdminSenh@123',
        role: 'admin' as const,
        phone: '(11) 88888-8888'
      };

      const result = await AuthService.register(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe('admin');
      expect(result.is_approved).toBe(false); // Administradores precisam de aprovação
    });

    it('deve registrar um agente com aprovação manual', async () => {
      const userData = {
        full_name: 'Carlos Oliveira',
        email: 'carlos@policia.sp.gov.br',
        password: 'AgenteSenh@123',
        role: 'agent' as const,
        phone: '(11) 77777-7777'
      };

      const result = await AuthService.register(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe('agent');
      expect(result.is_approved).toBe(false); // Agentes precisam de aprovação
    });

    it('deve rejeitar email já existente', async () => {
      const userData = {
        full_name: 'João Silva',
        email: 'joao@email.com',
        password: 'MinhaSenh@123',
        role: 'citizen' as const
      };

      // Primeiro registro
      await AuthService.register(userData);

      // Segundo registro com mesmo email
      await expect(AuthService.register(userData))
        .rejects.toThrow('Este email já está cadastrado no sistema');
    });

    it('deve rejeitar senha fraca', async () => {
      const userData = {
        full_name: 'João Silva',
        email: 'joao@email.com',
        password: '123',
        role: 'citizen' as const
      };

      await expect(AuthService.register(userData))
        .rejects.toThrow('Senha inválida');
    });

    it('deve rejeitar email inválido', async () => {
      const userData = {
        full_name: 'João Silva',
        email: 'email-invalido',
        password: 'MinhaSenh@123',
        role: 'citizen' as const
      };

      await expect(AuthService.register(userData))
        .rejects.toThrow('Email inválido');
    });

    it('deve rejeitar nome muito curto', async () => {
      const userData = {
        full_name: 'A',
        email: 'joao@email.com',
        password: 'MinhaSenh@123',
        role: 'citizen' as const
      };

      await expect(AuthService.register(userData))
        .rejects.toThrow('Nome completo deve ter pelo menos 2 caracteres');
    });
  });

  describe('Validações Específicas por Tipo de Usuário', () => {
    describe('Administrador', () => {
      it('deve exigir email institucional', async () => {
        const userData = {
          full_name: 'Admin User',
          email: 'admin@gmail.com',
          password: 'AdminSenh@123',
          role: 'admin' as const,
          phone: '(11) 99999-9999'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Administradores devem usar email institucional');
      });

      it('deve exigir telefone válido', async () => {
        const userData = {
          full_name: 'Admin User',
          email: 'admin@prefeitura.sp.gov.br',
          password: 'AdminSenh@123',
          role: 'admin' as const,
          phone: '123'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Telefone brasileiro válido é obrigatório para administradores');
      });

      it('deve exigir nome profissional', async () => {
        const userData = {
          full_name: 'Admin123',
          email: 'admin@prefeitura.sp.gov.br',
          password: 'AdminSenh@123',
          role: 'admin' as const,
          phone: '(11) 99999-9999'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Nome deve conter apenas letras e espaços');
      });
    });

    describe('Agente', () => {
      it('deve exigir email institucional', async () => {
        const userData = {
          full_name: 'Agent User',
          email: 'agent@gmail.com',
          password: 'AgentSenh@123',
          role: 'agent' as const,
          phone: '(11) 99999-9999'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Agentes devem usar email institucional');
      });

      it('deve exigir telefone válido', async () => {
        const userData = {
          full_name: 'Agent User',
          email: 'agent@policia.sp.gov.br',
          password: 'AgentSenh@123',
          role: 'agent' as const,
          phone: '123'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Telefone brasileiro válido é obrigatório para agentes');
      });
    });

    describe('Cidadão', () => {
      it('deve aceitar qualquer email válido', async () => {
        const userData = {
          full_name: 'Citizen User',
          email: 'citizen@gmail.com',
          password: 'CitizenSenh@123',
          role: 'citizen' as const
        };

        const result = await AuthService.register(userData);
        expect(result).toBeDefined();
        expect(result.email).toBe(userData.email);
      });

      it('deve aceitar telefone opcional', async () => {
        const userData = {
          full_name: 'Citizen User',
          email: 'citizen2@gmail.com',
          password: 'CitizenSenh@123',
          role: 'citizen' as const
        };

        const result = await AuthService.register(userData);
        expect(result).toBeDefined();
        expect(result.phone).toBeUndefined();
      });

      it('deve validar telefone se fornecido', async () => {
        const userData = {
          full_name: 'Citizen User',
          email: 'citizen3@gmail.com',
          password: 'CitizenSenh@123',
          role: 'citizen' as const,
          phone: '123'
        };

        await expect(AuthService.register(userData))
          .rejects.toThrow('Formato de telefone inválido');
      });
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      await AuthService.register({
        full_name: 'Test User',
        email: 'test@email.com',
        password: 'TestSenh@123',
        role: 'citizen'
      });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const credentials = {
        email: 'test@email.com',
        password: 'TestSenh@123'
      };

      const result = await AuthService.login(credentials);

      expect(result).toBeDefined();
      expect(result.email).toBe(credentials.email);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sentinela_current_user',
        expect.any(String)
      );
    });

    it('deve rejeitar email inexistente', async () => {
      const credentials = {
        email: 'inexistente@email.com',
        password: 'TestSenh@123'
      };

      await expect(AuthService.login(credentials))
        .rejects.toThrow('Email ou senha incorretos');
    });

    it('deve rejeitar senha incorreta', async () => {
      const credentials = {
        email: 'test@email.com',
        password: 'SenhaErrada@123'
      };

      await expect(AuthService.login(credentials))
        .rejects.toThrow('Email ou senha incorretos');
    });

    it('deve bloquear após muitas tentativas', async () => {
      const credentials = {
        email: 'test@email.com',
        password: 'SenhaErrada@123'
      };

      // Fazer 5 tentativas falhadas
      for (let i = 0; i < 5; i++) {
        try {
          await AuthService.login(credentials);
        } catch (error) {
          // Ignorar erros de senha incorreta
        }
      }

      // Sexta tentativa deve ser bloqueada
      await expect(AuthService.login(credentials))
        .rejects.toThrow('Muitas tentativas de login');
    });

    it('deve rejeitar conta não aprovada', async () => {
      // Criar administrador (não aprovado automaticamente)
      await AuthService.register({
        full_name: 'Admin User',
        email: 'admin@prefeitura.sp.gov.br',
        password: 'AdminSenh@123',
        role: 'admin',
        phone: '(11) 99999-9999'
      });

      const credentials = {
        email: 'admin@prefeitura.sp.gov.br',
        password: 'AdminSenh@123'
      };

      await expect(AuthService.login(credentials))
        .rejects.toThrow('Sua conta ainda não foi aprovada');
    });
  });

  describe('Logout', () => {
    it('deve remover usuário do localStorage', async () => {
      await AuthService.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sentinela_current_user');
    });
  });

  describe('Usuário Atual', () => {
    it('deve retornar null quando não há usuário logado', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const user = AuthService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('deve retornar usuário quando há dados válidos', () => {
      const userData = {
        id: 'test-id',
        email: 'test@email.com',
        role: 'citizen',
        full_name: 'Test User',
        is_approved: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData));
      const user = AuthService.getCurrentUser();
      expect(user).toEqual(userData);
    });

    it('deve retornar null quando dados são inválidos', () => {
      localStorageMock.getItem.mockReturnValue('dados-invalidos');
      const user = AuthService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('Sistema de Permissões', () => {
    const masterUser = {
      id: '1',
      email: 'master@system.com',
      role: 'master' as const,
      full_name: 'Master User',
      is_approved: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    const adminUser = {
      id: '2',
      email: 'admin@prefeitura.sp.gov.br',
      role: 'admin' as const,
      full_name: 'Admin User',
      is_approved: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    const agentUser = {
      id: '3',
      email: 'agent@policia.sp.gov.br',
      role: 'agent' as const,
      full_name: 'Agent User',
      is_approved: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    const citizenUser = {
      id: '4',
      email: 'citizen@email.com',
      role: 'citizen' as const,
      full_name: 'Citizen User',
      is_approved: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    describe('Permissões por Ação', () => {
      it('master deve ter todas as permissões', () => {
        expect(AuthService.canPerformAction(masterUser, 'manage_admins')).toBe(true);
        expect(AuthService.canPerformAction(masterUser, 'manage_agents')).toBe(true);
        expect(AuthService.canPerformAction(masterUser, 'manage_citizens')).toBe(true);
        expect(AuthService.canPerformAction(masterUser, 'approve_users')).toBe(true);
      });

      it('admin deve ter permissões administrativas', () => {
        expect(AuthService.canPerformAction(adminUser, 'manage_admins')).toBe(false);
        expect(AuthService.canPerformAction(adminUser, 'manage_agents')).toBe(true);
        expect(AuthService.canPerformAction(adminUser, 'manage_citizens')).toBe(true);
        expect(AuthService.canPerformAction(adminUser, 'approve_users')).toBe(true);
      });

      it('agent deve ter permissões operacionais', () => {
        expect(AuthService.canPerformAction(agentUser, 'manage_admins')).toBe(false);
        expect(AuthService.canPerformAction(agentUser, 'manage_agents')).toBe(false);
        expect(AuthService.canPerformAction(agentUser, 'manage_citizens')).toBe(true);
        expect(AuthService.canPerformAction(agentUser, 'manage_protective_measures')).toBe(true);
      });

      it('citizen deve ter permissões básicas', () => {
        expect(AuthService.canPerformAction(citizenUser, 'manage_admins')).toBe(false);
        expect(AuthService.canPerformAction(citizenUser, 'manage_agents')).toBe(false);
        expect(AuthService.canPerformAction(citizenUser, 'manage_citizens')).toBe(false);
        expect(AuthService.canPerformAction(citizenUser, 'create_protective_measure_request')).toBe(true);
        expect(AuthService.canPerformAction(citizenUser, 'view_own_data')).toBe(true);
      });
    });

    describe('Hierarquia de Papéis', () => {
      it('deve respeitar hierarquia de papéis', () => {
        expect(AuthService.canPerformActionByRole('master', 'admin')).toBe(true);
        expect(AuthService.canPerformActionByRole('admin', 'agent')).toBe(true);
        expect(AuthService.canPerformActionByRole('agent', 'citizen')).toBe(true);
        expect(AuthService.canPerformActionByRole('citizen', 'admin')).toBe(false);
      });
    });

    it('deve retornar false para usuário null', () => {
      expect(AuthService.canPerformAction(null, 'manage_admins')).toBe(false);
    });
  });

  describe('Login Social', () => {
    it('deve simular login com Google', async () => {
      const result = await AuthService.loginWithGoogle();

      expect(result).toBeDefined();
      expect(result.email).toContain('@gmail.com');
      expect(result.role).toBe('citizen');
      expect(result.is_approved).toBe(true);
    });

    it('deve simular login com Facebook', async () => {
      const result = await AuthService.loginWithFacebook();

      expect(result).toBeDefined();
      expect(result.email).toContain('@facebook.com');
      expect(result.role).toBe('citizen');
      expect(result.is_approved).toBe(true);
    });
  });

  describe('Refresh de Usuário', () => {
    it('deve retornar null quando não há usuário atual', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = await AuthService.refreshUser();
      expect(result).toBeNull();
    });

    it('deve fazer logout quando usuário não existe mais', async () => {
      const userData = {
        id: 'test-id',
        email: 'inexistente@email.com',
        role: 'citizen',
        full_name: 'Test User',
        is_approved: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData));
      const result = await AuthService.refreshUser();
      
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sentinela_current_user');
    });
  });

  describe('Modo Mock', () => {
    it('deve detectar modo mock', () => {
      expect(AuthService.isMockMode()).toBe(true);
    });
  });
});