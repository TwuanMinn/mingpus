'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppearanceStore } from '@/store/useAppearanceStore';
import type { AppTheme, AppFontSize } from '@/store/useAppearanceStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type RepetitionIntensity = 'relaxed' | 'balanced' | 'intense';
type LearningStyle = 'flashcards' | 'reading' | 'listening' | 'writing' | 'mixed';
type HskLevel = '1' | '2' | '3' | '4' | '5' | '6';
type ReminderTone = 'bamboo' | 'temple' | 'guzheng' | 'silent';
type InterfaceLang = 'en' | 'zh' | 'vi' | 'ja' | 'ko' | 'es';
type Visibility = 'public' | 'friends' | 'private';

interface Settings {
  // Notifications
  dailyReminder: boolean;
  reminderTime: string;
  streakAlerts: boolean;
  soundEffects: boolean;
  pronunciationVolume: number;
  doNotDisturb: boolean;
  reminderTone: ReminderTone;
  // Privacy
  shareLeaderboard: boolean;
  allowFriendRequests: boolean;
  profileVisibility: Visibility;
  showOnlineStatus: boolean;
  // Learning
  hskLevel: HskLevel;
  studyGoalMinutes: number;
  learningStyles: LearningStyle[];
  autoPlayPronunciation: boolean;
  handwritingSensitivity: number;
  repetitionIntensity: RepetitionIntensity;
  topics: string[];
  interfaceLang: InterfaceLang;
}

const STORAGE_KEY = 'dc-settings-v3';

