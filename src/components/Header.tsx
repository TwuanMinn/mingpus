'use client';

import { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex md:hidden justify-between items-center w-full px-4 sm:px-6 py-3 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="text-base sm:text-lg font-black text-primary font-(family-name:--font-jakarta)">Digital Calligrapher</div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Open settings"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>
      </header>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
