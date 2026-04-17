'use client';

import { trpc } from '@/trpc/client';

interface RadicalBreakdownProps {
  character: string;
  className?: string;
}

const POSITION_LABELS: Record<string, string> = {
  left: '← Left',
  right: 'Right →',
  top: '↑ Top',
  bottom: '↓ Bottom',
  outer: '□ Outer',
  inner: '◦ Inner',
  middle: '⊙ Middle',
};

export function RadicalBreakdown({ character, className = '' }: RadicalBreakdownProps) {
  const { data, isLoading } = trpc.features.getRadicals.useQuery(
    { character },
    { enabled: !!character }
  );

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 w-36 bg-surface-container-high rounded animate-pulse" />
        <div className="h-20 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[16px]">account_tree</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Radical Breakdown
        </span>
      </div>

      {/* Decomposition Visual */}
      <div className="bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="chinese-char text-3xl font-bold text-on-surface">{character}</span>
          <span className="text-on-surface-variant text-lg">=</span>
          {data.radicals.map((r, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-on-surface-variant">+</span>}
              <span className="chinese-char text-2xl font-bold text-primary">{r.radical}</span>
            </span>
          ))}
        </div>

        {/* Radical details */}
        <div className="grid grid-cols-2 gap-2">
          {data.radicals.map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg">
              <span className="chinese-char text-lg font-bold text-primary w-7 text-center">{r.radical}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{r.meaning}</p>
                <p className="text-[9px] text-on-surface-variant">{POSITION_LABELS[r.position] || r.position}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Etymology */}
        {data.etymology && (
          <p className="text-xs text-on-surface-variant mt-3 italic leading-relaxed border-t border-outline-variant/10 pt-2">
            💡 {data.etymology}
          </p>
        )}
      </div>
    </div>
  );
}
