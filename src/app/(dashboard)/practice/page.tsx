'use client';

import { useState, useEffect, useCallback, Component, type ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import { usePracticeStore } from '@/store/usePracticeStore';
import { SpeakButton } from '@/components/SpeakButton';
import { SentenceContext } from '@/components/SentenceContext';
import { RadicalBreakdown } from '@/components/RadicalBreakdown';
import { CompoundWords } from '@/components/CompoundWords';
import { CardReveal } from '@/components/Animations';
import { AchievementToast, XPPopup } from '@/components/AchievementToast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { calculateReviewXP } from '@/lib/gamification';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const QUALITY_ACTIONS = [
  { quality: 1, label: 'Again', icon: 'replay', key: '1', desc: '< 1 min', className: 'bg-error/10 text-error hover:bg-error/20 border border-error/20' },
  { quality: 3, label: 'Hard', icon: 'trending_flat', key: '2', desc: '~1 day', className: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/20' },
  { quality: 4, label: 'Good', icon: 'thumb_up', key: '3', desc: '~3 days', className: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20' },
  { quality: 5, label: 'Easy', icon: 'check_circle', key: '4', desc: '~7 days', className: 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:opacity-90' },
] as const;

export default function PracticePage() {
  usePageTitle('Practice');
  const { data: dueCards, isLoading, refetch } = trpc.getDueCards.useQuery({ limit: 20 });
  const submitReview = trpc.submitReview.useMutation({ onSuccess: () => refetch() });
  const recordActivity = trpc.recordStudyActivity.useMutation();
  const awardXP = trpc.awardXP.useMutation();
  const updateChallenge = trpc.updateChallengeProgress.useMutation();

  const [xpGained, setXpGained] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [reviewStartTime, setReviewStartTime] = useState(Date.now());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const {
    score, streak, mastered, reviewed,
    incrementScore, incrementStreak, resetStreak,
    recordMastered, recordReviewed, setCardsRemaining, resetSession,
  } = usePracticeStore();

  const cards = dueCards ?? [];
  const total = cards.length;
  const card = cards[currentIndex];
  const progress = total > 0 ? Math.round(((mastered + reviewed) / total) * 100) : 0;

  // Sync card count to store
  useEffect(() => {
    if (total > 0) setCardsRemaining(total - currentIndex);
  }, [total, currentIndex, setCardsRemaining]);

  // Reset timer when card changes
  useEffect(() => {
    setReviewStartTime(Date.now());
  }, [currentIndex]);

  const handleAction = useCallback((quality: number) => {
    if (!card) return;
    const responseTimeMs = Date.now() - reviewStartTime;
    submitReview.mutate({ progressId: card.progressId, quality, responseTimeMs });
    const isCorrect = quality >= 3;
    if (isCorrect) {
      recordMastered();
      incrementStreak();
      incrementScore();
    } else {
      recordReviewed();
      resetStreak();
    }
    // Record activity for streak persistence
    recordActivity.mutate({ cardsReviewed: 1, cardsCorrect: isCorrect ? 1 : 0 });

    // Award XP and track challenges
    const xp = calculateReviewXP(quality, streak, responseTimeMs);
    setXpGained(xp);
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1500);
    awardXP.mutate({ xpAmount: xp, source: 'review' }, {
      onSuccess: (result) => {
        if (result.newAchievements.length > 0) {
          setNewAchievements(prev => [...prev, ...result.newAchievements]);
        }
      },
    });
    updateChallenge.mutate({ challengeType: 'review_count', increment: 1 });
    if (quality >= 5) updateChallenge.mutate({ challengeType: 'perfect_recall', increment: 1 });

    setRevealed(false);
    setCurrentIndex(i => i + 1);
  }, [card, reviewStartTime, submitReview, recordMastered, recordReviewed, incrementStreak, incrementScore, resetStreak, recordActivity, awardXP, updateChallenge, streak]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
        return;
      }

      if (revealed) {
        const action = QUALITY_ACTIONS.find(a => a.key === e.key);
        if (action) {
          e.preventDefault();
          handleAction(action.quality);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, handleAction]);

  // Session complete
  if (!isLoading && (total === 0 || currentIndex >= total)) {
    return (
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8 items-center justify-center">
        <div className="text-center space-y-6">
          <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">
            {total === 0 ? 'No Cards Due!' : 'Session Complete!'}
          </h1>
          {total > 0 && (
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary block">{mastered}</span>
                <span className="text-on-surface-variant">Mastered</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-on-surface block">{reviewed}</span>
                <span className="text-on-surface-variant">To Review</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-secondary block">{Math.round(score)}</span>
                <span className="text-on-surface-variant">Score</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-tertiary block">{streak}🔥</span>
                <span className="text-on-surface-variant">Best Streak</span>
              </div>
            </div>
          )}
          <p className="text-on-surface-variant">
            {total === 0 ? 'All caught up — check back later.' : 'Great session! Keep the momentum going.'}
          </p>
          <button
            onClick={() => { setCurrentIndex(0); resetSession(); refetch(); }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
            aria-label={total === 0 ? 'Refresh cards' : 'Start a new practice session'}
          >
            {total === 0 ? 'Refresh' : 'Start New Session'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !card) {
    return (
      <div className="flex-1 flex items-center justify-center" role="status" aria-label="Loading practice cards">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      {/* Progress Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex justify-between items-end mb-3 sm:mb-4">
          <div>
            <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary">Current Session</span>
            <h1 className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-bold text-on-surface">Daily Review Flow</h1>
          </div>
          <div className="text-right flex items-center gap-4">
            {streak > 0 && (
              <span className="text-xs sm:text-sm font-bold text-secondary">{streak}🔥</span>
            )}
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">{currentIndex + 1} / {total}</span>
          </div>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Session progress">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Learning Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl relative">
          <div className="absolute -top-8 sm:-top-12 -left-8 sm:-left-12 w-40 sm:w-64 h-40 sm:h-64 bg-primary-fixed/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-12 w-40 sm:w-64 h-40 sm:h-64 bg-secondary-fixed/20 rounded-full blur-3xl -z-10"></div>

          {/* The Card */}
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-center shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] relative overflow-hidden group" role="region" aria-label={`Flashcard: ${card.character}`}>
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-surface-container-low px-3 sm:px-4 py-1 rounded-full">
              <span className="text-[0.5rem] sm:text-[0.625rem] font-bold text-primary uppercase tracking-widest">HSK {card.hskLevel ?? '?'}</span>
            </div>

            <div className="mb-4 sm:mb-6 mt-2 sm:mt-4">
              <span className="text-[5rem] sm:text-[8rem] md:text-[10rem] font-[family-name:var(--font-noto-sc)] text-on-surface leading-none block">{card.character}</span>
              <SpeakButton text={card.character} size="lg" className="mt-2" />
            </div>

            {revealed ? (
              <div className="mb-6 sm:mb-12 space-y-2" aria-live="polite">
                <span className="text-lg sm:text-2xl font-[family-name:var(--font-jakarta)] text-primary-container font-medium tracking-wide">{card.pinyin}</span>
                <p className="text-base sm:text-xl font-bold text-on-surface">{card.meaning}</p>
              </div>
            ) : (
              <div className="mb-6 sm:mb-12">
                <span className="text-lg sm:text-2xl font-[family-name:var(--font-jakarta)] text-primary-container font-medium tracking-wide">? ? ?</span>
              </div>
            )}

            <div className="relative">
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full py-5 sm:py-8 border-2 border-dashed border-outline-variant rounded-xl sm:rounded-2xl hover:bg-surface-container-low hover:border-primary/30 transition-all duration-300 active:scale-95"
                  aria-label="Reveal translation (or press Space)"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">visibility</span>
                    <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Tap to reveal · <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] font-mono">Space</kbd></span>
                  </div>
                </button>
              ) : (
                <p className="text-xs text-on-surface-variant py-4">How well did you know this?</p>
              )}
            </div>
          </div>

          {/* Action Buttons — 4-grade SM-2 scale */}
          {revealed && (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-6 sm:mt-12" role="group" aria-label="Rate your recall">
              {QUALITY_ACTIONS.map((action) => (
                <button
                  key={action.quality}
                  onClick={() => handleAction(action.quality)}
                  className={`flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-5 px-2 sm:px-6 rounded-2xl font-bold transition-all active:scale-95 text-xs sm:text-sm ${action.className}`}
                  aria-label={`${action.label} — estimated next review: ${action.desc}. Keyboard shortcut: ${action.key}`}
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[24px]">{action.icon}</span>
                  <span className="font-bold">{action.label}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-70 font-normal">{action.desc}</span>
                  <kbd className="hidden sm:inline text-[9px] opacity-50 font-mono">{action.key}</kbd>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auxiliary Information */}
      <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">lightbulb</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Character</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
            <span className="chinese-char text-lg">{card.character}</span> — {card.meaning}. {card.strokes ? `${card.strokes} strokes.` : ''}
          </p>
        </div>
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">menu_book</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pinyin</span>
          </div>
          <p className="text-lg sm:text-xl font-medium text-on-surface">{card.pinyin}</p>
        </div>
        <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center text-tertiary shadow-sm">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">insights</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">Session</span>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-on-surface">{mastered}</span>
              <span className="text-[10px] text-on-surface-variant ml-1">mastered</span>
            </div>
            <span className="text-outline">·</span>
            <div>
              <span className="text-lg font-bold text-secondary">{Math.round(score)}</span>
              <span className="text-[10px] text-on-surface-variant ml-1">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentence Context + Radical Breakdown + Compound Words */}
      {revealed && (
        <CardReveal delay={0.1}>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ErrorBoundary><SentenceContext character={card.character} /></ErrorBoundary>
            <ErrorBoundary><RadicalBreakdown character={card.character} /></ErrorBoundary>
            <ErrorBoundary><CompoundWords character={card.character} /></ErrorBoundary>
          </div>
        </CardReveal>
      )}

      {/* XP Popup */}
      <XPPopup amount={xpGained} show={showXP} />

      {/* Achievement Toast */}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievementKeys={newAchievements}
          onDismiss={() => setNewAchievements([])}
        />
      )}

      {/* Keyboard shortcuts — desktop only */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-low/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg shadow-on-surface/5 items-center gap-4 text-[10px] text-on-surface-variant font-medium z-20 border border-outline-variant/20">
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">Space</kbd> Reveal</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">1</kbd> Again</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">2</kbd> Hard</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">3</kbd> Good</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">4</kbd> Easy</span>
      </div>
    </div>
  );
}
