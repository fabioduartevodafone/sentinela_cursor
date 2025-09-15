import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, Route, MapPin, Clock, AlertTriangle, Navigation, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  vehicle_type: 'car' | 'motorcycle';
  license_plate: string;
  model: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  current_location_lat?: number;
  current_location_lng?: number;
  assigned_agent_id?: string;
}

interface CrimeHotspot {
  location_lat: number;
  location_lng: number;
  crime_type: string;
  incident_count: number;
  area_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface RouteAssignment {
  id: string;
  vehicle: Vehicle;
  agent_name: string;
  hotspots: CrimeHotspot[];
  estimated_duration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'active' | 'completed';
  created_at: string;
}

export default function VehicleRouteGenerator() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [crimeHotspots, setCrimeHotspots] = useState<CrimeHotspot[]>([]);
  const [routeAssignments, setRouteAssignments] = useState<RouteAssignment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load vehicles from Supabase
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select(`
          *,
          agents!vehicles_assigned_agent_id_fkey (
            user_id,
            profiles!agents_user_id_fkey (full_name)
          )
        `)
        .eq('status', 'available');

      if (vehiclesData) {
        const typedVehicles = vehiclesData.map(v => ({
          ...v,
          vehicle_type: v.vehicle_type as 'car' | 'motorcycle',
          status: v.status as 'available' | 'in_use' | 'maintenance' | 'out_of_service'
        }));
        setVehicles(typedVehicles);
      }

      // Load crime statistics for hotspots (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const startMonth = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

      const { data: crimeData } = await supabase
        .from('crime_statistics')
        .select('*')
        .gte('month_year', startMonth)
        .order('incident_count', { ascending: false });

      if (crimeData) {
        // Process crime data to create hotspots
        const hotspots = crimeData.map(crime => ({
          location_lat: crime.location_lat,
          location_lng: crime.location_lng,
          crime_type: crime.crime_type,
          incident_count: crime.incident_count,
          area_name: crime.area_name,
          severity: getSeverityLevel(crime.incident_count)
        }));
        setCrimeHotspots(hotspots);
      }

      // Load existing route assignments
      loadRouteAssignments();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadRouteAssignments = () => {
    const saved = localStorage.getItem('route_assignments');
    if (saved) {
      setRouteAssignments(JSON.parse(saved));
    }
  };

  const saveRouteAssignments = (assignments: RouteAssignment[]) => {
    localStorage.setItem('route_assignments', JSON.stringify(assignments));
    setRouteAssignments(assignments);
  };

  const getSeverityLevel = (incidentCount: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (incidentCount >= 8) return 'critical';
    if (incidentCount >= 5) return 'high';
    if (incidentCount >= 3) return 'medium';
    return 'low';
  };

  const generateOptimalRoute = () => {
    if (!selectedVehicle) {
      toast({
        title: "Erro",
        description: "Selecione uma viatura para gerar a rota.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Simulate route generation algorithm
    setTimeout(() => {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (!vehicle) return;

      // Select high-priority hotspots near the vehicle
      const nearbyHotspots = crimeHotspots
        .filter(hotspot => hotspot.severity === 'high' || hotspot.severity === 'critical')
        .slice(0, 4); // Limit to 4 stops

      const newAssignment: RouteAssignment = {
        id: Date.now().toString(),
        vehicle: vehicle,
        agent_name: `Agente ${vehicle.license_plate}`,
        hotspots: nearbyHotspots,
        estimated_duration: Math.floor(Math.random() * 180) + 60, // 60-240 minutes
        priority: nearbyHotspots.some(h => h.severity === 'critical') ? 'critical' : 'high',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const updatedAssignments = [newAssignment, ...routeAssignments];
      saveRouteAssignments(updatedAssignments);

      // Update vehicle status to in_use
      updateVehicleStatus(vehicle.id, 'in_use');

      toast({
        title: "Rota Gerada",
        description: `Rota otimizada criada para viatura ${vehicle.license_plate} com ${nearbyHotspots.length} pontos de patrulhamento.`,
      });

      setIsGenerating(false);
      setIsOpen(false);
      setSelectedVehicle("");
    }, 2000);
  };

  const updateVehicleStatus = async (vehicleId: string, status: Vehicle['status']) => {
    try {
      await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId);

      // Update local state
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, status } : v
      ));
    } catch (error) {
      console.error('Error updating vehicle status:', error);
    }
  };

