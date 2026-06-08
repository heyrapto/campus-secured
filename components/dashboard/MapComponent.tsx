'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js + Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ alerts = [] }: { alerts: any[] }) {
  const [positions, setPositions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    if (alerts.length === 0) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      alerts.forEach(alert => {
        const token = alert.trackToken || alert._id;
        ws.send(JSON.stringify({ type: 'subscribe', channel: `location:${token}` }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update' && data.trackToken) {
          const matchedAlert = alerts.find(a => a.trackToken === data.trackToken || a._id === data.trackToken);
          if (matchedAlert) {
            setPositions(prev => ({ ...prev, [matchedAlert._id]: [data.lat, data.lng] }));
          }
        }
      } catch (err) {}
    };

    return () => {
      ws.close();
    };
  }, [alerts]);

  // Default center (FUTMINNA approx coords or fallback)
  const defaultCenter: [number, number] = [9.5333, 6.4499];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl relative z-0 h-full min-h-[380px]">
      <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', minHeight: '380px', width: '100%' }}>
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {alerts.map(alert => {
          // If we have live position, use it, else fallback to initial alert position
          const pos = positions[alert._id] || [alert.lat, alert.lng];
          if (!pos) return null;

          return (
            <Marker key={alert._id} position={pos as [number, number]} icon={icon}>
              <Popup>
                <div className="text-slate-900">
                  <p className="font-bold">{alert.type} Alert</p>
                  <p className="text-sm">Student: {alert.studentId?.name || 'Unknown'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
