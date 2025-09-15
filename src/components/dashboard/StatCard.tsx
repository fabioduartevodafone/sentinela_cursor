import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'emergency' | 'success' | 'warning';
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatCardProps) => {
  const variantStyles = {
    default: "border-border",
    emergency: "border-emergency/20 bg-emergency/5",
    success: "border-success/20 bg-success/5", 
    warning: "border-warning/20 bg-warning/5"
  };

  const iconStyles = {
    default: "text-primary",
    emergency: "text-emergency",
    success: "text-success",
    warning: "text-warning"
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-elevated", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p className="text-xs mt-1">
            <span className={trend.isPositive ? "text-success" : "text-emergency"}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
            <span className="text-muted-foreground"> vs. mês anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;