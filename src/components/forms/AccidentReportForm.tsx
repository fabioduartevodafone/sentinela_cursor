import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { StorageService } from "@/lib/storage"
import { Car, Home, Building, Upload, X } from "lucide-react"

interface AccidentReport {
  type: 'domestic' | 'work' | 'traffic'
  description: string
  location: string
  date: string
  time: string
  severity: 'low' | 'medium' | 'high'
  witnesses: string
  photos: File[]
  videos: File[]
  reporter_name: string
  reporter_phone: string
  reporter_email: string
}

export default function AccidentReportForm() {
  const { toast } = useToast()
  const [report, setReport] = useState<AccidentReport>({
    type: 'traffic',
    description: '',
    location: '',
    date: '',
    time: '',
    severity: 'medium',
    witnesses: '',
    photos: [],
    videos: [],
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate saving to localStorage for demo
    const savedReports = JSON.parse(localStorage.getItem('accident_reports') || '[]')
    const newReport = {
      ...report,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'pending',
      photos: report.photos.map(f => f.name),
      videos: report.videos.map(f => f.name),
    }
    
    savedReports.push(newReport)
    localStorage.setItem('accident_reports', JSON.stringify(savedReports))
    
    toast({
      title: "Relatório de Acidente Enviado",
      description: "Seu relatório foi registrado e será analisado por nossa equipe.",
    })
    
    // Reset form
    setReport({
      type: 'traffic',
      description: '',
      location: '',
      date: '',
      time: '',
      severity: 'medium',
      witnesses: '',
      photos: [],
      videos: [],
      reporter_name: '',
      reporter_phone: '',
      reporter_email: '',
    })
  }

  const handleFileUpload = async (files: FileList | null, type: 'photos' | 'videos') => {
    if (!files || files.length === 0) return
    
    setUploadingFiles(true)
    const uploadedFiles: File[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = type === 'photos' 
          ? await StorageService.uploadImage(file)
          : await StorageService.uploadVideo(file)
        
        if (result.url) {
          uploadedFiles.push(file)
        } else if (result.error) {
          toast({
            title: "Erro no upload",
            description: `Falha ao enviar ${file.name}: ${result.error}`,
            variant: "destructive"
          })
        }
      }
      
      if (uploadedFiles.length > 0) {
        setReport(prev => ({
          ...prev,
          [type]: [...prev[type], ...uploadedFiles]
        }))
        
        toast({
          title: "Upload concluído",
          description: `${uploadedFiles.length} ${type === 'photos' ? 'foto(s)' : 'vídeo(s)'} enviado(s) com sucesso!`,
        })
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: `Não foi possível fazer upload ${type === 'photos' ? 'das fotos' : 'dos vídeos'}.`,
        variant: "destructive"
      })
    } finally {
      setUploadingFiles(false)
    }
  }

  const removeFile = (index: number, type: 'photos' | 'videos') => {
    setReport(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domestic': return <Home className="h-5 w-5" />
      case 'work': return <Building className="h-5 w-5" />
      case 'traffic': return <Car className="h-5 w-5" />
      default: return <Car className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'domestic': return 'Acidente Doméstico'
      case 'work': return 'Acidente de Trabalho'
      case 'traffic': return 'Acidente de Trânsito'
      default: return type
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low': return <Badge variant="secondary">🟢 Leve</Badge>
      case 'medium': return <Badge variant="default">🟡 Moderado</Badge>
      case 'high': return <Badge variant="destructive">🔴 Grave</Badge>
      default: return <Badge>{severity}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(report.type)}
            Relatório de Acidente
          </CardTitle>
          <CardDescription>
            Relate acidentes domésticos, de trabalho ou de trânsito para registro e acompanhamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={report.type} onValueChange={(value) => setReport(prev => ({ ...prev, type: value as any }))}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="traffic" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Trânsito
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Trabalho
                </TabsTrigger>
                <TabsTrigger value="domestic" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Doméstico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="traffic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Local do Acidente *</Label>
                    <Input
                      id="location"
                      value={report.location}
                      onChange={(e) => setReport(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Rua, número, bairro, cidade"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Gravidade</Label>
                    <Select value={report.severity} onValueChange={(value) => setReport(prev => ({ ...prev, severity: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Leve (sem feridos)</SelectItem>
                        <SelectItem value="medium">🟡 Moderado (feridos leves)</SelectItem>
                        <SelectItem value="high">🔴 Grave (feridos graves/óbito)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Local/Empresa *</Label>
                    <Input
                      id="location"
                      value={report.location}
                      onChange={(e) => setReport(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Nome da empresa, endereço"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Gravidade</Label>
                    <Select value={report.severity} onValueChange={(value) => setReport(prev => ({ ...prev, severity: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Leve (primeiros socorros)</SelectItem>
                        <SelectItem value="medium">🟡 Moderado (afastamento)</SelectItem>
                        <SelectItem value="high">🔴 Grave (internação/óbito)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="domestic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Local da Residência *</Label>
                    <Input
                      id="location"
                      value={report.location}
                      onChange={(e) => setReport(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Endereço da residência"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Gravidade</Label>
                    <Select value={report.severity} onValueChange={(value) => setReport(prev => ({ ...prev, severity: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Leve (sem ferimentos)</SelectItem>
                        <SelectItem value="medium">🟡 Moderado (ferimentos leves)</SelectItem>
                        <SelectItem value="high">🔴 Grave (hospitalização)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data do Acidente *</Label>
                <Input
                  id="date"
                  type="date"
                  value={report.date}
                  onChange={(e) => setReport(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Horário Aproximado *</Label>
                <Input
                  id="time"
                  type="time"
                  value={report.time}
                  onChange={(e) => setReport(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição Detalhada do Acidente *</Label>
              <Textarea
                id="description"
                value={report.description}
                onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva em detalhes como o acidente aconteceu, as pessoas envolvidas, veículos (se houver), ferimentos, etc."
                rows={5}
                required
              />
            </div>

            <div>
              <Label htmlFor="witnesses">Testemunhas</Label>
              <Textarea
                id="witnesses"
                value={report.witnesses}
                onChange={(e) => setReport(prev => ({ ...prev, witnesses: e.target.value }))}
                placeholder="Nome e contato de testemunhas (opcional)"
                rows={3}
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div>
                <Label>Fotos do Local/Acidente</Label>
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
                      onChange={(e) => handleFileUpload(e.target.files, 'photos')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Fotos podem servir como evidências importantes
                    </p>
                  </div>
                  
                  {report.photos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Fotos Adicionadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.photos.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded">
                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(index, 'photos')}
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

              <div>
                <Label>Vídeos do Local/Acidente</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Label htmlFor="videos" className="cursor-pointer text-sm text-primary hover:underline">
                      Clique para adicionar vídeos
                    </Label>
                    <Input
                      id="videos"
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'videos')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Vídeos podem mostrar a dinâmica do acidente
                    </p>
                  </div>
                  
                  {report.videos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Vídeos Adicionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.videos.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded">
                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(index, 'videos')}
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
            </div>

            {/* Reporter Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Informações do Relatante</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reporter_name">Nome Completo *</Label>
                  <Input
                    id="reporter_name"
                    value={report.reporter_name}
                    onChange={(e) => setReport(prev => ({ ...prev, reporter_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_phone">Telefone *</Label>
                  <Input
                    id="reporter_phone"
                    value={report.reporter_phone}
                    onChange={(e) => setReport(prev => ({ ...prev, reporter_phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporter_email">E-mail</Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    value={report.reporter_email}
                    onChange={(e) => setReport(prev => ({ ...prev, reporter_email: e.target.value }))}
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                <span className="text-sm text-muted-foreground">Gravidade:</span>
                {getSeverityBadge(report.severity)}
              </div>
              <Button type="submit" size="lg" disabled={uploadingFiles}>
                {uploadingFiles ? 'Fazendo upload...' : 'Enviar Relatório'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}