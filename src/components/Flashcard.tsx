'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { SpeakButton } from './SpeakButton';

interface FlashcardProps {
  character: string;
  pinyin: string;
  meaning: string;
  onResult: (correct: boolean) => void;
}

export function Flashcard({ character, pinyin, meaning, onResult }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  // Swipe gesture support
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;

    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold) {
      if (info.offset.x > 0) {
        onResult(true); // Swipe right = got it
      } else {
        onResult(false); // Swipe left = again
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000 h-96 touch-none">
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full backface-hidden bg-surface-container-lowest border border-outline-variant/20 rounded-3xl shadow-md p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-8xl chinese-char text-on-surface">{character}</span>
          <div className="flex items-center gap-2 mt-6">
            <SpeakButton text={character} size="lg" />
          </div>
          <p className="text-outline mt-4 text-sm uppercase tracking-widest font-medium">Tap to reveal · Swipe to rate</p>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-primary to-secondary text-on-primary border border-primary-container/20 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full">
             <span className="text-4xl font-bold font-[family-name:var(--font-jakarta)] mb-4">{pinyin}</span>
             <span className="text-2xl text-on-primary/80 text-center">{meaning}</span>
          </div>
          
          <div className="flex gap-4 w-full mt-8" onClick={(e) => e.stopPropagation()}>
             <button 
                onClick={() => onResult(false)}
                className="flex-1 py-3 px-4 bg-on-primary/20 hover:bg-on-primary/30 rounded-xl font-medium transition"
             >
                Again
             </button>
             <button 
                onClick={() => onResult(true)}
                className="flex-1 py-3 px-4 bg-on-primary text-primary hover:bg-primary-fixed rounded-xl font-semibold shadow-sm transition"
             >
                Got it
             </button>
          </div>
          <p className="text-on-primary/50 text-[10px] mt-3 uppercase tracking-wider">← Swipe left: Again · Swipe right: Got it →</p>
        </div>
      </motion.div>
    </div>
  );
}
