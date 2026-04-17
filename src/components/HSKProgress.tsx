'use client';

import { trpc } from '@/trpc/client';
import { motion } from 'framer-motion';

const HSK_TARGETS: Record<number, { words: number; label: string; color: string }> = {
  1: { words: 150, label: 'HSK 1', color: 'from-emerald-400 to-emerald-600' },
  2: { words: 300, label: 'HSK 2', color: 'from-sky-400 to-sky-600' },
  3: { words: 600, label: 'HSK 3', color: 'from-violet-400 to-violet-600' },
  4: { words: 1200, label: 'HSK 4', color: 'from-amber-400 to-amber-600' },
  5: { words: 2500, label: 'HSK 5', color: 'from-rose-400 to-rose-600' },
  6: { words: 5000, label: 'HSK 6', color: 'from-red-500 to-red-700' },
};

export function HSKProgressTracker() {
  const { data, isLoading } = trpc.analytics.getHSKProgress.useQuery();

  if (isLoading) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
        <div className="h-6 w-48 bg-surface-container-high rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const levels = data ?? [];

  // Predict mastery date based on learning rate
  const totalLearned = levels.reduce((s, l) => s + l.learned, 0);
  const totalMastered = levels.reduce((s, l) => s + l.mastered, 0);

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">
          HSK Progress
        </h3>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Mastered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary/30" />
            Learning
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((level, i) => {
          const info = HSK_TARGETS[level];
          const levelData = levels.find(l => l.hskLevel === level);
          const learned = levelData?.learned ?? 0;
          const mastered = levelData?.mastered ?? 0;
          const target = info.words;
          const masteryPercent = Math.min(100, Math.round((mastered / target) * 100));
          const learnedPercent = Math.min(100, Math.round((learned / target) * 100));

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 flex-shrink-0">
                  <span className="text-xs font-bold text-on-surface">{info.label}</span>
                </div>

                <div className="flex-1">
                  <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden relative">
                    {/* Mastered fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${masteryPercent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${info.color} rounded-full`}
                    />
                    {/* Learning fill (transparent overlay) */}
                    {learnedPercent > masteryPercent && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${learnedPercent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 + 0.2, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 bg-primary/15 rounded-full"
                      />
                    )}
                  </div>
                </div>

                <div className="w-20 text-right flex-shrink-0">
                  <span className="text-xs font-bold text-on-surface">{mastered}</span>
                  <span className="text-[10px] text-on-surface-variant"> / {target}</span>
                </div>
              </div>

              {/* Expanded detail on hover */}
              <div className="max-h-0 group-hover:max-h-10 overflow-hidden transition-all duration-300">
                <div className="flex gap-4 mt-1.5 ml-20 text-[10px] text-on-surface-variant">
                  <span>{learned} learning</span>
                  <span>{masteryPercent}% complete</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-5 border-t border-outline-variant/15 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-on-surface">{totalLearned}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Learning</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{totalMastered}</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Mastered</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-secondary">{Math.round((totalMastered / Math.max(1, totalLearned)) * 100)}%</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Retention</p>
        </div>
      </div>
    </div>
  );
}
