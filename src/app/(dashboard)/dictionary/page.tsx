'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/trpc/client';
import { SpeakButton } from '@/components/SpeakButton';
import { usePageTitle } from '@/hooks/usePageTitle';

const HISTORY_KEY = 'dc-search-history';

interface HistoryEntry {
  char: string;
  pinyin: string;
  meaning: string;
  time: string;
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function DictionaryPage() {
  usePageTitle('Dictionary');
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [hskFilter, setHskFilter] = useState<number | undefined>(undefined);
  const [searchHistory, setSearchHistory] = useState<HistoryEntry[]>([]);
  const [addingToStudy, setAddingToStudy] = useState<string | null>(null);

  // Sync URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) setQuery(q);
  }, [searchParams]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setSearchHistory(loadHistory());
  }, []);

  const { data: decksData } = trpc.getDecks.useQuery();
  const addCard = trpc.addCard.useMutation();
  const utils = trpc.useUtils();

  const { data: results, isLoading } = trpc.searchCharacters.useQuery(
    { query, hskLevel: hskFilter },
    { enabled: query.length > 0 }
  );

  const selectedResult = results?.[0];

  const addToHistory = (char: string, pinyin: string, meaning: string) => {
    setSearchHistory(prev => {
      const next = [
        { char, pinyin, meaning, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.filter(h => h.char !== char).slice(0, 9),
      ];
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="flex-1 pt-6 pb-24 md:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Translation Hero Area */}
        <section className="mb-8 sm:mb-12">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] text-primary uppercase block mb-1">Translation Studio</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-background font-[family-name:var(--font-jakarta)] tracking-tight">Refine Your Flow</h2>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
                {[undefined, 1, 2, 3, 4, 5, 6].map(level => (
                  <button key={level ?? 'all'}
                    onClick={() => setHskFilter(level)}
                    className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                      hskFilter === level
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                    {level ? `HSK ${level}` : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Translator Card */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] overflow-hidden">
              {/* Language Toggle Bar */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 py-3 sm:py-4 bg-surface-container-low">
                <span className="text-sm font-bold text-on-surface font-[family-name:var(--font-jakarta)]">English</span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">swap_horiz</span>
                </div>
                <span className="text-sm font-bold text-on-surface font-[family-name:var(--font-jakarta)]">Mandarin</span>
              </div>

              {/* Input/Output Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Input */}
                <div className="p-5 sm:p-8 border-b md:border-b-0 md:border-r border-outline-variant/15">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-36 sm:h-48 bg-transparent border-none focus:ring-0 text-lg sm:text-xl font-medium text-on-background placeholder-outline/50 resize-none outline-none"
                    placeholder="Enter Chinese or English"
                  ></textarea>
                  <div className="flex justify-between items-center mt-3 sm:mt-4">
                    <span className="text-xs text-outline font-medium">{query.length} / 500</span>
                    <button onClick={() => setQuery('')} className="text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">backspace</span>
                    </button>
                  </div>
                </div>

                {/* Output */}
                <div className="p-5 sm:p-8 bg-surface-bright/30">
                  <div className="h-36 sm:h-48">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : selectedResult ? (
                      <>
                        <p className="text-3xl sm:text-4xl chinese-char text-primary font-bold mb-2 tracking-wide leading-relaxed">{selectedResult.character}</p>
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <p className="text-base sm:text-lg text-secondary font-medium tracking-widest">{selectedResult.pinyin}</p>
                          <SpeakButton text={selectedResult.character} size="sm" />
                        </div>
                        <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">{selectedResult.meaning}</p>
                      </>
                    ) : query.length > 0 ? (
                      <p className="text-on-surface-variant text-sm py-4">No results found</p>
                    ) : (
                      <p className="text-outline/50 text-sm py-4">Start typing to search...</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 mt-3 sm:mt-4">
                    {selectedResult && (
                      <button onClick={() => addToHistory(selectedResult.character, selectedResult.pinyin, selectedResult.meaning)}
                        className="p-2 text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {selectedResult && (
                <div className="px-5 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/50">
                  <div className="flex gap-2">
                    {selectedResult.hskLevel && (
                      <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">HSK {selectedResult.hskLevel}</span>
                    )}
                    <span className="bg-secondary/10 text-secondary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">{selectedResult.deckTitle}</span>
                  </div>
                  <button onClick={async () => {
                    if (!decksData?.length || addingToStudy) return;
                    setAddingToStudy(selectedResult.character);
                    try {
                      await addCard.mutateAsync({
                        deckId: decksData[0].id,
                        character: selectedResult.character,
                        pinyin: selectedResult.pinyin,
                        meaning: selectedResult.meaning,
                        hskLevel: selectedResult.hskLevel ?? undefined,
                      });
                      addToHistory(selectedResult.character, selectedResult.pinyin, selectedResult.meaning);
                      utils.getDecks.invalidate();
                      utils.getDashboardStats.invalidate();
                    } catch {} finally {
                      setAddingToStudy(null);
                    }
                  }}
                    className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 transition-transform active:scale-95 w-full sm:w-auto justify-center disabled:opacity-50"
                    disabled={!!addingToStudy || !decksData?.length}>
                    <span className="material-symbols-outlined text-sm">{addingToStudy ? 'hourglass_empty' : 'bookmark_add'}</span>
                    {addingToStudy ? 'Adding...' : `Add to ${decksData?.[0]?.title ?? 'Deck'}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Sections Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Search Results (2/3 width) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              {results && results.length > 0 ? `Results (${results.length})` : 'Search Results'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {results && results.length > 0 ? results.slice(0, 10).map((r) => (
                <div key={r.id}
                  onClick={() => { setQuery(r.character); addToHistory(r.character, r.pinyin, r.meaning); }}
                  className="p-4 sm:p-6 bg-surface-container-low rounded-xl sm:rounded-2xl border-l-4 border-primary/20 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl sm:text-3xl chinese-char text-primary font-bold">{r.character}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-secondary">{r.pinyin}</p>
                      <p className="text-xs sm:text-sm text-on-surface-variant truncate">{r.meaning}</p>
                    </div>
                    {r.hskLevel && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">HSK {r.hskLevel}</span>
                    )}
                  </div>
                </div>
              )) : query.length > 0 && !isLoading ? (
                <div className="p-6 bg-surface-container-low rounded-xl text-center">
                  <p className="text-sm text-on-surface-variant">No matching characters found.</p>
                </div>
              ) : (
                <div className="p-6 bg-surface-container-low rounded-xl text-center">
                  <p className="text-sm text-on-surface-variant">Type a character, pinyin, or English meaning to search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent History (1/3 width) */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-jakarta)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
              Recent History
            </h3>
            <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-outline-variant/10">
                {searchHistory.length > 0 ? searchHistory.map((item) => (
                  <div key={item.char} onClick={() => setQuery(item.char)}
                    className="p-3 sm:p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold font-[family-name:var(--font-jakarta)]">{item.meaning}</span>
                      <span className="text-[10px] text-outline">{item.time}</span>
                    </div>
                    <p className="text-sm sm:text-base chinese-char text-primary">{item.char} ({item.pinyin})</p>
                  </div>
                )) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-on-surface-variant">No search history yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Card */}
            <div className="relative h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden group">
              <img
                alt="Calligraphy inspiration"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpKJnS9oIytVDK5qm1wzhQJGI35IHDpmQYx2C3yruu7LMo9BaDNxnqPsuUz_5yLQdfgfu5svgPBOkpbMP7eoGEaXPu-Bt3YI1i1iEM9Yk5e7XxD1tdbBtr0MX8ZxQu8jnXjt0m6d8_NbAn603rcAodM81uFjTeggFMp8bxV2NBERt5VxEXIfqnCpfVPo4cbe689kmBsZN2d-QBx-3LuJi3eYIjL-inGL_tcSRXUiO88OlNX5LMOxICWclyobcKhrwqxvcdfZbaF6HZ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4 sm:p-5">
                <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Daily Quote</p>
                <p className="text-white chinese-char text-lg">宁静致远</p>
                <p className="text-white/70 text-[10px] italic">Tranquility yields transcendence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
