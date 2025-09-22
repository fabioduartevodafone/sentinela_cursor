import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserPlus } from "lucide-react";
// Using require to handle image import
const sentinelaLogo = require('@/assets/sentinela-logo.png').default;

/**
 * LoginSelection - Página inicial para seleção do tipo de login
 */
const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <img 
              src={sentinelaLogo} 
              alt="Sentinela Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback se a imagem não carregar
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Shield className="w-12 h-12 text-white hidden" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema Sentinela
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma integrada de segurança pública para monitoramento, 
            alertas e coordenação de emergências
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Citizen Login */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-700">
                Acesso Cidadão
              </CardTitle>
              <CardDescription className="text-base">
                Para cidadãos que desejam reportar incidentes, 
                receber alertas e acompanhar a segurança local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Reportar acidentes e incidentes</li>
                <li>• Receber alertas de segurança</li>
                <li>• Acompanhar medidas preventivas</li>
                <li>• Visualizar mapa de ocorrências</li>
              </ul>
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/login-citizen")}
                >
                  Fazer Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/register")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Conta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200 hover:border-red-400">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">
                Acesso Administrativo
              </CardTitle>
              <CardDescription className="text-base">
                Para administradores, agentes e autoridades 
                responsáveis pela gestão do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Gerenciar usuários e permissões</li>
                <li>• Coordenar operações de emergência</li>
                <li>• Analisar dados e relatórios</li>
                <li>• Configurar alertas e medidas</li>
              </ul>
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => navigate("/login-admin")}
                >
                  Fazer Login
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => navigate("/register-selection")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Solicitar Acesso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Sistema desenvolvido para segurança pública e coordenação de emergências
          </p>
          <p className="mt-2">
            Em caso de emergência, ligue{" "}
            <span className="font-semibold text-red-600">190</span> (Polícia) ou{" "}
            <span className="font-semibold text-red-600">193</span> (Bombeiros)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;