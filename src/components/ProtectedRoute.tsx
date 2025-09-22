import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission, Permission } from '../lib/permissions';
import { UserRole } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  requiredPermission,
  fallbackPath = '/login-selection'
}) => {
  const { user, profile, signOut } = useAuth();

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Determinar qual objeto usar para verificação de aprovação
  // No modo mock, user já contém is_approved e role
  // No modo real, profile contém is_approved e role
  const userToCheck = profile || user;

  // Se a conta não estiver aprovada, mostrar mensagem
  if (userToCheck && 'is_approved' in userToCheck && !userToCheck.is_approved) {
    const handleSignOut = async () => {
      await signOut();
      window.location.href = '/login-selection';
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Conta Pendente de Aprovação</h3>
            <p className="mt-1 text-sm text-gray-500">
              Sua conta está sendo analisada por nossa equipe. Você receberá um email quando for aprovada.
            </p>
            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar papel específico se requerido
  if (requiredRole && profile && profile.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar se o papel está na lista de papéis permitidos
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar permissão específica se requerida
  if (requiredPermission && profile && !hasPermission(profile.role, requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};