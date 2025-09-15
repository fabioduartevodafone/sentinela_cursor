import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Building, 
  TreePine, 
  Zap, 
  Lightbulb, 
  Mountain, 
  AlertTriangle,
  Upload,
  X
} from "lucide-react"

interface RiskAlert {
  type: 'building_collapse' | 'tree_fall' | 'electrical_hazard' | 'poor_lighting' | 'landslide' | 'other'
  description: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  immediate_danger: boolean
  affected_people: string
  photos: File[]
  reporter_name: string
  reporter_phone: string
  reporter_email: string
}

export default function RiskAlertForm() {
  const { toast } = useToast()
  const [alert, setAlert] = useState<RiskAlert>({
    type: 'building_collapse',
    description: '',
    location: '',
    severity: 'medium',
    immediate_danger: false,
    affected_people: '',
    photos: [],
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate saving to localStorage for demo
    const savedAlerts = JSON.parse(localStorage.getItem('risk_alerts') || '[]')
    const newAlert = {
      ...alert,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'pending',
      photos: alert.photos.map(f => f.name),
    }
    
    savedAlerts.push(newAlert)
    localStorage.setItem('risk_alerts', JSON.stringify(savedAlerts))
    
    toast({
      title: "Alerta de Risco Enviado",
      description: alert.immediate_danger 
        ? "Alerta de emergência enviado! Equipes serão notificadas imediatamente."
        : "Seu alerta foi registrado e será analisado por nossa equipe.",
      variant: alert.immediate_danger ? "destructive" : "default"
    })
    
    // Reset form
    setAlert({
      type: 'building_collapse',
      description: '',
      location: '',
      severity: 'medium',
      immediate_danger: false,
      affected_people: '',
      photos: [],
      reporter_name: '',
      reporter_phone: '',
      reporter_email: '',
    })
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files)
    setAlert(prev => ({
      ...prev,
      photos: [...prev.photos, ...newFiles]
    }))
  }

  const removeFile = (index: number) => {
    setAlert(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const getRiskTypes = () => [
    { value: 'building_collapse', label: 'Risco de Desabamento', icon: Building, description: 'Prédios, casas, muros com rachaduras' },
    { value: 'tree_fall', label: 'Queda de Árvore', icon: TreePine, description: 'Árvores inclinadas ou com risco de queda' },
    { value: 'electrical_hazard', label: 'Risco Elétrico', icon: Zap, description: 'Fios soltos, postes danificados' },
    { value: 'poor_lighting', label: 'Má Iluminação', icon: Lightbulb, description: 'Vias públicas com iluminação deficiente' },
    { value: 'landslide', label: 'Deslizamento', icon: Mountain, description: 'Encostas e taludes instáveis' },
    { value: 'other', label: 'Outro Risco', icon: AlertTriangle, description: 'Outros tipos de riscos à segurança' },
  ]

  const getTypeIcon = (type: string) => {
    const riskType = getRiskTypes().find(t => t.value === type)
    const IconComponent = riskType?.icon || AlertTriangle
    return <IconComponent className="h-5 w-5" />
  }

  const getTypeLabel = (type: string) => {
    const riskType = getRiskTypes().find(t => t.value === type)
    return riskType?.label || type
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low': return <Badge variant="secondary">🟢 Baixo</Badge>
      case 'medium': return <Badge variant="default">🟡 Médio</Badge>
      case 'high': return <Badge variant="destructive">🟠 Alto</Badge>
      case 'critical': return <Badge variant="destructive" className="animate-pulse">🔴 Crítico</Badge>
      default: return <Badge>{severity}</Badge>
    }
  }

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'low': return 'Risco baixo - situação deve ser monitorada'
      case 'medium': return 'Risco médio - requer atenção em breve'
      case 'high': return 'Risco alto - requer ação rápida'
      case 'critical': return 'Risco crítico - perigo iminente'
      default: return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(alert.type)}
            Alerta de Risco
          </CardTitle>
          <CardDescription>
            Comunique riscos à segurança pública como desabamentos, quedas de árvores, problemas elétricos e outros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Risco */}
            <div>
              <Label htmlFor="type">Tipo de Risco *</Label>
              <Select value={alert.type} onValueChange={(value) => setAlert(prev => ({ ...prev, type: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getRiskTypes().map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Localização Exata *</Label>
                <Input
                  id="location"
                  value={alert.location}
                  onChange={(e) => setAlert(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Endereço completo, pontos de referência"
                  required
                />
              </div>
              <div>
                <Label htmlFor="severity">Nível de Gravidade *</Label>
                <Select value={alert.severity} onValueChange={(value) => setAlert(prev => ({ ...prev, severity: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baixo - Monitoramento</SelectItem>
                    <SelectItem value="medium">🟡 Médio - Atenção Necessária</SelectItem>
                    <SelectItem value="high">🟠 Alto - Ação Rápida</SelectItem>
                    <SelectItem value="critical">🔴 Crítico - Perigo Iminente</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getSeverityDescription(alert.severity)}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                value={alert.description}
                onChange={(e) => setAlert(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva em detalhes o risco observado, quando foi notado, características específicas, etc."
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="affected_people">Pessoas ou Propriedades em Risco</Label>
              <Textarea
                id="affected_people"
                value={alert.affected_people}
                onChange={(e) => setAlert(prev => ({ ...prev, affected_people: e.target.value }))}
                placeholder="Quantas pessoas podem ser afetadas? Quais propriedades estão em risco?"
                rows={3}
              />
            </div>

            {/* Perigo Imediato */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <input
                type="checkbox"
                id="immediate_danger"
                checked={alert.immediate_danger}
                onChange={(e) => setAlert(prev => ({ ...prev, immediate_danger: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="immediate_danger" className="cursor-pointer">
                <span className="font-medium text-destructive">⚠️ PERIGO IMEDIATO</span>
                <p className="text-sm text-muted-foreground">
                  Marque se há risco iminente à vida ou propriedade (evacuação pode ser necessária)
                </p>
              </Label>
            </div>

            {/* Upload de Fotos */}
            <div>
              <Label>Fotos do Local de Risco</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Label htmlFor="photos" className="cursor-pointer text-sm text-primary hover:underline">
                    Clique para adicionar fotos
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fotos ajudam na avaliação e priorização do risco
                  </p>
                </div>
                
                {alert.photos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Fotos Adicionadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.photos.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded">
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informações do Relatante */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Informações do Relatante</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reporter_name">Nome Completo *</Label>
                  <Input
                    id="reporter_name"
                    value={alert.reporter_name}
                    onChange={(e) => setAlert(prev => ({ ...prev, reporter_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_phone">Telefone *</Label>
                  <Input
                    id="reporter_phone"
                    value={alert.reporter_phone}
                    onChange={(e) => setAlert(prev => ({ ...prev, reporter_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_email">E-mail</Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    value={alert.reporter_email}
                    onChange={(e) => setAlert(prev => ({ ...prev, reporter_email: e.target.value }))}
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Gravidade:</span>
                  {getSeverityBadge(alert.severity)}
                </div>
                {alert.immediate_danger && (
                  <Badge variant="destructive" className="animate-pulse">
                    🚨 PERIGO IMEDIATO
                  </Badge>
                )}
              </div>
              <Button 
                type="submit" 
                size="lg"
                variant={alert.immediate_danger ? "destructive" : "default"}
              >
                {alert.immediate_danger ? "🚨 Enviar Alerta de Emergência" : "Enviar Alerta"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}