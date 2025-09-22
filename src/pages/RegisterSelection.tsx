import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, UserCheck, ArrowLeft, Crown, Badge } from "lucide-react";

/**
 * RegisterSelection - Página para seleção do tipo de conta administrativa
 */
const RegisterSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="mx-auto mb-6 w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cadastro Administrativo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione o tipo de conta que deseja criar. Cada tipo possui 
            permissões e responsabilidades específicas no sistema.
          </p>
        </div>

        {/* Account Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Administrator Account */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-amber-200 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-amber-700 mb-2">
                Administrador
              </CardTitle>
              <CardDescription className="text-base text-gray-700">
                Acesso completo ao sistema com privilégios totais 
                para gestão e configuração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Privilégios Totais
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Gerenciar todos os usuários e permissões</li>
                  <li>• Configurar sistema e parâmetros globais</li>
                  <li>• Acessar todos os relatórios e dados</li>
                  <li>• Coordenar operações de emergência</li>
                  <li>• Aprovar contas de agentes</li>
                  <li>• Definir políticas de segurança</li>
                </ul>
              </div>
              
              <div className="bg-amber-100/50 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">
                  ⚠️ Contas de administrador requerem aprovação manual
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 shadow-lg"
                onClick={() => navigate("/register?type=admin")}
              >
                <Crown className="mr-2 h-5 w-5" />
                Criar Conta de Administrador
              </Button>
            </CardContent>
          </Card>

          {/* Agent Account */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Badge className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-blue-700 mb-2">
                Agente
              </CardTitle>
              <CardDescription className="text-base text-gray-700">
                Acesso operacional com permissões específicas 
                para execução de tarefas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Permissões Específicas
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Gerenciar ocorrências e incidentes</li>
                  <li>• Responder a alertas de emergência</li>
                  <li>• Acessar relatórios operacionais</li>
                  <li>• Coordenar com outros agentes</li>
                  <li>• Atualizar status de operações</li>
                  <li>• Comunicar com cidadãos</li>
                </ul>
              </div>
              
              <div className="bg-blue-100/50 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium">
                  ⚠️ Contas de agente requerem aprovação por administrador ou master
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg"
                onClick={() => navigate("/register?type=agent")}
              >
                <Badge className="mr-2 h-5 w-5" />
                Criar Conta de Agente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Shield className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                <h4 className="font-semibold text-gray-800 mb-1">Segurança</h4>
                <p className="text-sm text-gray-600">
                  Todas as contas são protegidas com criptografia avançada
                </p>
              </div>
              <div>
                <UserCheck className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                <h4 className="font-semibold text-gray-800 mb-1">Aprovação</h4>
                <p className="text-sm text-gray-600">
                  Processo de verificação para garantir legitimidade
                </p>
              </div>
              <div>
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                <h4 className="font-semibold text-gray-800 mb-1">Suporte</h4>
                <p className="text-sm text-gray-600">
                  Equipe disponível para auxiliar no processo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            Já possui uma conta administrativa?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => navigate("/login-admin")}
            >
              Fazer login
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterSelection;