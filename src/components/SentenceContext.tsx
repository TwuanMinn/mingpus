'use client';

import { useEffect } from 'react';
import { trpc } from '@/trpc/client';

interface SentenceContextProps {
  character: string;
  meaning?: string;
  hskLevel?: number | null;
  className?: string;
}

export function SentenceContext({ character, meaning = '', hskLevel, className = '' }: SentenceContextProps) {
  const utils = trpc.useUtils();
  const { data: sentences, isLoading } = trpc.features.getSentences.useQuery(
    { character },
    { enabled: !!character },
  );
  const generate = trpc.features.generateSentences.useMutation({
    onSuccess: () => utils.features.getSentences.invalidate({ character }),
  });

  // Auto-generate when no sentences exist and we have enough context
  useEffect(() => {
    if (!isLoading && sentences && sentences.length === 0 && meaning && !generate.isPending && !generate.isSuccess) {
      generate.mutate({ character, meaning, hskLevel: hskLevel ?? undefined });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, sentences?.length]);

  if (isLoading || generate.isPending) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-[16px]">menu_book</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Example Sentences
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-14 bg-surface-container-high rounded-xl animate-pulse" />
          <div className="h-14 bg-surface-container-high rounded-xl animate-pulse" />
        </div>
        {generate.isPending && (
          <p className="text-[9px] text-on-surface-variant/60 text-center">Generating with AI…</p>
        )}
      </div>
    );
  }

  if (generate.isError) {
    return null; // Silent fail — not critical for the review flow
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
