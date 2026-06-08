'use client';

import dynamic from 'next/dynamic';

// Next.js requires dynamic import with SSR disabled for Leaflet to work correctly.
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-900 animate-pulse rounded-2xl flex items-center justify-center text-slate-500">Loading Map...</div>
});

export default DynamicMap;
