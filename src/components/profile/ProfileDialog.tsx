import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, Shield, MapPin } from "lucide-react";

interface ProfileDialogProps {
  user?: any;
  onUpdate?: (data: any) => void;
}

export default function ProfileDialog({ user, onUpdate }: ProfileDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "João Silva",
    email: user?.email || "joao.silva@exemplo.com",
    phone: user?.phone || "(11) 99999-9999",
    role: user?.role || "citizen",
    badge: user?.badge_number || "",
    department: user?.department || "",
  });

  const handleSave = () => {
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
    if (onUpdate) {
      onUpdate(formData);
    }
    setIsOpen(false);
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      citizen: { label: "Cidadão", variant: "secondary" as const, icon: User },
      agent: { label: "Agente", variant: "default" as const, icon: Shield },
      admin: { label: "Administrador", variant: "destructive" as const, icon: Shield },
    };
    const config = roles[role as keyof typeof roles] || roles.citizen;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar e Info Básica */}
          <Card>
            <CardHeader className="text-center pb-2">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{formData.fullName}</CardTitle>
              <div className="flex justify-center">
                {getRoleBadge(formData.role)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {formData.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {formData.phone}
              </div>
              {formData.badge && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Placa: {formData.badge}
                </div>
              )}
              {formData.department && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {formData.department}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Membro desde Janeiro 2024
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Edição */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Estatísticas */}
          {formData.role === 'citizen' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-xs text-muted-foreground">Denúncias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">2</div>
                  <div className="text-xs text-muted-foreground">Resolvidas</div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar Alterações
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