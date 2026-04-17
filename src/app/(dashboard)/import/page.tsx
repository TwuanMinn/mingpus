'use client';

import { useState, useCallback, useRef } from 'react';
import { trpc } from '@/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyCard {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
}

interface UserAnswer {
  pinyin: string;
  english: string;
  vietnamese: string;
}

type CheckState = 'idle' | 'correct' | 'incorrect' | 'partial';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkField(userInput: string, correct: string): boolean {
  if (!userInput.trim()) return false;
  const u = normalize(userInput);
  const c = normalize(correct);
  // Exact match or user input is contained in correct answer (for partial meanings like "hello" matching "hello; hi")
  return u === c || c.includes(u) || u.includes(c);
}

function getCardStatus(answer: UserAnswer, card: StudyCard): CheckState {
  const hasPinyin = answer.pinyin.trim().length > 0;
  const hasEnglish = answer.english.trim().length > 0;
  const hasVietnamese = answer.vietnamese.trim().length > 0;

  if (!hasPinyin && !hasEnglish && !hasVietnamese) return 'idle';

  const pinyinOk = hasPinyin ? checkField(answer.pinyin, card.pinyin) : false;
  const englishOk = hasEnglish ? checkField(answer.english, card.meaning) : false;

  const filledCount = [hasPinyin, hasEnglish, hasVietnamese].filter(Boolean).length;
  const correctCount = [pinyinOk, englishOk].filter(Boolean).length + (hasVietnamese ? 1 : 0); // Vietnamese is always "accepted" since we don't have ground truth

  if (filledCount === 0) return 'idle';
  if (pinyinOk && englishOk) return 'correct';
  if (correctCount > 0 && correctCount < filledCount) return 'partial';
  if (filledCount > 0 && correctCount === 0) return 'incorrect';
  return 'partial';
}

