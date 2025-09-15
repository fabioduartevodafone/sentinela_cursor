import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Shield, User } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  userType: 'citizen' | 'agent_admin'
}

export default function LoginForm({ userType }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (AuthService.isMockMode()) {
        // Use new AuthService for mock login
        const user = await AuthService.login({ email, password })

        // Verify user type authorization
        if (userType === 'citizen' && user.role !== 'citizen') {
          await AuthService.logout()
          throw new Error('Acesso negado. Esta tela é apenas para cidadãos.')
        }

        if (userType === 'agent_admin' && user.role === 'citizen') {
          await AuthService.logout()
          throw new Error('Acesso negado. Esta tela é para agentes e administradores.')
        }

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${user.full_name}`,
        })

        // Navigate based on user role
        if (user.role === 'citizen') {
          navigate('/citizen-dashboard')
        } else if (user.role === 'agent') {
          navigate('/agent-dashboard')
        } else {
          navigate('/admin-dashboard')
        }
        return
      }

      // Real Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Verify user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        throw new Error('Perfil não encontrado')
      }

      // Verify user type authorization
      if (userType === 'citizen' && profile.role !== 'citizen') {
        await supabase.auth.signOut()
        throw new Error('Acesso negado. Esta tela é apenas para cidadãos.')
      }

      if (userType === 'agent_admin' && profile.role === 'citizen') {
        await supabase.auth.signOut()
        throw new Error('Acesso negado. Esta tela é para agentes e administradores.')
      }

      if (!profile.is_approved) {
        await supabase.auth.signOut()
        throw new Error('Sua conta ainda não foi aprovada por um administrador.')
      }

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${profile.full_name}`,
      })

      // Navigate based on user role
      if (profile.role === 'citizen') {
        navigate('/citizen-dashboard')
      } else if (profile.role === 'agent') {
        navigate('/agent-dashboard')
      } else {
        navigate('/admin-dashboard')
      }

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            {userType === 'citizen' ? (
              <User className="h-8 w-8 text-white" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {userType === 'citizen' ? 'Portal do Cidadão' : 'Portal Administrativo'}
          </CardTitle>
          <CardDescription>
            {userType === 'citizen' 
              ? 'Acesse sua conta para fazer denúncias e gerenciar medidas protetivas'
              : 'Acesso restrito para agentes e administradores'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center space-y-2">
              <Button 
                variant="link" 
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm"
              >
                Não tem conta? Cadastre-se aqui
              </Button>
              <Button 
                variant="link" 
                type="button"
                onClick={() => navigate(userType === 'citizen' ? '/login-admin' : '/login-citizen')}
                className="text-sm"
              >
                {userType === 'citizen' 
                  ? 'Acesso para agentes/administradores' 
                  : 'Acesso para cidadãos'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}