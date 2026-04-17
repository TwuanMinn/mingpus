"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ---------------------------------------------------------------------------
// Primitives (scoped — same visual language as login page)
// ---------------------------------------------------------------------------

const INPUT_BASE: React.CSSProperties = {
  backgroundColor: '#ECECF5',
  borderRadius: '12px',
  height: '48px',
  color: '#1a1a2e',
  border: '2px solid transparent',
  outline: 'none',
  width: '100%',
  padding: '0 16px',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'border-color 160ms ease, box-shadow 160ms ease',
  boxSizing: 'border-box',
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={INPUT_BASE}
      onFocus={e => {
        e.currentTarget.style.borderColor = '#8B7FE8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
        props.onFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}

function Spinner() {
  return (
    <span
      className="animate-spin"
      style={{
        width: 20, height: 20, display: 'inline-block',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%',
      }}
    />
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" style={{
      padding: '10px 14px',
      backgroundColor: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 10, color: '#FCA5A5', fontSize: '0.8125rem', lineHeight: 1.5,
    }}>
      {message}
    </div>
  );
}

const LABEL: React.CSSProperties = {
  color: 'rgba(240,239,248,0.5)',
  fontSize: '0.6875rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontWeight: 600,
  display: 'block',
  marginBottom: '6px',
};

// ---------------------------------------------------------------------------
// Password strength meter
// ---------------------------------------------------------------------------

function strengthScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['transparent', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = strengthScore(password);
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              backgroundColor: score >= i ? STRENGTH_COLORS[score] : 'rgba(240,239,248,0.12)',
              transition: 'background-color 300ms ease',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.6875rem', color: STRENGTH_COLORS[score], fontWeight: 600, marginTop: 4, display: 'block' }}>
        {STRENGTH_LABELS[score]}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner component (reads search params — must be inside Suspense)
// ---------------------------------------------------------------------------

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get('token');
  const error  = params.get('error');

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  // Invalid / expired token landing
  const isInvalidToken = error === 'INVALID_TOKEN' || (!token && !error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) { setSubmitError("Passwords don't match."); return; }
    if (strengthScore(password) < 2) { setSubmitError('Password is too weak. Use at least 8 characters.'); return; }
    setLoading(true); setSubmitError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError((data as { message?: string }).message || 'Reset failed. The link may have expired.');
        setLoading(false);
      } else {
        setDone(true);
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err: unknown) {
      console.error('Reset password request failed:', err);
      setSubmitError('Network error. Please try again.');
      setLoading(false);
    }
  };

  // ── Success state ──
  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ color: '#22c55e', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
          Password Updated
        </span>
        <h1 style={{ color: '#F0EFF8', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, margin: '0 0 0.75rem' }}>
          You&apos;re all set.
        </h1>
        <p style={{ color: 'rgba(240,239,248,0.45)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Redirecting you to sign in&hellip;
        </p>
      </div>
    );
  }

  // ── Invalid / expired token ──
  if (isInvalidToken) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ color: '#ef4444', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
          Link Invalid
        </span>
        <h1 style={{ color: '#F0EFF8', fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25, margin: '0 0 0.75rem' }}>
          This link has expired.
        </h1>
        <p style={{ color: 'rgba(240,239,248,0.45)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Reset links are valid for 1 hour. Request a new one from the login page.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'linear-gradient(90deg, #8B7FE8, #C9B6F0)',
            boxShadow: '0 8px 32px rgba(139,127,232,0.4)',
            borderRadius: '9999px', height: '48px', color: '#fff',
            fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', border: 'none', padding: '0 32px', cursor: 'pointer',
            transition: 'box-shadow 200ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(139,127,232,0.65)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,127,232,0.4)'}
        >
          Back to Login
        </button>
      </div>
    );
  }

  // ── Reset form ──
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <span style={{ color: '#8B7FE8', letterSpacing: '0.12em', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
          New Password
        </span>
        <h1 style={{ color: '#F0EFF8', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
          Choose a strong password.
        </h1>
        <p style={{ color: 'rgba(240,239,248,0.4)', fontSize: '0.8125rem', marginTop: '0.625rem', lineHeight: 1.55 }}>
          Your new password must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {submitError && <ErrorBanner message={submitError} />}

        <div>
          <label htmlFor="rp-password" style={LABEL}>New Password</label>
          <div style={{ position: 'relative' }}>
            <StyledInput
              id="rp-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              style={{ ...INPUT_BASE, paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(26,26,46,0.4)', padding: 4,
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B7FE8'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(26,26,46,0.4)'}
            >
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <StrengthMeter password={password} />
        </div>

        <div>
          <label htmlFor="rp-confirm" style={LABEL}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <StyledInput
              id="rp-confirm"
              type={showCf ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={loading}
              style={{
                ...INPUT_BASE,
                paddingRight: '44px',
                borderColor: confirm && confirm !== password ? '#ef4444' : 'transparent',
                boxShadow: confirm && confirm !== password ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowCf(v => !v)}
              aria-label={showCf ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(26,26,46,0.4)', padding: 4,
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B7FE8'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(26,26,46,0.4)'}
            >
              {showCf ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {confirm && confirm !== password && (
            <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 600, marginTop: 4, display: 'block' }}>
              Passwords don&apos;t match
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg, #8B7FE8, #C9B6F0)',
            boxShadow: '0 8px 32px rgba(139,127,232,0.4)',
            borderRadius: '9999px', height: '48px', color: '#fff',
            fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', border: 'none', width: '100%',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'box-shadow 200ms ease, transform 100ms ease',
            opacity: loading ? 0.6 : 1, marginTop: '0.25rem',
          }}
          onPointerDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
          onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 40px rgba(139,127,232,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,127,232,0.4)'; }}
        >
          {loading ? <Spinner /> : 'Set New Password'}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

function ResetPasswordContent() {
  return (
    <div style={{
      backgroundColor: '#0E0E11', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: 'Inter, DM Sans, system-ui, sans-serif',
    }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(139,127,232,0.07) 0%, transparent 70%)' }} />
      </div>

      <main style={{ position: 'relative', width: '100%', maxWidth: '440px', zIndex: 10 }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(139,127,232,0.08)', border: '1px solid rgba(139,127,232,0.2)',
            borderRadius: '12px', padding: '8px 16px',
          }}>
            <span style={{ fontSize: '1.125rem' }}>✦</span>
            <span style={{ color: 'rgba(240,239,248,0.7)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              Digital Calligrapher
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#161618',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.045)',
          padding: '2.5rem',
        }}>
          <ResetForm />
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
