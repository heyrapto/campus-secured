'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DynamicMap from '@/components/dashboard/DynamicMap';
import { CheckCircle, MapPin, Shield } from 'lucide-react';

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
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="w-full p-4 glass border-b border-white/5 sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">Security <span className="text-emerald-400">Command Center</span></h1>
        </div>
        <button onClick={() => router.push('/')} className="text-sm text-slate-400 hover:text-white">
          Back to Dashboard
        </button>
      </header>

      <main className="flex-1 p-4 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white">Live Operations Map</h2>
          <DynamicMap alerts={alerts} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Incidents ({alerts.length})</h2>
          
          {alerts.length === 0 ? (
            <div className="glass-panel p-6 text-center rounded-xl">
              <p className="text-emerald-400 font-medium">All clear. No active incidents.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              {alerts.map(alert => (
                <div key={alert._id} className="glass p-4 rounded-xl border-l-4 border-l-red-500 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{alert.type} Alert</h4>
                      <p className="text-sm text-slate-300">Student: {alert.studentId?.name}</p>
                      <p className="text-xs text-slate-400">{alert.studentId?.whatsapp || 'No WhatsApp'}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                    <button 
                      onClick={() => window.open(`https://wa.me/${alert.studentId?.whatsapp}`)}
                      disabled={!alert.studentId?.whatsapp}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => resolveAlert(alert._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
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
