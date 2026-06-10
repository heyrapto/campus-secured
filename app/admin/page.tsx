'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DynamicMap from '@/components/dashboard/DynamicMap';
import { CheckCircle, Shield, PhoneForwarded, Users, AlertTriangle, UserX, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incidents' | 'users'>('incidents');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      const role = (session.user as any).role;
      if (role !== 'admin' && role !== 'guard') {
        router.push('/');
      } else {
        fetchAlerts();
        fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
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

  const handleUserAction = async (userId: string, actionType: string) => {
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, actionType })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading' || loading) {
    return null;
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

      <main className="flex-1 cs-container py-8">
        <div className="flex gap-6 border-b border-[var(--cs-border)] mb-8">
          <button 
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'incidents' ? 'text-[var(--cs-teal)] border-b-2 border-[var(--cs-teal)]' : 'text-[var(--cs-muted)] hover:text-[var(--cs-text)]'}`}
            onClick={() => setActiveTab('incidents')}
          >
            Live Operations
          </button>
          <button 
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'users' ? 'text-[var(--cs-teal)] border-b-2 border-[var(--cs-teal)]' : 'text-[var(--cs-muted)] hover:text-[var(--cs-text)]'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        {activeTab === 'incidents' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--cs-border)] pb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-teal)]">Active Users</h2>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--cs-muted)]" />
                <span className="text-xs font-mono text-[var(--cs-muted)]">{users.length} Total</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <div key={user._id} className={`cs-panel p-5 border-l-2 flex flex-col gap-4 ${user.status === 'suspended' ? 'border-l-[var(--cs-red)] opacity-75' : 'border-l-[var(--cs-teal)]'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[var(--cs-text)] text-sm tracking-widest uppercase">{user.name}</h4>
                      <p className="text-xs text-[var(--cs-muted)] mt-1 font-mono">ID: {user.studentId}</p>
                    </div>
                    {user.status === 'suspended' ? (
                      <span className="cs-pill-red text-[8px]">Suspended</span>
                    ) : (
                      <span className="cs-pill-teal text-[8px]">Active</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-[var(--cs-muted)] font-mono space-y-1">
                    <p>WhatsApp: {user.whatsapp || 'N/A'}</p>
                    <p className={user.falseAlarms > 0 ? 'text-[var(--cs-red-bright)]' : ''}>
                      False Alarms: {user.falseAlarms || 0}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-[var(--cs-border)]">
                    <button 
                      onClick={() => handleUserAction(user._id, 'FLAG_FALSE_ALARM')}
                      className="flex-1 cs-btn-ghost min-h-8 py-0 text-[9px]"
                      title="Flag False Alarm"
                    >
                      <AlertTriangle className="w-3 h-3 text-[var(--cs-red-bright)]" /> Flag
                    </button>
                    {user.status === 'suspended' ? (
                      <button 
                        onClick={() => handleUserAction(user._id, 'ACTIVATE')}
                        className="flex-1 cs-btn-primary min-h-8 py-0 text-[9px]"
                      >
                        <UserCheck className="w-3 h-3" /> Activate
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleUserAction(user._id, 'SUSPEND')}
                        className="flex-1 cs-btn-danger min-h-8 py-0 text-[9px]"
                      >
                        <UserX className="w-3 h-3" /> Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
