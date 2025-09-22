import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, AuthUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Se ainda estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona baseado no contexto
  if (!user) {
    // Se redirectTo foi especificado, usa ele
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Se a rota é exclusiva para cidadãos, redireciona para login de cidadão
    if (allowedRoles.length === 1 && allowedRoles[0] === 'citizen') {
      return <Navigate to="/login-citizen" replace />;
    }
    
    // Se a rota é exclusiva para admin/master, redireciona para login admin
    if (allowedRoles.every(role => ['admin', 'master'].includes(role))) {
      return <Navigate to="/login-admin" replace />;
    }
    
    // Para rotas mistas ou outras situações, usa a seleção de login
    return <Navigate to="/login-selection" replace />;
  }

  // Para o modo mock, user já contém role e is_approved
  // Para o modo real, profile contém essas informações
  const userToCheck = profile || user;

  // Se não tiver dados do usuário ou não for do tipo AuthUser, redireciona
  if (!userToCheck || !('role' in userToCheck) || !('is_approved' in userToCheck)) {
    // Usa a mesma lógica de redirecionamento inteligente
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    if (allowedRoles.length === 1 && allowedRoles[0] === 'citizen') {
      return <Navigate to="/login-citizen" replace />;
    }
    
    if (allowedRoles.every(role => ['admin', 'master'].includes(role))) {
      return <Navigate to="/login-admin" replace />;
    }
    
    return <Navigate to="/login-selection" replace />;
  }

  // Type assertion para garantir que userToCheck é AuthUser
  const authUser = userToCheck as AuthUser;

  // Verificar se a conta está aprovada
  if (!authUser.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conta Pendente de Aprovação</h3>
          <p className="text-gray-600 mb-4">Sua conta ainda não foi aprovada pelos administradores.</p>
        </div>
      </div>
    );
  }

  // Se o usuário não tiver o papel necessário, redireciona para o dashboard apropriado
  if (!allowedRoles.includes(authUser.role)) {
    if (authUser.role === 'citizen') {
      return <Navigate to="/citizen-dashboard" replace />;
    } else if (authUser.role === 'agent') {
      return <Navigate to="/agent-dashboard" replace />;
    } else if (authUser.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (authUser.role === 'master') {
      return <Navigate to="/user-approval" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Se estiver autenticado e tiver o papel necessário, renderiza o conteúdo
  return <>{children}</>;
}