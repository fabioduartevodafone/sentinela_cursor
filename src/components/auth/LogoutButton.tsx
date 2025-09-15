import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export default function LogoutButton({ variant = "ghost", size = "icon", showText = false }: LogoutButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('sentinela_current_user');
    localStorage.removeItem('sentinela_session');
    
    toast({
      title: "Sessão Encerrada",
      description: "Você foi desconectado com sucesso.",
    });
    
    // Redirect to home page
    navigate('/');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-destructive hover:text-destructive">
          <LogOut className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />
          {showText && "Sair"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Saída</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar o sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair do Sistema
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}