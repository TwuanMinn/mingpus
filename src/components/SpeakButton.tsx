'use client';

import { useState, useEffect } from 'react';
import { speakChinese, isTTSSupported } from '@/lib/tts';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SpeakButton({ text, className = '', size = 'md' }: SpeakButtonProps) {
  // Defer the window-dependent check to avoid hydration mismatch
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isTTSSupported());
  }, []);

  if (!supported) return null;

  const iconSize = size === 'sm' ? 'text-[16px]' : size === 'lg' ? 'text-[28px]' : 'text-[20px]';
  const padding = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-2.5' : 'p-1.5';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        speakChinese(text);
      }}
      className={`${padding} rounded-full hover:bg-primary-fixed text-primary transition-colors active:scale-90 ${className}`}
      aria-label={`Listen to pronunciation of ${text}`}
      title="Listen to pronunciation"
    >
      <span className={`material-symbols-outlined ${iconSize}`}>volume_up</span>
    </button>
  );
}
