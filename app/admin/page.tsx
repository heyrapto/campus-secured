'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DynamicMap from '@/components/dashboard/DynamicMap';
import { CheckCircle, Shield, PhoneForwarded } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      const role = (session.user as any).role;
      if (role !== 'admin' && role !== 'guard') {
        router.push('/');
      } else {
        fetchAlerts();
      }
    }
  }, [status, session, router]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts/active');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-[var(--cs-bg)] flex items-center justify-center text-[var(--cs-text)] font-mono uppercase tracking-widest text-sm animate-pulse">Initializing Control Plane...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-[var(--cs-border)] bg-[var(--cs-surface)]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="cs-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[var(--cs-teal)]" />
            <h1 className="text-base font-bold tracking-widest text-[var(--cs-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              SECURITY COMMAND CENTER
            </h1>
          </div>
          <button onClick={() => router.push('/')} className="cs-btn-ghost py-1 px-3 min-h-8 text-[10px]">
            &larr; Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 cs-container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-teal)] border-b border-[var(--cs-border)] pb-2">Live Operations Map</h2>
          <div className="cs-panel-solid p-1">
            <DynamicMap alerts={alerts} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--cs-border)] pb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-red-bright)]">Active Incidents</h2>
            <span className="cs-pill-red">{alerts.length}</span>
          </div>
          
          {alerts.length === 0 ? (
            <div className="cs-panel p-6 text-center border-l-2 border-[var(--cs-teal)]">
              <p className="text-[var(--cs-teal-bright)] text-xs font-bold tracking-widest uppercase font-mono">All clear. No active incidents.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {alerts.map(alert => (
                <div key={alert._id} className="cs-panel p-5 border-l-2 border-l-[var(--cs-red)] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[var(--cs-text)] text-sm tracking-widest uppercase">{alert.type} ALERT</h4>
                      <p className="text-xs text-[var(--cs-muted)] mt-1 font-mono">Target: {alert.studentId?.name}</p>
                      <p className="text-xs text-[var(--cs-muted)] font-mono mt-0.5">Contact: {alert.studentId?.whatsapp || 'NO WA'}</p>
                    </div>
                    <span className="text-[10px] text-[var(--cs-muted)] font-mono border border-[var(--cs-border)] px-1.5 py-0.5">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`https://wa.me/${alert.studentId?.whatsapp}`)}
                      disabled={!alert.studentId?.whatsapp}
                      className="flex-1 cs-btn-ghost min-h-9 py-0 text-[10px]"
                    >
                      <PhoneForwarded className="w-3 h-3" /> WhatsApp
                    </button>
                    <button 
                      onClick={() => resolveAlert(alert._id)}
                      className="flex-1 cs-btn-primary min-h-9 py-0 text-[10px]"
                    >
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
