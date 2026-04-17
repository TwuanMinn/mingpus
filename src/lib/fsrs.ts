/**
 * FSRS-5 (Free Spaced Repetition Scheduler) implementation.
 * Based on the open-source FSRS algorithm by Jarrett Ye.
 * https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 *
 * Replaces SM-2. Key differences:
 *   - Tracks `stability` (days until 90% retention) and `difficulty` (0–10)
 *   - Uses retrievability R = exp(ln(0.9) × t/S) to compute true forgetting
 *   - Rating scale: 1=Again, 2=Hard, 3=Good, 4=Easy
 */

// ─── FSRS-5 default parameters (pre-trained weights) ─────────────────────────

const W = [
  0.4072, 1.1829, 3.1262, 15.4722,  // initial stability by rating [Again,Hard,Good,Easy]
  7.2102, 0.5316, 1.0651, 0.0589,   // difficulty & forgetting curve parameters
  1.5330, 0.1544, 1.0070, 1.9395,
  0.1100, 0.2900, 2.2700, 0.1500,
  2.9898,
];

const DECAY   = -0.5;
const FACTOR  = Math.pow(0.9, 1 / DECAY) - 1; // ≈ 19/81 ≈ 0.2346

export type FSRSRating = 1 | 2 | 3 | 4; // Again=1, Hard=2, Good=3, Easy=4

export interface FSRSState {
  stability:  number; // days to 90% retention
  difficulty: number; // 1–10
  lastReview: Date;
}

export interface FSRSResult {
  stability:  number;
  difficulty: number;
  interval:   number; // days until next review
  retrievability: number; // 0–1
}

// ─── Core formulas ────────────────────────────────────────────────────────────

function retrievability(t: number, S: number): number {
  return Math.pow(1 + FACTOR * t / S, DECAY);
}

function nextInterval(S: number, requestedRetention = 0.9): number {
  const interval = S / FACTOR * (Math.pow(requestedRetention, 1 / DECAY) - 1);
  return Math.max(1, Math.round(interval));
}

function initialStability(rating: FSRSRating): number {
  return W[rating - 1]; // indices 0–3
}

function initialDifficulty(rating: FSRSRating): number {
  return W[4] - Math.exp(W[5] * (rating - 1)) + 1;
}

function nextDifficulty(d: number, rating: FSRSRating): number {
  const dd = W[6] * (initialDifficulty(3) - d) + W[7] * (rating - 3);
  return clamp(d + dd, 1, 10);
}

function shortTermStability(S: number, rating: FSRSRating): number {
  return S * Math.exp(W[17] * (rating - 3 + W[18]));
}

function nextRecallStability(d: number, S: number, R: number, rating: FSRSRating): number {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus   = rating === 4 ? W[16] : 1;
  return S * (
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(S, -W[9]) *
    (Math.exp((1 - R) * W[10]) - 1) *
    hardPenalty *
    easyBonus
  );
}

function nextForgetStability(d: number, S: number, R: number): number {
  return (
    W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(S + 1, W[13]) - 1) *
    Math.exp((1 - R) * W[14])
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * First review of a card (new card).
 */
export function fsrsNewCard(rating: FSRSRating): FSRSResult {
  const stability  = initialStability(rating);
  const difficulty = clamp(initialDifficulty(rating), 1, 10);
  const interval   = nextInterval(stability);
  return { stability, difficulty, interval, retrievability: 1 };
}

/**
 * Subsequent review of an existing card.
 */
export function fsrsReview(state: FSRSState, rating: FSRSRating, now: Date = new Date()): FSRSResult {
  const t = Math.max(1, Math.round((now.getTime() - state.lastReview.getTime()) / 86_400_000));
  const R = retrievability(t, state.stability);

  const d = clamp(nextDifficulty(state.difficulty, rating), 1, 10);

  let S: number;
  if (rating === 1) {
    // Forgot — use forget stability
    S = nextForgetStability(d, state.stability, R);
  } else {
    S = nextRecallStability(d, state.stability, R, rating);
  }
  S = Math.max(0.01, S);

  const interval = nextInterval(S);
  return { stability: S, difficulty: d, interval, retrievability: R };
}

/**
 * Convert a SM-2 quality (0–5) to FSRS rating (1–4).
 */
export function qualityToFSRS(quality: number): FSRSRating {
  if (quality <= 1) return 1; // Again
  if (quality <= 2) return 2; // Hard
  if (quality <= 3) return 3; // Good
  return 4;                   // Easy
}

/**
 * Convert existing SM-2 efactor + repetition to approximate FSRS stability.
 * Used for migrating existing cards.
 */
export function sm2ToFSRSStability(efactor: number, repetition: number, interval: number): number {
  // Rough heuristic: stability ≈ interval * (efactor/2500)
  if (repetition === 0) return W[2]; // Good initial stability
  return Math.max(1, interval * (efactor / 2500));
}

export function getDueDateFSRS(intervalDays: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date;
}