export default function ImportPage() {
  const { data: decksData } = trpc.deck.getDecks.useQuery();

  const [mode, setMode] = useState<'deck' | 'import'>('deck');
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [started, setStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const decks = decksData ?? [];

  const cardsQuery = trpc.flashcard.getCardsForDeck.useQuery(
    { deckId: selectedDeck ?? 0 },
    { enabled: !!selectedDeck && mode === 'deck' },
  );

  const handleLoadDeck = useCallback(() => {
    if (cardsQuery.data && cardsQuery.data.length > 0) {
      const cards: StudyCard[] = cardsQuery.data.map((c) => ({
        id: c.id,
        character: c.character,
        pinyin: c.pinyin,
        meaning: c.meaning,
      }));
      setStudyCards(cards);
      setAnswers({});
      setStarted(true);
      setShowResults(false);
    }
  }, [cardsQuery.data]);

  const handleParse = () => {
    const lines = pasteText.split('\n').filter((l) => l.trim());
    const cards: StudyCard[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes(',') ? line.split(',') : line.split(/\s+/);
      if (parts.length >= 3) {
        cards.push({
          id: -(i + 1), // negative IDs for imported
          character: parts[0].trim(),
          pinyin: parts[1].trim(),
          meaning: parts.slice(2).join(' ').trim(),
        });
      } else if (parts.length === 2) {
        cards.push({
          id: -(i + 1),
          character: parts[0].trim(),
          pinyin: '',
          meaning: parts[1].trim(),
        });
      }
    }
    if (cards.length > 0) {
      setStudyCards(cards);
      setAnswers({});
      setStarted(true);
      setShowResults(false);
    }
  };

  const updateAnswer = (cardId: number, field: keyof UserAnswer, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [cardId]: {
        pinyin: '',
        english: '',
        vietnamese: '',
        ...prev[cardId],
        [field]: value,
      },
    }));
  };

  const getAnswer = (cardId: number): UserAnswer =>
    answers[cardId] ?? { pinyin: '', english: '', vietnamese: '' };

  const handleCheckAll = () => setShowResults(true);

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const totalCards = studyCards.length;
  const correctCount = studyCards.filter(
    (c) => getCardStatus(getAnswer(c.id), c) === 'correct',
  ).length;
  const attemptedCount = studyCards.filter(
    (c) => getCardStatus(getAnswer(c.id), c) !== 'idle',
  ).length;

  const statusIcon = (status: CheckState) => {
    switch (status) {
      case 'correct':
        return <span className="material-symbols-outlined text-[18px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>;
      case 'incorrect':
        return <span className="material-symbols-outlined text-[18px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>;
      case 'partial':
        return <span className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-on-surface-variant/20 inline-block" />;
    }
  };

  const fieldClass = (isCorrect: boolean | null) => {
    if (!showResults || isCorrect === null)
      return 'bg-surface-container-lowest border border-transparent focus:border-primary/40';
    return isCorrect
      ? 'bg-green-500/10 border border-green-500/30 text-green-300'
      : 'bg-red-500/10 border border-red-500/30 text-red-300';
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 bg-surface pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold font-(family-name:--font-jakarta) tracking-tight text-on-surface">
            Expand Your Lexicon
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base lg:text-lg max-w-2xl">
            Test your knowledge — fill in pinyin, English, and Vietnamese for each character. Auto-checked instantly.
          </p>
        </header>

        {!started ? (
          /* ── Setup Phase ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left Panel: Mode Selection */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              {/* Mode Tabs */}
              <div className="flex gap-1 bg-surface-container-low rounded-2xl p-1">
                {(['deck', 'import'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      mode === m
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {m === 'deck' ? '📚 Choose Deck' : '📝 Import Words'}
                  </button>
                ))}
              </div>

              {mode === 'deck' ? (
                <div className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-5">
                  <h3 className="text-sm uppercase tracking-widest text-on-surface-variant font-medium">Select a Deck</h3>
                  <select
                    value={selectedDeck ?? ''}
                    onChange={(e) => setSelectedDeck(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-surface-container-lowest border-0 text-on-surface p-3 sm:p-4 rounded-xl outline-none text-sm sm:text-base"
                  >
                    <option value="">Select a deck...</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.cardCount} cards)
                      </option>
                    ))}
                  </select>
                  {cardsQuery.data && (
                    <p className="text-xs text-on-surface-variant">
                      {cardsQuery.data.length} cards ready to study
                    </p>
                  )}
                  <button
                    onClick={handleLoadDeck}
                    disabled={!selectedDeck || !cardsQuery.data?.length}
                    className="w-full bg-linear-to-r from-primary to-secondary text-white px-6 py-3.5 rounded-full font-bold text-base shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-40"
                  >
                    Start Learning
                  </button>
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-on-surface-variant font-medium">Quick Paste</h3>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="w-full bg-surface-container-lowest border-0 text-on-surface p-3 sm:p-4 rounded-xl chinese-char text-base sm:text-lg min-h-[140px] outline-none resize-none"
                    placeholder={"你好,nǐ hǎo,Hello\n书,shū,Book\n学,xué,To study"}
                  />
                  <div className="flex justify-between items-center">
                    <label className="text-primary font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer">
                      <span className="material-symbols-outlined text-sm">upload_file</span>
                      Upload CSV/TXT
                      <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setPasteText(ev.target?.result as string);
                          reader.readAsText(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      onClick={handleParse}
                      disabled={!pasteText.trim()}
                      className="bg-linear-to-r from-primary to-secondary text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-40"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Instructions */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-on-surface/5">
                <h3 className="font-bold text-lg font-(family-name:--font-jakarta) mb-6">How It Works</h3>
                <div className="space-y-5">
                  {[
                    { icon: 'library_books', title: 'Choose your words', desc: 'Pick an existing deck or paste Chinese characters' },
                    { icon: 'edit', title: 'Fill in the blanks', desc: 'Type the pinyin, English, and Vietnamese for each character' },
                    { icon: 'fact_check', title: 'Auto-check answers', desc: 'Your answers are validated in real-time as you type' },
                    { icon: 'emoji_events', title: 'Track your score', desc: 'See your accuracy and identify characters to review' },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">{step.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{step.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Tip */}
              <div className="bg-surface-container-low/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 flex items-center gap-4 border border-white/5">
                <div className="hidden sm:flex -space-x-3 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-secondary font-bold text-xs">A1</div>
                  <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-primary font-bold text-xs">B2</div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-tertiary font-bold text-xs">C1</div>
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  Format: <code className="bg-surface-container-high px-2 py-0.5 rounded text-xs">char,pinyin,meaning</code> — one per line.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Study Phase ── */
          <div className="space-y-6">
            {/* Score Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <button
                onClick={() => { setStarted(false); setStudyCards([]); setAnswers({}); setShowResults(false); }}
                className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">style</span>
                {totalCards} cards
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-amber-400">edit</span>
                {attemptedCount} attempted
              </div>
              {showResults && (
                <div className="flex items-center gap-2 text-sm font-bold text-green-400">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {correctCount}/{totalCards} correct
                </div>
              )}
              {showResults ? (
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-full font-bold text-sm bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={handleCheckAll}
                  disabled={attemptedCount === 0}
                  className="bg-linear-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-40"
                >
                  Check Answers
                </button>
              )}
            </div>

            {/* Interactive Table */}
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-on-surface/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-surface-container-low/50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant w-16">#</th>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant">Character</th>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant">Pinyin</th>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant">English</th>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant">Vietnamese</th>
                      <th className="px-4 sm:px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant text-center w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {studyCards.map((card, idx) => {
                      const answer = getAnswer(card.id);
                      const status = showResults ? getCardStatus(answer, card) : 'idle';
                      const pinyinCorrect = showResults && answer.pinyin.trim() ? checkField(answer.pinyin, card.pinyin) : null;
                      const englishCorrect = showResults && answer.english.trim() ? checkField(answer.english, card.meaning) : null;

                      return (
                        <motion.tr
                          key={card.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          className={`transition-colors ${
                            showResults && status === 'correct'
                              ? 'bg-green-500/5'
                              : showResults && status === 'incorrect'
                              ? 'bg-red-500/5'
                              : 'hover:bg-primary-fixed/10'
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-3 text-xs text-on-surface-variant font-mono">{idx + 1}</td>
                          <td className="px-4 sm:px-6 py-3">
                            <span className="text-2xl sm:text-3xl chinese-char text-primary font-light">{card.character}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-2">
                            <div className="relative">
                              <input
                                ref={(el) => { inputRefs.current[`pinyin-${card.id}`] = el; }}
                                type="text"
                                value={answer.pinyin}
                                onChange={(e) => updateAnswer(card.id, 'pinyin', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    inputRefs.current[`english-${card.id}`]?.focus();
                                  }
                                }}
                                placeholder="pīnyīn"
                                disabled={showResults}
                                className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${fieldClass(pinyinCorrect)}`}
                              />
                              {showResults && pinyinCorrect === false && (
                                <p className="text-[10px] text-green-400/80 mt-0.5 pl-1">{card.pinyin}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-2">
                            <div className="relative">
                              <input
                                ref={(el) => { inputRefs.current[`english-${card.id}`] = el; }}
                                type="text"
                                value={answer.english}
                                onChange={(e) => updateAnswer(card.id, 'english', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    inputRefs.current[`vietnamese-${card.id}`]?.focus();
                                  }
                                }}
                                placeholder="meaning"
                                disabled={showResults}
                                className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${fieldClass(englishCorrect)}`}
                              />
                              {showResults && englishCorrect === false && (
                                <p className="text-[10px] text-green-400/80 mt-0.5 pl-1">{card.meaning}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-2">
                            <input
                              ref={(el) => { inputRefs.current[`vietnamese-${card.id}`] = el; }}
                              type="text"
                              value={answer.vietnamese}
                              onChange={(e) => updateAnswer(card.id, 'vietnamese', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                  e.preventDefault();
                                  const nextCard = studyCards[idx + 1];
                                  if (nextCard) inputRefs.current[`pinyin-${nextCard.id}`]?.focus();
                                }
                              }}
                              placeholder="tiếng Việt"
                              disabled={showResults}
                              className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all bg-surface-container-lowest border border-transparent focus:border-primary/40`}
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-center">
                            {statusIcon(status)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results Summary */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-extrabold text-green-400">{correctCount}</p>
                    <p className="text-xs font-medium text-green-400/70 mt-1">Correct</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-extrabold text-amber-400">{attemptedCount - correctCount}</p>
                    <p className="text-xs font-medium text-amber-400/70 mt-1">Needs Review</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-extrabold text-primary">{totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0}%</p>
                    <p className="text-xs font-medium text-primary/70 mt-1">Accuracy</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
