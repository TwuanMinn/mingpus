'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ChevronRight, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';

const CardSchema = z.object({
  character: z.string().min(1, "Character needed"),
  pinyin: z.string().min(1, "Pinyin needed"),
  meaning: z.string().min(1, "Meaning needed"),
});

const DeckSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

type CardData = z.infer<typeof CardSchema>;
type DeckDetails = z.infer<typeof DeckSchema>;

const MAX_CARDS = 500; // matches importCards server-side cap

function parsePaste(pasteData: string): { cards: CardData[]; skipped: number } {
  const cards: CardData[] = [];
  let skipped = 0;
  const lines = pasteData.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(/[\t,]/).map((s) => s.trim());
    if (parts.length >= 3 && parts[0] && parts[1] && parts.slice(2).join(' ').trim()) {
      cards.push({
        character: parts[0],
        pinyin: parts[1],
        meaning: parts.slice(2).join(' '),
      });
    } else {
      skipped++;
    }
  }
  return { cards: cards.slice(0, MAX_CARDS), skipped };
}

export default function NewDeckPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [pasteData, setPasteData] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { cards, skipped } = useMemo(() => parsePaste(pasteData), [pasteData]);
  const truncated = cards.length === MAX_CARDS;

  const { register, handleSubmit, formState: { errors } } = useForm<DeckDetails>({
    resolver: zodResolver(DeckSchema),
  });

  const createDeck = trpc.deck.createDeck.useMutation();
  const importCards = trpc.import.importCards.useMutation();
  const submitting = createDeck.isPending || importCards.isPending;

  const onSubmit = async (data: DeckDetails) => {
    if (cards.length === 0) {
      setSubmitError('Paste at least one valid row before saving.');
      return;
    }
    setSubmitError(null);
    try {
      const [deck] = await createDeck.mutateAsync({
        title: data.title,
        description: data.description,
      });
      await importCards.mutateAsync({ deckId: deck.id, cards });
      await utils.dashboard.getOverview.invalidate();
      router.push('/study');
    } catch (err: unknown) {
      console.error('Deck save failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to save deck.');
    }
  };

  const columnHelper = createColumnHelper<CardData>();
  const columns = [
    columnHelper.accessor('character', { header: 'Character', cell: info => info.getValue() }),
    columnHelper.accessor('pinyin', { header: 'Pinyin', cell: info => info.getValue() }),
    columnHelper.accessor('meaning', { header: 'Meaning', cell: info => info.getValue() }),
  ];

  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-w-5xl mx-auto py-6">
       <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/study" className="hover:text-slate-800">Decks</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium">Import new deck</span>
       </div>

       <div className="flex justify-between items-end mb-8">
          <div>
             <h1 className="text-3xl font-bold text-slate-800">Import Flashcards</h1>
             <p className="text-slate-500 mt-2">Paste your words list from Excel, Pleco, or Quizlet.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <form id="deckForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deck Title</label>
                  <input {...register('title')} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. HSK 1 Vocabulary" />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <textarea {...register('description')} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe the focus of this deck..." rows={3} />
               </div>
            </form>

             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                 <Upload size={18} className="text-blue-600" /> Bulk Import
               </h3>
               <p className="text-xs text-slate-500 mb-3">Paste 3 columns: Character, Pinyin, Meaning — separated by Tab or Comma. Preview updates as you type.</p>
               <textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                  rows={6}
                  placeholder="好   hǎo   good&#10;人   rén   person"
               />
               <div className="mt-3 flex flex-wrap gap-2 text-xs">
                 <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">{cards.length} valid</span>
                 {skipped > 0 && (
                   <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-medium">{skipped} skipped</span>
                 )}
                 {truncated && (
                   <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-medium">capped at {MAX_CARDS}</span>
                 )}
               </div>
             </div>
          </div>

          <div className="lg:col-span-2">
             <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                   <h3 className="font-semibold text-slate-800">Preview ({cards.length} cards)</h3>
                   <button
                      form="deckForm"
                      type="submit"
                      disabled={cards.length === 0 || submitting}
                      className="px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg shadow-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                   >
                     <Save size={16} /> {submitting ? 'Saving…' : 'Save Deck'}
                   </button>
                </div>
                {submitError && (
                  <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-sm text-red-700" role="alert">
                    {submitError}
                  </div>
                )}
                
                {cards.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center flex-col gap-4">
                     <p>Paste rows on the left to preview your import.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           {table.getHeaderGroups().map(headerGroup => (
                              <tr key={headerGroup.id} className="border-b border-slate-200">
                                 {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 font-semibold text-slate-600 bg-slate-50">
                                       {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                 ))}
                              </tr>
                           ))}
                        </thead>
                        <tbody>
                           {table.getRowModel().rows.map(row => (
                              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                 {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="p-4 text-slate-700">
                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
