import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PracticeState {
  cardsRemaining: number;
  score: number;
  streak: number;
  mastered: number;
  reviewed: number;
  setCardsRemaining: (count: number) => void;
  incrementScore: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  recordMastered: () => void;
  recordReviewed: () => void;
  resetSession: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      cardsRemaining: 0,
      score: 0,
      streak: 0,
      mastered: 0,
      reviewed: 0,
      setCardsRemaining: (count) => set({ cardsRemaining: count }),
      incrementScore: () => set((state) => ({ score: state.score + 10 * (1 + state.streak * 0.1) })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      recordMastered: () => set((state) => ({ mastered: state.mastered + 1 })),
      recordReviewed: () => set((state) => ({ reviewed: state.reviewed + 1 })),
      resetSession: () => set({ cardsRemaining: 0, score: 0, streak: 0, mastered: 0, reviewed: 0 }),
    }),
    {
      name: 'dc-practice-session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
