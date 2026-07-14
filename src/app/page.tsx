'use client';

import dynamic from 'next/dynamic';

const NeonBruiserGame = dynamic(() => import('@/components/NeonBruiserGame').then((mod) => mod.default), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Home() {
  return <NeonBruiserGame />;
}