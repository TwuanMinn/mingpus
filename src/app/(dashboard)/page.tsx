'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { SpeakButton } from "@/components/SpeakButton";
import { usePageTitle } from "@/hooks/usePageTitle";

const DAILY_GOAL_KEY = 'dc-daily-goal';
const DEFAULT_GOAL = 20;

function StatSkeleton() {
  return <div className="h-6 w-12 bg-surface-container-high rounded animate-pulse" />;
}

export default function Dashboard() {
  usePageTitle('Dashboard');
  const { data: stats, isLoading: statsLoading } = trpc.getDashboardStats.useQuery();
  const { data: dueCards, isLoading: cardsLoading } = trpc.getDueCards.useQuery({ limit: 3 });
  const { data: streak } = trpc.getStudyStreak.useQuery();

  const totalCards = stats?.totalCards ?? 0;
  const dueCount = stats?.dueForReview ?? 0;
  const totalReviewed = streak?.totalReviewed ?? 0;
  const hasStudiedToday = streak?.hasStudiedToday ?? false;

  // Configurable daily goal
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(DAILY_GOAL_KEY);
    if (saved) setDailyGoal(Number(saved));
  }, []);
  const updateGoal = (g: number) => {
    const clamped = Math.max(1, Math.min(100, g));
    setDailyGoal(clamped);
    localStorage.setItem(DAILY_GOAL_KEY, String(clamped));
    setShowGoalEdit(false);
  };
  const todayReviewed = Math.max(0, totalCards - dueCount);
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayReviewed / dailyGoal) * 100)) : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Hero Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-2 sm:pb-4" aria-label="Dashboard overview">
        <div className="space-y-1">
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Welcome back, Scholar</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)] leading-tight">Your Daily Focus</h2>
        </div>
        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-container-low rounded-xl text-center">
            <p className="text-[10px] sm:text-xs font-bold text-outline uppercase tracking-wider">Total Decks</p>
            {statsLoading ? <StatSkeleton /> : <p className="text-lg sm:text-xl font-black text-secondary">{stats?.totalDecks ?? 0}</p>}
          </div>
          <div className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-container-low rounded-xl text-center">
            <p className="text-[10px] sm:text-xs font-bold text-outline uppercase tracking-wider">Total Cards</p>
            {statsLoading ? <StatSkeleton /> : <p className="text-lg sm:text-xl font-black text-primary">{totalCards.toLocaleString()}</p>}
          </div>
        </div>
      </section>

      {/* NEW: Progress & Lists (from user request) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Study Progress */}
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden group">
          {/* Watermark */}
          <svg className="absolute -bottom-8 -right-8 w-[14rem] sm:w-[20rem] h-[14rem] sm:h-[20rem] text-primary opacity-10 pointer-events-none z-0 group-hover:scale-110 group-hover:opacity-15 transition-all duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
          
          <div className="relative z-10 flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg sm:text-xl text-on-surface">Study Progress</h3>
            <Link href="#" className="font-bold text-sm text-primary flex items-center hover:underline">
              Weekly Review <span className="material-symbols-outlined text-[16px] ml-1">north_east</span>
            </Link>
          </div>
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Words Learned */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Words Learned</p>
              <p className="text-3xl font-black text-on-surface mb-3">1,248</p>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[75%]"></div>
              </div>
            </div>
            {/* Daily Streak */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Daily Streak</p>
              <p className="text-3xl font-black text-on-surface mb-3">42</p>
              <p className="text-xs font-bold text-primary flex items-center mt-2">
                <span className="material-symbols-outlined text-[14px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                Top 5% this month
              </p>
            </div>
            {/* Accuracy */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 transition-transform hover:-translate-y-1 hover:shadow-md">
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Accuracy</p>
              <p className="text-3xl font-black text-on-surface mb-3">94%</p>
              <p className="text-xs font-medium text-on-surface-variant mt-2">
                +2% from last week
              </p>
            </div>
          </div>
        </div>

        {/* Recent Word Lists */}
        <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden group">
          {/* Watermark */}
          <svg className="absolute -bottom-8 -right-8 w-[14rem] sm:w-[20rem] h-[14rem] sm:h-[20rem] text-primary opacity-10 pointer-events-none z-0 group-hover:scale-110 group-hover:opacity-15 transition-all duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>

          <div className="relative z-10 flex justify-between items-center mb-6">
            <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg sm:text-xl text-on-surface">Recent Word Lists</h3>
            <Link href="/decks" className="font-bold text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="relative z-10 space-y-3 sm:space-y-4">
            {/* List 1 */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between cursor-pointer hover:bg-surface-container-lowest/80 transition-colors hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Dining & Food</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">24 words • 85% mastered</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[85%]"></div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            </div>
            {/* List 2 */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between cursor-pointer hover:bg-surface-container-lowest/80 transition-colors hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">flight</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Travel & Transport</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">18 words • 40% mastered</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[40%]"></div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            </div>
            {/* List 3 */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between cursor-pointer hover:bg-surface-container-lowest/80 transition-colors hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary-fixed text-tertiary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">work</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Business Chinese</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">32 words • New</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-surface-container-high rounded-full w-[0%]"></div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Study Card */}
        <div className="sm:col-span-2 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary-fixed/20 rounded-full blur-3xl -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-6 sm:gap-12">
            <div className="flex justify-between items-start">
              <div className="space-y-3 sm:space-y-4 max-w-md">
                <span className="px-3 py-1 bg-primary-fixed text-primary text-[0.6rem] sm:text-[0.65rem] font-bold rounded-full uppercase tracking-widest">Active Review</span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-[family-name:var(--font-jakarta)] font-black text-on-surface">Experience the Flow of Memory.</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">You have <span className="font-bold text-primary">{dueCount} characters</span> due for spaced repetition today.</p>
              </div>
              <div className="hidden lg:block">
                <span className="chinese-char text-[8rem] font-bold text-primary/10 select-none">记忆</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/practice" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm sm:text-base shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center" aria-label={`Start practice session with ${dueCount} cards due`}>
                Resume Session
              </Link>
              <Link href="/decks" className="px-6 sm:px-8 py-3 sm:py-4 bg-surface-container-high text-on-surface rounded-full font-bold text-sm sm:text-base hover:bg-primary-fixed transition-colors text-center">
                Browse Deck
              </Link>
            </div>
          </div>
        </div>

        {/* Daily Goal Tracker — Configurable */}
        <div className="sm:col-span-2 lg:col-span-4 glass-effect rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-white/40">
          <div className="space-y-5 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface uppercase tracking-tight text-sm sm:text-base">Daily Goal</h4>
              <button onClick={() => setShowGoalEdit(!showGoalEdit)} className="material-symbols-outlined text-primary hover:text-secondary transition-colors text-[20px]" aria-label="Edit daily goal">
                {showGoalEdit ? 'close' : 'tune'}
              </button>
            </div>
            {showGoalEdit && (
              <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl">
                <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Target:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-16 bg-surface-container-low text-on-surface text-center py-1 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-on-surface-variant">cards/day</span>
                <button onClick={() => updateGoal(dailyGoal)} className="ml-auto px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-bold">Save</button>
              </div>
            )}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Today's Progress</span>
                {statsLoading ? <StatSkeleton /> : <span className="font-bold text-on-surface">{todayReviewed} / {dailyGoal}</span>}
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-label="Daily goal progress" aria-valuenow={goalProgress} aria-valuemax={100}>
                <div className={`h-full rounded-full transition-all duration-500 ${goalProgress >= 100 ? 'bg-gradient-to-r from-secondary to-primary' : 'bg-gradient-to-r from-primary to-secondary'}`} style={{ width: `${goalProgress}%` }}></div>
              </div>
              {goalProgress >= 100 && <p className="text-xs font-bold text-primary flex items-center gap-1"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Goal reached! 🎉</p>}
            </div>
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Due for Review</span>
                {statsLoading ? <StatSkeleton /> : <span className="font-bold text-on-surface">{dueCount} cards</span>}
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden" role="progressbar" aria-label="Due cards proportion" aria-valuenow={totalCards > 0 ? Math.round((dueCount / totalCards) * 100) : 0} aria-valuemax={100}>
                <div className="h-full bg-primary/40 rounded-full transition-all duration-500" style={{ width: `${totalCards > 0 ? Math.round((dueCount / totalCards) * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 p-4 bg-surface-container-lowest/50 rounded-xl">
            <p className="text-xs text-on-surface-variant font-medium">&quot;Learning is a treasure that will follow its owner everywhere.&quot;</p>
          </div>
        </div>

        {/* Words to Review */}
        <div className="sm:col-span-2 lg:col-span-5 bg-surface-container-low rounded-xl p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="flex justify-between items-center">
            <h4 className="font-[family-name:var(--font-jakarta)] font-extrabold text-on-surface uppercase tracking-tight text-sm sm:text-base">Critical Review</h4>
            <Link href="/practice" className="text-primary text-xs font-bold hover:underline" aria-label="View all cards due for review">View All</Link>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {cardsLoading ? (
              // Inline skeletons for due cards
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 sm:gap-6 animate-pulse">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-container-high rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 bg-surface-container-high rounded" />
                    <div className="h-3 w-32 bg-surface-container-high rounded" />
                  </div>
                </div>
              ))
            ) : (dueCards && dueCards.length > 0) ? dueCards.map((word) => (
              <div key={word.flashcardId} className="flex items-center gap-4 sm:gap-6 group cursor-pointer" role="listitem">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-surface-container-lowest rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary-fixed flex-shrink-0">
                  <span className="chinese-char text-2xl sm:text-3xl font-bold text-on-surface">{word.character}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <h5 className="font-bold text-on-surface">{word.pinyin}</h5>
                      <SpeakButton text={word.character} size="sm" />
                    </div>
                    <span className={`text-[0.6rem] sm:text-[0.65rem] font-bold uppercase ${word.repetition === 0 ? 'text-error' : 'text-outline'}`}>
                      {word.repetition === 0 ? 'New' : word.interval <= 1 ? 'Urgent' : 'Review'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate">{word.meaning}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant text-center py-4">No cards due for review! 🎉</p>
            )}
          </div>
        </div>

        {/* Session Quick Start */}
        <div className="sm:col-span-2 lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-6">
          {[
            { icon: "bolt", title: "Rapid Fire", desc: "5-minute sprint to reinforce high-frequency words.", hoverBg: "hover:bg-primary-fixed", iconColor: "text-primary", href: "/practice" },
            { icon: "edit_note", title: "Stroke Master", desc: "Focus exclusively on handwriting and radical order.", hoverBg: "hover:bg-secondary-fixed", iconColor: "text-secondary", href: "/strokes" },
            { icon: "quiz", title: "Quiz Mode", desc: "Test your knowledge with multiple choice questions.", hoverBg: "hover:bg-surface-container-high", iconColor: "text-tertiary", href: "/quiz" },
            { icon: "explore", title: "Expansion", desc: "Discover new characters based on your level.", hoverBg: "hover:bg-surface-container-high", iconColor: "text-on-surface-variant", href: "/discover" },
          ].map((card) => (
            <Link key={card.title} href={card.href} className={`bg-surface-container-lowest rounded-xl p-4 sm:p-6 lg:p-8 ${card.hoverBg} transition-colors cursor-pointer flex flex-col justify-between gap-3 sm:gap-4`} aria-label={`${card.title}: ${card.desc}`}>
              <span className={`material-symbols-outlined text-2xl sm:text-3xl lg:text-4xl ${card.iconColor}`}>{card.icon}</span>
              <div>
                <h4 className="font-[family-name:var(--font-jakarta)] font-bold text-base sm:text-lg lg:text-xl text-on-surface mb-1 sm:mb-2">{card.title}</h4>
                <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievement Banner — Milestone-aware */}
      <section className="relative w-full min-h-[120px] sm:h-48 rounded-xl overflow-hidden flex items-center p-6 sm:p-8 lg:p-12" aria-label="Study achievement">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary mix-blend-multiply opacity-20"></div>
        <div className="absolute inset-0 bg-cover bg-center -z-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkJ5UfCE7Wn5iAEVA-Wslcp-oFwFfcngs4ETYJo7DYH8rsb6XKaRBaRpS4FnwCUguDKtbL5M0ZmmwonO89aIaLKrKq3Oa3M5aEf3eriqlI8a7zWAE0hk8Ddy2Biao6VQzgrE7jxDI_6FrHjGmqG5I-TewSPOHGD8mUYn-5GrcxqcAn-q5KbfdMVZJE_H_dp4fQRfxgJH-e-u1eYE6nV7CAa-SxhPDPLifbEWX5RPeJ0Jfu9LX-vAGTR3KGSBr8EfWjEp3kk1rhbfE7')" }}></div>
        <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-on-surface">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl sm:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {totalReviewed >= 500 ? 'diamond' : totalReviewed >= 100 ? 'workspace_premium' : totalReviewed >= 50 ? 'military_tech' : totalReviewed >= 10 ? 'emoji_events' : hasStudiedToday ? 'local_fire_department' : 'rocket_launch'}
              </span>
              <h4 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-jakarta)]">
                {totalReviewed >= 500 ? 'Diamond Scholar!'
                  : totalReviewed >= 100 ? 'Century Master!'
                  : totalReviewed >= 50 ? 'Half-Century Hero!'
                  : totalReviewed >= 10 ? `${totalReviewed} Cards Mastered`
                  : hasStudiedToday ? `${totalReviewed} Cards Reviewed`
                  : "Start Today's Session"}
              </h4>
            </div>
            <p className="text-on-surface-variant font-medium text-sm sm:text-base">
              {totalReviewed >= 100
                ? `Incredible! ${totalReviewed} reviews and counting. You're in the top tier.`
                : totalReviewed >= 50
                ? `Halfway to triple digits! ${100 - totalReviewed} more to hit the Century milestone.`
                : totalReviewed >= 10
                ? `Great momentum! Next milestone: ${50 - totalReviewed} more reviews to reach 50.`
                : hasStudiedToday
                ? `You've started strong with ${totalReviewed} reviews. Hit 10 for your first badge!`
                : 'No reviews logged today. Jump into a session to build your streak!'}
            </p>
            {/* Milestone badges */}
            <div className="flex gap-2 mt-2">
              {[10, 50, 100, 500].map((m) => (
                <span key={m} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${totalReviewed >= m ? 'bg-primary text-on-primary' : 'bg-surface-container-high/50 text-outline'}`}>
                  {m}+
                </span>
              ))}
            </div>
          </div>
          <Link href="/practice" className="bg-surface-container-lowest text-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-primary-fixed transition-colors text-sm sm:text-base whitespace-nowrap">
            {hasStudiedToday ? 'Continue' : 'Start Now'}
          </Link>
        </div>
      </section>
    </div>
  );
}
