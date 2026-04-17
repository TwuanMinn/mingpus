'use client';

import { trpc } from '@/trpc/client';

export function DailyChallenges() {
  const { data: challenges, isLoading } = trpc.gamification.getDailyChallenges.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface-container-high rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!challenges || challenges.length === 0) return null;

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            checklist
          </span>
          <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-on-surface text-sm sm:text-base">
            Daily Challenges
          </h3>
        </div>
        <span className="text-xs font-bold text-primary">
          {completedCount}/{challenges.length}
        </span>
      </div>

      <div className="space-y-3">
        {challenges.map((ch) => {
          const progress = ch.targetValue > 0
            ? Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100))
            : 0;

          return (
            <div
              key={ch.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                ch.completed
                  ? 'bg-primary-fixed/50 border-primary/20'
                  : 'bg-surface-container-lowest border-outline-variant/10'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ch.completed
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={ch.completed ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {ch.completed ? 'check_circle' : ch.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-bold ${ch.completed ? 'text-primary line-through' : 'text-on-surface'}`}>
                    {ch.title}
                  </h4>
                  <span className="text-[10px] font-bold text-secondary">
                    +{ch.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{ch.description}</p>
                {!ch.completed && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-medium text-outline tabular-nums">
                      {ch.currentValue}/{ch.targetValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