const DEFAULT: Settings = {
  dailyReminder: true,
  reminderTime: '08:00',
  streakAlerts: true,
  soundEffects: true,
  pronunciationVolume: 75,
  doNotDisturb: false,
  reminderTone: 'bamboo',
  shareLeaderboard: true,
  allowFriendRequests: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
  hskLevel: '2',
  studyGoalMinutes: 20,
  learningStyles: ['flashcards', 'mixed'],
  autoPlayPronunciation: false,
  handwritingSensitivity: 60,
  repetitionIntensity: 'balanced',
  topics: ['Daily Life', 'Food'],
  interfaceLang: 'en',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const THEMES: { id: AppTheme; label: string; bg: string; ring: string; c1: string; c2: string }[] = [
  { id: 'dark-cosmos',    label: 'Dark Cosmos',    bg: 'bg-[#0d0b1e]', ring: 'ring-violet-500',  c1: 'bg-violet-500',  c2: 'bg-indigo-400' },
  { id: 'light-jade',     label: 'Light Jade',     bg: 'bg-[#edf7f2]', ring: 'ring-emerald-500', c1: 'bg-emerald-500', c2: 'bg-teal-400' },
  { id: 'light-classic',  label: 'Light Classic',  bg: 'bg-[#fafafa]', ring: 'ring-blue-500',    c1: 'bg-blue-500',    c2: 'bg-slate-400' },
  { id: 'ink-scroll',     label: 'Ink Scroll',     bg: 'bg-[#1a1a18]', ring: 'ring-stone-400',   c1: 'bg-stone-400',   c2: 'bg-amber-200' },
  { id: 'sunset',         label: 'Sunset',         bg: 'bg-[#1f0d06]', ring: 'ring-orange-500',  c1: 'bg-orange-500',  c2: 'bg-rose-400' },
];

const ACCENT_COLORS = ['#7C6FF7','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#F97316'];
const FONT_SIZES: { value: AppFontSize; label: string }[] = [
  { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }, { value: 'xl', label: 'XL' },
];
const REMINDER_TONES: { value: ReminderTone; label: string }[] = [
  { value: 'bamboo', label: '🎋 Bamboo Chime' }, { value: 'temple', label: '🔔 Temple Bell' },
  { value: 'guzheng', label: '🎵 Guzheng Pluck' }, { value: 'silent', label: '🔕 Silent' },
];
const INTERFACE_LANGS: { value: InterfaceLang; label: string }[] = [
  { value: 'en', label: '🇺🇸 English' }, { value: 'zh', label: '🇨🇳 中文' },
  { value: 'vi', label: '🇻🇳 Tiếng Việt' }, { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'ko', label: '🇰🇷 한국어' }, { value: 'es', label: '🇪🇸 Español' },
];
const LEARNING_STYLES: { value: LearningStyle; label: string; icon: string }[] = [
  { value: 'flashcards', label: 'Flashcards', icon: 'style' },
  { value: 'reading',    label: 'Reading',    icon: 'menu_book' },
  { value: 'listening',  label: 'Listening',  icon: 'headphones' },
  { value: 'writing',    label: 'Writing',    icon: 'draw' },
  { value: 'mixed',      label: 'Mixed',      icon: 'shuffle' },
];
const REPETITION_OPTIONS: { value: RepetitionIntensity; label: string; sub: string; icon: string }[] = [
  { value: 'relaxed',  label: 'Relaxed',  sub: 'Longer intervals, less pressure',  icon: 'self_improvement' },
  { value: 'balanced', label: 'Balanced', sub: 'Optimal for most learners',         icon: 'balance' },
  { value: 'intense',  label: 'Intense',  sub: 'Rapid review, maximum retention',   icon: 'local_fire_department' },
];
const ALL_TOPICS = ['Travel','Business','Food','Culture','Technology','Daily Life','History','Sports','Arts','Science'];
const PRESET_AVATARS = ['🐉','🦋','🌸','🎋','🏮','🐼','🌙','⭐','🎐','🦅','🌊','🔮'];

// ─── Toast System ─────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; icon?: string }

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container border border-primary/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl min-w-[220px]"
          >
            {t.icon && (
              <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                {t.icon}
              </span>
            )}
            <span className="text-sm font-semibold text-on-surface flex-1">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none ${
        value ? 'bg-primary shadow-[0_0_10px_rgba(124,111,247,0.45)]' : 'bg-surface-container-high'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingRow({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.04] transition-colors gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {sublabel && <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{sublabel}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Slider({ value, min, max, step = 1, onChange, formatLabel }: {
  value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; formatLabel?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3 w-48">
      <div className="relative flex-1 h-1.5 rounded-full bg-surface-container-high">
        <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_8px_rgba(124,111,247,0.6)] border-2 border-white transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
      <span className="text-xs font-bold text-primary w-10 text-right tabular-nums">
        {formatLabel ? formatLabel(value) : value}
      </span>
    </div>
  );
}

function SectionCard({ title, icon, isOpen, onToggle, delay, children }: {
  title: string; icon: string; isOpen: boolean; onToggle: () => void; delay: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-surface-container/60 backdrop-blur-sm overflow-hidden shadow-lg shadow-black/10"
      style={{ boxShadow: isOpen ? '0 0 0 1px rgba(124,111,247,0.2), 0 4px 32px rgba(124,111,247,0.07)' : undefined }}
    >
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.04] transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isOpen ? 'bg-gradient-to-br from-primary/30 to-secondary/20 shadow-[0_0_12px_rgba(124,111,247,0.3)]' : 'bg-surface-container-high'
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${isOpen ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
          </div>
          <span className="font-bold text-base text-on-surface tracking-tight">{title}</span>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
          className="material-symbols-outlined text-[20px] text-on-surface-variant">
          expand_more
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden">
            <div className="border-t border-white/[0.06] px-1 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-2.5 px-3 pt-4">{children}</p>;
}

// ─── Password Strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: 'bg-error' };
  if (s === 2) return { score: s, label: 'Fair', color: 'bg-warning' };
  if (s === 3) return { score: s, label: 'Good', color: 'bg-secondary' };
  return { score: s, label: 'Strong', color: 'bg-primary' };
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────

function InlineEdit({ label, value, onSave, type = 'text' }: {
  label: string; value: string; onSave: (v: string) => void; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/[0.04] transition-colors gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-on-surface-variant mb-1">{label}</p>
        {editing ? (
          <input ref={inputRef} type={type} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            className="w-full bg-surface-container-high text-on-surface text-sm font-semibold px-3 py-1.5 rounded-lg border border-primary/40 focus:outline-none focus:border-primary transition-colors"
          />
        ) : (
          <p className="text-sm font-semibold text-on-surface truncate">{value}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {editing ? (
          <>
            <button onClick={commit}
              className="px-3 py-1 text-xs font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity">
              Save
            </button>
            <button onClick={cancel}
              className="px-3 py-1 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  usePageTitle('Settings');

  // ── Appearance store (applies instantly, system-wide) ──
  const appearance = useAppearanceStore();

  // ── Core state ──
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved]       = useState<Settings>(DEFAULT);
  const [isDirty, setIsDirty]   = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toasts, setToasts]     = useState<{ id: number; message: string; icon?: string }[]>([]);
  const toastId = useRef(0);

  // ── Section open state ──
  const [open, setOpen] = useState<Record<string, boolean>>({
    profile: true, appearance: false, notifications: false,
    privacy: false, learning: false, danger: false,
  });

  // ── Profile state ──
  const [displayName, setDisplayName] = useState('Scholar');
  const [email, setEmail]             = useState('twuanminn47@gmail.com');
  const [avatar, setAvatar]           = useState('🐉');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // ── Password state ──
  const [pwCurrent, setPwCurrent]     = useState('');
  const [pwNew, setPwNew]             = useState('');
  const [pwConfirm, setPwConfirm]     = useState('');
  const [pwShow, setPwShow]           = useState({ current: false, new: false, confirm: false });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // ── Danger zone ──
  const [resetModal, setResetModal]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [resetInput, setResetInput]   = useState('');
  const [deleteInput, setDeleteInput] = useState('');

  const pwStrength = passwordStrength(pwNew);

  // ── Load / save ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const l = { ...DEFAULT, ...JSON.parse(raw) } as Settings; setSettings(l); setSaved(l); }
    } catch {}
  }, []);

  useEffect(() => { setIsDirty(JSON.stringify(settings) !== JSON.stringify(saved)); }, [settings, saved]);

  const patch = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);


  const addToast = (message: string, icon?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const handleSave = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
    setSaved(settings); setIsDirty(false); setSaveSuccess(true);
    addToast('Settings saved', 'check_circle');
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handlePasswordSave = () => {
    if (!pwCurrent) { addToast('Enter your current password', 'error'); return; }
    if (pwNew.length < 8) { addToast('Password must be 8+ characters', 'error'); return; }
    if (pwNew !== pwConfirm) { addToast('Passwords do not match', 'error'); return; }
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    addToast('Password updated', 'lock');
  };

  const toggleSection = (k: string) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  const toggleTopic = (topic: string) => {
    const next = settings.topics.includes(topic)
      ? settings.topics.filter((t) => t !== topic)
      : [...settings.topics, topic];
    patch('topics', next);
  };

  const toggleStyle = (style: LearningStyle) => {
    const next = settings.learningStyles.includes(style)
      ? settings.learningStyles.filter((s) => s !== style)
      : [...settings.learningStyles, style];
    patch('learningStyles', next);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* ── Watermark ── */}
      <div aria-hidden className="pointer-events-none select-none fixed right-4 top-1/2 -translate-y-1/2 z-0 hidden lg:flex flex-col items-center">
        <span className="text-[18rem] font-black leading-none text-primary/[0.03]" style={{ fontFamily: 'serif' }}>设</span>
        <span className="text-[18rem] font-black leading-none text-primary/[0.03]" style={{ fontFamily: 'serif' }}>置</span>
      </div>

      {/* ── Ambient blobs ── */}
      {[...Array(6)].map((_, i) => (
        <div key={i} aria-hidden
          className="pointer-events-none fixed rounded-full blur-3xl z-0"
          style={{
            width: `${80 + i * 30}px`, height: `${80 + i * 30}px`,
            background: i % 2 === 0 ? 'rgba(124,111,247,0.08)' : 'rgba(6,182,212,0.06)',
            top: `${8 + i * 14}%`, left: `${3 + (i % 4) * 22}%`,
          }}
        />
      ))}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto pb-36">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <span className="text-[0.65rem] font-bold tracking-[0.18em] text-primary uppercase">Preferences</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-[family-name:var(--font-jakarta)] leading-tight mt-1">Settings</h1>
          <p className="text-sm text-on-surface-variant mt-1">Customize your Digital Calligrapher experience</p>
        </motion.div>

        <div className="flex flex-col gap-4">

          {/* ════════════════════════════════════════════
              1. PROFILE & ACCOUNT
          ════════════════════════════════════════════ */}
          <SectionCard title="Profile & Account" icon="person" isOpen={open.profile} onToggle={() => toggleSection('profile')} delay={0.04}>

            {/* Avatar */}
            <div className="px-4 pt-4">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 flex items-center justify-center text-4xl select-none shadow-lg">
                    {avatar}
                  </div>
                  <button onClick={() => setAvatarPickerOpen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface text-base">{displayName}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{email}</p>
                  <button onClick={() => setAvatarPickerOpen(true)}
                    className="mt-2 text-xs font-bold text-primary hover:underline">
                    Change avatar
                  </button>
                </div>
              </div>

              {/* Avatar picker */}
              <AnimatePresence>
                {avatarPickerOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4">
                    <div className="p-3 rounded-xl bg-surface-container-high border border-white/10">
                      <p className="text-xs font-bold text-on-surface-variant mb-2.5">Choose an avatar</p>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((em) => (
                          <button key={em} onClick={() => { setAvatar(em); setAvatarPickerOpen(false); addToast('Avatar updated', 'mood'); }}
                            className={`w-full aspect-square text-2xl rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                              avatar === em ? 'bg-primary/20 ring-2 ring-primary scale-105' : 'hover:bg-white/10'
                            }`}>
                            {em}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setAvatarPickerOpen(false)} className="mt-2.5 w-full text-xs text-on-surface-variant hover:text-on-surface transition-colors py-1">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Editable fields */}
            <div className="mt-1">
              <InlineEdit label="Display name" value={displayName}
                onSave={(v) => { setDisplayName(v); addToast('Display name updated', 'badge'); }} />
              <InlineEdit label="Email address" value={email} type="email"
                onSave={(v) => { setEmail(v); addToast('Email updated', 'mail'); }} />
            </div>

            {/* Change password */}
            <SectionLabel>Change Password</SectionLabel>
            <div className="px-4 flex flex-col gap-2.5 pb-2">
              {(['current','new','confirm'] as const).map((field) => {
                const vals: Record<typeof field, string> = { current: pwCurrent, new: pwNew, confirm: pwConfirm };
                const setters: Record<typeof field, (v: string) => void> = { current: setPwCurrent, new: setPwNew, confirm: setPwConfirm };
                const labels: Record<typeof field, string> = { current: 'Current password', new: 'New password', confirm: 'Confirm new password' };
                return (
                  <div key={field} className="relative">
                    <input type={pwShow[field] ? 'text' : 'password'} placeholder={labels[field]} value={vals[field]}
                      onChange={(e) => setters[field](e.target.value)}
                      className="w-full bg-surface-container-high text-on-surface text-sm px-4 py-2.5 pr-10 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/40"
                    />
                    <button onClick={() => setPwShow((s) => ({ ...s, [field]: !s[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{pwShow[field] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                );
              })}

              {/* Strength bar */}
              {pwNew.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : 'bg-surface-container-high'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-bold ${pwStrength.score <= 1 ? 'text-error' : pwStrength.score === 2 ? 'text-yellow-400' : pwStrength.score === 3 ? 'text-secondary' : 'text-primary'}`}>
                    {pwStrength.label}
                  </p>
                  {pwConfirm.length > 0 && pwNew !== pwConfirm && (
                    <p className="text-xs text-error">Passwords do not match</p>
                  )}
                </motion.div>
              )}

              <button onClick={handlePasswordSave}
                className="w-full py-2.5 mt-1 rounded-xl text-sm font-bold bg-surface-container-high border border-white/10 text-on-surface hover:border-primary/40 hover:text-primary transition-all">
                Update Password
              </button>
            </div>

            {/* 2FA */}
            <SectionLabel>Two-Factor Authentication</SectionLabel>
            <SettingRow label="Enable 2FA" sublabel="Extra layer of sign-in security">
              <Toggle value={twoFAEnabled} onChange={(v) => { setTwoFAEnabled(v); addToast(v ? '2FA enabled' : '2FA disabled', 'security'); }} />
            </SettingRow>
            <AnimatePresence>
              {twoFAEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-4 pb-3">
                  <div className="p-4 rounded-xl bg-surface-container-high border border-white/10 flex flex-col items-center gap-3">
                    <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-px p-2 w-full h-full">
                        {[...Array(64)].map((_, i) => (
                          <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant text-center">Scan with your authenticator app</p>
                    <p className="text-xs font-mono font-bold text-primary tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg">
                      DCAL-7X2K-M9QP
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connected accounts */}
            <SectionLabel>Connected Accounts</SectionLabel>
            <div className="px-4 pb-4 flex flex-col gap-2">
              {[
                { label: 'Google', icon: 'G', color: 'from-red-500/20 to-yellow-400/20', connected: true },
                { label: 'WeChat', icon: '微', color: 'from-green-500/20 to-emerald-400/20', connected: false },
                { label: 'Apple', icon: '', color: 'from-stone-500/20 to-stone-400/20', connected: false },
              ].map((acc) => (
                <div key={acc.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high border border-white/10">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-sm font-black text-on-surface flex-shrink-0`}>
                    {acc.icon || <span className="material-symbols-outlined text-[18px]">apple</span>}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-on-surface">{acc.label}</span>
                  <button onClick={() => addToast(acc.connected ? `${acc.label} disconnected` : `${acc.label} connected`, 'link')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      acc.connected
                        ? 'border-error/30 text-error hover:bg-error/10'
                        : 'border-primary/30 text-primary hover:bg-primary/10'
                    }`}>
                    {acc.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            {/* Timestamps */}
            <div className="px-4 pb-4 flex gap-4 flex-wrap">
              {[{ label: 'Last login', value: 'Today, 9:41 AM' }, { label: 'Account created', value: 'Jan 12, 2025' }].map((ts) => (
                <div key={ts.label} className="flex-1 min-w-[140px] p-3 rounded-xl bg-surface-container-high/50 border border-white/6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">{ts.label}</p>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{ts.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════
              2. APPEARANCE
          ════════════════════════════════════════════ */}
          <SectionCard title="Appearance & Themes" icon="palette" isOpen={open.appearance} onToggle={() => toggleSection('appearance')} delay={0.08}>
            <SectionLabel>Theme</SectionLabel>
            <div className="px-4 pb-2 grid grid-cols-5 gap-2 sm:gap-3">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => appearance.setTheme(t.id)}
                  className={`relative rounded-xl overflow-hidden h-16 flex flex-col items-center justify-center gap-1.5 border-2 transition-all duration-200 ${
                    appearance.theme === t.id
                      ? `${t.ring} ring-2 ring-offset-1 ring-offset-background border-transparent scale-[1.04] shadow-lg`
                      : 'border-white/10 hover:border-white/20'
                  } ${t.bg}`}>
                  <div className="flex gap-1.5"><span className={`w-3 h-3 rounded-full ${t.c1}`} /><span className={`w-3 h-3 rounded-full ${t.c2}`} /></div>
                  <span className={`text-[10px] font-bold px-1 text-center leading-tight ${t.id.startsWith('light') ? 'text-black/70' : 'text-white/80'}`}>{t.label}</span>
                  {appearance.theme === t.id && (
                    <motion.div layoutId="theme-check" className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[11px] text-black" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <SectionLabel>Font Size</SectionLabel>
            <div className="px-4 pb-2 flex gap-2">
              {FONT_SIZES.map((fs) => (
                <button key={fs.value} onClick={() => appearance.setFontSize(fs.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    appearance.fontSize === fs.value
                      ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_8px_rgba(124,111,247,0.25)]'
                      : 'bg-surface-container-high border-transparent text-on-surface-variant hover:border-white/10'
                  }`}>{fs.label}</button>
              ))}
            </div>

            <SettingRow label="Show Pinyin" sublabel="Display pronunciation above characters">
              <Toggle value={appearance.showPinyin} onChange={(v) => appearance.setShowPinyin(v)} />
            </SettingRow>
            <SettingRow label="Traditional Characters" sublabel="Use 繁體 instead of 简体">
              <Toggle value={appearance.useTraditional} onChange={(v) => appearance.setUseTraditional(v)} />
            </SettingRow>

            <SectionLabel>Accent Color</SectionLabel>
            <div className="px-4 pb-4 flex gap-3 flex-wrap">
              {ACCENT_COLORS.map((color) => (
                <button key={color} onClick={() => appearance.setAccentColor(color)} title={color}
                  className={`w-8 h-8 rounded-full transition-all duration-150 ${
                    appearance.accentColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-background ring-white/50 shadow-lg' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color, boxShadow: appearance.accentColor === color ? `0 0 14px ${color}90` : undefined }}
                />
              ))}
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════
              3. NOTIFICATIONS
          ════════════════════════════════════════════ */}
          <SectionCard title="Notifications & Sounds" icon="notifications" isOpen={open.notifications} onToggle={() => toggleSection('notifications')} delay={0.12}>
            <SettingRow label="Daily Study Reminder" sublabel="Get reminded to practice each day">
              <Toggle value={settings.dailyReminder} onChange={(v) => patch('dailyReminder', v)} />
            </SettingRow>
            <AnimatePresence>
              {settings.dailyReminder && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="flex items-center justify-between py-2 px-4 ml-4 border-l-2 border-primary/20">
                    <span className="text-sm text-on-surface-variant">Reminder time</span>
                    <input type="time" value={settings.reminderTime}
                      onChange={(e) => patch('reminderTime', e.target.value)}
                      className="bg-surface-container-high text-on-surface text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <SettingRow label="Streak Alerts" sublabel="Notify before your streak breaks">
              <Toggle value={settings.streakAlerts} onChange={(v) => patch('streakAlerts', v)} />
            </SettingRow>
            <SettingRow label="Sound Effects" sublabel="Play sounds during lessons">
              <Toggle value={settings.soundEffects} onChange={(v) => patch('soundEffects', v)} />
            </SettingRow>
            <SettingRow label="Pronunciation Volume">
              <Slider value={settings.pronunciationVolume} min={0} max={100} step={5}
                onChange={(v) => patch('pronunciationVolume', v)} formatLabel={(v) => `${v}%`} />
            </SettingRow>
            <SettingRow label="Do Not Disturb" sublabel="Silence all alerts during study">
              <Toggle value={settings.doNotDisturb} onChange={(v) => patch('doNotDisturb', v)} />
            </SettingRow>
            <SectionLabel>Reminder Tone</SectionLabel>
            <div className="px-4 pb-4">
              <select value={settings.reminderTone} onChange={(e) => patch('reminderTone', e.target.value as ReminderTone)}
                className="w-full bg-surface-container-high text-on-surface text-sm font-medium px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer">
                {REMINDER_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════
              4. PRIVACY & SECURITY
          ════════════════════════════════════════════ */}
          <SectionCard title="Privacy & Security" icon="shield" isOpen={open.privacy} onToggle={() => toggleSection('privacy')} delay={0.16}>
            <SettingRow label="Share Progress on Leaderboard">
              <Toggle value={settings.shareLeaderboard} onChange={(v) => patch('shareLeaderboard', v)} />
            </SettingRow>
            <SettingRow label="Allow Friend Requests">
              <Toggle value={settings.allowFriendRequests} onChange={(v) => patch('allowFriendRequests', v)} />
            </SettingRow>
            <SettingRow label="Show Online Status">
              <Toggle value={settings.showOnlineStatus} onChange={(v) => patch('showOnlineStatus', v)} />
            </SettingRow>

            <SectionLabel>Profile Visibility</SectionLabel>
            <div className="px-4 pb-2 flex flex-col gap-2">
              {([
                { value: 'public',  label: 'Public',       sub: 'Anyone can view your profile', icon: 'public' },
                { value: 'friends', label: 'Friends Only',  sub: 'Only your connections',        icon: 'group' },
                { value: 'private', label: 'Private',       sub: 'Only you can see your data',   icon: 'lock' },
              ] as const).map((opt) => {
                const active = settings.profileVisibility === opt.value;
                return (
                  <button key={opt.value} onClick={() => patch('profileVisibility', opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      active ? 'bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(124,111,247,0.12)]' : 'bg-surface-container-high border-transparent hover:border-white/10'
                    }`}>
                    <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'text-on-surface-variant'}`}
                      style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{opt.label}</p>
                      <p className="text-xs text-on-surface-variant">{opt.sub}</p>
                    </div>
                    {active && <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>}
                  </button>
                );
              })}
            </div>

            <SectionLabel>Data & Sessions</SectionLabel>
            <div className="px-4 pb-2 flex flex-col gap-2">
              <button onClick={() => addToast('Data export started — check your email', 'download')}
                className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold border border-white/10 bg-surface-container-high text-on-surface hover:border-primary/30 hover:text-primary transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download My Data
              </button>
              <div className="p-3 rounded-xl bg-surface-container-high border border-white/10">
                <p className="text-xs font-bold text-on-surface-variant mb-2.5">Active Sessions</p>
                {[
                  { device: 'MacBook Pro', loc: 'Hanoi, VN', icon: 'laptop_mac', current: true },
                  { device: 'iPhone 15',   loc: 'Hanoi, VN', icon: 'smartphone', current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center gap-3 py-1.5">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                        {s.device}
                        {s.current && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">This device</span>}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">{s.loc}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => addToast('Signed out of all other devices', 'logout')}
                  className="mt-2.5 w-full py-1.5 text-xs font-bold text-error hover:bg-error/10 rounded-lg transition-colors">
                  Sign out all devices
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════
              5. LEARNING PREFERENCES
          ════════════════════════════════════════════ */}
          <SectionCard title="Learning Preferences" icon="school" isOpen={open.learning} onToggle={() => toggleSection('learning')} delay={0.2}>
            <SectionLabel>Current HSK Level</SectionLabel>
            <div className="px-4 pb-2 flex gap-2">
              {(['1','2','3','4','5','6'] as HskLevel[]).map((lvl) => (
                <button key={lvl} onClick={() => patch('hskLevel', lvl)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                    settings.hskLevel === lvl
                      ? 'bg-primary text-on-primary border-transparent shadow-[0_0_10px_rgba(124,111,247,0.4)]'
                      : 'bg-surface-container-high border-transparent text-on-surface-variant hover:border-white/10'
                  }`}>{lvl}</button>
              ))}
            </div>

            <SettingRow label="Daily Study Goal" sublabel={`${settings.studyGoalMinutes} min / day`}>
              <Slider value={settings.studyGoalMinutes} min={5} max={120} step={5}
                onChange={(v) => patch('studyGoalMinutes', v)} formatLabel={(v) => `${v}m`} />
            </SettingRow>

            <SectionLabel>Learning Style</SectionLabel>
            <div className="px-4 pb-2 grid grid-cols-5 gap-2">
              {LEARNING_STYLES.map((s) => {
                const active = settings.learningStyles.includes(s.value);
                return (
                  <button key={s.value} onClick={() => toggleStyle(s.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                      active ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_10px_rgba(124,111,247,0.2)]'
                             : 'bg-surface-container-high border-transparent text-on-surface-variant hover:border-white/10'
                    }`}>
                    <span className="material-symbols-outlined text-[20px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{s.icon}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>

            <SettingRow label="Auto-play Pronunciation" sublabel="Read characters aloud on reveal">
              <Toggle value={settings.autoPlayPronunciation} onChange={(v) => patch('autoPlayPronunciation', v)} />
            </SettingRow>
            <SettingRow label="Handwriting Sensitivity">
              <Slider value={settings.handwritingSensitivity} min={20} max={100} step={5}
                onChange={(v) => patch('handwritingSensitivity', v)} formatLabel={(v) => `${v}%`} />
            </SettingRow>

            <SectionLabel>Spaced Repetition Intensity</SectionLabel>
            <div className="px-4 pb-2 flex flex-col gap-2">
              {REPETITION_OPTIONS.map((opt) => {
                const active = settings.repetitionIntensity === opt.value;
                return (
                  <button key={opt.value} onClick={() => patch('repetitionIntensity', opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      active ? 'bg-primary/15 border-primary/40 shadow-[0_0_12px_rgba(124,111,247,0.15)]'
                             : 'bg-surface-container-high border-transparent hover:border-white/10'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-primary/20' : 'bg-surface-container-low'}`}>
                      <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'text-on-surface-variant'}`}
                        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{opt.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{opt.label}</p>
                      <p className="text-xs text-on-surface-variant truncate">{opt.sub}</p>
                    </div>
                    {active && <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>}
                  </button>
                );
              })}
            </div>

            <SectionLabel>Topics of Interest</SectionLabel>
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {ALL_TOPICS.map((topic) => {
                const active = settings.topics.includes(topic);
                return (
                  <button key={topic} onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      active ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_8px_rgba(124,111,247,0.25)]'
                             : 'bg-surface-container-high border-transparent text-on-surface-variant hover:border-white/10'
                    }`}>
                    {active && '✓ '}{topic}
                  </button>
                );
              })}
            </div>

            <SectionLabel>App Interface Language</SectionLabel>
            <div className="px-4 pb-4">
              <select value={settings.interfaceLang} onChange={(e) => patch('interfaceLang', e.target.value as InterfaceLang)}
                className="w-full bg-surface-container-high text-on-surface text-sm font-medium px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer">
                {INTERFACE_LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════
              6. DANGER ZONE
          ════════════════════════════════════════════ */}
          <SectionCard title="Danger Zone" icon="warning" isOpen={open.danger} onToggle={() => toggleSection('danger')} delay={0.24}>
            <div className="px-4 py-4 flex flex-col gap-3">
              <div className="p-4 rounded-xl border border-error/20 bg-error/[0.04]">
                <p className="text-sm font-bold text-on-surface mb-1">Reset All Progress</p>
                <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                  Permanently erase your study history, streak, XP, and flashcard progress.
                </p>
                <button onClick={() => setResetModal(true)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-error/30 text-error hover:bg-error/10 transition-colors">
                  Reset Progress
                </button>
              </div>
              <div className="p-4 rounded-xl border border-error/30 bg-error/[0.06]">
                <p className="text-sm font-bold text-error mb-1">Delete Account</p>
                <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                <button onClick={() => setDeleteModal(true)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-error/15 border border-error/40 text-error hover:bg-error/25 transition-colors">
                  Delete My Account
                </button>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ── Floating Save Bar ── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-surface-container border border-primary/30 shadow-[0_0_40px_rgba(124,111,247,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(124,111,247,0.5)','0 0 0 8px rgba(124,111,247,0)','0 0 0 0 rgba(124,111,247,0)'] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
            />
            <span className="text-sm font-semibold text-on-surface whitespace-nowrap">Unsaved changes</span>
            <button onClick={() => setSettings(saved)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors">
              Discard
            </button>
            <button onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-lg shadow-primary/40 whitespace-nowrap">
              Save Changes
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset Confirm Modal ── */}
      <AnimatePresence>
        {resetModal && (
          <ConfirmModal
            title="Reset All Progress?"
            icon="restart_alt"
            description='This will permanently erase your study history, streak, XP, and all flashcard progress. Type "RESET" to confirm.'
            inputPlaceholder='Type "RESET" to confirm'
            inputMatch="RESET"
            confirmLabel="Reset Everything"
            value={resetInput}
            onChange={setResetInput}
            onConfirm={() => { setResetModal(false); setResetInput(''); addToast('All progress has been reset', 'restart_alt'); }}
            onCancel={() => { setResetModal(false); setResetInput(''); }}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <ConfirmModal
            title="Delete Your Account?"
            icon="delete_forever"
            description={`Your account and all data will be permanently deleted. This cannot be undone. Type your email address (${email}) to confirm.`}
            inputPlaceholder="Type your email to confirm"
            inputMatch={email}
            confirmLabel="Delete My Account"
            destructive
            value={deleteInput}
            onChange={setDeleteInput}
            onConfirm={() => { setDeleteModal(false); setDeleteInput(''); addToast('Account deletion requested', 'delete_forever'); }}
            onCancel={() => { setDeleteModal(false); setDeleteInput(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, icon, description, inputPlaceholder, inputMatch, confirmLabel,
  destructive = false, value, onChange, onConfirm, onCancel,
}: {
  title: string; icon: string; description: string;
  inputPlaceholder: string; inputMatch: string; confirmLabel: string;
  destructive?: boolean; value: string;
  onChange: (v: string) => void; onConfirm: () => void; onCancel: () => void;
}) {
  const valid = value === inputMatch;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80]" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-full max-w-sm px-4">
        <div className={`bg-surface-container rounded-2xl border shadow-2xl p-6 ${destructive ? 'border-error/30' : 'border-white/10'}`}>
          <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${destructive ? 'bg-error/15' : 'bg-surface-container-high'}`}>
            <span className={`material-symbols-outlined text-[24px] ${destructive ? 'text-error' : 'text-on-surface-variant'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </div>
          <h3 className={`text-lg font-bold mb-2 ${destructive ? 'text-error' : 'text-on-surface'}`}>{title}</h3>
          <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{description}</p>
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={inputPlaceholder}
            className={`w-full bg-surface-container-high text-on-surface text-sm px-4 py-2.5 rounded-xl border transition-colors focus:outline-none mb-4 placeholder:text-on-surface-variant/40 ${
              value.length > 0
                ? valid ? 'border-secondary/50 focus:border-secondary' : 'border-error/40 focus:border-error'
                : 'border-white/10 focus:border-primary/50'
            }`}
          />
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-white/10 text-on-surface-variant hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={!valid}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                valid
                  ? destructive ? 'bg-error text-on-error hover:opacity-90 shadow-lg shadow-error/30' : 'bg-primary text-on-primary hover:opacity-90'
                  : 'opacity-30 cursor-not-allowed bg-surface-container-high text-on-surface-variant'
              }`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
