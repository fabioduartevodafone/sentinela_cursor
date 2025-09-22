import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleGoBack = () => {
    // Redirecionar para o dashboard apropriado baseado no papel do usuário
    if (profile?.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (profile?.role === 'agent') {
      navigate('/agent-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="mt-2 text-lg font-medium text-gray-900">Acesso Negado</h3>
          
          <p className="mt-1 text-sm text-gray-500">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar ao Dashboard
            </button>
            
            <button
              onClick={() => navigate('/login-selection')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Fazer Logout
            </button>
          </div>
          
          {profile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                Usuário atual: <span className="font-medium">{profile.full_name}</span>
              </p>
              <p className="text-xs text-gray-600">
                Papel: <span className="font-medium capitalize">{profile.role}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;