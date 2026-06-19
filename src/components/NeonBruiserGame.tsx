'use client';

import { useEffect, useRef } from 'react';
import { gameShellHtml } from '@/game/gameShell';

export default function NeonBruiserGame() {
  const rootRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current || initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    rootRef.current.innerHTML = gameShellHtml;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void import('@/game/neonBruiser').then(({ initNeonBruiser }) => {
      if (cancelled) {
        return;
      }

      cleanup = initNeonBruiser();
    });

    return () => {
      cancelled = true;
      cleanup?.();
      if (rootRef.current) {
        rootRef.current.innerHTML = '';
      }
      initializedRef.current = false;
    };
  }, []);

  return <div ref={rootRef} />;
}
