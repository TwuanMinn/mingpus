"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Field, StyledInput, PasswordInput, StyledSelect, Checkbox, ErrorBanner, CTAButton } from './AuthPrimitives';

export function SignUpPanel({ firstRef }: { firstRef: React.RefObject<HTMLInputElement | null> }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (!agree) { setError('Please agree to the Terms & Privacy Policy.'); return; }
    setLoading(true); setError('');
    const { error: err } = await signUp.email({ email, password, name: name.trim() || email.split('@')[0] });
    if (err) { setError(err.message || 'Failed to create account.'); setLoading(false); }
    else { router.push('/'); router.refresh(); }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ color: '#8B7FE8', letterSpacing: '0.12em', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
          Create Account
        </span>
        <h1 style={{ color: '#F0EFF8', fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.2, margin: 0 }}>
          Begin your craft.
        </h1>
      </div>
      <form onSubmit={handleSignUp}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <ErrorBanner message={error} />}
          <Field label="Full Name" id="su-name">
            <StyledInput inputRef={firstRef} id="su-name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </Field>
          <Field label="Email Address" id="su-email">
            <StyledInput id="su-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </Field>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Field label="Gender" id="su-gender">
                <StyledSelect id="su-gender" required value={gender} onChange={e => setGender(e.target.value)} disabled={loading}>
                  <option value="" disabled hidden>Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </StyledSelect>
              </Field>
            </div>
            <div style={{ flex: 0.6 }}>
              <Field label="Age" id="su-age">
                <StyledInput id="su-age" type="number" min="13" max="120" placeholder="18" required value={age} onChange={e => setAge(e.target.value)} disabled={loading} />
              </Field>
            </div>
          </div>
          <Field label="Password" id="su-password">
            <PasswordInput id="su-password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </Field>
          <Field label="Confirm Password" id="su-confirm-password">
            <PasswordInput id="su-confirm-password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} />
          </Field>
          <Checkbox id="agree-terms" checked={agree} onChange={setAgree}>
            I agree to the{' '}
            <a href="#" style={{ color: '#8B7FE8', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Terms &amp; Privacy Policy
            </a>
          </Checkbox>
          <CTAButton type="submit" loading={loading} disabled={loading} style={{ marginTop: '0.25rem' }}>
            Sign Up
          </CTAButton>
        </div>
      </form>
    </div>
  );
}
