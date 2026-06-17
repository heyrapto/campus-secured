'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldAlert, MapPin, CheckSquare, Shield, Activity, UserX, MessageSquare, AlertCircle, ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

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

          if (!res.ok) throw new Error(data.error);

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

  const startLocationStream = (_alertId: string, token: string) => {
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

  const idleClasses   = 'bg-[var(--cs-surface-alt)] border-[var(--cs-border)] text-[var(--cs-red-bright)] hover:border-[var(--cs-red)]/50 hover:bg-[var(--cs-red)]/5';
  const locatingClasses = 'bg-[var(--cs-surface-alt)] border-[var(--cs-border)] text-[var(--cs-muted)]';
  const sentClasses   = 'bg-[var(--cs-surface-alt)] border-[var(--cs-teal)]/45 text-[var(--cs-teal-bright)]';

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8">
      <div className="text-center space-y-2 border-b border-[var(--cs-border)] pb-6 w-full max-w-lg">
        <h2
          className="text-3xl font-bold text-[var(--cs-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          EMERGENCY PROTOCOL
        </h2>
        <p className="text-[var(--cs-muted)] text-sm font-mono uppercase tracking-widest">
          Initiate priority broadcast &amp; GPS tracking
        </p>
      </div>

      <div className="w-full max-w-lg cs-panel p-8 flex flex-col items-center gap-8 relative overflow-hidden">

        {/* Subtle inner grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(var(--cs-border) 1px, transparent 1px), linear-gradient(90deg, var(--cs-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

       <div className="w-full space-y-2 relative z-10">
  <label className="cs-overline block mb-2">Select Incident Type</label>
  <IncidentDropdown
    value={incidentType as IncidentValue}
    onChange={setIncidentType}
    disabled={status !== 'idle'}
  />
</div>

        <button
          onClick={triggerSOS}
          disabled={status !== 'idle'}
          className={`relative z-10 flex flex-col items-center justify-center w-full py-10 border transition-all cursor-pointer disabled:cursor-not-allowed ${
            status === 'idle' ? idleClasses : status === 'locating' ? locatingClasses : sentClasses
          }`}
        >
          {status === 'idle' && (
            <>
              <ShieldAlert className="w-12 h-12 mb-3" />
              <span className="font-bold tracking-[0.3em] text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                TRIGGER SOS
              </span>
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
          <div className="w-full relative z-10 bg-[var(--cs-surface-alt)] border border-[var(--cs-border)] p-4 text-center space-y-2">
            <p className="text-[var(--cs-teal-bright)] text-xs uppercase tracking-widest font-bold">
              Security Notified
            </p>
            <div className="bg-[var(--cs-bg)] border border-[var(--cs-border)] p-2 text-xs text-[var(--cs-muted)] break-all font-mono">
              [TRK] {window.location.origin}/track/{trackToken}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const INCIDENT_TYPES = [
  { value: 'ROBBERY',    label: 'Robbery',           code: 'INC-001', severity: 'CRITICAL', desc: 'Theft by force or threat',           icon: Shield,        sevClass: 'text-[var(--cs-red-bright)] border-red-800/40 bg-red-950/30' },
  { value: 'MEDICAL',    label: 'Medical Emergency',  code: 'INC-002', severity: 'HIGH',     desc: 'Injury or health crisis',            icon: Activity,      sevClass: 'text-orange-400 border-orange-800/40 bg-orange-950/30' },
  { value: 'KIDNAP',     label: 'Kidnapping',         code: 'INC-003', severity: 'CRITICAL', desc: 'Abduction or unlawful detention',    icon: UserX,         sevClass: 'text-[var(--cs-red-bright)] border-red-800/40 bg-red-950/30' },
  { value: 'HARASSMENT', label: 'Harassment',         code: 'INC-004', severity: 'MEDIUM',   desc: 'Intimidation or unwanted conduct',   icon: MessageSquare, sevClass: 'text-yellow-400 border-yellow-800/40 bg-yellow-950/30' },
  { value: 'OTHER',      label: 'Other Incident',     code: 'INC-005', severity: 'LOW',      desc: 'Unclassified campus incident',       icon: AlertCircle,   sevClass: 'text-[var(--cs-teal-bright)] border-teal-800/40 bg-teal-950/30' },
] as const;

type IncidentValue = typeof INCIDENT_TYPES[number]['value'];

function IncidentDropdown({ value, onChange, disabled }: {
  value: IncidentValue;
  onChange: (v: IncidentValue) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = INCIDENT_TYPES.find(t => t.value === value)!;
  const Icon = selected.icon;

  const positionMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) positionMenu();
  }, [open, positionMenu]);

  useEffect(() => {
    const onScroll = () => { if (open) positionMenu(); };
    const onResize = () => { if (open) positionMenu(); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, positionMenu]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menu = open ? (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-[#0d1014] border border-[var(--cs-teal)] overflow-y-auto max-h-72"
    >
      <div className="px-4 py-2 border-b border-[var(--cs-border)] flex items-center justify-between sticky top-0 bg-[#0d1014]">
        <span className="text-[9px] tracking-[0.25em] uppercase text-[var(--cs-teal-bright)]">
          Incident Classification
        </span>
        <span className="text-[9px] text-[var(--cs-muted)]">5 types</span>
      </div>

      {INCIDENT_TYPES.map(type => {
        const TIcon = type.icon;
        const isSelected = type.value === value;
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => { onChange(type.value); setOpen(false); }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-[var(--cs-border)]/50 last:border-0 transition-colors relative
              ${isSelected ? 'bg-teal-950/20' : 'hover:bg-teal-950/10'}
            `}
          >
            {isSelected && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cs-teal-bright)]" />
            )}
            <div className={`w-[26px] h-[26px] flex items-center justify-center border flex-shrink-0 ${
              isSelected ? 'border-[var(--cs-teal)] bg-teal-950/30' : 'border-[var(--cs-border)]'
            }`}>
              <TIcon className={`w-3 h-3 ${isSelected ? 'text-[var(--cs-teal-bright)]' : 'text-[var(--cs-muted)]'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--cs-text)]">
                {type.label}
              </div>
              <div className="text-[9px] text-[var(--cs-muted)] mt-0.5 tracking-wide">
                {type.desc}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`text-[9px] tracking-[0.15em] ${isSelected ? 'text-[var(--cs-teal)]' : 'text-[var(--cs-border)]'} font-bold`}>
                {type.code}
              </span>
              <span className={`text-[8px] px-1.5 py-px tracking-[0.1em] uppercase border ${type.sevClass}`}>
                {type.severity}
              </span>
            </div>
            <div className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-[var(--cs-teal-bright)]' : 'invisible'}`}>
              {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </div>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`
          w-full h-[52px] px-4 flex items-center justify-between
          bg-[var(--cs-surface-alt)] border transition-colors
          disabled:cursor-not-allowed
          ${open ? 'border-[var(--cs-teal)]' : 'border-[var(--cs-border)] hover:border-[#2e3540]'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center border border-red-900/40 bg-red-950/20">
            <Icon className="w-3.5 h-3.5 text-[var(--cs-red-bright)]" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--cs-text)]">
              {selected.label}
            </div>
            <div className="text-[9px] tracking-[0.12em] text-[var(--cs-muted)] mt-0.5">
              {selected.code} · PRIORITY: {selected.severity}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
            selected.severity === 'CRITICAL' ? 'bg-[var(--cs-red-bright)]' :
            selected.severity === 'HIGH'     ? 'bg-orange-400' :
            selected.severity === 'MEDIUM'   ? 'bg-yellow-400' :
            'bg-[var(--cs-teal-bright)]'
          }`} />
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--cs-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {typeof document !== 'undefined' && createPortal(menu, document.body)}
    </div>
  );
}