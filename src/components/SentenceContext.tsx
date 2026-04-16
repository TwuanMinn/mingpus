'use client';

import { trpc } from '@/trpc/client';

interface SentenceContextProps {
  character: string;
  className?: string;
}

export function SentenceContext({ character, className = '' }: SentenceContextProps) {
  const { data: sentences, isLoading } = trpc.getSentences.useQuery(
    { character },
    { enabled: !!character }
  );

  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 w-32 bg-surface-container-high rounded animate-pulse" />
        <div className="h-12 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!sentences || sentences.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[16px]">menu_book</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Example Sentences
        </span>
      </div>
      <div className="space-y-2">
        {sentences.slice(0, 2).map((s) => (
          <div
            key={s.id}
            className="bg-surface-container-lowest/60 p-3 rounded-xl border border-outline-variant/10"
          >
            <p className="chinese-char text-sm text-on-surface leading-relaxed">
              {s.sentence.split(character).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="text-primary font-bold bg-primary/10 px-0.5 rounded">
                      {character}
                    </span>
                  )}
                </span>
              ))}
            </p>
            <p className="text-xs text-on-surface-variant mt-1 italic">{s.pinyin}</p>
            <p className="text-xs text-on-surface-variant/80">{s.translation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
