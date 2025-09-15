import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Shield, Eye, Volume2, Moon, Sun } from "lucide-react";

export default function SettingsDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: false,
      sms: true,
      emergency: true,
    },
    privacy: {
      shareLocation: true,
      anonymousReports: false,
      publicProfile: false,
    },
    display: {
      theme: "system",
      language: "pt-BR",
      mapStyle: "default",
    },
    audio: {
      soundEnabled: true,
      volume: [75],
      emergencyAlerts: true,
    }
  });

  const handleSave = () => {
    localStorage.setItem('sentinela_settings', JSON.stringify(settings));
    toast({
      title: "Configurações Salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
    setIsOpen(false);
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => updateSetting('notifications', 'sms', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emergency-notifications">Alertas de Emergência</Label>
                <Switch
                  id="emergency-notifications"
                  checked={settings.notifications.emergency}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emergency', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="share-location">Compartilhar Localização</Label>
                  <p className="text-sm text-muted-foreground">Permite que agentes vejam sua localização</p>
                </div>
                <Switch
                  id="share-location"
                  checked={settings.privacy.shareLocation}
                  onCheckedChange={(checked) => updateSetting('privacy', 'shareLocation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous-reports">Denúncias Anônimas por Padrão</Label>
                  <p className="text-sm text-muted-foreground">Suas denúncias serão anônimas automaticamente</p>
                </div>
                <Switch
                  id="anonymous-reports"
                  checked={settings.privacy.anonymousReports}
                  onCheckedChange={(checked) => updateSetting('privacy', 'anonymousReports', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public-profile">Perfil Público</Label>
                  <p className="text-sm text-muted-foreground">Permite que outros usuários vejam seu perfil</p>
                </div>
                <Switch
                  id="public-profile"
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exibição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Exibição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={settings.display.theme} onValueChange={(value) => updateSetting('display', 'theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={settings.display.language} onValueChange={(value) => updateSetting('display', 'language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estilo do Mapa</Label>
                <Select value={settings.display.mapStyle} onValueChange={(value) => updateSetting('display', 'mapStyle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="satellite">Satélite</SelectItem>
                    <SelectItem value="terrain">Terreno</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Áudio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Volume2 className="h-5 w-5" />
                Áudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Sons do Sistema</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.audio.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('audio', 'soundEnabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Volume ({settings.audio.volume[0]}%)</Label>
                <Slider
                  value={settings.audio.volume}
                  onValueChange={(value) => updateSetting('audio', 'volume', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="emergency-alerts-audio">Alertas Sonoros de Emergência</Label>
                <Switch
                  id="emergency-alerts-audio"
                  checked={settings.audio.emergencyAlerts}
                  onCheckedChange={(checked) => updateSetting('audio', 'emergencyAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}