"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth-client';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function LoginPage() {
  usePageTitle('Login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || 'Failed to sign in. Check your credentials.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter an email and password to create an account.");
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await signUp.email({
      email,
      password,
      name: email.split('@')[0],
    });

    if (error) {
      setError(error.message || 'Failed to create account.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-on-surface font-sans antialiased">
      {/* Background — CSS gradient, no external images */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />

      {/* Main Canvas */}
      <main className="relative w-full h-screen flex items-center justify-center p-4">
        {/* Auth Card Container */}
        <div className="relative w-full max-w-[900px] h-[600px] md:h-[500px] bg-surface-container-low rounded-xl overflow-hidden shadow-2xl shadow-on-surface/10 flex z-10 transition-colors">
          
          {/* LEFT PANEL */}
          <div className="w-full md:w-1/2 glass-panel p-10 flex flex-col justify-center relative">
            <div className="mb-10 text-center md:text-left">
              <span className="text-[0.6875rem] uppercase tracking-[0.1em] font-bold text-primary mb-2 block">Welcome Back</span>
              <h1 className="text-[1.75rem] font-bold text-on-surface leading-tight font-sans">Master your flow.</h1>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 text-sm text-error bg-error-container/30 border border-error/20 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="relative group">
                <input 
                  className="w-full bg-transparent border-b-2 border-outline-variant py-3 px-1 focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/40 text-on-surface" 
                  placeholder="Email Address" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required 
                />
              </div>
              <div className="relative group">
                <input 
                  className="w-full bg-transparent border-b-2 border-outline-variant py-3 px-1 focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/40 text-on-surface" 
                  placeholder="Password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required 
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="hidden peer" />
                  <div className="w-4 h-4 rounded-sm border border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center peer-checked:bg-primary"></div>
                  <span className="text-xs text-on-surface-variant font-medium">Keep me signed in</span>
                </label>
                <a className="text-xs text-primary font-bold hover:underline" href="#">Forgot?</a>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:shadow-secondary/30 text-on-primary rounded-full font-bold text-sm tracking-wide shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                ) : (
                   "SIGN IN"
                )}
              </button>
            </form>

            <div className="mt-10 md:hidden flex flex-col items-center">
              <p className="text-xs text-on-surface-variant mb-4">Don't have an account?</p>
              <button 
                onClick={handleSignUp}
                disabled={loading}
                className="px-8 py-3 border border-primary text-primary rounded-full font-bold text-[0.6875rem] tracking-widest uppercase hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-secondary/90 p-12 flex-col items-center justify-center text-center text-on-primary relative overflow-hidden">
            {/* Abstract pattern via CSS instead of external image */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[15%] left-[20%] w-40 h-40 rounded-full bg-on-primary/20 blur-2xl" />
              <div className="absolute bottom-[20%] right-[15%] w-56 h-56 rounded-full bg-on-primary/15 blur-3xl" />
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-on-primary/10 blur-xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-[1.75rem] font-bold mb-4 font-sans">New Here?</h2>
              <p className="text-sm font-medium leading-relaxed opacity-80 mb-10 max-w-[280px] mx-auto">
                Begin your journey into the art of focus and scholarly mastery.
              </p>
              <button 
                onClick={handleSignUp}
                disabled={loading}
                className="px-10 py-4 border-2 border-on-primary/40 hover:border-on-primary text-on-primary rounded-full font-bold text-[0.6875rem] tracking-[0.1em] uppercase transition-all duration-300 hover:bg-on-primary hover:text-primary disabled:opacity-50"
              >
                Join Digital Calligrapher
              </button>
            </div>
            
            {/* Visual Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
              <div className="w-8 h-1 bg-on-primary rounded-full"></div>
              <div className="w-2 h-1 bg-on-primary/30 rounded-full"></div>
              <div className="w-2 h-1 bg-on-primary/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
