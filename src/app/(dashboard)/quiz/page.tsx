'use client';

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { SpeakButton } from '@/components/SpeakButton';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function QuizPage() {
  usePageTitle('Quiz');
  const { data: questions, isLoading, refetch } = trpc.getQuizQuestions.useQuery({ count: 10 });
  const submitAnswer = trpc.submitQuizAnswer.useMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);

  const quizCards = questions ?? [];
  const total = quizCards.length;
  const q = quizCards[currentIndex];
  const letters = ['A', 'B', 'C', 'D'];

  const handleSelect = useCallback(async (option: string) => {
    if (answered || !q) return;
    setSelected(option);
    setAnswered(true);

    // Server-side validation — correctAnswer is never on the client
    const res = await submitAnswer.mutateAsync({
      flashcardId: q.id,
      selectedAnswer: option,
    });

    setResult(res);
    if (res.isCorrect) {
      setScore(s => s + 50);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  }, [answered, q, submitAnswer]);

  const handleNext = useCallback(() => {
    setSelected(null);
    setAnswered(false);
    setResult(null);
    setCurrentIndex(i => i + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setResult(null);
    setScore(0);
    setStreak(0);
    refetch();
  }, [refetch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!answered && q) {
        const idx = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
        if (idx >= 0 && idx < q.options.length) {
          e.preventDefault();
          handleSelect(q.options[idx]);
        }
        // Number keys 1-4
        const numIdx = ['1', '2', '3', '4'].indexOf(e.key);
        if (numIdx >= 0 && numIdx < q.options.length) {
          e.preventDefault();
          handleSelect(q.options[numIdx]);
        }
      }

      if (answered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (currentIndex < total - 1) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [answered, q, handleSelect, handleNext, currentIndex, total]);

  // Save quiz result to history on completion
  const quizDone = !isLoading && (total === 0 || currentIndex >= total);

  const getHistory = (): { date: string; score: number; correct: number; total: number }[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('dc-quiz-history') || '[]');
    } catch { return []; }
  };

  const [historySaved, setHistorySaved] = useState(false);
  const [history, setHistory] = useState(getHistory);

  if (quizDone && total > 0 && !historySaved) {
    const entry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score,
      correct: Math.round(score / 50),
      total,
    };
    const updated = [entry, ...getHistory()].slice(0, 10);
    localStorage.setItem('dc-quiz-history', JSON.stringify(updated));
    setHistory(updated);
    setHistorySaved(true);
  }

  // Results screen
  if (quizDone) {
    return (
      <div className="flex-1 p-4 sm:p-6 md:p-12 max-w-6xl mx-auto w-full pb-24 md:pb-8 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md w-full">
          <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface">
            {total === 0 ? 'No Cards Available' : 'Quiz Complete!'}
          </h2>
          {total === 0 && (
            <div className="space-y-3">
              <span className="material-symbols-outlined text-5xl text-outline/40">library_add</span>
              <p className="text-on-surface-variant">Add some cards to your decks to start quizzing!</p>
            </div>
          )}
          {total > 0 && (
            <div className="flex justify-center gap-8 bg-surface-container-low px-8 py-4 rounded-xl">
              <div className="text-center">
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Score</p>
                <p className="text-2xl font-black text-primary">{score.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Correct</p>
                <p className="text-2xl font-black text-secondary">{Math.round(score / 50)} / {total}</p>
              </div>
            </div>
          )}
          {/* Session History */}
          {history.length > 1 && (
            <div className="bg-surface-container-lowest rounded-xl p-4 text-left space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Recent Sessions</h3>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className={`flex justify-between items-center text-sm py-1.5 ${i === 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  <span>{h.date}</span>
                  <span>{h.correct}/{h.total} ({Math.round((h.correct / h.total) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => { setHistorySaved(false); handleRestart(); }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
            {total === 0 ? 'Refresh' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !q) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-12 max-w-6xl mx-auto w-full pb-24 md:pb-8">
      {/* Quiz Progress Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="space-y-1">
          <span className="text-[0.625rem] sm:text-[0.6875rem] font-bold text-primary uppercase tracking-[0.2em]">
            {q.hskLevel ? `HSK ${q.hskLevel}` : 'Mixed Level'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface tracking-tight">Focus Mastery</h2>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 bg-surface-container-low px-4 sm:px-8 py-3 sm:py-4 rounded-xl w-full md:w-auto justify-around md:justify-start">
          <div className="text-center">
            <p className="text-[0.6rem] sm:text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-black text-primary">{score.toLocaleString()}</p>
          </div>
          <div className="h-8 sm:h-10 w-[1px] bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="text-[0.6rem] sm:text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</p>
            <p className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-black text-secondary">{streak} 🔥</p>
          </div>
          <div className="h-8 sm:h-10 w-[1px] bg-outline-variant/30"></div>
          <div className="text-center">
            <p className="text-[0.6rem] sm:text-[0.6875rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
            <p className="text-xl sm:text-2xl font-[family-name:var(--font-jakarta)] font-black text-on-surface">
              {String(currentIndex + 1).padStart(2, '0')}<span className="text-slate-300">/{total}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Hero Character Card */}
        <div className="lg:col-span-7 aspect-square sm:aspect-video lg:aspect-auto lg:h-[400px] xl:h-[500px] flex flex-col justify-center items-center bg-surface-container-lowest rounded-xl p-6 sm:p-8 md:p-12 transition-colors hover:bg-primary-fixed group relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <p className="text-[12rem] sm:text-[20rem] chinese-char font-bold leading-none">{q.character}</p>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[6rem] sm:text-[10rem] md:text-[14rem] chinese-char font-bold text-on-surface tracking-[0.05em] leading-none mb-4">{q.character}</span>
            {answered && result && (
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl font-medium text-primary">{q.pinyin}</p>
                <SpeakButton text={q.character} size="md" />
              </div>
            )}
          </div>
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 flex justify-between items-center">
            <span className="px-3 sm:px-4 py-1 rounded-full border border-primary/20 text-[0.6rem] sm:text-[0.6875rem] font-bold text-primary uppercase tracking-widest">Identify Meaning</span>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 sm:w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIndex + 1) / total) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
          {q.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = result ? opt === result.correctAnswer : false;
            const showCorrect = answered && isCorrect;
            const showWrong = answered && isSelected && !isCorrect;

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={answered || submitAnswer.isPending}
                className={`w-full p-4 sm:p-6 text-left rounded-xl transition-all flex items-center justify-between group ${
                  showCorrect
                    ? "bg-primary-fixed border-l-4 border-primary ring-2 ring-primary/20"
                    : showWrong
                    ? "bg-error-container border-l-4 border-error ring-2 ring-error/20"
                    : "bg-surface-container-lowest hover:bg-surface-container-high border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-[family-name:var(--font-jakarta)] font-bold text-xs sm:text-sm flex-shrink-0 transition-colors ${
                    showCorrect
                      ? "bg-primary text-white"
                      : showWrong
                      ? "bg-error text-white"
                      : "bg-surface-container text-slate-400 group-hover:bg-primary group-hover:text-white"
                  }`}>{letters[i]}</span>
                  <div className="min-w-0">
                    <h4 className={`text-base sm:text-xl font-[family-name:var(--font-jakarta)] font-bold ${showCorrect ? "text-primary" : showWrong ? "text-error" : "text-on-surface"}`}>{opt}</h4>
                  </div>
                </div>
                {showCorrect && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">+50 XP</span>
                    <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                )}
                {showWrong && (
                  <span className="material-symbols-outlined text-error text-[20px] sm:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                )}
              </button>
            );
          })}

          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4">
            <button onClick={handleRestart}
              className="flex-1 py-3 sm:py-4 bg-surface-container text-on-surface font-[family-name:var(--font-jakarta)] font-bold rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">replay</span>
              Restart
            </button>
            <button onClick={handleNext} disabled={!answered}
              className="flex-[2] py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white font-[family-name:var(--font-jakarta)] font-bold rounded-full hover:opacity-90 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base disabled:opacity-50">
              Next Question
              <span className="material-symbols-outlined text-[18px] sm:text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts — desktop only */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-low/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg shadow-on-surface/5 items-center gap-4 text-[10px] text-on-surface-variant font-medium z-20 border border-outline-variant/20">
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">A-D</kbd> Select</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">1-4</kbd> Select</span>
        <span className="text-outline">·</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-[9px]">Enter</kbd> Next</span>
      </div>
    </div>
  );
}
