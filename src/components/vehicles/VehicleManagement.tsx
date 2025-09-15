import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Car, Plus, Settings, Users } from "lucide-react"
import { Vehicle } from "@/lib/supabase"

interface VehicleManagementProps {
  currentUser: any
}

export default function VehicleManagement({ currentUser }: VehicleManagementProps) {
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [agents] = useState([
    { id: '1', name: 'João Silva', badge: 'AG001' },
    { id: '2', name: 'Maria Santos', badge: 'AG002' },
    { id: '3', name: 'Pedro Costa', badge: 'AG003' },
  ])

  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    type: 'fixed' as 'fixed' | 'rotating',
    district: '',
    assigned_agents: [] as string[]
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = () => {
    const savedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]')
    setVehicles(savedVehicles)
  }

  const handleAddVehicle = () => {
    if (!formData.plate || !formData.model || !formData.district) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      plate: formData.plate.toUpperCase(),
      model: formData.model,
      type: formData.type,
      assigned_agents: formData.assigned_agents,
      district: formData.district,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const updatedVehicles = [...vehicles, newVehicle]
    setVehicles(updatedVehicles)
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles))

    setFormData({
      plate: '',
      model: '',
      type: 'fixed',
      district: '',
      assigned_agents: []
    })
    setShowAddDialog(false)

    toast({
      title: "Viatura Adicionada",
      description: `Viatura ${newVehicle.plate} foi adicionada com sucesso.`,
    })
  }

  const handleStatusChange = (vehicleId: string, newStatus: Vehicle['status']) => {
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === vehicleId
        ? { ...vehicle, status: newStatus, updated_at: new Date().toISOString() }
        : vehicle
    )
    setVehicles(updatedVehicles)
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles))

    toast({
      title: "Status Atualizado",
      description: "Status da viatura foi atualizado com sucesso.",
    })
  }

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">🟢 Disponível</Badge>
      case 'in_use':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">🔵 Em Uso</Badge>
      case 'maintenance':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">🔴 Manutenção</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: Vehicle['type']) => {
    return type === 'fixed' 
      ? <Badge variant="outline">📍 Fixa</Badge>
      : <Badge variant="outline">🔄 Rotativa</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Gerenciamento de Viaturas
            </CardTitle>
            <CardDescription>
              Gerencie as viaturas disponíveis e suas atribuições
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Viatura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Viatura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: Ford Ka, Hilux, Moto Honda CG"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo de Viatura *</Label>
                  <Select value={formData.type} onValueChange={(value: 'fixed' | 'rotating') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixa (Agentes específicos)</SelectItem>
                      <SelectItem value="rotating">Rotativa (Uso geral)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="district">Distrito/Região *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Ex: Centro, Norte, Sul"
                  />
                </div>
                
                {formData.type === 'fixed' && (
                  <div>
                    <Label>Agentes Designados</Label>
                    <div className="space-y-2 mt-2">
                      {agents.map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={agent.id}
                            checked={formData.assigned_agents.includes(agent.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assigned_agents: [...formData.assigned_agents, agent.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  assigned_agents: formData.assigned_agents.filter(id => id !== agent.id)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={agent.id} className="text-sm">
                            {agent.name} ({agent.badge})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleAddVehicle} className="flex-1">
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma viatura cadastrada</p>
            <p className="text-sm">Clique em "Adicionar Viatura" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{vehicle.plate}</h4>
                      {getTypeBadge(vehicle.type)}
                      {getStatusBadge(vehicle.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Modelo:</strong> {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Distrito:</strong> {vehicle.district}
                    </p>
                    
                    {vehicle.type === 'fixed' && vehicle.assigned_agents && vehicle.assigned_agents.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Agentes Designados:</strong>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {vehicle.assigned_agents.map((agentId) => {
                            const agent = agents.find(a => a.id === agentId)
                            return agent ? (
                              <Badge key={agentId} variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {agent.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select 
                      value={vehicle.status} 
                      onValueChange={(value: Vehicle['status']) => handleStatusChange(vehicle.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="in_use">Em Uso</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Criada em: {new Date(vehicle.created_at).toLocaleString('pt-BR')}
                  {vehicle.updated_at !== vehicle.created_at && (
                    <span className="ml-4">
                      Atualizada em: {new Date(vehicle.updated_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}