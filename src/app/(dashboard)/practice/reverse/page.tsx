'use client';

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { trpc } from '@/trpc/client';
import { SpeakButton } from '@/components/SpeakButton';
import { QUALITY } from '@/lib/practice-config';
import { useAwardXP } from '@/hooks/useAwardXP';
import Link from 'next/link';

/**
 * Reverse Practice: Show English meaning → user selects the correct Chinese character.
 * Tests productive recall (harder than recognition).
 */
export default function ReversePracticePage() {
  const { data: dueCards, isLoading, refetch } = trpc.practice.getDueCards.useQuery({ limit: 20 });
  const submitReview = trpc.practice.submitReview.useMutation({ onSuccess: () => refetch() });
  const recordActivity = trpc.dashboard.recordStudyActivity.useMutation();
  const awardXP = useAwardXP();
  const updateChallenge = trpc.gamification.updateChallengeProgress.useMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(() => Date.now());

  const cards = React.useMemo(() => dueCards ?? [], [dueCards]);
  const total = cards.length;
  const card = cards[currentIndex];

  // Generate options whenever card changes
  useEffect(() => {
    if (!card || cards.length < 2) return;

    const correctChar = card.character;
    const distractors = cards
      .filter(c => c.character !== correctChar)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.character);

    const opts = [...distractors, correctChar].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptions(opts);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartTime(Date.now());
  }, [card, cards]);

  const handleSelect = useCallback((char: string) => {
    if (answered || !card) return;
    setSelected(char);
    setAnswered(true);

    const isCorrect = char === card.character;
    const responseTimeMs = Date.now() - startTime;
    const quality = isCorrect
      ? responseTimeMs < 3000
        ? QUALITY.EASY
        : responseTimeMs < 6000
          ? QUALITY.GOOD
          : QUALITY.HARD
      : QUALITY.AGAIN;

    submitReview.mutate({ progressId: card.progressId, quality, responseTimeMs });
    recordActivity.mutate({ cardsReviewed: 1, cardsCorrect: isCorrect ? 1 : 0 });

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      const xp = quality >= QUALITY.EASY ? 18 : quality >= QUALITY.GOOD ? 14 : 10; // Bonus for reverse mode
      awardXP.mutate({ xpAmount: xp, source: 'review' });
      updateChallenge.mutate({ challengeType: 'review_count', increment: 1 });
      if (quality >= QUALITY.EASY) updateChallenge.mutate({ challengeType: 'perfect_recall', increment: 1 });
    } else {
      setStreak(0);
    }
  }, [answered, card, startTime, submitReview, recordActivity, awardXP, updateChallenge]);

  const handleNext = useCallback(() => {
    setSelected(null);
    setAnswered(false);
    setCurrentIndex(i => i + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (!answered && options.length > 0) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx >= 0 && idx < options.length) {
          e.preventDefault();
          handleSelect(options[idx]);
        }
      }
      if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answered, options, handleSelect, handleNext]);

  // Session complete
  if (!isLoading && (total === 0 || currentIndex >= total)) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 pb-24 md:pb-8">
        <div className="text-center space-y-6 max-w-sm">
          <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          <h1 className="text-2xl sm:text-3xl font-(family-name:--font-jakarta) font-bold text-on-surface">
            {total === 0 ? 'No Cards Due!' : 'Session Complete!'}
          </h1>
          {total > 0 && (
            <div className="flex justify-center gap-6 bg-surface-container-low p-4 rounded-xl">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary block">{score}</span>
                <span className="text-on-surface-variant text-xs">Correct</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-on-surface block">{total}</span>
                <span className="text-on-surface-variant text-xs">Total</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-secondary block">{total > 0 ? Math.round((score / total) * 100) : 0}%</span>
                <span className="text-on-surface-variant text-xs">Accuracy</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Link href="/practice" className="flex-1 px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold text-sm text-center hover:bg-surface-container-highest transition-colors">
              Standard Mode
            </Link>
            <button
              onClick={() => { setCurrentIndex(0); setScore(0); setStreak(0); refetch(); }}
              className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !card) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status" aria-label="Loading practice cards">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-secondary">Reverse Mode</span>
          <h1 className="text-xl sm:text-2xl font-(family-name:--font-jakarta) font-bold text-on-surface">Meaning → Character</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {streak > 0 && <span className="font-bold text-secondary">{streak}🔥</span>}
          <span className="font-medium text-on-surface-variant">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-10">
        <div className="h-full bg-linear-to-r from-secondary to-primary rounded-full transition-all duration-500" style={{ width: `${((currentIndex) / total) * 100}%` }} />
      </div>

      {/* The Prompt: Show meaning + pinyin */}
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-12 text-center shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-5 bg-surface-container-low px-3 py-1 rounded-full">
          <span className="text-[0.5rem] font-bold text-secondary uppercase tracking-widest">Find the Character</span>
        </div>
        <p className="text-2xl sm:text-4xl font-(family-name:--font-jakarta) font-black text-on-surface mt-6 mb-3">
          {card.meaning}
        </p>
        <p className="text-lg text-primary font-medium">{card.pinyin}</p>
        <SpeakButton text={card.character} size="lg" className="mt-3" />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === card.character;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;

          return (
            <button
              key={`${opt}-${i}`}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              aria-label={`${opt} (option ${i + 1})`}
              aria-pressed={answered ? selected === opt : undefined}
              className={`p-6 sm:p-8 rounded-2xl transition-all text-center ${
                showCorrect
                  ? 'bg-primary-fixed border-2 border-primary ring-2 ring-primary/20'
                  : showWrong
                    ? 'bg-error-container border-2 border-error ring-2 ring-error/20'
                    : 'bg-surface-container-lowest border-2 border-transparent hover:border-primary/20 hover:bg-surface-container-low'
              }`}
            >
              <span className="chinese-char text-4xl sm:text-5xl font-bold text-on-surface block mb-2">
                {opt}
              </span>
              <kbd className="text-[10px] text-outline font-mono">{i + 1}</kbd>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 w-full py-4 bg-linear-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          Next <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      )}

      {/* Keyboard shortcuts */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-low/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg items-center gap-4 text-[10px] text-on-surface-variant font-medium z-20 border border-outline-variant/20">
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">1-4</kbd> Select</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">Enter</kbd> Next</span>
      </div>
    </div>
  );
}
