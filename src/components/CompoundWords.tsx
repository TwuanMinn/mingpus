'use client';

import { trpc } from '@/trpc/client';
import { SpeakButton } from './SpeakButton';

export function CompoundWords({ character }: { character: string }) {
  const { data: words, isLoading } = trpc.gamification.getCompoundWords.useQuery({ character });

  if (isLoading) {
    return (
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl animate-pulse">
        <div className="h-4 w-24 bg-surface-container-high rounded mb-4" />
        <div className="space-y-2">
          <div className="h-8 bg-surface-container-high rounded" />
          <div className="h-8 bg-surface-container-high rounded" />
        </div>
      </div>
    );
  }

  if (!words || words.length === 0) return null;

  return (
    <div className="bg-surface-container-low p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-tertiary shadow-sm">
          <span className="material-symbols-outlined text-[20px]">dictionary</span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Common Compounds
        </span>
      </div>
      <div className="space-y-2">
        {words.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-3 p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/10"
          >
            <span className="chinese-char text-lg font-bold text-on-surface min-w-[2.5rem] text-center">
              {w.word}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{w.pinyin}</p>
              <p className="text-xs text-on-surface-variant truncate">{w.meaning}</p>
            </div>
            <SpeakButton text={w.word} size="sm" />
            {w.hskLevel && (
              <span className="text-[9px] font-bold text-outline bg-surface-container-high px-2 py-0.5 rounded-full">
                HSK {w.hskLevel}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
