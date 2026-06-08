'use client';

import { useSession } from 'next-auth/react';
import Landing from '@/components/Landing';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (session) {
    return <Dashboard />;
  }

  return <Landing />;
}
