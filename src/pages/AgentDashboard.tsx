import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Shield, AlertTriangle, FileText, Play, Volume2, Clock, MapPin, User, LogOut, Car } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import VehicleManagement from "@/components/vehicles/VehicleManagement"

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

interface Incident {
  id: string
  type: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved'
  created_at: string
  reporter_name?: string
  photos?: string[]
  videos?: string[]
}

export default function AgentDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!user || !profile || (profile.role !== 'agent' && profile.role !== 'admin')) {
      navigate('/login-admin')
      return
    }

    // Load current user and mock data
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}')
    setCurrentUser(userData)
    loadMockData()
  }, [user, profile, navigate])

  const loadMockData = () => {
    // Mock panic alerts
    const mockAlerts: PanicAlert[] = [
      {
        id: '1',
        citizen_name: 'Maria Silva',
        location: 'Rua das Flores, 123, Centro',
        latitude: -15.7942,
        longitude: -47.8822,
        audio_url: 'mock-audio-1.wav',
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        citizen_name: 'Ana Costa',
        location: 'Av. Principal, 456, Bairro Norte',
        latitude: -15.7850,
        longitude: -47.8900,
        audio_url: 'mock-audio-2.wav',
        status: 'in_progress',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        assigned_agent_id: currentUser?.id,
      },
    ]

    // Mock incidents
    const mockIncidents: Incident[] = [
      {
        id: '1',
        type: 'Acidente de Trânsito',
        description: 'Colisão entre dois veículos na esquina da Rua A com Rua B',
        location: 'Esquina Rua A com Rua B',
        priority: 'high',
        status: 'pending',
        created_at: new Date().toISOString(),
        reporter_name: 'João Santos',
        photos: ['photo1.jpg', 'photo2.jpg'],
      },
      {
        id: '2',
        type: 'Risco de Desabamento',
        description: 'Prédio antigo com rachaduras visíveis na fachada',
        location: 'Rua Central, 789',
        priority: 'emergency',
        status: 'assigned',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reporter_name: 'Anônimo',
      },
    ]

    setPanicAlerts(mockAlerts)
    setIncidents(mockIncidents)
  }

  const handleAssignAlert = (alertId: string) => {
    setPanicAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'in_progress', assigned_agent_id: currentUser?.id }
          : alert
      )
    )
    toast({
      title: "Alerta Atribuído",
      description: "Você foi designado para este alerta de pânico.",
    })
  }

  const handleResolveAlert = (alertId: string) => {
    setPanicAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' }
          : alert
      )
    )
    toast({
      title: "Alerta Resolvido",
      description: "O alerta de pânico foi marcado como resolvido.",
    })
  }

  const handleAssignIncident = (incidentId: string) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: 'assigned' }
          : incident
      )
    )
    toast({
      title: "Ocorrência Atribuída",
      description: "Você foi designado para esta ocorrência.",
    })
  }

  const playAudio = (audioUrl: string) => {
    // In a real implementation, this would play the actual audio file
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
      case 'pending':
        return <Badge variant="outline">⏳ Pendente</Badge>
      case 'assigned':
        return <Badge variant="default">👤 Atribuído</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge variant="destructive">🚨 Emergência</Badge>
      case 'high':
        return <Badge variant="destructive">🔴 Alta</Badge>
      case 'medium':
        return <Badge variant="default">🟡 Média</Badge>
      case 'low':
        return <Badge variant="secondary">🟢 Baixa</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login-admin')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard do Agente</h1>
            <p className="text-muted-foreground">Bem-vindo(a), {profile?.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {panicAlerts.filter(a => a.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {panicAlerts.filter(a => a.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocorrências Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {incidents.filter(i => i.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
              <Shield className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {panicAlerts.filter(a => a.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas de Pânico */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Pânico</CardTitle>
              <CardDescription>
                Alertas ativos e em andamento que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              {panicAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum alerta ativo
                </p>
              ) : (
                <div className="space-y-4">
                  {panicAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <h4 className="font-medium">{alert.citizen_name}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        {getStatusBadge(alert.status)}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        {alert.audio_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playAudio(alert.audio_url!)}
                          >
                            <Volume2 className="h-4 w-4 mr-1" />
                            Áudio
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Relatório
                        </Button>
                        
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignAlert(alert.id)}
                          >
                            Assumir
                          </Button>
                        )}
                        
                        {alert.status === 'in_progress' && alert.assigned_agent_id === currentUser?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outras Ocorrências */}
          <Card>
            <CardHeader>
              <CardTitle>Outras Ocorrências</CardTitle>
              <CardDescription>
                Acidentes, riscos e outros tipos de ocorrências reportadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma ocorrência pendente
                </p>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{incident.type}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3" />
                            {incident.location}
                          </div>
                          <p className="text-sm mb-2">{incident.description}</p>
                          <div className="flex gap-2 mb-2">
                            {getPriorityBadge(incident.priority)}
                            {getStatusBadge(incident.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Reportado por: {incident.reporter_name || 'Anônimo'} em{' '}
                            {new Date(incident.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        
                        {incident.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignIncident(incident.id)}
                          >
                            Assumir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Management */}
        <VehicleManagement currentUser={currentUser} />
      </main>

      {/* Dialog para Relatório de Alerta */}
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
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Ações Disponíveis:</h4>
                <div className="flex gap-2">
                  {selectedAlert.status === 'active' && (
                    <Button onClick={() => {
                      handleAssignAlert(selectedAlert.id)
                      setSelectedAlert(null)
                    }}>
                      Assumir Alerta
                    </Button>
                  )}
                  {selectedAlert.status === 'in_progress' && selectedAlert.assigned_agent_id === currentUser?.id && (
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleResolveAlert(selectedAlert.id)
                        setSelectedAlert(null)
                      }}
                    >
                      Marcar como Resolvido
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para Detalhes da Ocorrência */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo:</label>
                  <p>{selectedIncident.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade:</label>
                  <div className="mt-1">{getPriorityBadge(selectedIncident.priority)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Localização:</label>
                  <p>{selectedIncident.location}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Descrição:</label>
                  <p>{selectedIncident.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Reportado por:</label>
                  <p>{selectedIncident.reporter_name || 'Anônimo'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data/Hora:</label>
                  <p>{new Date(selectedIncident.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              {selectedIncident.photos && selectedIncident.photos.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Fotos Anexadas:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedIncident.photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-muted rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs">{photo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedIncident.videos && selectedIncident.videos.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Vídeos Anexados:</label>
                  <div className="space-y-2">
                    {selectedIncident.videos.map((video, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <span className="text-sm">{video}</span>
                      </div>
                    ))}
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