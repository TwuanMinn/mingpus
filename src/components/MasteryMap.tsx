'use client';

import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { SpeakButton } from './SpeakButton';

const MASTERY_CONFIG = {
  mastered: { color: 'bg-primary', ring: 'ring-primary/30', label: 'Mastered', icon: 'check_circle' },
  learning: { color: 'bg-secondary/60', ring: 'ring-secondary/20', label: 'Learning', icon: 'trending_up' },
  new: { color: 'bg-surface-container-high', ring: '', label: 'New', icon: 'fiber_new' },
} as const;

export function MasteryMap() {
  const { data, isLoading } = trpc.features.getMasteryMap.useQuery();

  type MasteryItem = NonNullable<typeof data>[number];
  const [hskFilter, setHskFilter] = useState<number | undefined>(undefined);
  const [selectedChar, setSelectedChar] = useState<MasteryItem | null>(null);

  if (isLoading) {
    return <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />;
  }

  if (!data || data.length === 0) return null;

  const filtered = hskFilter ? data.filter(c => c.hskLevel === hskFilter) : data;
  const counts = {
    mastered: data.filter(c => c.mastery === 'mastered').length,
    learning: data.filter(c => c.mastery === 'learning').length,
    new: data.filter(c => c.mastery === 'new').length,
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="font-[family-name:var(--font-jakarta)] font-bold text-lg text-on-surface">
          Character Mastery Map
        </h3>
        <div className="flex gap-4 text-xs">
          {Object.entries(MASTERY_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${cfg.color}`} />
              <span className="text-on-surface-variant font-medium">
                {cfg.label} ({counts[key as keyof typeof counts]})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HSK Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setHskFilter(undefined)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !hskFilter ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-fixed'
          }`}
        >
          All ({data.length})
        </button>
        {[1, 2, 3, 4, 5, 6].map(level => {
          const count = data.filter(c => c.hskLevel === level).length;
          if (count === 0) return null;
          return (
            <button
              key={level}
              onClick={() => setHskFilter(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                hskFilter === level ? 'bg-primary text-white' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-fixed'
              }`}
            >
              HSK {level} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2rem, 1fr))' }}>
        {filtered.map((c) => {
          const cfg = MASTERY_CONFIG[c.mastery];
          return (
            <button
              key={c.flashcardId}
              onClick={() => setSelectedChar(c)}
              className={`aspect-square rounded-md flex items-center justify-center text-xs chinese-char transition-all hover:scale-125 hover:z-10 hover:shadow-md ${cfg.color} ${cfg.ring ? `ring-1 ${cfg.ring}` : ''} ${
                c.mastery === 'mastered' ? 'text-on-primary' : c.mastery === 'learning' ? 'text-on-secondary' : 'text-on-surface-variant'
              }`}
              title={`${c.character} (${c.pinyin}) - ${cfg.label}`}
            >
              {c.character}
            </button>
          );
        })}
      </div>

      {/* Selected Character Detail */}
      {selectedChar && (
        <div className="mt-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex items-center gap-4">
          <span className="chinese-char text-4xl font-bold text-on-surface">{selectedChar.character}</span>
          <div className="flex-1">
            <p className="font-bold text-on-surface">{selectedChar.pinyin}</p>
            <p className="text-sm text-on-surface-variant">{selectedChar.meaning}</p>
          </div>
          <div className="flex items-center gap-2">
            <SpeakButton text={selectedChar.character} size="md" />
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              MASTERY_CONFIG[selectedChar.mastery].color
            } ${selectedChar.mastery !== 'new' ? 'text-white' : 'text-on-surface-variant'}`}>
              {MASTERY_CONFIG[selectedChar.mastery].label}
            </span>
          </div>
          <button onClick={() => setSelectedChar(null)} className="text-outline hover:text-on-surface p-1">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
