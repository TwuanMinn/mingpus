'use client';

import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveButton, ConfirmDialog, EASING, DURATION } from '@/components/MicroInteractions';

interface DecksPanelProps {
  onStudyDeck: (deckId: number) => void;
  onStartQuiz: () => void;
}

export function DecksPanel({ onStudyDeck, onStartQuiz }: DecksPanelProps) {
  const { data: deckList, isLoading, refetch } = trpc.deck.getDecks.useQuery();
  const createDeck = trpc.deck.createDeck.useMutation({
    onSuccess: () => { refetch(); setShowCreate(false); setNewTitle(''); setNewDesc(''); },
  });
  const deleteDeck = trpc.deck.deleteDeck.useMutation({
    onSuccess: () => { refetch(); setDeleteTarget(null); },
  });
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <span className="text-[0.6875rem] font-bold tracking-[0.15em] text-primary uppercase">Your Library</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface font-(family-name:--font-jakarta)">Decks</h2>
        </div>
        <div className="flex gap-3">
          <InteractiveButton variant="secondary" size="md" icon="quiz" onClick={onStartQuiz}>
            <span className="hidden sm:inline">Quick Quiz</span>
          </InteractiveButton>
          <InteractiveButton variant="primary" size="md" icon="add" onClick={() => setShowCreate(true)}
            className="bg-linear-to-r from-primary to-secondary shadow-primary/20">
            New Deck
          </InteractiveButton>
        </div>
      </div>

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20">
            <h3 className="font-bold text-on-surface mb-4">Create New Deck</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Deck name (e.g. HSK 5 Vocabulary)"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface mb-3 outline-none focus:ring-2 focus:ring-primary/20" />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface mb-4 outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="flex gap-3">
              <InteractiveButton
                variant="primary"
                size="md"
                onClick={() => createDeck.mutate({ title: newTitle, description: newDesc || undefined })}
                disabled={!newTitle.trim()}
                loading={createDeck.isPending}
              >
                Create
              </InteractiveButton>
              <InteractiveButton variant="secondary" size="md" onClick={() => setShowCreate(false)}>
                Cancel
              </InteractiveButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Deck?"
        description={`"${deleteTarget?.title}" and all its flashcards will be permanently removed. This action cannot be undone.`}
        icon="delete_forever"
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
        loading={deleteDeck.isPending}
        onConfirm={() => { if (deleteTarget) deleteDeck.mutate({ id: deleteTarget.id }); }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Deck Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-surface-container-high rounded-2xl" />)}
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
              {/* Faded Watermark Icon — SVG stroke style */}
              <svg className="absolute -bottom-10 -right-10 w-48 h-48 text-primary opacity-[0.08] pointer-events-none z-0 group-hover:scale-110 group-hover:opacity-[0.14] transition-all duration-700 select-none" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
              </svg>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">collections_bookmark</span>
                  </div>
                  <button onClick={() => setDeleteTarget({ id: deck.id, title: deck.title })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-error/10 rounded-lg transition-all" title="Delete deck">
                    <span className="material-symbols-outlined text-error text-lg">delete</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-on-surface font-(family-name:--font-jakarta) mb-1">{deck.title}</h3>
                {deck.description && <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{deck.description}</p>}

                {/* Due / New badges */}
                {(deck.cardCount > 0) && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {Number(deck.dueCount) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/12 text-amber-600 dark:text-amber-400 rounded-full text-[0.6875rem] font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                        {deck.dueCount} due
                      </span>
                    )}
                    {Number(deck.newCount) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[0.6875rem] font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>fiber_new</span>
                        {deck.newCount} new
                      </span>
                    )}
                    {Number(deck.dueCount) === 0 && Number(deck.newCount) === 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[0.6875rem] font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        All caught up
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
                  <span className="text-xs font-bold text-outline">{deck.cardCount} cards</span>
                  <button onClick={() => onStudyDeck(deck.id)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group/btn">
                    <span className="material-symbols-outlined text-[16px]">style</span>
                    Study
                    <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
