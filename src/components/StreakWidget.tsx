'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';

export function StreakWidget() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.gamification.getStreakStatus.useQuery(undefined, {
    staleTime: 60_000,
  });
  const setGoal = trpc.gamification.setDailyGoal.useMutation({
    onSuccess: () => utils.gamification.getStreakStatus.invalidate(),
  });
  const useFreeze = trpc.gamification.useStreakFreeze.useMutation({
    onSuccess: () => utils.gamification.getStreakStatus.invalidate(),
  });

  const [showGoalPicker, setShowGoalPicker] = useState(false);

  if (isLoading || !data) return null;

  const { currentStreak, longestStreak, streakFreezes, graceUsed, dailyGoal, dailyProgress } = data;
  const goalPct = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100));
  const goalReached = dailyProgress >= dailyGoal;

  const GOAL_OPTIONS = [5, 10, 20, 30, 50, 100];

  return (
    <div className="bg-surface-container-low rounded-xl p-3 space-y-3">
      {/* Streak row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[20px] text-error"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <div>
            <span className="text-sm font-bold text-on-surface">{currentStreak}</span>
            <span className="text-[10px] text-on-surface-variant ml-1">day streak</span>
          </div>
        </div>

        {/* Freeze pills */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: Math.min(streakFreezes, 5) }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined text-[14px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
              title="Streak freeze available"
            >
              ac_unit
            </span>
          ))}
          {streakFreezes > 5 && (
            <span className="text-[10px] font-bold text-primary">+{streakFreezes - 5}</span>
          )}
          {streakFreezes === 0 && (
            <span className="text-[10px] text-on-surface-variant/50">No freezes</span>
          )}
        </div>
      </div>

      {/* Grace-period warning */}
      <AnimatePresence>
        {graceUsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-warning/10 border border-warning/25">
              <span className="material-symbols-outlined text-[14px] text-warning flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <p className="text-[10px] font-semibold text-warning leading-tight flex-1">
                Grace period active — study today or use a freeze!
              </p>
              {streakFreezes > 0 && (
                <button
                  onClick={() => useFreeze.mutate()}
                  disabled={useFreeze.isPending}
                  className="text-[9px] font-bold text-primary hover:underline flex-shrink-0 disabled:opacity-50"
                >
                  Use freeze
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily goal progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Daily Goal
          </span>
          <button
            onClick={() => setShowGoalPicker(!showGoalPicker)}
            className="text-[9px] font-bold text-primary hover:underline"
          >
            {dailyProgress}/{dailyGoal} cards
          </button>
        </div>

        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${goalReached ? 'bg-gradient-to-r from-secondary to-primary' : 'bg-gradient-to-r from-primary/60 to-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${goalPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {goalReached && (
          <p className="text-[9px] text-secondary font-bold text-center animate-pulse">
            🎉 Daily goal complete!
          </p>
        )}
      </div>

      {/* Goal picker dropdown */}
      <AnimatePresence>
        {showGoalPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-outline-variant/20 pt-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1.5">
                Change goal
              </p>
              <div className="grid grid-cols-3 gap-1">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGoal.mutate({ goal: g }); setShowGoalPicker(false); }}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                      dailyGoal === g
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best streak */}
      {longestStreak > currentStreak && (
        <p className="text-[9px] text-on-surface-variant/60 text-center">
          Best: {longestStreak} days
        </p>
      )}
    </div>
  );
}
