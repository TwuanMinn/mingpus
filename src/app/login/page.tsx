"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion, OverlayContent, SignInPanel, SignUpPanel } from './components';

// ---------------------------------------------------------------------------
// Floating Chinese Characters — decorative watermark that drifts upward
// ---------------------------------------------------------------------------

const FLOAT_CHARS = ['学', '写', '道', '墨', '心', '笔', '文', '字', '书', '画', '知', '思', '练', '功', '静'];

function FloatingCharacters() {
  const items = React.useMemo(() => {
    return FLOAT_CHARS.map((char, i) => ({
      char,
      left: `${3 + (i * 13) % 94}%`,
      size: 80 + (i % 5) * 30,
      duration: 22 + (i % 6) * 5,
      delay: (i % 8) * 2.5,
      opacity: 0.02 + (i % 4) * 0.008,
    }));
  }, []);

  return (
    <>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: item.left,
            bottom: '-8%',
            fontSize: `${item.size}px`,
            fontWeight: 900,
            color: 'rgba(255,255,255,1)',
            opacity: item.opacity,
            filter: 'blur(1.5px)',
            animation: `floatUp ${item.duration}s ${item.delay}s linear infinite`,
            userSelect: 'none',
          }}
        >
          {item.char}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(12deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const reducedMotion = useReducedMotion();

  const [isSignIn, setIsSignIn] = useState(true);
  const [overlayMode, setOverlayMode] = useState<'join' | 'signin'>('join');
  const [transitioning, setTransitioning] = useState(false);

  const siFirstRef = useRef<HTMLInputElement>(null);
  const suFirstRef = useRef<HTMLInputElement>(null);
  const siPanelRef = useRef<HTMLDivElement>(null);
  const suPanelRef = useRef<HTMLDivElement>(null);

  const SLIDE_MS = reducedMotion ? 0 : 640;
  const SWAP_MS = reducedMotion ? 60 : 320;
  const FOCUS_MS = reducedMotion ? 120 : 700;
  const EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

  // Inert + aria-hidden on inactive panel
  useEffect(() => {
    type IE = HTMLElement & { inert: boolean };
    const si = siPanelRef.current as IE | null;
    const su = suPanelRef.current as IE | null;
    if (si) { si.inert = !isSignIn; si.setAttribute('aria-hidden', String(!isSignIn)); }
    if (su) { su.inert = isSignIn; su.setAttribute('aria-hidden', String(isSignIn)); }
  }, [isSignIn]);

  const goSignUp = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setIsSignIn(false);
    setOverlayMode('signin');
    setTimeout(() => { suFirstRef.current?.focus(); setTransitioning(false); }, FOCUS_MS);
  }, [transitioning, FOCUS_MS]);

  const goSignIn = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    setIsSignIn(true);
    setOverlayMode('join');
    setTimeout(() => { siFirstRef.current?.focus(); setTransitioning(false); }, FOCUS_MS);
  }, [transitioning, FOCUS_MS]);

  const panelFade = (active: boolean) =>
    reducedMotion ? 'opacity 120ms ease' : `opacity 280ms ease ${active ? '320ms' : '180ms'}`;

  const overlayTx = isSignIn ? 'translateX(100%)' : 'translateX(0%)';
  const overlayTr = reducedMotion ? 'opacity 120ms ease' : `transform ${SLIDE_MS}ms ${EASE}`;

  return (
    <div suppressHydrationWarning style={{
      backgroundColor: '#0E0E11', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: 'Inter, DM Sans, system-ui, sans-serif',
    }}>
      {/* Ambient glows */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 700px 500px at 20% 50%, rgba(139,127,232,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 500px at 80% 50%, rgba(201,182,240,0.05) 0%, transparent 70%)' }} />
        <FloatingCharacters />
      </div>

      <main style={{ position: 'relative', width: '100%', maxWidth: '900px', zIndex: 10 }}>
        {/* Card */}
        <div style={{
          backgroundColor: '#161618', borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.045)',
          height: '600px', position: 'relative', overflow: 'hidden',
        }}>

          {/* ── SIGN IN PANEL ── */}
          <div
            ref={siPanelRef}
            style={{
              position: 'absolute', left: 0, top: 0, width: '50%', height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '2.5rem',
              opacity: isSignIn ? 1 : 0,
              transition: panelFade(isSignIn),
              pointerEvents: isSignIn ? 'auto' : 'none',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SignInPanel firstRef={siFirstRef} />
            </div>
          </div>

          {/* ── SIGN UP PANEL ── */}
          <div
            ref={suPanelRef}
            style={{
              position: 'absolute', right: 0, top: 0, width: '50%', height: '100%',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '2.5rem',
              opacity: !isSignIn ? 1 : 0,
              transition: panelFade(!isSignIn),
              pointerEvents: !isSignIn ? 'auto' : 'none',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <SignUpPanel firstRef={suFirstRef} />
            </div>
          </div>

          {/* ── OVERLAY ── */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', left: 0, top: 0, width: '50%', height: '100%',
              background: 'linear-gradient(135deg, #1E1635 0%, #0D1630 100%)',
              borderRadius: '16px', zIndex: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '2.5rem 2rem',
              transform: overlayTx, transition: overlayTr,
              willChange: 'transform', overflow: 'hidden',
            }}
          >
            {/* Blobs */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '8%', right: '-8%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
              <div style={{ position: 'absolute', bottom: '12%', left: '-5%', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(30px)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(20px)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              <OverlayContent mode={overlayMode} onJoin={goSignUp} onSignIn={goSignIn} />
            </div>

            {/* Pagination dots */}
            <div aria-hidden="true" style={{ position: 'absolute', bottom: '28px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.9)' }} />
              <div style={{ width: '8px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <div style={{ width: '8px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
