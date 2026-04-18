import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import rocketImg from '../../../public/images/rocket-transparent.png';

export type BtnPhase = 'idle' | 'icon' | 'dots' | 'rocket' | 'done';

interface AnimatedSignInButtonProps {
  btnPhase: BtnPhase;
}

export function AnimatedSignInButton({ btnPhase }: AnimatedSignInButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={btnPhase !== 'idle'}
      animate={
        btnPhase === 'done'
          ? {
              background: ['linear-gradient(90deg,#8B7FE8,#C9B6F0)', 'linear-gradient(90deg,#60a5fa,#3b82f6)'],
              boxShadow: ['0 8px 32px rgba(139,127,232,0.4)', '0 0 50px rgba(59,130,246,0.5), 0 8px 40px rgba(59,130,246,0.4)'],
              scale: [1, 0.92, 1.06, 1],
            }
          : btnPhase === 'rocket'
          ? { boxShadow: '0 8px 40px rgba(139,127,232,0.55)' }
          : {}
      }
      whileHover={btnPhase === 'idle' ? { scale: 1.02, boxShadow: '0 8px 48px rgba(139,127,232,0.6)' } : {}}
      whileTap={btnPhase === 'idle' ? { scale: 0.95 } : {}}
      transition={btnPhase === 'done' ? { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } : { type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        position: 'relative',
        overflow: btnPhase === 'rocket' || btnPhase === 'done' ? 'visible' : 'hidden',
        isolation: 'isolate',
        background: 'linear-gradient(90deg, #8B7FE8, #C9B6F0)',
        boxShadow: '0 8px 32px rgba(139,127,232,0.4)',
        borderRadius: '9999px', height: '52px', color: '#fff',
        fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em',
        textTransform: 'uppercase', border: 'none', width: '100%',
        cursor: btnPhase !== 'idle' ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '0.25rem',
      }}
    >
      {/* Shimmer sweep — only in idle */}
      {btnPhase === 'idle' && (
        <span aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'signin-shimmer 2.8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Success burst ring */}
      <AnimatePresence>
        {btnPhase === 'done' && (
          <motion.span
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, margin: 'auto',
              width: '48px', height: '48px', borderRadius: '50%',
              border: '2px solid rgba(96,165,250,0.5)',
              pointerEvents: 'none', zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Content state machine ─── */}
      <AnimatePresence mode="wait">

        {/* IDLE: "Sign In" text */}
        {btnPhase === 'idle' && (
          <motion.span
            key="label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            Sign In
          </motion.span>
        )}

        {/* PHASE 1: Login icon rises from bottom with bounce */}
        {btnPhase === 'icon' && (
          <motion.div
            key="login-icon"
            initial={{ opacity: 0, y: 40, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, mass: 0.8 }}
            style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Login icon SVG — person inside circle with arrow */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {/* Circle (open on left for arrow entry) */}
              <motion.path
                d="M15 3.5A8.5 8.5 0 1 1 15 20.5"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              />
              {/* Arrow pointing right */}
              <motion.path
                d="M2 12h10m0 0l-3-3m3 3l-3 3"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.3 }}
              />
              {/* Person head */}
              <motion.circle
                cx="16" cy="9.5" r="2"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.25 }}
              />
              {/* Person body */}
              <motion.path
                d="M13 17c0-1.657 1.343-3 3-3s3 1.343 3 3"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.35 }}
              />
            </svg>
          </motion.div>
        )}

        {/* PHASE 2: Three bouncing dots */}
        {btnPhase === 'dots' && (
          <motion.div
            key="dots"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', gap: '6px', position: 'relative', zIndex: 1, alignItems: 'center' }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1],
                  repeat: Infinity,
                  repeatDelay: 0.1,
                  delay: i * 0.12,
                }}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* PHASE 3: Rocket slides left → right across full button */}
        {btnPhase === 'rocket' && (
          <motion.div
            key="rocket"
            initial={{ x: -220 }}
            animate={{ x: 220, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.0, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.1, 0.85, 1] }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: '-12px',
              marginTop: '-12px',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            {/* Rocket trail */}
            <motion.div
              animate={{ scaleX: [0.3, 1, 1, 0.5], opacity: [0, 0.5, 0.5, 0] }}
              transition={{ duration: 3.0, ease: 'easeOut' }}
              style={{
                width: '120px', height: '5px', borderRadius: '3px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6))',
                transformOrigin: 'right',
              }}
            />
            {/* High-fidelity 3D Glassmorphic Rocket Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Image
                src={rocketImg}
                alt="Rocket"
                width={192}
                height={192}
                style={{
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 24px rgba(139,127,232,0.7))'
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 4: Success checkmark */}
        {btnPhase === 'done' && (
          <motion.svg
            key="check"
            width="22" height="22" viewBox="0 0 22 22" fill="none"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: [0.3, 1.25, 1] }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            aria-hidden="true"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <motion.path
              d="M4 11L9 16L18 6"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="22"
              initial={{ strokeDashoffset: 22 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.32, ease: 'easeOut', delay: 0.1 }}
            />
          </motion.svg>
        )}

      </AnimatePresence>
    </motion.button>
  );
}
