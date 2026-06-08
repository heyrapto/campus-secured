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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 border-b border-[var(--aero-border)] bg-[var(--aero-panel)]/80 backdrop-blur-sm sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3 aero-container m-0">
          <Shield className="w-6 h-6 text-[var(--aero-accent)]" />
          <h1 className="text-xl font-bold tracking-widest text-[var(--aero-text)]" style={{ fontFamily: 'var(--font-hero)' }}>
            CONTROL PLANE
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[var(--aero-accent-strong)] hidden sm:inline-block border border-[var(--aero-accent)]/30 px-2 py-1 bg-[var(--aero-accent)]/10">
            user_id: {session?.user?.name} [{role}]
          </span>
          <button 
            onClick={() => signOut()}
            className="text-[var(--aero-muted)] hover:text-[var(--aero-pink)] transition-colors p-2 flex items-center gap-2 uppercase tracking-widest"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 w-full aero-container pb-24 mt-4">
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'warn' && isAdminOrGuard && <WarnTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full border-t border-[var(--aero-border)] bg-[var(--aero-panel)] px-6 py-4 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold">
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'report' ? 'text-[var(--aero-accent-strong)]' : 'text-[var(--aero-muted)] hover:text-white'}`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Report</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'discover' ? 'text-[var(--aero-accent-strong)]' : 'text-[var(--aero-muted)] hover:text-white'}`}
          >
            <Map className="w-5 h-5" />
            <span>Discover</span>
          </button>

          {isAdminOrGuard && (
            <button 
              onClick={() => setActiveTab('warn')}
              className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'warn' ? 'text-[var(--aero-accent-strong)]' : 'text-[var(--aero-muted)] hover:text-white'}`}
            >
              <Bell className="w-5 h-5" />
              <span>Warn</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
