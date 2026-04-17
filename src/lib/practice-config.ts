/**
 * Spaced-repetition quality scale used across the practice flow,
 * the SM-2/FSRS schedulers, and the server-side review router.
 *
 * Values 0/2 are reserved by SM-2 but unused in the UI to keep buttons
 * to four — a tighter cognitive load. Don't reintroduce 0/2 without
 * matching scheduler tests.
 */
export const QUALITY = {
  AGAIN: 1,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
} as const;

export type QualityValue = typeof QUALITY[keyof typeof QUALITY];

export interface QualityAction {
  quality: QualityValue;
  label: string;
  icon: string;
  key: string;
  desc: string;
  className: string;
}

export const QUALITY_ACTIONS: readonly QualityAction[] = [
  {
    quality: QUALITY.AGAIN,
    label: 'Again',
    icon: 'replay',
    key: '1',
    desc: '< 1 min',
    className: 'bg-error/10 text-error hover:bg-error/20 border border-error/20',
  },
  {
    quality: QUALITY.HARD,
    label: 'Hard',
    icon: 'trending_flat',
    key: '2',
    desc: '~1 day',
    className: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/20',
  },
  {
    quality: QUALITY.GOOD,
    label: 'Good',
    icon: 'thumb_up',
    key: '3',
    desc: '~3 days',
    className: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
  },
  {
    quality: QUALITY.EASY,
    label: 'Easy',
    icon: 'check_circle',
    key: '4',
    desc: '~7 days',
    className: 'bg-linear-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:opacity-90',
  },
] as const;
