'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { trpc } from '@/trpc/client';
import { SpeakButton } from '@/components/SpeakButton';

const HISTORY_KEY = 'dc-search-history';
const BOOKMARKS_KEY = 'dc-bookmarks';
const SEARCH_DEBOUNCE_MS = 300;
const MAX_INPUT = 500;

interface HistoryEntry {
  char: string;
  pinyin: string;
  meaning: string;
  time: string;
}

function loadList(key: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function DictionaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [hskFilter, setHskFilter] = useState<number | undefined>(undefined);
  const [searchHistory, setSearchHistory] = useState<HistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<HistoryEntry[]>([]);
  const [addingToStudy, setAddingToStudy] = useState<string | null>(null);
  const [direction, setDirection] = useState<'en-zh' | 'zh-en'>('en-zh');
  const [swapRotation, setSwapRotation] = useState(0);
  const [selectedDeckId, setSelectedDeckId] = useState<number | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEnToZh = direction === 'en-zh';
  const leftLabel = isEnToZh ? 'English' : 'Mandarin';
  const rightLabel = isEnToZh ? 'Mandarin' : 'English';

  // Debounce query for tRPC + URL sync
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Sync debounced query to URL (no history spam)
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedQuery === current) return;
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) params.set('q', debouncedQuery);
    else params.delete('q');
    router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  // Pick up external URL changes (back/forward)
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setQuery(prev => (prev === q ? prev : q));
  }, [searchParams]);

  // Hydrate history + bookmarks, and keep in sync across tabs
  useEffect(() => {
    setSearchHistory(loadList(HISTORY_KEY));
    setBookmarks(loadList(BOOKMARKS_KEY));
    const onStorage = (e: StorageEvent) => {
      if (e.key === HISTORY_KEY) setSearchHistory(loadList(HISTORY_KEY));
      if (e.key === BOOKMARKS_KEY) setBookmarks(loadList(BOOKMARKS_KEY));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Keyboard shortcuts: "/" or Ctrl/Cmd+K to focus, Esc to clear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if ((e.key === '/' && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        textareaRef.current?.focus();
      } else if (e.key === 'Escape' && target === textareaRef.current) {
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSwapDirection = () => {
    setDirection(prev => (prev === 'en-zh' ? 'zh-en' : 'en-zh'));
    setSwapRotation(prev => prev + 180);
    setQuery('');
  };

  const { data: decksData } = trpc.deck.getDecks.useQuery();
  const addCard = trpc.flashcard.addCard.useMutation();
  const utils = trpc.useUtils();

  // Default selected deck to first available
  useEffect(() => {
    if (!selectedDeckId && decksData?.length) setSelectedDeckId(decksData[0].id);
  }, [decksData, selectedDeckId]);

  const { data: results, isLoading } = trpc.dictionary.searchCharacters.useQuery(
    { query: debouncedQuery, hskLevel: hskFilter },
    { enabled: debouncedQuery.length > 0 }
  );

  const selectedResult = results?.[0];
  const isBookmarked = selectedResult
    ? bookmarks.some(b => b.char === selectedResult.character)
    : false;

  const persistList = (key: string, next: HistoryEntry[]) => {
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  };

  const addToHistory = useCallback((char: string, pinyin: string, meaning: string) => {
    setSearchHistory(prev => {
      const next = [
        { char, pinyin, meaning, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.filter(h => h.char !== char).slice(0, 9),
      ];
      persistList(HISTORY_KEY, next);
      return next;
    });
  }, []);

  const toggleBookmark = (char: string, pinyin: string, meaning: string) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.char === char);
      const next = exists
        ? prev.filter(b => b.char !== char)
        : [{ char, pinyin, meaning, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 50);
      persistList(BOOKMARKS_KEY, next);
      return next;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    persistList(HISTORY_KEY, []);
  };

  const copyCharacter = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const handleAddToDeck = async () => {
    if (!selectedResult || !selectedDeckId || addingToStudy) return;
    setAddingToStudy(selectedResult.character);
    setErrorMsg(null);
    try {
      await addCard.mutateAsync({
        deckId: selectedDeckId,
        character: selectedResult.character,
        pinyin: selectedResult.pinyin,
        meaning: selectedResult.meaning,
        hskLevel: selectedResult.hskLevel ?? undefined,
      });
      addToHistory(selectedResult.character, selectedResult.pinyin, selectedResult.meaning);
      utils.deck.getDecks.invalidate();
      utils.dashboard.getDashboardStats.invalidate();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setAddingToStudy(null);
    }
  };

  const selectedDeckTitle = decksData?.find(d => d.id === selectedDeckId)?.title ?? 'Deck';
  const showingLoading = isLoading && debouncedQuery.length > 0;

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
                <h2 className="text-2xl sm:text-3xl font-extrabold text-on-background font-(family-name:--font-jakarta) tracking-tight">Refine Your Flow</h2>
              </div>
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-full" role="group" aria-label="HSK level filter">
                {[undefined, 1, 2, 3, 4, 5, 6].map(level => {
                  const active = hskFilter === level;
                  return (
                    <button key={level ?? 'all'}
                      onClick={() => setHskFilter(level)}
                      aria-pressed={active}
                      className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                        active
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}>
                      {level ? `HSK ${level}` : 'All'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Translator Card */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-[0_32px_64px_-4px_rgba(27,27,35,0.06)] overflow-hidden">
              {/* Language Toggle Bar */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 py-3 sm:py-4 bg-surface-container-low">
                <span className="text-sm font-bold text-on-surface font-(family-name:--font-jakarta) min-w-18 text-right">{leftLabel}</span>
                <button
                  onClick={handleSwapDirection}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  aria-label="Swap translation direction"
                  title="Swap direction"
                >
                  <span
                    className="material-symbols-outlined text-[20px] sm:text-[24px] transition-transform duration-300"
                    style={{ transform: `rotate(${swapRotation}deg)` }}
                  >swap_horiz</span>
                </button>
                <span className="text-sm font-bold text-on-surface font-(family-name:--font-jakarta) min-w-18 text-left">{rightLabel}</span>
              </div>

              {/* Input/Output Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Input */}
                <div className="p-5 sm:p-8 border-b md:border-b-0 md:border-r border-outline-variant/15">
                  <label htmlFor="dict-query" className="sr-only">Search characters or meanings</label>
                  <textarea
                    id="dict-query"
                    ref={textareaRef}
                    value={query}
                    maxLength={MAX_INPUT}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-36 sm:h-48 bg-transparent border-none focus:ring-0 text-lg sm:text-xl font-medium text-on-background placeholder-outline/50 resize-none outline-none"
                    placeholder={isEnToZh ? 'Enter English word or phrase (press / to focus)' : 'Enter Chinese character or pinyin (press / to focus)'}
                  />
                  <div className="flex justify-between items-center mt-3 sm:mt-4">
                    <span className="text-xs text-outline font-medium">{query.length} / {MAX_INPUT}</span>
                    <button
                      onClick={() => setQuery('')}
                      aria-label="Clear input"
                      className="text-outline hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">backspace</span>
                    </button>
                  </div>
                </div>

                {/* Output */}
                <div className="p-5 sm:p-8 bg-surface-bright/30">
                  <div className="h-36 sm:h-48">
                    {showingLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-10 w-24 bg-primary/10 rounded" />
                        <div className="h-5 w-32 bg-secondary/10 rounded" />
                        <div className="h-4 w-full bg-on-surface-variant/10 rounded" />
                        <div className="h-4 w-3/4 bg-on-surface-variant/10 rounded" />
                      </div>
                    ) : selectedResult ? (
                      isEnToZh ? (
                        <>
                          <p className="text-3xl sm:text-4xl chinese-char text-primary font-bold mb-2 tracking-wide leading-relaxed">{selectedResult.character}</p>
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className="text-base sm:text-lg text-secondary font-medium tracking-widest">{selectedResult.pinyin}</p>
                            <SpeakButton text={selectedResult.character} size="sm" />
                          </div>
                          <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base">{selectedResult.meaning}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl sm:text-2xl font-bold text-primary mb-2 leading-relaxed">{selectedResult.meaning}</p>
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <p className="text-2xl sm:text-3xl chinese-char text-on-surface font-medium">{selectedResult.character}</p>
                            <SpeakButton text={selectedResult.character} size="sm" />
                          </div>
                          <p className="text-on-surface-variant leading-relaxed text-sm sm:text-base tracking-widest">{selectedResult.pinyin}</p>
                        </>
                      )
                    ) : debouncedQuery.length > 0 ? (
                      <p className="text-on-surface-variant text-sm py-4">No results found</p>
                    ) : (
                      <p className="text-outline/50 text-sm py-4">Start typing to search...</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-1 mt-3 sm:mt-4">
                    {selectedResult && (
                      <>
                        <Link
                          href={`/strokes?char=${encodeURIComponent(selectedResult.character)}`}
                          aria-label="View stroke order"
                          title="Stroke order"
                          className="p-2 text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">draw</span>
                        </Link>
                        <button
                          onClick={() => copyCharacter(selectedResult.character)}
                          aria-label="Copy character"
                          title="Copy"
                          className="p-2 text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => toggleBookmark(selectedResult.character, selectedResult.pinyin, selectedResult.meaning)}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                          aria-pressed={isBookmarked}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                          className={`p-2 transition-colors ${isBookmarked ? 'text-primary' : 'text-outline hover:text-primary'}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isBookmarked ? 'bookmark' : 'bookmark_add'}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="px-5 sm:px-8 py-3 bg-red-500/10 text-red-400 text-xs font-medium flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg(null)} aria-label="Dismiss error" className="text-red-400 hover:text-red-300">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {/* Action Bar */}
              {selectedResult && (
                <div className="px-5 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container-low/50">
                  <div className="flex gap-2 flex-wrap">
                    {selectedResult.hskLevel && (
                      <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">HSK {selectedResult.hskLevel}</span>
                    )}
                    <span className="bg-secondary/10 text-secondary text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">{selectedResult.deckTitle}</span>
                    {selectedResult.source === 'dictionary' && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Built-in</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {decksData && decksData.length > 1 && (
                      <select
                        aria-label="Target deck"
                        value={selectedDeckId ?? ''}
                        onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                        className="bg-surface-container-lowest text-on-surface text-xs font-bold rounded-full px-3 py-2 border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {decksData.map(d => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={handleAddToDeck}
                      className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-primary to-secondary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 transition-transform active:scale-95 flex-1 sm:flex-none justify-center disabled:opacity-50"
                      disabled={!!addingToStudy || !decksData?.length}
                      title={!decksData?.length ? 'Create a deck first' : undefined}
                    >
                      <span className="material-symbols-outlined text-sm">{addingToStudy ? 'hourglass_empty' : 'bookmark_add'}</span>
                      {addingToStudy ? 'Adding...' : !decksData?.length ? 'No decks yet' : `Add to ${selectedDeckTitle}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Sections Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Search Results (2/3 width) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-bold font-(family-name:--font-jakarta) flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              {results && results.length > 0 ? `Results (${results.length})` : 'Search Results'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {showingLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 sm:p-6 bg-surface-container-low rounded-xl sm:rounded-2xl border-l-4 border-primary/20 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-secondary/10 rounded" />
                        <div className="h-3 w-3/4 bg-on-surface-variant/10 rounded" />
                      </div>
                    </div>
                  </div>
                ))
              ) : results && results.length > 0 ? results.slice(0, 10).map((r) => (
                <button key={r.id}
                  type="button"
                  onClick={() => { setQuery(r.character); addToHistory(r.character, r.pinyin, r.meaning); }}
                  className="w-full text-left p-4 sm:p-6 bg-surface-container-low rounded-xl sm:rounded-2xl border-l-4 border-primary/20 cursor-pointer hover:bg-surface-container-high transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl sm:text-3xl chinese-char text-primary font-bold">{r.character}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-secondary">{r.pinyin}</p>
                      <p className="text-xs sm:text-sm text-on-surface-variant truncate">{r.meaning}</p>
                    </div>
                    <div className="flex gap-1.5 items-center shrink-0">
                      {r.hskLevel && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">HSK {r.hskLevel}</span>
                      )}
                      {r.source === 'dictionary' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Dict</span>
                      )}
                    </div>
                  </div>
                </button>
              )) : debouncedQuery.length > 0 ? (
                <div className="p-6 bg-surface-container-low rounded-xl text-center">
                  <p className="text-sm text-on-surface-variant">No matching characters found.</p>
                </div>
              ) : (
                <div className="p-6 bg-surface-container-low rounded-xl text-center">
                  <p className="text-sm text-on-surface-variant">Type a character, pinyin, or English meaning to search. Press <kbd className="px-1.5 py-0.5 text-[10px] bg-surface-container-high rounded">/</kbd> anywhere to focus.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right rail: Bookmarks + Recent History + Daily Quote */}
          <div className="space-y-4 sm:space-y-6">
            {bookmarks.length > 0 && (
              <>
                <h3 className="text-base sm:text-lg font-bold font-(family-name:--font-jakarta) flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Bookmarks ({bookmarks.length})
                </h3>
                <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-outline-variant/10 max-h-64 overflow-y-auto">
                    {bookmarks.map(item => (
                      <button key={item.char}
                        type="button"
                        onClick={() => setQuery(item.char)}
                        className="w-full text-left p-3 sm:p-4 hover:bg-surface-container-low transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold font-(family-name:--font-jakarta) truncate pr-2">{item.meaning}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); toggleBookmark(item.char, item.pinyin, item.meaning); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleBookmark(item.char, item.pinyin, item.meaning); } }}
                            aria-label="Remove bookmark"
                            className="material-symbols-outlined text-[14px] text-primary hover:text-red-400"
                          >
                            bookmark
                          </span>
                        </div>
                        <p className="text-sm sm:text-base chinese-char text-primary">{item.char} ({item.pinyin})</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold font-(family-name:--font-jakarta) flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                Recent History
              </h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-[10px] font-bold uppercase tracking-wider text-outline hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="bg-surface-container-lowest rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-outline-variant/10">
                {searchHistory.length > 0 ? searchHistory.map((item) => (
                  <button key={item.char}
                    type="button"
                    onClick={() => setQuery(item.char)}
                    className="w-full text-left p-3 sm:p-4 hover:bg-surface-container-low transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold font-(family-name:--font-jakarta) truncate pr-2">{item.meaning}</span>
                      <span className="text-[10px] text-outline shrink-0">{item.time}</span>
                    </div>
                    <p className="text-sm sm:text-base chinese-char text-primary">{item.char} ({item.pinyin})</p>
                  </button>
                )) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-on-surface-variant">No search history yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Card */}
            <div className="relative h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden group">
              <Image
                alt="Calligraphy inspiration"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpKJnS9oIytVDK5qm1wzhQJGI35IHDpmQYx2C3yruu7LMo9BaDNxnqPsuUz_5yLQdfgfu5svgPBOkpbMP7eoGEaXPu-Bt3YI1i1iEM9Yk5e7XxD1tdbBtr0MX8ZxQu8jnXjt0m6d8_NbAn603rcAodM81uFjTeggFMp8bxV2NBERt5VxEXIfqnCpfVPo4cbe689kmBsZN2d-QBx-3LuJi3eYIjL-inGL_tcSRXUiO88OlNX5LMOxICWclyobcKhrwqxvcdfZbaF6HZ"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-indigo-900/80 to-transparent flex flex-col justify-end p-4 sm:p-5">
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
