import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { UserPlus } from "lucide-react"
import { AuthService, UserRole } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "citizen" as UserRole
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      if (AuthService.isMockMode()) {
        // Use new AuthService for mock registration
        await AuthService.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role
        })

        toast({
          title: "Conta criada com sucesso!",
          description: formData.role === 'citizen' 
            ? "Você já pode fazer login e usar o sistema."
            : formData.role === 'agent'
              ? "Sua conta será analisada por um administrador ou conta master antes da aprovação."
              : "Sua conta será analisada pela conta master antes da aprovação.",
        })

        navigate(formData.role === 'citizen' ? '/login-citizen' : '/login-admin')
        return
      }

      // Real Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role,
            is_approved: formData.role === 'citizen' // Citizens are auto-approved
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        toast({
          title: "Conta criada com sucesso!",
          description: formData.role === 'citizen' 
            ? "Você já pode fazer login e usar o sistema."
            : "Sua conta será analisada por um administrador antes da aprovação.",
        })

        navigate(formData.role === 'citizen' ? '/login-citizen' : '/login-admin')
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
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
          <CardDescription>
            Cadastre-se no Sistema Sentinela
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                placeholder="João da Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="joao@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Conta</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Cidadão</SelectItem>
                  <SelectItem value="agent">Agente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {formData.role !== 'citizen' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    ⚠️ Aprovação Necessária
                  </p>
                  <p className="text-xs text-blue-700">
                    {formData.role === 'agent' 
                      ? "Contas de agente precisam ser aprovadas por um administrador ou conta master antes de ter acesso completo ao sistema."
                      : "Contas de administrador precisam ser aprovadas pela conta master antes de ter acesso completo ao sistema."
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                placeholder="Digite a senha novamente"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                type="button"
                onClick={() => navigate('/login-citizen')}
                className="text-sm"
              >
                Já tem conta? Faça login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}