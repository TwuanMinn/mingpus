'use client';

import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle, _hydrated, _hydrate } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!_hydrated) _hydrate();
    setMounted(true);
  }, [_hydrated, _hydrate]);

  const label = mounted
    ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`
    : 'Toggle theme';
  const icon = mounted
    ? (theme === 'light' ? 'dark_mode' : 'light_mode')
    : 'dark_mode';

  return (
    <button
      onClick={toggle}
      className={`hover:opacity-80 transition-opacity p-1 ${className}`}
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      <span className="material-symbols-outlined text-[20px] sm:text-[24px]" suppressHydrationWarning>
        {icon}
      </span>
    </button>
  );
}
