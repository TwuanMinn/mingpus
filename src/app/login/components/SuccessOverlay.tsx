"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

// Ambient floating particles
const PARTICLES = [
  { id: 0, x: 8, y: 15, size: 3, opacity: 0.50, travel: 95, dur: 3.8, delay: 0.5 },
  { id: 1, x: 22, y: 7, size: 4, opacity: 0.35, travel: 70, dur: 4.5, delay: 1.2 },
  { id: 2, x: 70, y: 12, size: 5, opacity: 0.30, travel: 115, dur: 3.2, delay: 0.8 },
  { id: 3, x: 85, y: 25, size: 3, opacity: 0.45, travel: 80, dur: 4.8, delay: 2.0 },
  { id: 4, x: 60, y: 5, size: 4, opacity: 0.28, travel: 100, dur: 3.6, delay: 0.3 },
  { id: 5, x: 40, y: 30, size: 3, opacity: 0.42, travel: 65, dur: 4.2, delay: 1.5 },
  { id: 6, x: 6, y: 48, size: 5, opacity: 0.25, travel: 85, dur: 3.7, delay: 2.2 },
  { id: 7, x: 92, y: 55, size: 4, opacity: 0.35, travel: 72, dur: 4.0, delay: 0.7 },
  { id: 8, x: 50, y: 20, size: 3, opacity: 0.40, travel: 58, dur: 4.1, delay: 1.8 },
  { id: 9, x: 33, y: 62, size: 4, opacity: 0.30, travel: 88, dur: 4.6, delay: 1.0 },
  { id: 10, x: 77, y: 70, size: 3, opacity: 0.22, travel: 60, dur: 5.0, delay: 2.5 },
  { id: 11, x: 18, y: 80, size: 4, opacity: 0.28, travel: 75, dur: 3.9, delay: 0.6 },
];

// Radial spark burst when checkmark completes — 12 directions × 30°
const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: i * 30,
  dist: 62 + (i % 4) * 12,   // 62 / 74 / 86 / 98
  size: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3,
  color: ['#8B7FE8', '#C9B6F0', '#E0D9FF', '#A78BFA'][i % 4],
  delay: 1.08 + i * 0.028,
}));

