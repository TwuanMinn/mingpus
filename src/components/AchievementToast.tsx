'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievement } from '@/lib/gamification';

interface AchievementToastProps {
  achievementKeys: string[];
  onDismiss: () => void;
}

export function AchievementToast({ achievementKeys, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const achievement = achievementKeys[currentIndex]
    ? getAchievement(achievementKeys[currentIndex])
    : null;

  const handleNext = useCallback(() => {
    if (currentIndex < achievementKeys.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onDismiss();
    }
  }, [currentIndex, achievementKeys.length, onDismiss]);

  // Auto-dismiss after 5 seconds per achievement
  useEffect(() => {
    const timer = setTimeout(handleNext, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, handleNext]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={achievement.key}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <div
          className="bg-surface-container-lowest border border-primary/20 rounded-2xl p-5 shadow-2xl shadow-primary/10 flex items-start gap-4 cursor-pointer"
          onClick={handleNext}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-white text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {achievement.icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
              🏆 Achievement Unlocked!
            </p>
            <h4 className="font-bold text-on-surface text-sm">
              {achievement.title}
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {achievement.description}
            </p>
            <p className="text-[10px] font-bold text-secondary mt-1.5">
              +{achievement.xpReward} XP
            </p>
          </div>

          {/* Progress indicator */}
          {achievementKeys.length > 1 && (
            <span className="text-[9px] font-bold text-outline self-start">
              {currentIndex + 1}/{achievementKeys.length}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── XP Popup (small floating notification) ───

export function XPPopup({ amount, show }: { amount: number; show: boolean }) {
  if (!show || amount <= 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="fixed bottom-20 right-8 z-40 pointer-events-none"
        >
          <span className="text-lg font-black text-primary">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Level Up Modal ───

export function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 text-center max-w-sm mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span
            className="material-symbols-outlined text-6xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            arrow_circle_up
          </span>
        </motion.div>
        <h2 className="text-2xl font-[family-name:var(--font-jakarta)] font-black text-on-surface mt-4">
          Level Up!
        </h2>
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-3">
          {level}
        </p>
        <p className="text-on-surface-variant mt-3 text-sm">
          Keep studying to unlock more achievements!
        </p>
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
