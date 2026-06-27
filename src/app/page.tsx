'use client';

import dynamic from 'next/dynamic';

const NeonBruiserGame = dynamic(() => import('@/components/NeonBruiserGame'), {
  ssr: false,
});

export default function Home() {
  return <NeonBruiserGame />;
}