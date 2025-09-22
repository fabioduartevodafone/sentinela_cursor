import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Shield } from "lucide-react"
import { MockDatabase, DatabaseUser } from "@/lib/database"
import { useAuth } from "@/hooks/useAuth";

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState<DatabaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    try {
      setLoading(true)
      const users = await MockDatabase.getPendingUsers()
      setPendingUsers(users)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar usuários pendentes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    if (!user) return

    try {
      setProcessingUser(userId)
      
      await MockDatabase.updateUserApprovalStatus(userId, status, user.id)
      
      toast({
        title: status === 'approved' ? "Usuário Aprovado" : "Usuário Rejeitado",
        description: `O usuário foi ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`,
        variant: status === 'approved' ? "default" : "destructive"
      })

      // Recarregar lista
      await loadPendingUsers()
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${status === 'approved' ? 'aprovar' : 'rejeitar'} usuário`,
        variant: "destructive"
      })
    } finally {
      setProcessingUser(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'agent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'citizen': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'agent': return 'Agente'
      case 'citizen': return 'Cidadão'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Carregando usuários pendentes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Aprovação de Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie solicitações de criação de contas de agentes e administradores
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma aprovação pendente</h3>
            <p className="text-muted-foreground text-center">
              Todas as solicitações de criação de conta foram processadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((pendingUser) => (
            <Card key={pendingUser.id} className="border-l-4 border-l-yellow-400">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pendingUser.full_name}</CardTitle>
                      <CardDescription>
                        Solicitação criada em {new Date(pendingUser.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(pendingUser.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(pendingUser.role)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pendingUser.email}</span>
                  </div>
                  {pendingUser.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{pendingUser.phone}</span>
                    </div>
                  )}
                </div>

                {pendingUser.role !== 'citizen' && (
                  <Alert className="mb-4">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      {pendingUser.role === 'admin' 
                        ? "Esta solicitação é para uma conta de administrador. Verifique cuidadosamente antes de aprovar."
                        : "Esta solicitação é para uma conta de agente. Confirme se o solicitante tem autorização para este tipo de acesso."
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleApproval(pendingUser.id, 'approved')}
                    disabled={processingUser === pendingUser.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingUser === pendingUser.id ? 'Processando...' : 'Aprovar'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(pendingUser.id, 'rejected')}
                    disabled={processingUser === pendingUser.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {processingUser === pendingUser.id ? 'Processando...' : 'Rejeitar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}