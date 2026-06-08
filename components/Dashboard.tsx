'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield,
  AlertTriangle,
  Map,
  Bell,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

import ReportTab from './dashboard/ReportTab';
import DiscoverTab from './dashboard/DiscoverTab';
import IncidentTab from './dashboard/IncidentTab';
import WarnTab from './dashboard/WarnTab';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('report');

  const role = (session?.user as any)?.role || 'student';
  const isAdminOrGuard = role === 'admin' || role === 'guard';

  const tabs = [
    { id: 'report', label: 'SOS', Icon: AlertTriangle },
    { id: 'incident', label: 'Nearby', Icon: ShieldAlert },
    { id: 'discover', label: 'Feed', Icon: Map },
    ...(isAdminOrGuard
      ? [{ id: 'warn', label: 'Broadcast', Icon: Bell }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--cs-border)] bg-[var(--cs-bg)]/90 backdrop-blur-md">
        <div className="cs-container flex items-center justify-between py-3">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--cs-teal)]" />

            <span
              className="text-sm font-bold tracking-wide text-[var(--cs-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              CAMPUS SHIELD
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">

            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-medium text-[var(--cs-text)]">
                {session?.user?.name}
              </p>

              <p className="text-[10px] text-[var(--cs-muted)] uppercase">
                {role}
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="text-[var(--cs-muted)] hover:text-[var(--cs-red-bright)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 cs-container py-6 pb-24">
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'incident' && <IncidentTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'warn' && isAdminOrGuard && <WarnTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--cs-border)] bg-[var(--cs-bg)]/95 backdrop-blur-md z-40">
        <div className="max-w-lg mx-auto flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active
                    ? 'text-[var(--cs-teal-bright)]'
                    : 'text-[var(--cs-muted)]'
                }`}
              >
                <Icon className="w-4 h-4" />

                <span className="text-[10px] font-medium">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}