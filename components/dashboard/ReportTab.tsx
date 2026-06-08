'use client';

import { useState } from 'react';
import { ShieldAlert, MapPin, CheckSquare } from 'lucide-react';

export default function ReportTab() {
  const [status, setStatus] = useState<'idle' | 'locating' | 'sent'>('idle');
  const [incidentType, setIncidentType] = useState('ROBBERY');
  const [trackToken, setTrackToken] = useState<string | null>(null);

  const triggerSOS = async () => {
    setStatus('locating');
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setStatus('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch('/api/alerts/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng, type: incidentType })
          });
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error);
          }

          setTrackToken(data.trackToken);
          setStatus('sent');
          startLocationStream(data.alertId, data.trackToken);
        } catch (err: any) {
          alert('Failed to send SOS: ' + err.message);
          setStatus('idle');
        }
      },
      () => {
        alert('Could not get location. Please enable GPS permissions.');
        setStatus('idle');
      },
      { enableHighAccuracy: true }
    );
  };

  const startLocationStream = (alertId: string, token: string) => {
    navigator.geolocation.watchPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        await fetch('/api/location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: token, lat, lng })
        });
      },
      console.error,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8">
      <div className="text-center space-y-2 border-b border-[var(--aero-border)] pb-6 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
          EMERGENCY PROTOCOL
        </h2>
        <p className="text-[var(--aero-muted)] text-sm font-mono uppercase tracking-widest">
          Initiate priority broadcast & GPS tracking
        </p>
      </div>

      <div className="w-full max-w-lg aero-panel p-8 flex flex-col items-center gap-8 relative overflow-hidden">
        
        {/* Decorative Grid Lines inside panel */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(var(--aero-border) 1px, transparent 1px), linear-gradient(90deg, var(--aero-border) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="w-full space-y-2 relative z-10">
          <label className="block text-xs uppercase tracking-widest text-[var(--aero-muted)] mb-2">Select Incident Type</label>
          <select
            value={incidentType}
            onChange={e => setIncidentType(e.target.value)}
            disabled={status !== 'idle'}
            className="aero-input font-bold tracking-widest uppercase text-sm"
          >
            <option value="ROBBERY">Robbery</option>
            <option value="MEDICAL">Medical Emergency</option>
            <option value="KIDNAP">Kidnapping</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="OTHER">Other Incident</option>
          </select>
        </div>

        <button
          onClick={triggerSOS}
          disabled={status !== 'idle'}
          className={`relative z-10 flex flex-col items-center justify-center w-full py-8 border-2 transition-all
            ${status === 'idle' ? 'bg-[var(--aero-pink)]/10 border-[var(--aero-pink)] text-[var(--aero-pink)] hover:bg-[var(--aero-pink)]/20' : 
              status === 'locating' ? 'bg-[var(--aero-panel-soft)] border-[var(--aero-muted)] text-[var(--aero-muted)]' : 'bg-[var(--aero-accent)]/10 border-[var(--aero-accent)] text-[var(--aero-accent)]'}`}
        >
          {status === 'idle' && (
            <>
              <ShieldAlert className="w-12 h-12 mb-3" />
              <span className="font-bold tracking-[0.3em] text-xl" style={{ fontFamily: 'var(--font-hero)' }}>TRIGGER SOS</span>
            </>
          )}
          
          {status === 'locating' && (
            <>
              <MapPin className="w-10 h-10 mb-3 animate-pulse" />
              <span className="font-bold tracking-widest uppercase text-sm">Acquiring GPS Signal...</span>
            </>
          )}

          {status === 'sent' && (
            <>
              <CheckSquare className="w-10 h-10 mb-3" />
              <span className="font-bold tracking-widest uppercase text-sm">Protocol Active</span>
            </>
          )}
        </button>

        {status === 'sent' && trackToken && (
          <div className="w-full relative z-10 bg-[var(--aero-panel-soft)] border border-[var(--aero-border)] p-4 text-center space-y-2">
            <p className="text-[var(--aero-accent-strong)] text-xs uppercase tracking-widest font-bold">>> Security Notified</p>
            <div className="bg-[var(--aero-bg)] border border-[var(--aero-border)] p-2 text-xs text-[var(--aero-muted)] break-all font-mono">
              [TRK] {window.location.origin}/track/{trackToken}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
