'use client';

import { useAppearanceStore } from '@/store/useAppearanceStore';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, _hydrated } = useAppearanceStore();

  const isDark  = theme !== 'light-jade' && theme !== 'light-classic';
  const label   = _hydrated ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme';
  const icon    = _hydrated ? (isDark ? 'light_mode' : 'dark_mode') : 'dark_mode';

  const toggle = () => {
    // Toggle between Dark Cosmos ↔ Light Jade (the canonical dark/light pair)
    if (theme === 'light-jade') {
      setTheme('dark-cosmos');
    } else {
      setTheme('light-jade');
    }
  };

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
