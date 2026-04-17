'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecksPanel } from './DecksPanel';
import { FlashcardsPanel } from './FlashcardsPanel';
import { QuizPanel } from './QuizPanel';

const tabs = [
  { id: 'decks', label: 'My Decks', icon: 'collections_bookmark' },
  { id: 'flashcards', label: 'Flashcards', icon: 'style' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  // Cross-tab workflow handlers
  const handleStudyDeck = (deckId: number) => {
    setSelectedDeckId(deckId);
    setActiveTab('flashcards');
  };

  const handleStartQuiz = () => {
    setActiveTab('quiz');
  };

  const handleReviewFlashcards = () => {
    setSelectedDeckId(null);
    setActiveTab('flashcards');
  };

  const handleBackToDecks = () => {
    setSelectedDeckId(null);
    setActiveTab('decks');
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-stretch pt-3 sm:pt-4">
            {tabs.map((tab, i) => (
              <div key={tab.id} className="flex items-stretch">
                {/* Vertical divider between tabs */}
                {i > 0 && (
                  <div className="w-[1px] bg-outline-variant/20 my-2 sm:my-1.5" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold transition-colors rounded-t-xl ${
                    activeTab === tab.id
                      ? 'text-primary bg-primary-fixed/30'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="study-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'decks' && (
            <motion.div
              key="decks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DecksPanel onStudyDeck={handleStudyDeck} onStartQuiz={handleStartQuiz} />
            </motion.div>
          )}
          {activeTab === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FlashcardsPanel
                initialDeckId={selectedDeckId}
                onBackToDecks={handleBackToDecks}
                onStartQuiz={handleStartQuiz}
              />
            </motion.div>
          )}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <QuizPanel
                onReviewFlashcards={handleReviewFlashcards}
                onBackToDecks={handleBackToDecks}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
