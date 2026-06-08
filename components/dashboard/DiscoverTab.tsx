'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DynamicMap from './DynamicMap';

export default function DiscoverTab() {
  const [alerts, setAlerts]   = useState<any[]>([]);
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

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'feed' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_alert' && data.alert) {
          setAlerts(prev => [data.alert, ...prev.filter(a => a._id !== data.alert._id)]);
        }
      } catch (err) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--cs-border)] pb-4 flex items-end justify-between">
        <div>
          <div className="cs-accent-label mb-1">Global overview</div>
          <h2
            className="text-2xl font-bold text-[var(--cs-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            CAMPUS FEED
          </h2>
        </div>
        <button
          onClick={fetchAlerts}
          className="text-[var(--cs-muted)] hover:text-[var(--cs-teal)] transition-colors flex items-center gap-1.5 text-xs uppercase tracking-widest"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Map */}
      <div className="cs-panel-solid p-1">
        <DynamicMap alerts={alerts} />
      </div>

      {/* Alert list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--cs-teal)]">
            Active Threats
          </h3>
          <span className="cs-pill-red">{alerts.length} live</span>
        </div>

        {loading ? (
          <p className="text-[var(--cs-muted)] text-xs font-mono animate-pulse">Scanning campus frequencies...</p>
        ) : alerts.length === 0 ? (
          <div className="cs-panel p-8 text-center">
            <p className="text-[var(--cs-teal-bright)] text-sm font-bold tracking-widest uppercase">
              All clear — no active alerts.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {alerts.map((alert, i) => (
              <Link
                key={alert._id}
                href={`/track/${alert.trackToken}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="cs-panel p-5 flex items-start gap-4 hover:border-[var(--cs-teal)] transition-colors duration-200 h-full"
                >
                  <div className="bg-[var(--cs-surface-alt)] p-2 border border-[var(--cs-border)] shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[var(--cs-red-bright)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-[var(--cs-text)] text-sm truncate">{alert.type}</h4>
                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-[var(--cs-muted)] font-mono border border-[var(--cs-border)] px-1.5 py-0.5 bg-[var(--cs-surface)]">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] font-mono text-[var(--cs-muted)]">
                      <p>target: <span className="text-[var(--cs-text)]">{alert.studentId?.name || 'UNKNOWN'}</span></p>
                      <p>status: <span className="text-[var(--cs-red-bright)] font-bold">CRITICAL</span></p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
