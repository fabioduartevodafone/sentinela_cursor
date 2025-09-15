import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Shield, Upload, FileText } from "lucide-react"

export default function ProtectiveMeasureForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    protectedPersonName: "",
    restrictedPersonName: "",
    restrictionDetails: "",
    validUntil: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não permitido",
          description: "Apenas arquivos PDF, JPG ou PNG são aceitos.",
          variant: "destructive"
        })
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive"
        })
        return
      }
      
      setDocumentFile(file)
    }
  }

  const uploadDocument = async (file: File): Promise<string | null> => {
    setUploadingFile(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `protective-measures/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do documento.",
        variant: "destructive"
      })
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      let documentUrl = null
      
      // Fazer upload do documento se fornecido
      if (documentFile) {
        documentUrl = await uploadDocument(documentFile)
        if (!documentUrl) {
          setLoading(false)
          return
        }
      }

      // Criar medida protetiva
      const { error } = await supabase
        .from('protective_measures')
        .insert({
          citizen_id: user.id,
          protected_person_name: formData.protectedPersonName,
          restricted_person_name: formData.restrictedPersonName,
          restriction_details: formData.restrictionDetails,
          valid_until: formData.validUntil,
          document_url: documentUrl,
          is_approved: false,
          is_active: false
        })

      if (error) throw error

      toast({
        title: "Medida protetiva solicitada!",
        description: "Sua solicitação será analisada por um administrador.",
      })

      // Limpar formulário
      setFormData({
        protectedPersonName: "",
        restrictedPersonName: "",
        restrictionDetails: "",
        validUntil: ""
      })
      setDocumentFile(null)

    } catch (error: any) {
      toast({
        title: "Erro ao solicitar medida protetiva",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Nova Medida Protetiva
        </CardTitle>
        <CardDescription>
          Solicite uma medida protetiva fornecendo os dados necessários e documentação comprobatória
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="protectedPersonName">Nome da Pessoa Protegida</Label>
            <Input
              id="protectedPersonName"
              value={formData.protectedPersonName}
              onChange={(e) => handleInputChange('protectedPersonName', e.target.value)}
              required
              placeholder="Nome completo da pessoa que será protegida"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restrictedPersonName">Nome da Pessoa Restrita</Label>
            <Input
              id="restrictedPersonName"
              value={formData.restrictedPersonName}
              onChange={(e) => handleInputChange('restrictedPersonName', e.target.value)}
              required
              placeholder="Nome completo da pessoa que deve ser mantida afastada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restrictionDetails">Detalhes da Restrição</Label>
            <Textarea
              id="restrictionDetails"
              value={formData.restrictionDetails}
              onChange={(e) => handleInputChange('restrictionDetails', e.target.value)}
              required
              placeholder="Descreva os detalhes da medida protetiva (distância mínima, locais proibidos, etc.)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Válida Até</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-4">
            <Label>Documentação Comprobatória</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <Label htmlFor="document" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Selecionar Arquivo
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="document"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  PDF, JPG ou PNG (máximo 5MB)
                </p>
                {documentFile && (
                  <Alert className="mt-4">
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Arquivo selecionado: {documentFile.name}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Sua solicitação será analisada por um administrador. Você receberá uma notificação quando a medida protetiva for aprovada ou rejeitada.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || uploadingFile}
          >
            {loading ? 'Enviando...' : uploadingFile ? 'Fazendo upload...' : 'Solicitar Medida Protetiva'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}