export function SuccessOverlay({ mounted }: { mounted: boolean }) {
  if (!mounted) return null;

  const heading = "You're in.";

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#09090D',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: 'Inter, DM Sans, system-ui, sans-serif',
      }}
    >
      {/* ── Aurora blobs ── */}
      <motion.div
        initial={{ opacity: 0, x: -80, y: -80 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
        style={{
          position: 'absolute', top: '-15%', left: '-12%',
          width: '60%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(99,79,220,0.22) 0%, rgba(139,127,232,0.08) 50%, transparent 70%)',
          filter: 'blur(70px)', pointerEvents: 'none',
        }}
      />
      <motion.div
        initial={{ opacity: 0, x: 80, y: 80 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 0.15 }}
        style={{
          position: 'absolute', bottom: '-18%', right: '-12%',
          width: '65%', height: '65%',
          background: 'radial-gradient(ellipse, rgba(168,139,250,0.18) 0%, rgba(201,182,240,0.06) 50%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }}
      />
      {/* Centre deep glow — expands as icon springs in */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.0, ease: [0, 0, 0.2, 1], delay: 0.2 }}
        style={{
          position: 'absolute',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,127,232,0.14) 0%, rgba(139,127,232,0.04) 45%, transparent 70%)',
          filter: 'blur(4px)', pointerEvents: 'none',
        }}
      />

      {/* ── Subtle dot-grid ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle, rgba(139,127,232,0.18) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 100%)',
          opacity: 0.5,
        }}
      />

      {/* ── Ambient floating particles ── */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, p.opacity, 0], y: -p.travel }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, repeatDelay: p.delay * 0.55, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, bottom: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            backgroundColor: 'rgba(139,127,232,0.75)', pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Icon ── */}
      <motion.div
        initial={{ scale: 0.35, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 230, damping: 17, delay: 0.18 }}
        style={{ position: 'relative', marginBottom: '2.5rem', zIndex: 2 }}
      >
        {/* Rotating orbit ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
          style={{ position: 'absolute', inset: -22, borderRadius: '50%' }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0, top: 0, right: 0, bottom: 0,
                transform: `rotate(${i * 36}deg)`,
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                width: i % 2 === 0 ? 4 : 2.5, height: i % 2 === 0 ? 4 : 2.5,
                marginLeft: i % 2 === 0 ? -2 : -1.25,
                borderRadius: '50%',
                backgroundColor: `rgba(${i % 2 === 0 ? '139,127,232' : '201,182,240'},${i % 2 === 0 ? 0.65 : 0.35})`,
              }} />
            </div>
          ))}
        </motion.div>

        {/* Shockwave rings — 3 waves, staggered */}
        {([0, 0.18, 0.36] as const).map((d, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 2.4 + i * 0.35, 3.0 + i * 0.35], opacity: [0, 0.38 - i * 0.1, 0] }}
            transition={{ duration: 1.1 + i * 0.2, ease: 'easeOut', delay: 1.0 + d, repeat: Infinity, repeatDelay: 2.2 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `${1.8 - i * 0.4}px solid rgba(139,127,232,0.55)`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Bloom glow — fires when checkmark lands */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.75, 0.35], scale: [0.5, 1.5, 1.2] }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 1.0 }}
          style={{
            position: 'absolute', inset: -18, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,127,232,0.55) 0%, rgba(139,127,232,0.2) 50%, transparent 70%)',
            filter: 'blur(14px)', pointerEvents: 'none',
          }}
        />

        {/* SVG icon — larger, three-stop gradient ring */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          {/* Subtle fill */}
          <circle cx="60" cy="60" r="54" fill="rgba(139,127,232,0.07)" />
          {/* Static dim track */}
          <circle cx="60" cy="60" r="54" stroke="rgba(139,127,232,0.10)" strokeWidth="1.5" />
          {/* Animated draw ring */}
          <motion.circle
            cx="60" cy="60" r="50"
            stroke="url(#sg3)"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="314"
            initial={{ strokeDashoffset: 314 }}
            animate={{ strokeDashoffset: 0 }}
            style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }}
            transition={{ duration: 0.85, ease: [0.35, 0, 0.15, 1], delay: 0.26 }}
          />
          {/* Checkmark */}
          <motion.path
            d="M36 60L52 76L84 42"
            stroke="#C9B6F0"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="68"
            initial={{ strokeDashoffset: 68 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut', delay: 1.0 }}
          />
          <defs>
            <linearGradient id="sg3" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6B5FD8" />
              <stop offset="50%" stopColor="#8B7FE8" />
              <stop offset="100%" stopColor="#C9B6F0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Spark burst — radiates out when checkmark lands */}
        {SPARKS.map(s => {
          const rad = s.angle * (Math.PI / 180);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: Math.cos(rad) * s.dist,
                y: Math.sin(rad) * s.dist,
                scale: [0, 1.3, 0.5],
              }}
              transition={{ duration: 0.65 + (s.id % 3) * 0.12, ease: 'easeOut', delay: s.delay }}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                marginLeft: -s.size / 2, marginTop: -s.size / 2,
                width: s.size, height: s.size,
                borderRadius: s.id % 4 === 0 ? '2px' : '50%',
                backgroundColor: s.color,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </motion.div>

      {/* ── Letter-by-letter heading ── */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1
          aria-label={heading}
          style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
            margin: '0 0 0.625rem', overflow: 'hidden',
            perspective: '600px',
          }}
        >
          {heading.split('').map((char, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, y: 32, rotateX: -55 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0, 1], delay: 0.70 + i * 0.048 }}
              style={{
                display: 'inline-block',
                color: '#F4F3FC',
                fontSize: '2.75rem',
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle — slides up after heading settles */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 1.38 }}
          style={{ color: 'rgba(240,239,248,0.32)', fontSize: '1rem', letterSpacing: '0.015em', margin: 0 }}
        >
          Taking you to your workspace&hellip;
        </motion.p>
      </div>

      {/* ── Progress bar ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '3px', backgroundColor: 'rgba(139,127,232,0.08)',
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.95, ease: 'linear', delay: 0.45 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6B5FD8, #8B7FE8, #C9B6F0)',
            transformOrigin: 'left',
            boxShadow: '0 0 12px rgba(139,127,232,0.7)',
          }}
        />
      </div>
    </motion.div>,
    document.body
  );
}
