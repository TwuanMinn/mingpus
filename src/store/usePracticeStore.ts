import { create } from 'zustand';

interface FlashcardState {
  cardsRemaining: number;
  score: number;
  streak: number;
  setCardsRemaining: (count: number) => void;
  incrementScore: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const usePracticeStore = create<FlashcardState>((set) => ({
  cardsRemaining: 0,
  score: 0,
  streak: 0,
  setCardsRemaining: (count) => set({ cardsRemaining: count }),
  incrementScore: () => set((state) => ({ score: state.score + 10 * (1 + state.streak * 0.1) })),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
}));
