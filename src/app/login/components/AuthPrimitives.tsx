"use client";

import React, { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// Shared primitives
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

interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.RefObject<HTMLInputElement | null>;
}
export function StyledInput({ inputRef, onFocus, onBlur, ...rest }: StyledInputProps) {
  return (
    <input
      ref={inputRef}
      {...rest}
      style={INPUT_BASE}
      onFocus={e => {
        e.currentTarget.style.borderColor = '#8B7FE8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
        onFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    />
  );
}

export function PasswordInput({ inputRef, ...rest }: StyledInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <StyledInput
        inputRef={inputRef}
        {...rest}
        type={visible ? 'text' : 'password'}
        style={{ ...INPUT_BASE, paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#8B7FE8'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  inputRef?: React.RefObject<HTMLSelectElement | null>;
}
export function StyledSelect({ inputRef, onFocus, onBlur, children, ...rest }: StyledSelectProps) {
  return (
    <select
      ref={inputRef}
      {...rest}
      style={{
        ...INPUT_BASE,
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%231a1a2e\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
        paddingRight: '36px',
        color: rest.value === "" ? '#6b7280' : '#1a1a2e',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = '#8B7FE8';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
        onFocus?.(e);
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    >
      {children}
    </select>
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

export function Field({ label, id, children, style }: { label: string; id: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div suppressHydrationWarning style={style}>
      <label htmlFor={id} style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

export function Spinner() {
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

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}
export function CTAButton({ loading, children, disabled, style, ...rest }: CTAButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        background: 'linear-gradient(90deg, #8B7FE8, #C9B6F0)',
        boxShadow: '0 8px 32px rgba(139,127,232,0.4)',
        borderRadius: '9999px',
        height: '48px',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        border: 'none',
        width: '100%',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 200ms ease, transform 100ms ease',
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
      onPointerDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.boxShadow = '0 8px 40px rgba(139,127,232,0.65)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,127,232,0.4)'; }}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export function Checkbox({ id, checked, onChange, children }: {
  id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
      <div
        id={id}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
        style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
          border: `2px solid ${checked ? '#8B7FE8' : 'rgba(240,239,248,0.25)'}`,
          backgroundColor: checked ? '#8B7FE8' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 160ms ease', cursor: 'pointer',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ color: 'rgba(240,239,248,0.55)', fontSize: '0.75rem', lineHeight: 1.55 }}>{children}</span>
    </label>
  );
}

export function ErrorBanner({ message }: { message: string }) {
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

export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        color: 'rgba(240,239,248,0.45)', fontSize: '0.75rem',
        fontWeight: 600, padding: 0, marginBottom: '1.5rem',
        transition: 'color 150ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#8B7FE8'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,239,248,0.45)'}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back to Sign In
    </button>
  );
}
