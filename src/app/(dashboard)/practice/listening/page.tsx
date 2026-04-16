'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/trpc/client';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

/**
 * Listening Mode: Play TTS audio only → user identifies the character.
 * Tests listening comprehension without visual hints.
 */
export default function ListeningPracticePage() {
  usePageTitle('Listening Practice');
  const { data: dueCards, isLoading, refetch } = trpc.getDueCards.useQuery({ limit: 20 });
  const submitReview = trpc.submitReview.useMutation({ onSuccess: () => refetch() });
  const recordActivity = trpc.recordStudyActivity.useMutation();
  const awardXP = trpc.awardXP.useMutation();
  const updateChallenge = trpc.updateChallengeProgress.useMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<{ character: string; meaning: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  const cards = dueCards ?? [];
  const total = cards.length;
  const card = cards[currentIndex];

  // Generate options whenever card changes
  useEffect(() => {
    if (!card || cards.length < 2) return;

    const distractors = cards
      .filter(c => c.character !== card.character)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => ({ character: c.character, meaning: c.meaning }));

    const opts = [...distractors, { character: card.character, meaning: card.meaning }]
      .sort(() => Math.random() - 0.5);
    setOptions(opts);
    setHasPlayed(false);
  }, [card, cards]);

  // Auto-play pronunciation for each new card
  useEffect(() => {
    if (!card || hasPlayed) return;
    const timer = setTimeout(() => {
      speak(card.character);
      setHasPlayed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [card, hasPlayed]);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    synth.speak(utterance);
  };

  const handleSelect = useCallback((char: string) => {
    if (answered || !card) return;
    setSelected(char);
    setAnswered(true);

    const isCorrect = char === card.character;
    const quality = isCorrect ? 4 : 1;

    submitReview.mutate({ progressId: card.progressId, quality });
    recordActivity.mutate({ cardsReviewed: 1, cardsCorrect: isCorrect ? 1 : 0 });

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      awardXP.mutate({ xpAmount: 16, source: 'review' }); // Bonus for listening mode
      updateChallenge.mutate({ challengeType: 'review_count', increment: 1 });
    } else {
      setStreak(0);
    }
  }, [answered, card, submitReview, recordActivity, awardXP, updateChallenge]);

  const handleNext = useCallback(() => {
    setSelected(null);
    setAnswered(false);
    setCurrentIndex(i => i + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'r' || e.key === 'R') {
        if (card) speak(card.character);
        return;
      }
      if (!answered && options.length > 0) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx >= 0 && idx < options.length) {
          e.preventDefault();
          handleSelect(options[idx].character);
        }
      }
      if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answered, options, card, handleSelect, handleNext]);

  // Session complete
  if (!isLoading && (total === 0 || currentIndex >= total)) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 pb-24 md:pb-8">
        <div className="text-center space-y-6 max-w-sm">
          <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>headphones</span>
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">
            {total === 0 ? 'No Cards Due!' : 'Listening Complete!'}
          </h1>
          {total > 0 && (
            <div className="flex justify-center gap-6 bg-surface-container-low p-4 rounded-xl">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary block">{score}</span>
                <span className="text-on-surface-variant text-xs">Correct</span>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90"
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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-tertiary">Listening Mode</span>
          <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Audio → Character</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {streak > 0 && <span className="font-bold text-secondary">{streak}🔥</span>}
          <span className="font-medium text-on-surface-variant">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-10">
        <div className="h-full bg-gradient-to-r from-tertiary to-primary rounded-full transition-all duration-500" style={{ width: `${((currentIndex) / total) * 100}%` }} />
      </div>

      {/* Audio Prompt */}
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-5 bg-surface-container-low px-3 py-1 rounded-full">
          <span className="text-[0.5rem] font-bold text-tertiary uppercase tracking-widest">Listen Carefully</span>
        </div>

        <button
          onClick={() => speak(card.character)}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Play pronunciation"
        >
          <span className="material-symbols-outlined text-white text-[3rem] sm:text-[4rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
            volume_up
          </span>
        </button>

        <p className="text-on-surface-variant mt-6 text-sm">
          Tap to hear again · <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] font-mono">R</kbd> to replay
        </p>

        {/* Show answer after selecting */}
        {answered && (
          <div className="mt-6 space-y-1">
            <p className="chinese-char text-4xl font-bold text-on-surface">{card.character}</p>
            <p className="text-lg text-primary font-medium">{card.pinyin}</p>
            <p className="text-sm text-on-surface-variant">{card.meaning}</p>
          </div>
        )}
      </div>

      {/* Options: show character + meaning */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt, i) => {
          const isSelected = selected === opt.character;
          const isCorrect = opt.character === card.character;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;

          return (
            <button
              key={`${opt.character}-${i}`}
              onClick={() => handleSelect(opt.character)}
              disabled={answered}
              className={`p-5 sm:p-6 rounded-2xl transition-all text-center ${
                showCorrect
                  ? 'bg-primary-fixed border-2 border-primary ring-2 ring-primary/20'
                  : showWrong
                    ? 'bg-error-container border-2 border-error ring-2 ring-error/20'
                    : 'bg-surface-container-lowest border-2 border-transparent hover:border-primary/20 hover:bg-surface-container-low'
              }`}
            >
              <span className="chinese-char text-3xl sm:text-4xl font-bold text-on-surface block mb-1">{opt.character}</span>
              <p className="text-xs text-on-surface-variant truncate">{opt.meaning}</p>
              <kbd className="text-[10px] text-outline font-mono mt-1 inline-block">{i + 1}</kbd>
            </button>
          );
        })}
      </div>

      {/* Next */}
      {answered && (
        <button
          onClick={handleNext}
          className="mt-6 w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          Next <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      )}

      {/* Keyboard shortcuts */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-low/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg items-center gap-4 text-[10px] text-on-surface-variant font-medium z-20 border border-outline-variant/20">
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">R</kbd> Replay</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">1-4</kbd> Select</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">Enter</kbd> Next</span>
      </div>
    </div>
  );
}
