import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import sentinelaLogo from "@/assets/sentinela-logo.png";
import ProfileDialog from "@/components/profile/ProfileDialog";
import SettingsDialog from "@/components/settings/SettingsDialog";
import LogoutButton from "@/components/auth/LogoutButton";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={sentinelaLogo} alt="Sentinela" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Sentinela</h1>
            <p className="text-xs text-muted-foreground">Sistema de Segurança Pública</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            Ocorrências
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/vehicles'}>
            Viaturas
          </Button>
          <Button variant="ghost" size="sm">
            Denúncias
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <SettingsDialog />
          <ProfileDialog />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;