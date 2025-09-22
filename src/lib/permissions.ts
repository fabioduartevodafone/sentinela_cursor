import { UserRole } from './auth';

// Sistema de permissões granulares
export const PERMISSIONS = {
  // Permissões de usuários
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_APPROVE: 'user:approve',
  
  // Permissões de sistema
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  
  // Permissões de operações
  OPERATION_CREATE: 'operation:create',
  OPERATION_MANAGE: 'operation:manage',
  OPERATION_COORDINATE: 'operation:coordinate',
  
  // Permissões de relatórios
  REPORT_VIEW_ALL: 'report:view_all',
  REPORT_VIEW_OWN: 'report:view_own',
  REPORT_EXPORT: 'report:export',
  
  // Permissões de alertas
  ALERT_CREATE: 'alert:create',
  ALERT_BROADCAST: 'alert:broadcast',
  ALERT_MANAGE: 'alert:manage',
  
  // Permissões de dados
  DATA_EXPORT: 'data:export',
  DATA_IMPORT: 'data:import',
  DATA_DELETE: 'data:delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Mapeamento de permissões por papel
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  master: [
    // Master tem todas as permissões
    ...Object.values(PERMISSIONS)
  ],
  admin: [
    // Administradores têm permissões amplas, exceto algumas críticas de master
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.OPERATION_CREATE,
    PERMISSIONS.OPERATION_MANAGE,
    PERMISSIONS.OPERATION_COORDINATE,
    PERMISSIONS.REPORT_VIEW_ALL,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.ALERT_CREATE,
    PERMISSIONS.ALERT_BROADCAST,
    PERMISSIONS.ALERT_MANAGE,
    PERMISSIONS.DATA_EXPORT,
    PERMISSIONS.DATA_IMPORT,
  ],
  agent: [
    // Agentes têm permissões operacionais específicas
    PERMISSIONS.USER_READ,
    PERMISSIONS.OPERATION_CREATE,
    PERMISSIONS.OPERATION_MANAGE,
    PERMISSIONS.REPORT_VIEW_OWN,
    PERMISSIONS.REPORT_VIEW_ALL, // Agentes podem ver relatórios para coordenação
    PERMISSIONS.ALERT_CREATE,
  ],
  citizen: [
    // Cidadãos têm permissões básicas limitadas
    PERMISSIONS.REPORT_VIEW_OWN,
  ]
};

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Função para verificar múltiplas permissões (OR - pelo menos uma)
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Função para verificar se tem todas as permissões (AND - todas necessárias)
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Função para obter todas as permissões de um papel
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

// Função para verificar hierarquia de papéis (compatibilidade com sistema antigo)
export function canPerformAction(userRole: UserRole, requiredLevel: 'master' | 'admin' | 'agent' | 'citizen'): boolean {
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

// Hook personalizado para verificar permissões em componentes React
export function usePermissions(userRole: UserRole) {
  return {
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    canPerformAction: (requiredLevel: 'master' | 'admin' | 'agent' | 'citizen') => 
      canPerformAction(userRole, requiredLevel),
    permissions: getRolePermissions(userRole)
  };
}