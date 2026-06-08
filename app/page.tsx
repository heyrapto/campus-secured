'use client';

import { useSession } from 'next-auth/react';
import Landing from '@/components/Landing';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return <Landing />;
}
