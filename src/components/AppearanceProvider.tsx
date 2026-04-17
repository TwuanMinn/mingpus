'use client';

import { useEffect } from 'react';
import { useAppearanceStore } from '@/store/useAppearanceStore';

/**
 * Mounted once at the root. Reads appearance preferences from localStorage
 * and applies them to <html> on every page load before first paint (as much
 * as possible client-side). Keeps the Zustand store in sync.
 */
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const { _hydrated, _hydrate } = useAppearanceStore();

  useEffect(() => {
    if (!_hydrated) _hydrate();
  }, [_hydrated, _hydrate]);

  return <>{children}</>;
}
