'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { trpc } from '@/trpc/client';
import { SpeakButton } from '@/components/SpeakButton';
import { PRESET_CHARS } from '@/lib/preset-characters';
import type HanziWriterType from 'hanzi-writer';

type StrokeMode = 'animate' | 'quiz';

/** Returns true if the string contains at least one CJK character */
function isChinese(str: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2ebef}\uf900-\ufaff]/u.test(str);
}

export default function StrokesPage() {
  const writerRef = useRef<HanziWriterType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedChar, setSelectedChar] = useState('永');
  const [mode, setMode] = useState<StrokeMode>('animate');
  const [quizResult, setQuizResult] = useState<{ correct: number; total: number } | null>(null);
  const [customChar, setCustomChar] = useState('');
  const [writerReady, setWriterReady] = useState(false);

  const { data: decksData } = trpc.deck.getDecks.useQuery();
  const { data: cards } = trpc.flashcard.getCardsForDeck.useQuery(
    { deckId: decksData?.[0]?.id ?? 0 },
    { enabled: !!decksData?.[0]?.id }
  );

  // Build a merged character list: presets + user's cards
  const userChars = (cards ?? []).slice(0, 12).map(c => ({
    char: c.character,
    name: c.pinyin,
    meaning: c.meaning,
  }));

  const allChars = [
    ...PRESET_CHARS,
    ...userChars.filter(uc => !PRESET_CHARS.some(p => p.char === uc.char)),
  ];

  const currentInfo = allChars.find(c => c.char === selectedChar) ?? {
    char: selectedChar,
    name: '',
    meaning: '',
  };

  const initWriter = useCallback(async (char: string, writerMode: StrokeMode) => {
    setWriterReady(false); // Begin loading phase
    
    // Clean up previous writer
    if (writerRef.current) {
      try { writerRef.current.hideCharacter(); } catch {}
      writerRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    if (!containerRef.current) return;

    // Guard: only allow actual Chinese characters
    if (!isChinese(char)) {
      setWriterReady(true);
      containerRef.current.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl text-outline mb-4">translate</span>
        <p class="text-sm font-medium">"${char}" is not a Chinese character</p>
        <p class="text-xs text-outline mt-1">Enter a Chinese character to practice strokes</p>
      </div>`;
      return;
    }

    const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight, 400);

    try {
      // Dynamic import — keeps HanziWriter out of the initial bundle
      const { default: HanziWriter } = await import('hanzi-writer');
      
      if (!containerRef.current) return;
      // Clear container again immediately before creating to prevent duplicate 
      // SVGs if multiple async setups fired (e.g. via React StrictMode)
      containerRef.current.innerHTML = '';

      const writer = HanziWriter.create(containerRef.current, char, {
        width: size,
        height: size,
        padding: 20,
        showOutline: true,
        showCharacter: writerMode === 'animate',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        strokeColor: '#4648d4',
        outlineColor: '#e4e1ed',
        drawingColor: '#8127cf',
        highlightColor: '#c0c1ff',
        radicalColor: '#4b41e1',
        drawingWidth: 6,
        showHintAfterMisses: 2,
        // @ts-ignore - Handle older hanzi-writer types that omit callbacks
        onLoadCharDataSuccess: () => setWriterReady(true),
        // @ts-ignore
        onLoadCharDataError: () => setWriterReady(true),
      });

      writerRef.current = writer;

      if (writerMode === 'animate') {
        writer.animateCharacter();
      } else {
        setQuizResult(null);
        let correct = 0;
        const total = 0;

        let strokeCount = 0;

        writer.quiz({
          onMistake: () => {},
          onCorrectStroke: (strokeData) => {
            correct = strokeData.strokeNum + 1;
            strokeCount = strokeData.strokeNum + 1;
          },
          onComplete: (summary) => {
            const totalStrokes = strokeCount || correct;
            setQuizResult({
              correct: Math.max(0, totalStrokes - summary.totalMistakes),
              total: totalStrokes,
            });
            // Auto-advance to next character after 2s
            setTimeout(() => {
              const currentIdx = allChars.findIndex(c => c.char === char);
              if (currentIdx >= 0 && currentIdx < allChars.length - 1) {
                setSelectedChar(allChars[currentIdx + 1].char);
              }
            }, 2000);
          },
        });
      }
    } catch {
      setWriterReady(true);
      // Character not in HanziWriter database
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl text-outline mb-4">error_outline</span>
          <p class="text-sm font-medium">Character "${char}" not available for stroke practice</p>
        </div>`;
      }
    }
  }, []);

  useEffect(() => {
    initWriter(selectedChar, mode);
    return () => {
      if (writerRef.current) {
        try { writerRef.current.hideCharacter(); } catch {}
        writerRef.current = null;
      }
    };
  }, [selectedChar, mode, initWriter]);

  const handleAnimate = () => {
    if (mode === 'animate' && writerRef.current) {
      writerRef.current.animateCharacter();
    } else {
      setMode('animate');
    }
  };

  const handleQuiz = () => {
    setMode('quiz');
  };

  const handleCustomChar = () => {
    const trimmed = customChar.trim();
    if (trimmed) {
      setSelectedChar(trimmed[0]);
      setCustomChar('');
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Character Info & Controls */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-1">
          <div className="bg-surface-container-low rounded-xl p-5 sm:p-8">
            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Current Character</span>
              <div className="flex items-center gap-3 mt-2">
                <h3 className="text-3xl sm:text-4xl font-black">{selectedChar} ({currentInfo.name})</h3>
                <SpeakButton text={selectedChar} size="md" />
              </div>
              <p className="text-on-surface-variant mt-2 text-xs sm:text-sm leading-relaxed">
                {currentInfo.meaning || 'Practice writing this character stroke by stroke.'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleAnimate}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  mode === 'animate'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Animate
              </button>
              <button
                onClick={handleQuiz}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  mode === 'quiz'
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                Practice
              </button>
            </div>

            {/* Quiz Result */}
            {quizResult && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-4 ${
                quizResult.correct === quizResult.total
                  ? 'bg-primary-fixed text-primary'
                  : 'bg-secondary-fixed text-secondary'
              }`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {quizResult.correct === quizResult.total ? 'check_circle' : 'info'}
                </span>
                {quizResult.correct === quizResult.total
                  ? 'Perfect! All strokes correct!'
                  : `${quizResult.correct}/${quizResult.total} strokes correct. Try again!`}
              </div>
            )}

            {/* Custom character input */}
            <div className="flex gap-2">
              <input
                value={customChar}
                onChange={(e) => setCustomChar(e.target.value)}
                placeholder="Enter any character..."
                className="flex-1 px-4 py-2.5 bg-surface-container-lowest rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 chinese-char"
                maxLength={4}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomChar()}
              />
              <button
                onClick={handleCustomChar}
                disabled={!customChar.trim()}
                className="px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm disabled:opacity-50 transition-opacity"
              >
                Go
              </button>
            </div>
          </div>

          {/* Character Palette from user's cards */}
          <div className="bg-surface-container-low rounded-xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-outline">Quick Select</h4>
              <span className="text-[9px] font-medium text-outline tabular-nums">{allChars.length} chars</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-4 gap-2">
                {allChars.map((c, i) => (
                  <button
                    key={`${c.char}-${i}`}
                    onClick={() => setSelectedChar(c.char)}
                    className={`p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                      selectedChar === c.char
                        ? 'bg-primary text-on-primary ring-2 ring-primary/30 scale-[1.02]'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-primary-fixed hover:text-primary'
                    }`}
                  >
                    <span className="chinese-char text-lg sm:text-xl">{c.char}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-surface-container-high/30 p-4 sm:p-6 rounded-xl border border-white/20 backdrop-blur-sm">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-outline mb-3 sm:mb-4">Practice Tips</h4>
            <ul className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs text-on-surface-variant">
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <strong>Animate</strong> mode shows you the correct stroke order.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <strong>Practice</strong> mode lets you draw — hints appear after 2 mistakes.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                Type any Chinese character in the input box to practice it.
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Drawing Canvas */}
        <div className="lg:col-span-8 relative group order-1 lg:order-2">
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl aspect-square w-full max-w-[500px] mx-auto shadow-2xl shadow-on-surface/5 relative overflow-hidden flex items-center justify-center border border-surface-variant/30">
            <div className="absolute inset-0 canvas-grid opacity-30"></div>
            
            {!writerReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                <span className="text-xs font-bold text-primary tracking-widest uppercase animate-pulse">Loading Engine</span>
              </div>
            )}
            
            <div ref={containerRef} className={`relative z-10 flex items-center justify-center w-full h-full transition-opacity duration-300 ${writerReady ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* Action Bar */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={handleAnimate}
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              {mode === 'animate' ? 'Replay' : 'Watch Strokes'}
            </button>
            <button
              onClick={handleQuiz}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-secondary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              {mode === 'quiz' ? 'Restart Quiz' : 'Practice Writing'}
            </button>
          </div>

          {/* Stroke Component Breakdown */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-8">
            {[
              { char: '丶', name: 'Diǎn', desc: 'Dot' },
              { char: '一', name: 'Héng', desc: 'Horizontal' },
              { char: '丨', name: 'Shù', desc: 'Vertical' },
              { char: '亅', name: 'Gōu', desc: 'Hook' },
            ].map((stroke) => (
              <button
                key={stroke.name}
                onClick={() => setSelectedChar(stroke.char)}
                className="bg-surface-container-low rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <span className="chinese-char text-lg sm:text-2xl text-primary">{stroke.char}</span>
                <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-outline">{stroke.name}</span>
                <span className="text-[8px] text-on-surface-variant">{stroke.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
