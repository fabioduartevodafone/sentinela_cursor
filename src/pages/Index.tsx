import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Index component - Redireciona o usuário para o dashboard apropriado com base no seu papel (role)
 */
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Redireciona com base no papel do usuário
    switch (user.role) {
      case 'citizen':
        navigate('/citizen-dashboard');
        break;
      case 'agent':
        navigate('/agent-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'master':
        navigate('/user-approval');
        break;
      default:
        navigate('/');
        break;
    }
  }, [user, navigate]);

  // Componente de carregamento enquanto o redirecionamento ocorre
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Redirecionando para o dashboard...</p>
      </div>
    </div>
  );
};

export default Index;