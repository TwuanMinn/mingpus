'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { useSettingsStore, type SpeechRate, type DailyGoal, type FontSize } from '@/store/useSettingsStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3 px-1">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-container-low transition-colors">
      <div>
        <p className="text-sm font-medium text-on-surface">{label}</p>
        {sublabel && <p className="text-xs text-on-surface-variant mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        value ? 'bg-primary' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg bg-surface-container-low p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors duration-150 ${
            value === opt.value
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({ open, onClose }: Props) {
  const store = useSettingsStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Hydrate on first open
  useEffect(() => {
    if (open && !store._hydrated) store._hydrate();
  }, [open, store]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            ref={panelRef}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed top-0 left-0 h-full w-80 bg-background border-r border-outline-variant/30 z-[70] flex flex-col shadow-2xl font-[family-name:var(--font-jakarta)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[22px] text-primary">settings</span>
                <h2 className="text-base font-bold text-on-surface tracking-tight">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close settings"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">

              {/* Appearance */}
              <Section title="Appearance">
                <Row label="Theme" sublabel="Light or dark interface">
                  <ThemeToggle />
                </Row>
                <Row label="Font Size">
                  <SegmentedControl<FontSize>
                    options={[
                      { label: 'S', value: 'small' },
                      { label: 'M', value: 'medium' },
                      { label: 'L', value: 'large' },
                    ]}
                    value={store.fontSize}
                    onChange={store.setFontSize}
                  />
                </Row>
              </Section>

              {/* Audio */}
              <Section title="Audio">
                <Row label="Auto-play pronunciation" sublabel="Read cards aloud on flip">
                  <Toggle value={store.autoPlayTTS} onChange={store.setAutoPlayTTS} />
                </Row>
                <Row label="Speech speed">
                  <SegmentedControl<SpeechRate>
                    options={[
                      { label: 'Slow', value: 'slow' },
                      { label: 'Normal', value: 'normal' },
                      { label: 'Fast', value: 'fast' },
                    ]}
                    value={store.speechRate}
                    onChange={store.setSpeechRate}
                  />
                </Row>
              </Section>

              {/* Study */}
              <Section title="Study">
                <Row label="Daily card goal" sublabel="New cards to review each day">
                  <SegmentedControl<string>
                    options={[
                      { label: '10', value: '10' },
                      { label: '20', value: '20' },
                      { label: '50', value: '50' },
                      { label: '100', value: '100' },
                    ]}
                    value={String(store.dailyGoal)}
                    onChange={(v) => store.setDailyGoal(Number(v) as DailyGoal)}
                  />
                </Row>
                <Row label="Show pinyin by default" sublabel="Display pronunciation guide">
                  <Toggle value={store.showPinyinByDefault} onChange={store.setShowPinyinByDefault} />
                </Row>
                <Row label="Card flip animations" sublabel="Animate card transitions">
                  <Toggle value={store.enableCardAnimations} onChange={store.setEnableCardAnimations} />
                </Row>
              </Section>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-outline-variant/30">
              <p className="text-xs text-on-surface-variant/50 text-center">
                Settings are saved automatically
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
