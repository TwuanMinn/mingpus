"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from '@/lib/auth-client';
import { AnimatedSignInButton, type BtnPhase } from '@/components/ui/AnimatedSignInButton';
import { Field, StyledInput, PasswordInput, Checkbox, ErrorBanner, BackLink, CTAButton } from './AuthPrimitives';
import { SuccessOverlay } from './SuccessOverlay';

type SignInView = 'form' | 'forgot' | 'forgot-sent';

export function SignInPanel({ firstRef }: { firstRef: React.RefObject<HTMLInputElement | null> }) {
  const router = useRouter();
  const [view, setView] = useState<SignInView>('form');

  // Sign in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);
  const [error, setError] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);

  // Multi-phase button animation: idle → icon → dots → rocket → done
  const [btnPhase, setBtnPhase] = useState<BtnPhase>('idle');

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('');
  const [fpError, setFpError] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const fpFirstRef = useRef<HTMLInputElement>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (btnPhase !== 'idle') return;
    setError('');

    // Phase 1: Login icon rises up
    setBtnPhase('icon');

    // Phase 2: Bouncing dots while authenticating
    const dotsTimer = setTimeout(() => setBtnPhase('dots'), 700);

    const { error: err } = await signIn.email({ email, password });

    if (err) {
      clearTimeout(dotsTimer);
      setError(err.message || 'Failed to sign in. Check your credentials.');
      setBtnPhase('idle');
    } else {
      // Phase 3: Rocket slides across
      setBtnPhase('rocket');
      // Phase 4: Success
      setTimeout(() => {
        setBtnPhase('done');
        setTimeout(() => setShowOverlay(true), 400);
        setTimeout(() => { router.push('/'); router.refresh(); }, 2600);
      }, 3200);
    }
  };

  const goForgot = () => {
    setFpEmail(email); // pre-fill with whatever was typed
    setFpError('');
    setView('forgot');
    setTimeout(() => fpFirstRef.current?.focus(), 60);
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fpEmail) { setFpError('Please enter your email address.'); return; }
    setFpLoading(true); setFpError('');
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fpEmail,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFpError((data as { message?: string }).message || 'Something went wrong. Please try again.');
        setFpLoading(false);
      } else {
        setView('forgot-sent');
      }
    } catch {
      setFpError('Network error. Please try again.');
      setFpLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'form' && (
        <motion.div key="si-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ color: '#8B7FE8', letterSpacing: '0.12em', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Welcome Back
            </span>
            <h1 style={{ color: '#F0EFF8', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
              Master your flow.
            </h1>
          </div>
          <form onSubmit={handleSignIn}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {error && <ErrorBanner message={error} />}
              <Field label="Email Address" id="si-email">
                <StyledInput inputRef={firstRef} id="si-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={btnPhase !== 'idle'} />
              </Field>
              <Field label="Password" id="si-password">
                <PasswordInput id="si-password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={btnPhase !== 'idle'} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Checkbox id="keep-signed-in" checked={keep} onChange={setKeep}>Keep me signed in</Checkbox>
                <button
                  type="button"
                  onClick={goForgot}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B7FE8', fontSize: '0.75rem', fontWeight: 700, padding: 0, transition: 'text-decoration 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot?
                </button>
              </div>
              {/* ─── Multi-phase animated sign-in button ─── */}
              <AnimatedSignInButton btnPhase={btnPhase} />
            </div>
          </form>

          {/* Full-screen success overlay */}
          <SuccessOverlay mounted={showOverlay} />
        </motion.div>
      )}

      {view === 'forgot' && (
        <motion.div key="si-forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <BackLink onClick={() => setView('form')} />
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ color: '#8B7FE8', letterSpacing: '0.12em', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Reset Password
            </span>
            <h1 style={{ color: '#F0EFF8', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
              Recover your access.
            </h1>
            <p style={{ color: 'rgba(240,239,248,0.45)', fontSize: '0.8125rem', marginTop: '0.625rem', lineHeight: 1.55 }}>
              Enter the email tied to your account and we&apos;ll send you a reset link.
            </p>
          </div>
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {fpError && <ErrorBanner message={fpError} />}
            <Field label="Email Address" id="fp-email">
              <StyledInput inputRef={fpFirstRef} id="fp-email" type="email" autoComplete="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)} disabled={fpLoading} />
            </Field>
            <CTAButton type="submit" loading={fpLoading} disabled={fpLoading}>
              Send Reset Link
            </CTAButton>
          </form>
        </motion.div>
      )}

      {view === 'forgot-sent' && (
        <motion.div key="si-sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          {/* Success icon */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(139,127,232,0.12)', border: '2px solid rgba(139,127,232,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17L4 12" stroke="#8B7FE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ color: '#8B7FE8', letterSpacing: '0.12em', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            Email Sent
          </span>
          <h1 style={{ color: '#F0EFF8', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, margin: '0 0 0.75rem' }}>
            Check your inbox.
          </h1>
          <p style={{ color: 'rgba(240,239,248,0.45)', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We sent a reset link to <span style={{ color: 'rgba(240,239,248,0.75)', fontWeight: 600 }}>{fpEmail}</span>. It expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
          <button
            onClick={() => { setView('form'); setFpEmail(''); }}
            style={{
              background: 'none', border: '1.5px solid rgba(139,127,232,0.35)', borderRadius: '9999px',
              padding: '10px 24px', color: '#8B7FE8', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'border-color 160ms ease, background 160ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B7FE8'; e.currentTarget.style.background = 'rgba(139,127,232,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,127,232,0.35)'; e.currentTarget.style.background = 'none'; }}
          >
            Back to Sign In
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
