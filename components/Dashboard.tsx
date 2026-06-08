'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Shield, AlertTriangle, Map, Bell, LogOut } from 'lucide-react';
import ReportTab from './dashboard/ReportTab';
import DiscoverTab from './dashboard/DiscoverTab';
import WarnTab from './dashboard/WarnTab';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('report');

  const role = (session?.user as any)?.role || 'student';
  const isAdminOrGuard = role === 'admin' || role === 'guard';

  const tabs = [
    { id: 'report',   label: 'Report',   Icon: AlertTriangle },
    { id: 'discover', label: 'Discover', Icon: Map },
    ...(isAdminOrGuard ? [{ id: 'warn', label: 'Warn', Icon: Bell }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[var(--cs-border)] bg-[var(--cs-surface)]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="cs-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[var(--cs-teal)]" />
            <h1
              className="text-base font-bold tracking-widest text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CAMPUS SHIELD
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="hidden sm:inline-block cs-pill-teal">
              {session?.user?.name} · {role}
            </span>
            <button
              onClick={() => signOut()}
              className="text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors flex items-center gap-2 uppercase tracking-widest"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 cs-container py-8 pb-28">
        {activeTab === 'report'   && <ReportTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'warn' && isAdminOrGuard && <WarnTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full border-t border-[var(--cs-border)] bg-[var(--cs-surface)] z-40">
        <div className="max-w-sm mx-auto flex justify-around items-center py-3">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1.5 px-4 transition-colors text-[10px] font-bold uppercase tracking-[0.18em] ${
                  active
                    ? 'text-[var(--cs-teal-bright)]'
                    : 'text-[var(--cs-muted)] hover:text-[var(--cs-text)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
