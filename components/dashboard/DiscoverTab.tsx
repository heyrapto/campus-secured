'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import DynamicMap from './DynamicMap';

export default function DiscoverTab() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-[var(--aero-border)] pb-4">
        <h2 className="text-2xl font-bold text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
          CAMPUS FEED
        </h2>
        <p className="text-[var(--aero-muted)] text-xs uppercase tracking-widest mt-1">Global operations overview</p>
      </div>

      <div className="aero-panel p-1">
        <DynamicMap alerts={alerts} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--aero-accent)] border-b border-[var(--aero-border)] pb-2">
          Active Threats ({alerts.length})
        </h3>
        
        {loading ? (
          <div className="text-[var(--aero-muted)] text-xs font-mono animate-pulse">Scanning frequencies...</div>
        ) : alerts.length === 0 ? (
          <div className="aero-panel p-6 text-center">
            <p className="text-[var(--aero-accent-strong)] text-sm font-bold tracking-widest uppercase">System nominal. No active alerts.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert, i) => (
              <motion.div 
                key={alert._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="aero-panel p-4 flex items-start gap-4 border-l-2 border-l-[var(--aero-pink)]"
              >
                <div className="bg-[var(--aero-pink)]/10 p-2 border border-[var(--aero-pink)]/30">
                  <AlertTriangle className="w-5 h-5 text-[var(--aero-pink)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[var(--aero-text)] truncate">{alert.type} INCIDENT</h4>
                    <span className="text-[10px] text-[var(--aero-muted)] flex items-center gap-1 bg-[var(--aero-bg)] px-2 border border-[var(--aero-border)]">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--aero-muted)] mt-2 font-mono space-y-1">
                    <p>TARGET: <span className="text-[var(--aero-text)]">{alert.studentId?.name || 'UNKNOWN'}</span></p>
                    <p>STATUS: <span className="text-[var(--aero-pink)] animate-pulse">CRITICAL</span></p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
