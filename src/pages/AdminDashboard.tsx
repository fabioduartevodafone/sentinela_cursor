import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Shield, Users, FileCheck, AlertTriangle, Play, Volume2, User, MapPin, Clock } from "lucide-react"

interface PendingUser {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface PendingMeasure {
  id: string
  citizen_name: string
  protected_person_name: string
  restricted_person_name: string
  restriction_details: string
  created_at: string
}

interface PanicAlert {
  id: string
  citizen_name: string
  location: string
  latitude?: number
  longitude?: number
  audio_url?: string
  status: 'active' | 'in_progress' | 'resolved'
  created_at: string
  assigned_agent_id?: string
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [pendingMeasures, setPendingMeasures] = useState<PendingMeasure[]>([])
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load current user
    const user = JSON.parse(localStorage.getItem('current_user') || '{}')
    setCurrentUser(user)

    // Load pending users for approval (mock data)
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const pending = users.filter((u: any) => !u.is_approved && u.role !== 'citizen')
    setPendingUsers(pending)

    // Load pending protective measures (mock data)
    const measures = JSON.parse(localStorage.getItem('protective_measures') || '[]')
    const pendingMeasures = measures.filter((m: any) => !m.is_approved)
    setPendingMeasures(pendingMeasures)

    // Load panic alerts
    const alerts = JSON.parse(localStorage.getItem('panic_alerts') || '[]')
    setPanicAlerts(alerts)
  }, [])

  const approveUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, is_approved: true } : u
    )
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers))
    setPendingUsers(prev => prev.filter(u => u.id !== userId))
    
    toast({
      title: "Usuário aprovado!",
      description: "O usuário foi aprovado com sucesso.",
    })
  }

  const approveMeasure = (measureId: string) => {
    const measures = JSON.parse(localStorage.getItem('protective_measures') || '[]')
    const updatedMeasures = measures.map((m: any) => 
      m.id === measureId ? { 
        ...m, 
        is_approved: true, 
        approved_by: currentUser?.id,
        approved_at: new Date().toISOString() 
      } : m
    )
    localStorage.setItem('protective_measures', JSON.stringify(updatedMeasures))
    setPendingMeasures(prev => prev.filter(m => m.id !== measureId))
    
    toast({
      title: "Medida protetiva aprovada!",
      description: "A medida protetiva foi aprovada com sucesso.",
    })
  }

  const rejectUser = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const updatedUsers = users.filter((u: any) => u.id !== userId)
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers))
    setPendingUsers(prev => prev.filter(u => u.id !== userId))
    
    toast({
      title: "Usuário rejeitado",
      description: "O usuário foi removido do sistema.",
      variant: "destructive"
    })
  }

  const rejectMeasure = (measureId: string) => {
    const measures = JSON.parse(localStorage.getItem('protective_measures') || '[]')
    const updatedMeasures = measures.filter((m: any) => m.id !== measureId)
    localStorage.setItem('protective_measures', JSON.stringify(updatedMeasures))
    setPendingMeasures(prev => prev.filter(m => m.id !== measureId))
    
    toast({
      title: "Medida protetiva rejeitada",
      description: "A medida protetiva foi rejeitada.",
      variant: "destructive"
    })
  }

  const playAudio = (audioUrl: string) => {
    const alerts = JSON.parse(localStorage.getItem('panic_alerts') || '[]');
    const alert = alerts.find((a: any) => a.audio_url === audioUrl);
    
    if (alert?.audio_blob) {
      const audio = new Audio(alert.audio_url);
      audio.play().catch(console.error);
      toast({
        title: "Reproduzindo Áudio",
        description: "Áudio gravado durante o alerta de pânico.",
      });
    } else {
      toast({
        title: "Áudio Não Disponível",
        description: "O arquivo de áudio não está disponível.",
        variant: "destructive",
      });
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive" className="animate-pulse">🚨 Ativo</Badge>
      case 'in_progress':
        return <Badge variant="default">🔄 Em Andamento</Badge>
      case 'resolved':
        return <Badge variant="secondary">✅ Resolvido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo, {currentUser?.full_name || 'Administrador'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Pendentes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingUsers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medidas Pendentes</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingMeasures.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovações Hoje</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas de Pânico</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{panicAlerts.filter(a => a.status === 'active').length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panic Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Pânico</CardTitle>
              <CardDescription>
                Todos os alertas de pânico registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {panicAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum alerta registrado
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {panicAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3" />
                            <h5 className="text-sm font-medium">{alert.citizen_name}</h5>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <MapPin className="h-2 w-2" />
                            {alert.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-2 w-2" />
                            {new Date(alert.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        {getStatusBadge(alert.status)}
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        {alert.audio_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAudio(alert.audio_url!)}
                            className="text-xs h-7"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Áudio
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAlert(alert)}
                          className="text-xs h-7"
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Users */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Pendentes de Aprovação</CardTitle>
              <CardDescription>
                Agentes e administradores aguardando aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum usuário pendente
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {user.role === 'agent' ? 'Agente' : 'Administrador'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveUser(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectUser(user.id)}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Protective Measures */}
          <Card>
            <CardHeader>
              <CardTitle>Medidas Protetivas Pendentes</CardTitle>
              <CardDescription>
                Solicitações de medidas protetivas para aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingMeasures.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma medida pendente
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingMeasures.map((measure) => (
                    <div key={measure.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          Proteção: {measure.protected_person_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contra: {measure.restricted_person_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {measure.restriction_details.length > 50 
                            ? measure.restriction_details.substring(0, 50) + '...'
                            : measure.restriction_details
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => approveMeasure(measure.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rejectMeasure(measure.id)}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para Relatório de Alerta de Pânico */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Relatório do Alerta de Pânico</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cidadão:</label>
                  <p>{selectedAlert.citizen_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Localização:</label>
                  <p>{selectedAlert.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data/Hora:</label>
                  <p>{new Date(selectedAlert.created_at).toLocaleString('pt-BR')}</p>
                </div>
                {selectedAlert.assigned_agent_id && (
                  <div>
                    <label className="text-sm font-medium">Agente Responsável:</label>
                    <p>ID: {selectedAlert.assigned_agent_id}</p>
                  </div>
                )}
              </div>
              
              {selectedAlert.audio_url && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Áudio Gravado:</label>
                  <div className="flex gap-2 items-center">
                    <Button onClick={() => playAudio(selectedAlert.audio_url!)}>
                      <Play className="h-4 w-4 mr-2" />
                      Reproduzir Áudio
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Áudio ambiente gravado durante o alerta
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}