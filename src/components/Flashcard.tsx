'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardProps {
  character: string;
  pinyin: string;
  meaning: string;
  onResult: (correct: boolean) => void;
}

export function Flashcard({ character, pinyin, meaning, onResult }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000 h-96">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full backface-hidden bg-white border border-slate-200 rounded-3xl shadow-md p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-8xl font-noto-sc text-slate-800">{character}</span>
          <p className="text-slate-400 mt-8 text-sm uppercase tracking-widest font-medium">Tap to reveal</p>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full bg-blue-600 text-white border border-blue-500 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full">
             <span className="text-4xl font-bold font-jakarta mb-4">{pinyin}</span>
             <span className="text-2xl text-blue-100 text-center">{meaning}</span>
          </div>
          
          <div className="flex gap-4 w-full mt-8" onClick={(e) => e.stopPropagation()}>
             <button 
                onClick={() => onResult(false)}
                className="flex-1 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
             >
                Again
             </button>
             <button 
                onClick={() => onResult(true)}
                className="flex-1 py-3 px-4 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-semibold shadow-sm transition"
             >
                Got it
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
