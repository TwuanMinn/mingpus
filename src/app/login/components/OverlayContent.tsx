"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import authIcon1 from '../../../../public/auth-yellow-3d.png';
import authIcon2 from '../../../../public/auth-signin-styled-transparent.png';
import authIcon3 from '../../../../public/auth-cyan-3d.png';
import rocketIcon from '../../../../public/images/rocket-transparent.png';

const ALL_ICONS = [authIcon1, authIcon3];

function RotatingIcon() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ALL_ICONS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', height: 260, perspective: 1000 }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={index}
           initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
           animate={{ opacity: 1, rotateY: 0, scale: 1 }}
           exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
           transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
           style={{ position: 'absolute', top: 0 }}
        >
          <Image src={ALL_ICONS[index]} alt="3D Feature Asset" width={260} height={260} style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(139,127,232,0.65))' }} priority />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

const GHOST_BTN: React.CSSProperties = {
  border: '2px solid rgba(255,255,255,0.45)',
  borderRadius: '9999px',
  padding: '12px 28px',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.6875rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  background: 'transparent',
  cursor: 'pointer',
  transition: 'border-color 180ms ease, background 180ms ease',
};

export function OverlayContent({
  mode, onJoin, onSignIn,
}: { mode: 'join' | 'signin'; onJoin: () => void; onSignIn: () => void }) {
  const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)';
    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
  };
  const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)';
    e.currentTarget.style.background = 'transparent';
  };
  const press = (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(0.97)'; };
  const release = (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1)'; };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {mode === 'join' ? (
          <motion.div key="join" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.4, ease: 'backOut' }} style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '100%', height: 260, marginBottom: '1.5rem' }}>
              <RotatingIcon />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, marginBottom: '0.875rem' }}>New Here?</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: '248px', margin: '0 auto 1.75rem' }}>
              Begin your journey into the art of focus and scholarly mastery.
            </p>
            <button style={GHOST_BTN} aria-pressed={false} onClick={onJoin} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onPointerDown={press} onPointerUp={release} onPointerLeave={release}>
              Join Digital Calligrapher
            </button>
          </motion.div>
        ) : (
          <motion.div key="signin" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: 'backOut' }} style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '100%', height: 260, marginBottom: '1.5rem', overflow: 'hidden' }}>
              {/* Rocket trail particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`trail-${i}`}
                  style={{
                    position: 'absolute',
                    width: 6 + i * 2,
                    height: 6 + i * 2,
                    borderRadius: '50%',
                    background: `rgba(139, 127, 232, ${0.6 - i * 0.1})`,
                    filter: 'blur(2px)',
                    top: `${45 + (i % 3) * 5}%`,
                    left: '50%', // start from center (behind rocket)
                  }}
                  animate={{
                     x: [0, -150], // shooting backwards to the left
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.3],
                  }}
                  transition={{
                    duration: 10, // Extreme slow motion particles
                    repeat: Infinity,
                    delay: i * 2, // staggered heavily
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Flying rocket — hovers perfectly in the center */}
              <motion.div
                style={{ position: 'absolute', top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0, 12, 0] }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }} // Extremely slow, majestic float
                >
                  <Image
                    src={rocketIcon}
                    alt="3D Rocket Flying"
                    width={1000} // EVEN BIGGER
                    height={1000}
                    style={{
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 20px 45px rgba(139,127,232,0.9)) drop-shadow(-20px 0 40px rgba(100,200,255,0.4))',
                      transform: 'translateX(20px) translateY(-200px)', // strongly pull up to center visual mass
                    }}
                    priority
                  />
                </motion.div>
              </motion.div>

              {/* Speed lines — rushing past the rocket */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  style={{
                    position: 'absolute',
                    height: 2,
                    borderRadius: 1,
                    background: `linear-gradient(270deg, transparent, rgba(139,127,232,${0.5 - i * 0.15}), transparent)`,
                    top: `${30 + i * 20}%`,
                    width: 100 + i * 40,
                  }}
                  animate={{
                    x: ['200px', '-200px'],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 20, // Extreme slow motion cruising
                    repeat: Infinity,
                    delay: i * 4,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, marginBottom: '0.875rem' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: '248px', margin: '0 auto 1.75rem' }}>
              Continue mastering your flow and creative discipline.
            </p>
            <button style={GHOST_BTN} aria-pressed={false} onClick={onSignIn} onMouseEnter={hoverOn} onMouseLeave={hoverOff} onPointerDown={press} onPointerUp={release} onPointerLeave={release}>
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>
  </div>
  );
}
