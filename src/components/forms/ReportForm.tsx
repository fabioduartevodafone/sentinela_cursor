import { useState } from "react";
import { MapPin, Phone, AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { IncidentCategorySelector } from "@/components/incidents/IncidentCategories";

const ReportForm = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ type: string; subtype?: string }>();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("crime-violence");
  const { toast } = useToast();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Denúncia Registrada",
      description: `Sua denúncia foi enviada com sucesso. Protocolo: #2024001234${mediaFiles.length > 0 ? ` (${mediaFiles.length} arquivo(s) anexado(s))` : ''}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Nova Denúncia
        </CardTitle>
        <CardDescription>
          Registre uma ocorrência ou denúncia de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="anonymous" 
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label htmlFor="anonymous" className="text-sm">
              Denúncia anônima
            </Label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tipo de Ocorrência</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="crime-violence">Crime e Violência</TabsTrigger>
                <TabsTrigger value="accident">Acidentes</TabsTrigger>
                <TabsTrigger value="risk-alert">Alertas de Risco</TabsTrigger>
              </TabsList>
              
              <TabsContent value="crime-violence" className="space-y-2">
                <IncidentCategorySelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  categoryFilter="crime-violence"
                />
              </TabsContent>
              
              <TabsContent value="accident" className="space-y-2">
                <IncidentCategorySelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  categoryFilter="accident"
                />
              </TabsContent>
              
              <TabsContent value="risk-alert" className="space-y-2">
                <IncidentCategorySelector
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  categoryFilter="risk-alert"
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local da Ocorrência</Label>
            <div className="flex space-x-2">
              <Input 
                id="location" 
                placeholder="Endereço completo ou ponto de referência"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Ocorrência</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o que aconteceu..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evidências (Fotos/Vídeos)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="mb-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Fotos/Vídeos
                </Button>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, MP4, MOV (máx. 50MB cada)
                </p>
              </div>
              
              {mediaFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs p-2">
                        <span className="text-center truncate">
                          {file.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              Registrar Denúncia
            </Button>
            <Button type="button" variant="outline" size="icon" className="text-emergency">
              <Phone className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Em caso de emergência, ligue imediatamente para 190
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;