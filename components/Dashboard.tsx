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

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40">
        <div className="cs-container flex justify-between items-center py-5">

          {/* Logo — icon in bordered box + wordmark */}
          <div className="flex items-center gap-3 font-bold">
            <span className="grid place-items-center w-9 h-9 border border-[var(--cs-border)] bg-[var(--cs-teal)]/10 shrink-0">
              <Shield className="w-4 h-4 text-[var(--cs-teal)]" />
            </span>
            <span
              className="text-sm font-bold tracking-widest text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CAMPUS SHIELD
            </span>
          </div>

          {/* Right — user badge + logout */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end leading-none gap-1">
              <span className="text-xs font-bold text-[var(--cs-text)] truncate max-w-[140px]">
                {session?.user?.name}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--cs-teal)] font-mono">
                {role}
              </span>
            </div>

            <div className="w-px h-6 bg-[var(--cs-border)] hidden sm:block" />

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────── */}
      <main className="flex-1 cs-container py-8 pb-28">
        {activeTab === 'report'   && <ReportTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'warn' && isAdminOrGuard && <WarnTab />}
      </main>

      {/* ── Bottom Tab Nav ─────────────────────────────── */}
      <nav className="fixed bottom-0 w-full bg-[var(--cs-bg)]/95 backdrop-blur-md border-t border-[var(--cs-border)] z-40">
        <div className="max-w-xs mx-auto flex items-stretch">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? 'text-[var(--cs-teal-bright)]'
                    : 'text-[var(--cs-muted)] hover:text-[var(--cs-text)]'
                }`}
              >
                {/* Active indicator — top line */}
                {active && (
                  <span className="absolute top-0 left-4 right-4 h-px bg-[var(--cs-teal)]" />
                )}
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
