import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Car, 
  Hammer, 
  Home, 
  TreePine, 
  Zap, 
  Building, 
  Waves, 
  Navigation, 
  Lightbulb,
  Shield,
  Sword
} from "lucide-react";

export const INCIDENT_CATEGORIES = {
  crime_violence: {
    label: "Crime e Violência",
    icon: Shield,
    color: "destructive",
    subcategories: {
      roubo: { label: "Roubo", icon: Sword },
      furto: { label: "Furto", icon: AlertTriangle },
      agressao: { label: "Agressão", icon: Sword },
      violencia_domestica: { label: "Violência Doméstica", icon: Home },
      trafico: { label: "Tráfico de Drogas", icon: AlertTriangle },
      vandalismo: { label: "Vandalismo", icon: Building },
      ameaca: { label: "Ameaça", icon: AlertTriangle },
      sequestro: { label: "Sequestro", icon: Shield },
    }
  },
  accident_traffic: {
    label: "Acidente de Trânsito",
    icon: Car,
    color: "warning",
    subcategories: {
      colisao: { label: "Colisão", icon: Car },
      atropelamento: { label: "Atropelamento", icon: Car },
      capotamento: { label: "Capotamento", icon: Car },
      choque: { label: "Choque Elétrico", icon: Zap },
      moto: { label: "Acidente de Moto", icon: Car },
      bicicleta: { label: "Acidente de Bicicleta", icon: Car },
    }
  },
  accident_work: {
    label: "Acidente de Trabalho",
    icon: Hammer,
    color: "warning",
    subcategories: {
      queda: { label: "Queda", icon: AlertTriangle },
      corte: { label: "Corte", icon: Hammer },
      queimadura: { label: "Queimadura", icon: Zap },
      soterramento: { label: "Soterramento", icon: Building },
      intoxicacao: { label: "Intoxicação", icon: AlertTriangle },
      choque_eletrico: { label: "Choque Elétrico", icon: Zap },
    }
  },
  accident_domestic: {
    label: "Acidente Doméstico",
    icon: Home,
    color: "warning",
    subcategories: {
      incendio: { label: "Incêndio", icon: Zap },
      vazamento_gas: { label: "Vazamento de Gás", icon: Home },
      intoxicacao: { label: "Intoxicação", icon: AlertTriangle },
      queda: { label: "Queda", icon: AlertTriangle },
      afogamento: { label: "Afogamento", icon: Waves },
      choque_eletrico: { label: "Choque Elétrico", icon: Zap },
    }
  },
  risk_alert: {
    label: "Alerta de Risco",
    icon: AlertTriangle,
    color: "secondary",
    subcategories: {
      quedas_arvores: { label: "Quedas de Árvores", icon: TreePine },
      fios_eletricos: { label: "Fios Elétricos Soltos", icon: Zap },
      estrutura_risco: { label: "Estrutura com Risco de Desabamento", icon: Building },
      alagamento: { label: "Risco de Alagamento", icon: Waves },
      pontos_alagamento: { label: "Pontos de Alagamento Existentes", icon: Waves },
      ruas_bloqueadas: { label: "Ruas Bloqueadas", icon: Navigation },
      ma_iluminacao: { label: "Má Iluminação", icon: Lightbulb },
      condicoes_adversas: { label: "Condições que Aumentam Criminalidade", icon: AlertTriangle },
    }
  }
} as const;

interface IncidentCategoryBadgeProps {
  type: string;
  subtype?: string;
  showIcon?: boolean;
}

export function IncidentCategoryBadge({ type, subtype, showIcon = true }: IncidentCategoryBadgeProps) {
  const category = INCIDENT_CATEGORIES[type as keyof typeof INCIDENT_CATEGORIES];
  
  if (!category) {
    return <Badge variant="outline">Tipo Desconhecido</Badge>;
  }

  const Icon = category.icon;
  const subcategory = subtype ? category.subcategories[subtype as keyof typeof category.subcategories] : null;
  const SubIcon = subcategory?.icon;

  return (
    <Badge variant={category.color as any} className="gap-1">
      {showIcon && SubIcon && <SubIcon className="h-3 w-3" />}
      {showIcon && !SubIcon && <Icon className="h-3 w-3" />}
      {subcategory ? subcategory.label : category.label}
    </Badge>
  );
}

interface IncidentCategorySelectorProps {
  value?: { type: string; subtype?: string };
  onChange: (category: { type: string; subtype?: string }) => void;
  categoryFilter?: "crime-violence" | "accident" | "risk-alert";
}

export function IncidentCategorySelector({ value, onChange, categoryFilter }: IncidentCategorySelectorProps) {
  const selectedCategory = value?.type ? INCIDENT_CATEGORIES[value.type as keyof typeof INCIDENT_CATEGORIES] : null;
  
  const getFilteredCategories = () => {
    if (!categoryFilter) return INCIDENT_CATEGORIES;
    
    switch (categoryFilter) {
      case "crime-violence":
        return { crime_violence: INCIDENT_CATEGORIES.crime_violence };
      case "accident":
        return { 
          accident_traffic: INCIDENT_CATEGORIES.accident_traffic,
          accident_work: INCIDENT_CATEGORIES.accident_work,
          accident_domestic: INCIDENT_CATEGORIES.accident_domestic
        };
      case "risk-alert":
        return { risk_alert: INCIDENT_CATEGORIES.risk_alert };
      default:
        return INCIDENT_CATEGORIES;
    }
  };
  
  const filteredCategories = getFilteredCategories();
  
  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Categoria Principal</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(filteredCategories).map(([key, category]) => {
            const Icon = category.icon;
            const isSelected = value?.type === key;
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ type: key })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Selection */}
      {selectedCategory && (
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo Específico</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(selectedCategory.subcategories).map(([key, subcategory]) => {
              const Icon = subcategory.icon;
              const isSelected = value?.subtype === key;
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ type: value!.type, subtype: key })}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3" />
                    <span className="text-sm">{subcategory.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}