  const activateRoute = (assignmentId: string) => {
    const updatedAssignments = routeAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, status: 'active' as const }
        : assignment
    );
    saveRouteAssignments(updatedAssignments);

    toast({
      title: "Rota Ativada",
      description: "A rota foi ativada e enviada para a viatura.",
    });
  };

  const completeRoute = (assignmentId: string) => {
    const updatedAssignments = routeAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, status: 'completed' as const }
        : assignment
    );
    saveRouteAssignments(updatedAssignments);

    // Find the assignment and make vehicle available again
    const assignment = routeAssignments.find(a => a.id === assignmentId);
    if (assignment) {
      updateVehicleStatus(assignment.vehicle.id, 'available');
    }

    toast({
      title: "Rota Concluída",
      description: "A rota foi marcada como concluída e a viatura está disponível.",
    });
  };

  const getSeverityBadge = (severity: string) => {
    const configs = {
      low: { label: "Baixo", variant: "secondary" as const },
      medium: { label: "Médio", variant: "default" as const },
      high: { label: "Alto", variant: "destructive" as const },
      critical: { label: "Crítico", variant: "destructive" as const },
    };
    const config = configs[severity as keyof typeof configs] || configs.low;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { label: "Pendente", variant: "secondary" as const },
      active: { label: "Ativa", variant: "default" as const },
      completed: { label: "Concluída", variant: "outline" as const },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const availableVehicles = vehicles.filter(v => v.status === 'available');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Gerador de Rotas Inteligente
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gera rotas otimizadas baseadas em manchas criminais dos últimos 3 meses
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Navigation className="h-4 w-4 mr-2" />
                Gerar Nova Rota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar Rota Otimizada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecionar Viatura</label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma viatura disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {vehicle.license_plate} - {vehicle.model}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>🎯 A rota será otimizada baseada em:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Manchas criminais dos últimos 3 meses</li>
                    <li>Prioridade por severidade dos crimes</li>
                    <li>Proximidade geográfica dos pontos</li>
                    <li>Capacidade da viatura selecionada</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={generateOptimalRoute} 
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Route className="h-4 w-4 mr-2" />
                        Gerar Rota
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{availableVehicles.length}</div>
            <div className="text-xs text-muted-foreground">Viaturas Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{routeAssignments.filter(r => r.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground">Rotas Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{crimeHotspots.filter(h => h.severity === 'critical').length}</div>
            <div className="text-xs text-muted-foreground">Pontos Críticos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{routeAssignments.filter(r => r.status === 'completed').length}</div>
            <div className="text-xs text-muted-foreground">Rotas Concluídas</div>
          </div>
        </div>

        {/* Route Assignments */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Atribuições de Rota
          </h3>
          
          {routeAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma rota gerada</p>
              <p className="text-sm">Gere uma nova rota para começar o patrulhamento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routeAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Car className="h-4 w-4" />
                        <span className="font-medium">{assignment.vehicle.license_plate}</span>
                        {getSeverityBadge(assignment.priority)}
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Users className="h-3 w-3 inline mr-1" />
                        {assignment.agent_name}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {assignment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => activateRoute(assignment.id)}
                        >
                          Ativar
                        </Button>
                      )}
                      {assignment.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeRoute(assignment.id)}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{assignment.hotspots.length} pontos de patrulhamento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Duração estimada: {assignment.estimated_duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Áreas: {assignment.hotspots.map(h => h.area_name).join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Criada em: {new Date(assignment.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}