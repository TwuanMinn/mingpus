'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function DecksPage() {
  usePageTitle('Decks');
  const { data: deckList, isLoading, refetch } = trpc.getDecks.useQuery();
  const createDeck = trpc.createDeck.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); setNewTitle(''); } });
  const deleteDeck = trpc.deleteDeck.useMutation({ onSuccess: () => refetch() });
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Your Library</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)]">Decks</h2>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span> New Deck
        </button>
      </div>

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
            <h3 className="font-bold text-on-surface mb-4">Create New Deck</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Deck name (e.g. HSK 5 Vocabulary)"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm mb-3 outline-none focus:ring-2 focus:ring-primary/20" />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm mb-4 outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="flex gap-3">
              <button onClick={() => createDeck.mutate({ title: newTitle, description: newDesc || undefined })}
                disabled={!newTitle.trim() || createDeck.isPending}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-50">
                {createDeck.isPending ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-full font-bold text-sm">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deck Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface-container-low rounded-2xl" />)}
        </div>
      ) : !deckList?.length ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4 block">collections_bookmark</span>
          <p className="text-on-surface-variant">No decks yet. Create your first deck to start learning.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deckList.map((deck, i) => (
            <motion.div key={deck.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">collections_bookmark</span>
                  </div>
                  <button onClick={() => { if (confirm('Delete this deck and all its cards?')) deleteDeck.mutate({ id: deck.id }); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-error/10 rounded-lg transition-all" title="Delete deck">
                    <span className="material-symbols-outlined text-error text-lg">delete</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-on-surface font-[family-name:var(--font-jakarta)] mb-1">{deck.title}</h3>
                {deck.description && <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{deck.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
                  <span className="text-xs font-bold text-outline">{deck.cardCount} cards</span>
                  <Link href={`/flashcards?deck=${deck.id}`} className="text-xs font-bold text-primary hover:underline">View Cards →</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
