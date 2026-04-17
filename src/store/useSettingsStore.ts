import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPlayTTS: false,
      speechRate: 'normal',
      dailyGoal: 20,
      showPinyinByDefault: true,
      enableCardAnimations: true,
      fontSize: 'medium',

      setAutoPlayTTS: (v) => set({ autoPlayTTS: v }),
      setSpeechRate: (v) => set({ speechRate: v }),
      setDailyGoal: (v) => set({ dailyGoal: v }),
      setShowPinyinByDefault: (v) => set({ showPinyinByDefault: v }),
      setEnableCardAnimations: (v) => set({ enableCardAnimations: v }),
      setFontSize: (v) => set({ fontSize: v }),
    }),
    {
      name: 'dc-settings-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
);
