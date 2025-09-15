import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet.heat';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on São Paulo
    const map = L.map(mapRef.current).setView([-23.5505, -46.6333], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom icons
    const agentIcon = L.divIcon({
      html: `<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const policeStationIcon = L.divIcon({
      html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 2px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const incidentIcon = L.divIcon({
      html: `<div style="background: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
      className: 'custom-marker',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const carIcon = L.divIcon({
      html: `<div style="color: #8b5cf6; font-size: 20px; text-align: center; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; border: 2px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚗</div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const motorcycleIcon = L.divIcon({
      html: `<div style="color: #06b6d4; font-size: 18px; text-align: center; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; border: 2px solid #06b6d4; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏍️</div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const riskIcon = L.divIcon({
      html: `<div style="background: #f59e0b; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
      className: 'custom-marker',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const accidentIcon = L.divIcon({
      html: `<div style="background: #dc2626; width: 16px; height: 16px; border-radius: 2px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: rotate(45deg);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Sample data
    const agents = [
      { lat: -23.5505, lng: -46.6333, name: "Agente Silva", status: "online" },
      { lat: -23.5605, lng: -46.6233, name: "Agente Santos", status: "online" },
      { lat: -23.5405, lng: -46.6433, name: "Agente Oliveira", status: "offline" },
      { lat: -23.5705, lng: -46.6133, name: "Agente Costa", status: "online" },
    ];

    const policeStations = [
      { lat: -23.5505, lng: -46.6333, name: "1º Distrito Policial" },
      { lat: -23.5305, lng: -46.6533, name: "2º Distrito Policial" },
      { lat: -23.5705, lng: -46.6133, name: "3º Distrito Policial" },
    ];

    const incidents = [
      { lat: -23.5455, lng: -46.6383, type: "Roubo", time: "14:30" },
      { lat: -23.5655, lng: -46.6183, type: "Furto", time: "15:45" },
      { lat: -23.5355, lng: -46.6483, type: "Agressão", time: "16:20" },
    ];

    const vehicles = [
      { lat: -23.5505, lng: -46.6333, plate: "ABC-1234", type: "Fixa", vehicleType: "car", agents: ["Silva", "Santos"] },
      { lat: -23.5405, lng: -46.6433, plate: "DEF-5678", type: "Rotativa", vehicleType: "motorcycle", agents: ["Oliveira"] },
      { lat: -23.5605, lng: -46.6233, plate: "GHI-9012", type: "Fixa", vehicleType: "car", agents: ["Costa", "Lima"] },
      { lat: -23.5455, lng: -46.6383, plate: "JKL-3456", type: "Rotativa", vehicleType: "motorcycle", agents: ["Pereira"] },
    ];

    const risks = [
      { lat: -23.5525, lng: -46.6353, type: "Encosta com risco", severity: "Alto" },
      { lat: -23.5475, lng: -46.6413, type: "Árvore caída", severity: "Médio" },
      { lat: -23.5575, lng: -46.6253, type: "Fiação solta", severity: "Alto" },
      { lat: -23.5425, lng: -46.6453, type: "Iluminação deficiente", severity: "Baixo" },
    ];

    const accidents = [
      { lat: -23.5485, lng: -46.6363, type: "Acidente de trânsito", vehicles: 2 },
      { lat: -23.5585, lng: -46.6213, type: "Colisão", vehicles: 3 },
      { lat: -23.5385, lng: -46.6463, type: "Atropelamento", vehicles: 1 },
    ];

    // Heat map data for crimes
    const crimeHeatData = [
      [-23.5455, -46.6383, 0.8],
      [-23.5655, -46.6183, 0.6],
      [-23.5355, -46.6483, 0.9],
      [-23.5555, -46.6283, 0.7],
      [-23.5255, -46.6583, 0.5],
      [-23.5755, -46.6083, 0.8],
      [-23.5155, -46.6683, 0.6],
      [-23.5855, -46.5983, 0.4],
    ];

    // Add markers
    agents.forEach(agent => {
      const marker = L.marker([agent.lat, agent.lng], { 
        icon: agentIcon 
      }).addTo(map);
      
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong>${agent.name}</strong><br>
          Status: <span style="color: ${agent.status === 'online' ? '#10b981' : '#ef4444'}">${agent.status}</span>
        </div>
      `);
    });

    policeStations.forEach(station => {
      L.marker([station.lat, station.lng], { 
        icon: policeStationIcon 
      }).addTo(map)
        .bindPopup(`<strong>${station.name}</strong>`);
    });

    incidents.forEach(incident => {
      L.marker([incident.lat, incident.lng], { 
        icon: incidentIcon 
      }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong>${incident.type}</strong><br>
            Horário: ${incident.time}
          </div>
        `);
    });

    // Add vehicles
    vehicles.forEach(vehicle => {
      const icon = vehicle.vehicleType === 'motorcycle' ? motorcycleIcon : carIcon;
      L.marker([vehicle.lat, vehicle.lng], { 
        icon: icon 
      }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong>${vehicle.vehicleType === 'motorcycle' ? 'Moto' : 'Viatura'} ${vehicle.plate}</strong><br>
            Tipo: ${vehicle.type}<br>
            Veículo: ${vehicle.vehicleType === 'motorcycle' ? 'Motocicleta' : 'Carro'}<br>
            Agentes: ${vehicle.agents.join(', ')}
          </div>
        `);
    });

    // Add risk areas
    risks.forEach(risk => {
      L.marker([risk.lat, risk.lng], { 
        icon: riskIcon 
      }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong>${risk.type}</strong><br>
            Severidade: <span style="color: ${risk.severity === 'Alto' ? '#dc2626' : risk.severity === 'Médio' ? '#f59e0b' : '#10b981'}">${risk.severity}</span>
          </div>
        `);
    });

    // Add accident spots
    accidents.forEach(accident => {
      L.marker([accident.lat, accident.lng], { 
        icon: accidentIcon 
      }).addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif;">
            <strong>${accident.type}</strong><br>
            Veículos envolvidos: ${accident.vehicles}
          </div>
        `);
    });

    // Add crime heat map layer
    const heatLayer = (L as any).heatLayer(crimeHeatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }).addTo(map);

    // Add layer control
    const baseLayers = {
      "Mapa Base": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    };

    const overlayLayers = {
      "Mapa de Calor - Crimes": heatLayer,
      "Delegacias": L.layerGroup(),
      "Agentes": L.layerGroup(),
      "Viaturas": L.layerGroup(),
      "Áreas de Risco": L.layerGroup(),
      "Acidentes": L.layerGroup()
    };

    L.control.layers(baseLayers, overlayLayers).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full rounded-lg z-0" />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .leaflet-container {
            z-index: 1 !important;
          }
          .leaflet-popup {
            z-index: 1000 !important;
          }
        `
      }} />
    </div>
  );
};

export default InteractiveMap;