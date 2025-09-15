import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { supabase, ProtectiveMeasure, Incident } from "@/lib/supabase"
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, LogOut, FileText, Plus, Map } from "lucide-react"
import PanicButton from "@/components/emergency/PanicButton"
import InteractiveMap from "@/components/map/InteractiveMap"

export default function CitizenDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [protectiveMeasures, setProtectiveMeasures] = useState<ProtectiveMeasure[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !profile) {
      navigate('/login-citizen')
      return
    }

    if (profile.role !== 'citizen') {
      navigate('/login-citizen')
      return
    }

    fetchData()
  }, [user, profile, navigate])

  const fetchData = async () => {
    if (!user) return

    try {
      // Check if using mock system
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
      
      if (supabaseUrl.includes('placeholder')) {
        // Mock system - get data from localStorage or use empty arrays
        const mockMeasures = localStorage.getItem(`protective_measures_${user.id}`)
        const mockIncidents = localStorage.getItem(`incidents_${user.id}`)
        
        setProtectiveMeasures(mockMeasures ? JSON.parse(mockMeasures) : [])
        setIncidents(mockIncidents ? JSON.parse(mockIncidents) : [])
        setLoading(false)
        return
      }

      // Real Supabase system
      // Buscar medidas protetivas do usuário
      const { data: measures } = await supabase
        .from('protective_measures')
        .select('*')
        .eq('citizen_id', user.id)
        .order('created_at', { ascending: false })

      // Buscar incidentes do usuário (não anônimos)
      const { data: userIncidents } = await supabase
        .from('incidents')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      setProtectiveMeasures(measures || [])
      setIncidents(userIncidents || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login-citizen')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
      case 'assigned':
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Atribuído</Badge>
      case 'in_progress':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Em Andamento</Badge>
      case 'resolved':
        return <Badge variant="destructive"><CheckCircle className="w-3 h-3 mr-1" />Resolvido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getApprovalBadge = (isApproved: boolean, isActive: boolean) => {
    if (!isApproved) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Aguardando Aprovação</Badge>
    }
    if (isApproved && isActive) {
      return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Ativa</Badge>
    }
    return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Inativa</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verificar se existe alguma medida protetiva ativa
  const hasActiveMeasure = protectiveMeasures.some(m => m.is_approved && m.is_active)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portal do Cidadão</h1>
            <p className="text-muted-foreground">Bem-vindo(a), {profile?.full_name}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Ações Rápidas */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/new-report')}>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-warning/10 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Fazer Denúncia</h3>
                <p className="text-sm text-muted-foreground">Relatar uma ocorrência</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/accident-report')}>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-destructive/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Relatório de Acidente</h3>
                <p className="text-sm text-muted-foreground">Doméstico, trabalho, trânsito</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/risk-alert')}>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-orange-500/10 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Alerta de Risco</h3>
                <p className="text-sm text-muted-foreground">Desabamentos, árvores, etc.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/new-protective-measure')}>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Medida Protetiva</h3>
                <p className="text-sm text-muted-foreground">Solicitar proteção</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Botão de Pânico (apenas se tiver medida protetiva ativa) */}
        {hasActiveMeasure && (
          <section>
            <PanicButton />
          </section>
        )}

        {/* Mapa Interativo */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Mapa da Segurança
              </CardTitle>
              <CardDescription>
                Delegacias, agentes, viaturas e mapas de calor de criminalidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <InteractiveMap />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medidas Protetivas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Medidas Protetivas
                </span>
                <Button size="sm" onClick={() => navigate('/new-protective-measure')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </CardTitle>
              <CardDescription>
                Suas solicitações de medidas protetivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {protectiveMeasures.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma medida protetiva encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  {protectiveMeasures.map((measure) => (
                    <div key={measure.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Contra: {measure.restricted_person_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Protegendo: {measure.protected_person_name}
                          </p>
                        </div>
                        {getApprovalBadge(measure.is_approved, measure.is_active)}
                      </div>
                      <p className="text-sm mb-2">{measure.restriction_details}</p>
                      <p className="text-xs text-muted-foreground">
                        Válida até: {new Date(measure.valid_until).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Denúncias Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Denúncias Recentes
              </CardTitle>
              <CardDescription>
                Suas últimas denúncias registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma denúncia encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{incident.type}</h4>
                          <p className="text-sm text-muted-foreground">{incident.location}</p>
                        </div>
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm mb-2">{incident.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(incident.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}