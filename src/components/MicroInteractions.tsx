'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   §3.2 — Easing tokens as Framer Motion objects
   ═══════════════════════════════════════════════════════════════════════════ */

export const EASING = {
  out:    [0.16, 1, 0.3, 1]   as const,
  in:     [0.7, 0, 0.84, 0]   as const,
  inOut:  [0.65, 0, 0.35, 1]  as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

export const DURATION = {
  instant:    0,
  quick:      0.12,
  snappy:     0.2,
  smooth:     0.32,
  deliberate: 0.48,
  ambient:    0.8,
};

/* ═══════════════════════════════════════════════════════════════════════════
   §4.1 — Confirmation Chip (Copy Action, Save, etc.)
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConfirmationChipProps {
  message: string;
  icon?: string;
  show: boolean;
  type?: 'success' | 'info' | 'error' | 'warning';
  duration?: number;
  onDone?: () => void;
}

const chipStyles = {
  success: { bg: 'bg-primary/12', border: 'border-primary/20', color: 'text-primary' },
  info:    { bg: 'bg-secondary/12', border: 'border-secondary/20', color: 'text-secondary' },
  error:   { bg: 'bg-error/12', border: 'border-error/20', color: 'text-error' },
  warning: { bg: 'bg-amber-500/12', border: 'border-amber-500/20', color: 'text-amber-600' },
};

export function ConfirmationChip({
  message,
  icon = 'check_circle',
  show,
  type = 'success',
  duration = 2500,
  onDone,
}: ConfirmationChipProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (show && onDone) {
      const t = setTimeout(onDone, duration);
      return () => clearTimeout(t);
    }
  }, [show, duration, onDone]);

  const s = chipStyles[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          // §4.1 — enters from causal direction (bottom), exits faster (70%)
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
          transition={{
            duration: DURATION.snappy,
            ease: EASING.out,
          }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl ${s.bg} border ${s.border} backdrop-blur-xl shadow-2xl`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${s.color}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <span className={`text-sm font-semibold ${s.color}`}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4.3 — Button Press Physics (Ripple Effect)
   ═══════════════════════════════════════════════════════════════════════════ */

export function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  }, []);

  const RippleContainer = useCallback(() => (
    <>
      {ripples.map(r => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.16 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASING.out }}
          className="absolute rounded-full bg-current pointer-events-none z-0"
          style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
        />
      ))}
    </>
  ), [ripples]);

  return { addRipple, RippleContainer };
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2.1 — Animated Counter (smooth number transitions)
   ═══════════════════════════════════════════════════════════════════════════ */

export function AnimatedCounter({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (display === value) return;
    const diff = value - display;
    const step = Math.max(1, Math.ceil(Math.abs(diff) / 20));
    const interval = setInterval(() => {
      setDisplay(prev => {
        const next = diff > 0 ? Math.min(prev + step, value) : Math.max(prev - step, value);
        if (next === value) clearInterval(interval);
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [value, display]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.15 }}
      animate={{ scale: 1 }}
      transition={{ duration: DURATION.quick, ease: EASING.spring }}
      className={className}
    >
      {display.toLocaleString()}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §5 — Loading Dots (indeterminate, for inline indicators)
   ═══════════════════════════════════════════════════════════════════════════ */

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2.2 — Empty State (illustration + CTA, per spec)
   ═══════════════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon: string;
  headline: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({ icon, headline, description, actionLabel, onAction, actionHref }: EmptyStateProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.smooth, ease: EASING.out }}
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <span
        className="material-symbols-outlined text-5xl text-on-surface-variant/30"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        {icon}
      </span>
      <h3 className="text-base font-bold text-on-surface">{headline}</h3>
      {description && <p className="text-sm text-on-surface-variant max-w-xs">{description}</p>}
      {actionLabel && (
        actionHref ? (
          <a
            href={actionHref}
            className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-xs font-bold press-scale"
          >
            {actionLabel}
          </a>
        ) : (
          <button
            onClick={onAction}
            className="mt-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-xs font-bold press-scale"
          >
            {actionLabel}
          </button>
        )
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2.1 — Status Dot (for real-time state indicators)
   ═══════════════════════════════════════════════════════════════════════════ */

export function StatusDot({ status }: { status: 'online' | 'offline' | 'busy' | 'idle' }) {
  const colors = {
    online: 'bg-emerald-500',
    offline: 'bg-outline/40',
    busy: 'bg-error',
    idle: 'bg-amber-400',
  };

  return (
    <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${colors[status]}`}>
      {status === 'online' && (
        <span className={`absolute inset-0 rounded-full ${colors[status]} animate-ping opacity-50`} />
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4.2 — Form Field Error Feedback (shake + message slide)
   ═══════════════════════════════════════════════════════════════════════════ */

export function FieldError({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: DURATION.snappy, ease: EASING.out }}
          className="text-xs text-error font-medium mt-1.5 flex items-center gap-1"
          role="alert"
        >
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            error
          </span>
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4.3 — Interactive Button (full state machine)
   ═══════════════════════════════════════════════════════════════════════════ */

interface InteractiveButtonProps {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

const variantClasses = {
  primary: 'bg-primary text-on-primary shadow-md shadow-primary/15 hover:brightness-110',
  secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container-low',
  danger: 'bg-error text-on-error shadow-md shadow-error/15 hover:brightness-110',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
};

export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  disabledReason,
  loading = false,
  className = '',
  type = 'button',
  ...rest
}: InteractiveButtonProps) {
  const { addRipple, RippleContainer } = useRipple();
  const [isAsync, setIsAsync] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e);
    if (!onClick) return;

    const result = onClick();
    if (result instanceof Promise) {
      setIsAsync(true);
      try { await result; } finally { setIsAsync(false); }
    }
  };

  const isDisabled = disabled || loading || isAsync;
  const isLoading = loading || isAsync;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      title={disabled && disabledReason ? disabledReason : undefined}
      className={`
        relative overflow-hidden isolate inline-flex items-center justify-center
        font-bold transition-all press-scale
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${isLoading ? 'btn-loading' : ''}
        ${className}
      `.trim()}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...rest}
    >
      <RippleContainer />
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </button>
  );
}
