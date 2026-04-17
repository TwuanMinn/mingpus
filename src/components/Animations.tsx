'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { EASING, DURATION } from './MicroInteractions';

/* ═══════════════════════════════════════════════════════════════════════════
   Page Transition — §3.3 deliberate duration, ease-out entrance
   ═══════════════════════════════════════════════════════════════════════════ */

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }} // exits 70% faster
      transition={{ duration: reduced ? 0.08 : DURATION.smooth, ease: EASING.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Card Reveal — §3.3 spring-like for content reveals
   ═══════════════════════════════════════════════════════════════════════════ */

interface CardRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function CardReveal({ children, delay = 0, className = '' }: CardRevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.08 : DURATION.smooth,
        delay: reduced ? 0 : delay,
        ease: EASING.spring,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Slide In — §3.3 origin matters (enter from causal direction)
   ═══════════════════════════════════════════════════════════════════════════ */

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}

export function SlideIn({ children, direction = 'up', delay = 0, className = '' }: SlideInProps) {
  const reduced = useReducedMotion();
  const offsets = {
    left: { x: -24, y: 0 },
    right: { x: 24, y: 0 },
    up: { x: 0, y: 24 },
    down: { x: 0, y: -24 },
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, ...offsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reduced ? 0.08 : DURATION.smooth, delay: reduced ? 0 : delay, ease: EASING.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stagger Container/Item — §3.3 one hero, 40-60ms cascade
   ═══════════════════════════════════════════════════════════════════════════ */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.05 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduced ? 0.08 : DURATION.smooth, ease: EASING.out },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Success Pulse — §2.1 success state (auto-dismiss 2.5s)
   ═══════════════════════════════════════════════════════════════════════════ */

export function SuccessPulse({ show }: { show: boolean }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { scale: 1.5, opacity: 0 }}
          transition={{ duration: DURATION.deliberate }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Scale On Press — §4.3 wraps any element with press physics
   ═══════════════════════════════════════════════════════════════════════════ */

export function ScaleOnPress({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={{ duration: DURATION.quick, ease: EASING.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Fade Transition — §3.3 exits faster than entrances
   ═══════════════════════════════════════════════════════════════════════════ */

export function FadeTransition({
  children,
  show,
  className = '',
}: {
  children: ReactNode;
  show: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.quick, ease: EASING.out }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
