import { create } from 'zustand';

export type AppTheme    = 'dark-cosmos' | 'light-jade' | 'light-classic' | 'ink-scroll' | 'sunset';
export type AppFontSize = 'small' | 'medium' | 'large' | 'xl';

export interface AppearanceState {
  theme:          AppTheme;
  fontSize:       AppFontSize;
  accentColor:    string;
  showPinyin:     boolean;
  useTraditional: boolean;

  setTheme:          (v: AppTheme)    => void;
  setFontSize:       (v: AppFontSize) => void;
  setAccentColor:    (v: string)      => void;
  setShowPinyin:     (v: boolean)     => void;
  setUseTraditional: (v: boolean)     => void;

  _hydrated: boolean;
  _hydrate:  () => void;
}

const KEY = 'dc-appearance';

const DEFAULTS = {
  theme:          'dark-cosmos' as AppTheme,
  fontSize:       'medium'      as AppFontSize,
  accentColor:    '#7C6FF7',
  showPinyin:     true,
  useTraditional: false,
};

// ── DOM application ────────────────────────────────────────────────────────

export function applyAppearanceToDom(state: Pick<AppearanceState, 'theme' | 'fontSize' | 'accentColor'>) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;

  // 1. Dark / light class
  const isDark = state.theme !== 'light-jade' && state.theme !== 'light-classic';
  html.classList.toggle('dark',  isDark);
  html.classList.toggle('light', !isDark);

  // 2. data-theme attribute (drives CSS overrides in globals.css)
  if (state.theme === 'dark-cosmos') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', state.theme);
  }

  // 3. Accent color → override --color-primary only for themes that don't
  //    have their own strong palette (ink-scroll / sunset use CSS overrides)
  if (state.theme === 'dark-cosmos' || state.theme === 'light-jade' || state.theme === 'light-classic') {
    html.style.setProperty('--color-primary', state.accentColor);
    const hex = state.accentColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    html.style.setProperty('--color-on-primary', lum > 0.55 ? '#111111' : '#ffffff');
  } else {
    html.style.removeProperty('--color-primary');
    html.style.removeProperty('--color-on-primary');
  }

  // 4. Font size
  html.setAttribute('data-fontsize', state.fontSize);
}

function save(partial: Partial<typeof DEFAULTS>) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    localStorage.setItem(KEY, JSON.stringify({ ...existing, ...partial }));
  } catch {}
  // Also write theme to a cookie so the server layout can read it
  if (partial.theme !== undefined) {
    try {
      document.cookie = `dc-theme=${partial.theme};path=/;max-age=31536000;SameSite=Lax`;
    } catch {}
  }
}

function load(): typeof DEFAULTS {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  ...DEFAULTS,
  _hydrated: false,

  _hydrate: () => {
    if (typeof window === 'undefined') return;
    const stored = load();
    applyAppearanceToDom(stored);
    set({ ...stored, _hydrated: true });
  },

  setTheme: (v) => {
    save({ theme: v });
    applyAppearanceToDom({ theme: v, fontSize: get().fontSize, accentColor: get().accentColor });
    set({ theme: v });
  },

  setFontSize: (v) => {
    save({ fontSize: v });
    applyAppearanceToDom({ theme: get().theme, fontSize: v, accentColor: get().accentColor });
    set({ fontSize: v });
  },

  setAccentColor: (v) => {
    save({ accentColor: v });
    applyAppearanceToDom({ theme: get().theme, fontSize: get().fontSize, accentColor: v });
    set({ accentColor: v });
  },

  setShowPinyin: (v) => {
    save({ showPinyin: v });
    set({ showPinyin: v });
  },

  setUseTraditional: (v) => {
    save({ useTraditional: v });
    set({ useTraditional: v });
  },
}));
