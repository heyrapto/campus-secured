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
    // Start SSE connections for each active alert to get live location
    const eventSources: EventSource[] = [];

    alerts.forEach(alert => {
      // Use trackToken for tracking
      const es = new EventSource(`/api/location/stream?alertId=${alert.trackToken || alert._id}`);
      es.onmessage = e => {
        try {
          const { lat, lng } = JSON.parse(e.data);
          setPositions(prev => ({ ...prev, [alert._id]: [lat, lng] }));
        } catch (err) {}
      };
      eventSources.push(es);
    });

    return () => {
      eventSources.forEach(es => es.close());
    };
  }, [alerts]);

  // Default center (FUTMINNA approx coords or fallback)
  const defaultCenter: [number, number] = [9.5333, 6.4499];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl relative z-0">
      <MapContainer center={defaultCenter} zoom={14} style={{ height: '400px', width: '100%' }}>
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
