import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * NotFound - Página 404 para rotas não encontradas
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="default" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Voltar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="w-full sm:w-auto"
          >
            Ir para página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;