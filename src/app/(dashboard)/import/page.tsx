'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { usePageTitle } from '@/hooks/usePageTitle';

interface ParsedCard {
  character: string;
  pinyin: string;
  meaning: string;
}

export default function ImportPage() {
  usePageTitle('Import');
  const { data: decksData } = trpc.getDecks.useQuery();
  const importCards = trpc.importCards.useMutation();
  const utils = trpc.useUtils();

  const [pasteText, setPasteText] = useState('');
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const decks = decksData ?? [];

  const handleParse = () => {
    const lines = pasteText.split('\n').filter(l => l.trim());
    const cards: ParsedCard[] = [];
    for (const line of lines) {
      // Support formats: "char pinyin meaning" or "char,pinyin,meaning"
      const parts = line.includes(',') ? line.split(',') : line.split(/\s+/);
      if (parts.length >= 3) {
        cards.push({
          character: parts[0].trim(),
          pinyin: parts[1].trim(),
          meaning: parts.slice(2).join(' ').trim(),
        });
      } else if (parts.length === 2) {
        cards.push({
          character: parts[0].trim(),
          pinyin: '',
          meaning: parts[1].trim(),
        });
      }
    }
    setParsedCards(cards);
  };

  const handleImport = async () => {
    if (!selectedDeck || parsedCards.length === 0) return;
    try {
      await importCards.mutateAsync({
        deckId: selectedDeck,
        cards: parsedCards,
      });
      setImportStatus('success');
      setParsedCards([]);
      setPasteText('');
      utils.getDecks.invalidate();
      utils.getDashboardStats.invalidate();
    } catch {
      setImportStatus('error');
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 bg-surface pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold font-[family-name:var(--font-jakarta)] tracking-tight text-on-surface">Expand Your Lexicon</h2>
          <p className="text-on-surface-variant text-sm sm:text-base lg:text-lg max-w-2xl">Import custom vocabulary sets from CSV or plain text. Our system maps characters to stroke data.</p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Import Area */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Deck selector */}
            <div className="bg-surface-container-low rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-8 space-y-4">
              <h3 className="text-sm uppercase tracking-[0.1em] text-on-surface-variant font-medium">Target Deck</h3>
              <select
                value={selectedDeck ?? ''}
                onChange={(e) => setSelectedDeck(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-surface-container-lowest border-0 text-on-surface p-3 sm:p-4 rounded-xl outline-none text-sm sm:text-base"
              >
                <option value="">Select a deck...</option>
                {decks.map(d => (
                  <option key={d.id} value={d.id}>{d.title} ({d.cardCount} cards)</option>
                ))}
              </select>
            </div>

            <div className="bg-surface-container-low rounded-2xl sm:rounded-[1.5rem] p-6 sm:p-8 space-y-4">
              <h3 className="text-sm uppercase tracking-[0.1em] text-on-surface-variant font-medium">Quick Paste</h3>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full bg-surface-container-lowest border-0 focus:ring-0 text-on-surface p-3 sm:p-4 rounded-xl chinese-char text-base sm:text-lg min-h-[120px] sm:min-h-[160px] outline-none resize-none"
                placeholder={"你好,nǐ hǎo,Hello\n书,shū,Book\n学,xué,To study"}
              ></textarea>
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
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string;
                        setPasteText(text);
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button onClick={handleParse}
                  className="text-primary font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">auto_fix</span>
                  Parse Text
                </button>
              </div>
            </div>

            {importStatus === 'success' && (
              <div className="bg-primary-fixed text-primary p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Cards imported successfully!
              </div>
            )}
          </div>

          {/* Preview Table */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[1.5rem] p-0 shadow-2xl shadow-on-surface/5 overflow-hidden">
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-surface-container flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-surface-bright">
                <h3 className="font-bold text-base sm:text-lg font-[family-name:var(--font-jakarta)]">Import Preview</h3>
                <span className="px-3 py-1 bg-primary-fixed text-primary text-[10px] sm:text-xs font-bold rounded-full">
                  {parsedCards.length} Words Detected
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-surface-container-low/50">
                    <tr>
                      <th className="px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Character</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Pinyin</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Meaning</th>
                      <th className="px-4 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {parsedCards.length > 0 ? parsedCards.map((row) => (
                      <tr key={row.character} className="hover:bg-primary-fixed/20 transition-colors">
                        <td className="px-4 sm:px-8 py-3 sm:py-5 text-xl sm:text-2xl chinese-char text-primary">{row.character}</td>
                        <td className="px-4 sm:px-8 py-3 sm:py-5 font-medium text-on-surface text-sm sm:text-base">{row.pinyin}</td>
                        <td className="px-4 sm:px-8 py-3 sm:py-5 text-on-surface-variant text-sm sm:text-base">{row.meaning}</td>
                        <td className="px-4 sm:px-8 py-3 sm:py-5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-8 text-center text-sm text-on-surface-variant">
                          Paste text above and click &quot;Parse Text&quot; to preview
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-4 sm:p-8 bg-surface-container-low/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">info</span>
                    <p className="text-xs sm:text-sm text-on-surface-variant">
                      {parsedCards.length > 0 ? `${parsedCards.length} characters ready to import.` : 'No characters parsed yet.'}
                    </p>
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={!selectedDeck || parsedCards.length === 0 || importCards.isPending}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all text-center disabled:opacity-50">
                    {importCards.isPending ? 'Importing...' : 'Start Learning'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-surface-container-low/50 backdrop-blur-md rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-6 flex items-center gap-4 sm:gap-6 border border-white/40">
              <div className="hidden sm:flex -space-x-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-secondary font-bold text-xs">A1</div>
                <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-primary font-bold text-xs">B2</div>
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest flex items-center justify-center text-tertiary font-bold text-xs">C1</div>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">Format: <code className="bg-surface-container-high px-2 py-0.5 rounded text-xs">char,pinyin,meaning</code> — one per line.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
