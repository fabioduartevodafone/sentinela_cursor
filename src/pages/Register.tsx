import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { SecurityService } from "@/lib/security";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";

/**
 * Register - Página de cadastro para usuários cidadãos, administradores e agentes
 */
const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'citizen'; // 'citizen', 'admin' ou 'agent'
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de email
    if (!SecurityService.validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido (exemplo: usuario@dominio.com)",
        variant: "destructive"
      });
      return;
    }

    // Validação de senha
    const passwordValidation = SecurityService.validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais. Verifique e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Termos de uso",
        description: "Você deve aceitar os termos de uso para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let role: 'citizen' | 'agent' | 'admin';
      
      // Define o papel baseado no tipo de usuário
      if (userType === 'admin') {
        role = 'admin';
      } else if (userType === 'agent') {
        role = 'agent';
      } else {
        role = 'citizen';
      }
      
      await AuthService.register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role
      });
      
      await refreshProfile();
      
      if (userType === 'admin') {
        toast({
          title: "Solicitação enviada!",
          description: "Sua solicitação de acesso administrativo foi enviada. Aguarde aprovação.",
        });
        navigate("/");
      } else if (userType === 'agent') {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta de agente foi criada. Você já pode fazer login.",
        });
        navigate("/login-admin");
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao Sentinela. Você já pode fazer login.",
        });
        navigate("/login-citizen");
      }
    } catch (error: any) {
      let errorMessage = "Não foi possível criar sua conta. Tente novamente.";
      
      // Mensagens específicas de erro
      if (error.message?.includes('email já está cadastrado') || error.message?.includes('email já está em uso')) {
        errorMessage = "Este email já está cadastrado no sistema. Tente fazer login ou use outro email.";
      } else if (error.message?.includes('Email inválido')) {
        errorMessage = "Formato de email inválido. Use o formato: usuario@dominio.com";
      } else if (error.message?.includes('Senha inválida')) {
        errorMessage = error.message;
      } else if (error.message?.includes('email institucional')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Nome')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Telefone')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
              userType === 'admin' ? 'bg-amber-100' : 
              userType === 'agent' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <UserPlus className={`h-6 w-6 ${
                userType === 'admin' ? 'text-amber-600' : 
                userType === 'agent' ? 'text-blue-600' : 'text-green-600'
              }`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${
              userType === 'admin' ? 'text-amber-700' : 
              userType === 'agent' ? 'text-blue-700' : 'text-green-700'
            }`}>
              {userType === 'admin' ? 'Solicitação de Acesso Administrativo' : 
               userType === 'agent' ? 'Cadastro de Agente' : 'Cadastro Cidadão'}
            </CardTitle>
            <CardDescription>
              {userType === 'admin' 
                ? 'Solicite acesso administrativo ao sistema. Sua solicitação será analisada.'
                : userType === 'agent'
                ? 'Crie sua conta de agente para gerenciar ocorrências e operações.'
                : 'Crie sua conta para reportar incidentes e receber alertas'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="border-green-200 focus:border-green-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  A senha deve conter:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pelo menos 8 caracteres</li>
                    <li>Uma letra maiúscula</li>
                    <li>Uma letra minúscula</li>
                    <li>Um número</li>
                    <li>Um símbolo especial (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="border-green-200 focus:border-green-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))}
                />
                <Label htmlFor="terms" className="text-sm">
                  Aceito os{" "}
                  <Link to="/terms" className="text-green-600 hover:underline">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="text-green-600 hover:underline">
                    política de privacidade
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  to="/login-citizen"
                  className="font-medium text-green-600 hover:underline"
                >
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;