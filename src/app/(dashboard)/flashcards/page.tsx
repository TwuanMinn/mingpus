'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { Flashcard } from '@/components/Flashcard';
import { SpeakButton } from '@/components/SpeakButton';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function FlashcardsPage() {
  usePageTitle('Flashcards');
  const { data: decksData } = trpc.getDecks.useQuery();
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const { data: cards } = trpc.getCardsForDeck.useQuery(
    { deckId: selectedDeckId! },
    { enabled: !!selectedDeckId }
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [again, setAgain] = useState(0);

  const decks = decksData ?? [];
  const cardList = cards ?? [];
  const card = cardList[currentIndex];
  const total = cardList.length;

  const handleResult = (correct: boolean) => {
    if (correct) {
      setMastered(m => m + 1);
    } else {
      setAgain(a => a + 1);
    }
    // Small delay for animation before advancing
    setTimeout(() => {
      setCurrentIndex(i => Math.min(total - 1, i + 1));
    }, 200);
  };

  const handleNext = () => {
    setCurrentIndex(i => Math.min(total - 1, i + 1));
  };

  const handlePrev = () => {
    setCurrentIndex(i => Math.max(0, i - 1));
  };

  // Keyboard navigation: arrow keys for prev/next
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Deck selector
  if (!selectedDeckId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-24 md:pb-8">
        <div className="space-y-2 mb-8">
          <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold tracking-[0.1em] text-primary uppercase">Flashcards</span>
          <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface">Choose a Deck</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Available decks">
          {decks.map(d => (
            <button key={d.id} onClick={() => { setSelectedDeckId(d.id); setCurrentIndex(0); setMastered(0); setAgain(0); }}
              className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 text-left hover:bg-primary-fixed transition-colors group" role="listitem" aria-label={`${d.title}, ${d.cardCount} cards`}>
              <h3 className="text-lg sm:text-xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface group-hover:text-primary mb-2">{d.title}</h3>
              <p className="text-sm text-on-surface-variant">{d.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{d.cardCount} cards</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Session complete — all cards reviewed
  if (currentIndex >= total && total > 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col items-center justify-center pb-24 md:pb-8 text-center space-y-6">
        <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
        <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Deck Complete!</h1>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <span className="text-2xl font-bold text-primary block">{mastered}</span>
            <span className="text-on-surface-variant">Got It</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-error block">{again}</span>
            <span className="text-on-surface-variant">Again</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setCurrentIndex(0); setMastered(0); setAgain(0); }} className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
            Restart Deck
          </button>
          <button onClick={() => setSelectedDeckId(null)} className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-colors">
            Choose Another
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col items-center justify-center pb-24 md:pb-8">
        <p className="text-on-surface-variant text-sm mb-4">No cards in this deck.</p>
        <button onClick={() => setSelectedDeckId(null)} className="text-primary font-bold text-sm hover:underline">← Back to decks</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col items-center pb-24 md:pb-8">
      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-8 sm:mb-12 flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-end">
          <div>
            <button onClick={() => setSelectedDeckId(null)} className="text-[0.625rem] sm:text-[0.6875rem] font-bold tracking-[0.1em] text-primary uppercase hover:underline" aria-label="Go back to deck selection">
              ← {decks.find(d => d.id === selectedDeckId)?.title ?? 'Deck'}
            </button>
            <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface">Flashcard Review</h1>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Card {currentIndex + 1} of {total}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(((currentIndex + 1) / total) * 100)} aria-valuemax={100}>
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / total) * 100}%` }}></div>
        </div>
      </div>

      {/* Framer Motion Flashcard Component */}
      <Flashcard
        key={card.id}
        character={card.character}
        pinyin={card.pinyin}
        meaning={card.meaning}
        onResult={handleResult}
      />

      {/* Navigation Controls */}
      <div className="w-full max-w-sm mt-8 sm:mt-12 flex gap-3 sm:gap-4">
        <button onClick={handlePrev} disabled={currentIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-surface-container-low text-on-surface-variant rounded-xl hover:bg-surface-container-high transition-all active:scale-95 text-sm sm:text-base disabled:opacity-30"
          aria-label="Previous card (Left Arrow)">
          <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chevron_left</span>
          <span className="font-bold">Prev</span>
        </button>
        <button onClick={handleNext} disabled={currentIndex >= total - 1}
          className="flex-[1.5] flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 text-sm sm:text-base disabled:opacity-50"
          aria-label="Next card (Right Arrow)">
          <span className="font-bold">Next</span>
          <span className="material-symbols-outlined text-[20px] sm:text-[24px]">arrow_forward</span>
        </button>
      </div>

      {/* Session Stats Bar */}
      <div className="flex gap-8 mt-8 sm:mt-12 text-center">
        <div>
          <span className="text-lg font-bold text-primary">{mastered}</span>
          <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider font-bold">Got It</span>
        </div>
        <div>
          <span className="text-lg font-bold text-error">{again}</span>
          <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider font-bold">Again</span>
        </div>
        <div>
          <span className="text-lg font-bold text-on-surface">{total - currentIndex - 1}</span>
          <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider font-bold">Remaining</span>
        </div>
      </div>

      {/* Keyboard Hint + TTS */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <SpeakButton text={card.character} size="md" />
        <p className="text-[10px] text-on-surface-variant/60">
          <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">←</kbd> Previous ·
          <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px] ml-1">→</kbd> Next ·
          Click card to flip · Swipe to rate
        </p>
      </div>
    </div>
  );
}
