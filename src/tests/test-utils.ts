import { vi } from 'vitest'
import { localStorageMock, sessionStorageMock } from './setup'

// =============================================================================
// UTILITÁRIOS DE TESTE PADRONIZADOS
// =============================================================================

/**
 * Factory para criar dados de usuário de teste
 */
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Usuário Teste',
  role: 'citizen' as const,
  is_approved: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

/**
 * Factory para criar dados de registro de teste
 */
export const createMockRegistrationData = (overrides: Partial<any> = {}) => ({
  full_name: 'João Silva',
  email: 'joao@email.com',
  password: 'MinhaSenh@123',
  role: 'citizen' as const,
  phone: '(11) 99999-9999',
  ...overrides,
})

/**
 * Simula usuário logado no localStorage
 */
export const mockLoggedUser = (userData: any = createMockUser()) => {
  localStorageMock.getItem.mockImplementation((key: string) => {
    if (key === 'sentinela_current_user') {
      return JSON.stringify(userData)
    }
    return null
  })
}

/**
 * Simula localStorage vazio (usuário não logado)
 */
export const mockEmptyStorage = () => {
  localStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.getItem.mockReturnValue(null)
}

/**
 * Mock para fetch com resposta customizada
 */
export const mockFetchResponse = (data: any, status = 200, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  })
}

/**
 * Mock para fetch com erro
 */
export const mockFetchError = (error: string = 'Network Error') => {
  global.fetch = vi.fn().mockRejectedValue(new Error(error))
}

/**
 * Utilitário para aguardar próximo tick do event loop
 */
export const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Utilitário para aguardar tempo específico em testes
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Mock para geolocalização
 */
export const mockGeolocation = (coords: { latitude: number; longitude: number }) => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  }

  Object.defineProperty(window.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  })

  return mockGeolocation
}

/**
 * Mock para console com captura de logs
 */
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  const consoleMock = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }

  Object.assign(console, consoleMock)

  return {
    consoleMock,
    restore: () => Object.assign(console, originalConsole),
  }
}

/**
 * Limpa todos os mocks e redefine estados
 */
export const resetAllMocks = () => {
  vi.clearAllMocks()
  mockEmptyStorage()
  global.fetch = vi.fn()
}