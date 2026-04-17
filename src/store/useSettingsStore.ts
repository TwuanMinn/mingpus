import { create } from 'zustand';

export type SpeechRate = 'slow' | 'normal' | 'fast';
export type DailyGoal = 10 | 20 | 50 | 100;
export type FontSize = 'small' | 'medium' | 'large';

interface SettingsState {
  // Audio
  autoPlayTTS: boolean;
  speechRate: SpeechRate;
  // Study
  dailyGoal: DailyGoal;
  showPinyinByDefault: boolean;
  enableCardAnimations: boolean;
  // Appearance
  fontSize: FontSize;
  // Setters
  setAutoPlayTTS: (v: boolean) => void;
  setSpeechRate: (v: SpeechRate) => void;
  setDailyGoal: (v: DailyGoal) => void;
  setShowPinyinByDefault: (v: boolean) => void;
  setEnableCardAnimations: (v: boolean) => void;
  setFontSize: (v: FontSize) => void;
  // Hydration
  _hydrated: boolean;
  _hydrate: () => void;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const useSettingsStore = create<SettingsState>((set) => ({
  autoPlayTTS: false,
  speechRate: 'normal',
  dailyGoal: 20,
  showPinyinByDefault: true,
  enableCardAnimations: true,
  fontSize: 'medium',
  _hydrated: false,

  _hydrate: () => {
    if (typeof window === 'undefined') return;
    set({
      autoPlayTTS: load('dc-autoPlayTTS', false),
      speechRate: load<SpeechRate>('dc-speechRate', 'normal'),
      dailyGoal: load<DailyGoal>('dc-dailyGoal', 20),
      showPinyinByDefault: load('dc-showPinyin', true),
      enableCardAnimations: load('dc-cardAnim', true),
      fontSize: load<FontSize>('dc-fontSize', 'medium'),
      _hydrated: true,
    });
  },

  setAutoPlayTTS: (v) => { save('dc-autoPlayTTS', v); set({ autoPlayTTS: v }); },
  setSpeechRate: (v) => { save('dc-speechRate', v); set({ speechRate: v }); },
  setDailyGoal: (v) => { save('dc-dailyGoal', v); set({ dailyGoal: v }); },
  setShowPinyinByDefault: (v) => { save('dc-showPinyin', v); set({ showPinyinByDefault: v }); },
  setEnableCardAnimations: (v) => { save('dc-cardAnim', v); set({ enableCardAnimations: v }); },
  setFontSize: (v) => { save('dc-fontSize', v); set({ fontSize: v }); },
}));
