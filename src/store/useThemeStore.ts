import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  _hydrated: boolean;
  _hydrate: () => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  try { localStorage.setItem('dc-theme', theme); } catch {}
}

export const useThemeStore = create<ThemeState>((set) => ({
  // Start with 'light' on both server and client to avoid hydration mismatch.
  // The real value is resolved in _hydrate() which runs client-side only.
  theme: 'light',
  _hydrated: false,

  _hydrate: () => {
    if (typeof window === 'undefined') return;
    let stored: Theme = 'light';
    try {
      const val = localStorage.getItem('dc-theme');
      if (val === 'dark' || val === 'light') {
        stored = val;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        stored = 'dark';
      }
    } catch {}
    applyTheme(stored);
    set({ theme: stored, _hydrated: true });
  },

  toggle: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return { theme: next };
    }),

  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
}));
