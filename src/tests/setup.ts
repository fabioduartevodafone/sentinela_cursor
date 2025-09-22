import { vi, beforeEach } from 'vitest'

// =============================================================================
// MOCKS GLOBAIS CENTRALIZADOS
// =============================================================================

// Mock das variáveis de ambiente para garantir modo mock nos testes
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'placeholder-key',
        MODE: 'test',
      }
    }
  },
  writable: true,
})

// Mock do localStorage com métodos completos
export const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock do sessionStorage
export const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// Mock do crypto com UUID consistente para testes
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123456789',
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    subtle: {
      digest: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    }
  },
  writable: true,
})

// Mock do fetch global
global.fetch = vi.fn()

// Mock do console para capturar logs em testes
export const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

// Mock de APIs do navegador
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
})

// Mock do navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
    language: 'pt-BR',
    languages: ['pt-BR', 'en-US'],
    onLine: true,
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  },
  writable: true,
})

// =============================================================================
// CONFIGURAÇÃO GLOBAL DE TESTES
// =============================================================================

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks()
  
  // Reset localStorage mock
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.length = 0
  
  // Reset sessionStorage mock
  sessionStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.length = 0
  
  // Reset fetch mock
  global.fetch = vi.fn()
  
  // Reset console mocks
  Object.values(consoleMock).forEach(mock => mock.mockClear())
})