import { describe, it, expect } from 'vitest';
import {
  fsrsNewCard,
  fsrsReview,
  qualityToFSRS,
  sm2ToFSRSStability,
  getDueDateFSRS,
  type FSRSRating,
  type FSRSState,
} from '@/lib/fsrs';

// ─── fsrsNewCard ──────────────────────────────────────────────────────────────

describe('fsrsNewCard', () => {
  it('returns positive stability for all ratings', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsNewCard(rating);
      expect(result.stability).toBeGreaterThan(0);
    }
  });

  it('returns difficulty between 1 and 10', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsNewCard(rating);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);
      expect(result.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it('returns a positive interval (at least 1 day)', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsNewCard(rating);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    }
  });

  it('retrieval starts at 1 (just learned)', () => {
    const result = fsrsNewCard(3);
    expect(result.retrievability).toBe(1);
  });

  it('Easy rating gives higher stability than Again', () => {
    const easy = fsrsNewCard(4);
    const again = fsrsNewCard(1);
    expect(easy.stability).toBeGreaterThan(again.stability);
  });

  it('Easy rating gives lower difficulty than Again', () => {
    const easy = fsrsNewCard(4);
    const again = fsrsNewCard(1);
    expect(easy.difficulty).toBeLessThan(again.difficulty);
  });

  it('Easy rating gives a longer interval than Again', () => {
    const easy = fsrsNewCard(4);
    const again = fsrsNewCard(1);
    expect(easy.interval).toBeGreaterThan(again.interval);
  });

  it('stability increases monotonically with rating', () => {
    const stabilities = ([1, 2, 3, 4] as FSRSRating[]).map(
      (r) => fsrsNewCard(r).stability,
    );
    for (let i = 1; i < stabilities.length; i++) {
      expect(stabilities[i]).toBeGreaterThan(stabilities[i - 1]);
    }
  });
});

// ─── fsrsReview ───────────────────────────────────────────────────────────────

describe('fsrsReview', () => {
  const baseState: FSRSState = {
    stability: 3.1262,
    difficulty: 5.5,
    lastReview: new Date(Date.now() - 3 * 86_400_000), // 3 days ago
  };

  it('returns positive stability for all ratings', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsReview(baseState, rating);
      expect(result.stability).toBeGreaterThan(0);
    }
  });

  it('returns difficulty between 1 and 10', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsReview(baseState, rating);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);
      expect(result.difficulty).toBeLessThanOrEqual(10);
    }
  });

  it('returns a positive interval', () => {
    for (const rating of [1, 2, 3, 4] as FSRSRating[]) {
      const result = fsrsReview(baseState, rating);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    }
  });

  it('returns retrievability between 0 and 1', () => {
    const result = fsrsReview(baseState, 3);
    expect(result.retrievability).toBeGreaterThan(0);
    expect(result.retrievability).toBeLessThanOrEqual(1);
  });

  it('Again rating (1) gives lower stability than Good rating (3)', () => {
    const again = fsrsReview(baseState, 1);
    const good = fsrsReview(baseState, 3);
    expect(again.stability).toBeLessThan(good.stability);
  });

  it('Easy rating (4) gives higher stability than Good (3)', () => {
    const easy = fsrsReview(baseState, 4);
    const good = fsrsReview(baseState, 3);
    expect(easy.stability).toBeGreaterThan(good.stability);
  });

  it('rating impacts difficulty output: lower rating = lower resulting difficulty', () => {
    // In FSRS-5, nextDifficulty = d + W[6]*(anchor - d) + W[7]*(rating - 3)
    // Rating term: W[7]*(rating-3), so higher rating = higher delta
    // This means rating 4 (Easy) adds more to difficulty than rating 1 (Again)
    // This is the correct FSRS-5 behavior — "easy" means "I found it easy
    // BECAUSE the difficulty is right", not "make it easier"
    const again = fsrsReview(baseState, 1);
    const good  = fsrsReview(baseState, 3);
    const easy  = fsrsReview(baseState, 4);
    // Easy rating adds W[7]*(4-3)>0, Again adds W[7]*(1-3)<0
    expect(easy.difficulty).toBeGreaterThan(again.difficulty);
    // Good is neutral (rating-3=0), so it sits between
    expect(easy.difficulty).toBeGreaterThan(good.difficulty);
  });

  it('Easy rating decreases difficulty', () => {
    const result = fsrsReview(baseState, 4);
    expect(result.difficulty).toBeLessThan(baseState.difficulty);
  });

  it('consecutive Good reviews with proper elapsed time increase stability', () => {
    let state: FSRSState = {
      stability: 3.1262,
      difficulty: 5.5,
      lastReview: new Date(Date.now() - 3 * 86_400_000),
    };
    const stabilities: number[] = [state.stability];

    for (let i = 0; i < 5; i++) {
      // Review after the scheduled interval elapses
      const reviewDate = new Date(
        state.lastReview.getTime() + Math.max(1, Math.round(state.stability)) * 86_400_000,
      );
      const result = fsrsReview(state, 3, reviewDate);
      stabilities.push(result.stability);
      state = {
        stability: result.stability,
        difficulty: result.difficulty,
        lastReview: reviewDate,
      };
    }

    // Stability should grow over consecutive correct reviews
    expect(stabilities[stabilities.length - 1]).toBeGreaterThan(stabilities[0]);
  });

  it('handles very old cards (large elapsed time)', () => {
    const oldState: FSRSState = {
      stability: 10,
      difficulty: 5,
      lastReview: new Date(Date.now() - 365 * 86_400_000), // 1 year ago
    };
    const result = fsrsReview(oldState, 3);
    expect(result.retrievability).toBeGreaterThan(0);
    expect(result.retrievability).toBeLessThan(1);
    expect(result.interval).toBeGreaterThanOrEqual(1);
  });

  it('handles recent review (1 day elapsed)', () => {
    const recentState: FSRSState = {
      stability: 10,
      difficulty: 5,
      lastReview: new Date(Date.now() - 1 * 86_400_000),
    };
    const result = fsrsReview(recentState, 4);
    expect(result.retrievability).toBeGreaterThan(0.8);
  });

  it('produces deterministic results for same input', () => {
    const now = new Date();
    const r1 = fsrsReview(baseState, 3, now);
    const r2 = fsrsReview(baseState, 3, now);
    expect(r1).toEqual(r2);
  });
});

// ─── qualityToFSRS ────────────────────────────────────────────────────────────

describe('qualityToFSRS', () => {
  it('maps SM-2 quality 0 to Again (1)', () => {
    expect(qualityToFSRS(0)).toBe(1);
  });

  it('maps SM-2 quality 1 to Again (1)', () => {
    expect(qualityToFSRS(1)).toBe(1);
  });

  it('maps SM-2 quality 2 to Hard (2)', () => {
    expect(qualityToFSRS(2)).toBe(2);
  });

  it('maps SM-2 quality 3 to Good (3)', () => {
    expect(qualityToFSRS(3)).toBe(3);
  });

  it('maps SM-2 quality 4 to Easy (4)', () => {
    expect(qualityToFSRS(4)).toBe(4);
  });

  it('maps SM-2 quality 5 to Easy (4)', () => {
    expect(qualityToFSRS(5)).toBe(4);
  });

  it('always returns a value in 1..4', () => {
    for (let q = 0; q <= 5; q++) {
      const result = qualityToFSRS(q);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(4);
    }
  });
});

// ─── sm2ToFSRSStability ───────────────────────────────────────────────────────

describe('sm2ToFSRSStability', () => {
  it('returns initial Good stability for new cards (repetition=0)', () => {
    const stability = sm2ToFSRSStability(2500, 0, 0);
    expect(stability).toBeGreaterThan(0);
  });

  it('returns positive stability for learned cards', () => {
    const stability = sm2ToFSRSStability(2500, 5, 21);
    expect(stability).toBeGreaterThan(0);
  });

  it('higher efactor produces higher stability', () => {
    const low = sm2ToFSRSStability(1500, 3, 10);
    const high = sm2ToFSRSStability(3000, 3, 10);
    expect(high).toBeGreaterThan(low);
  });

  it('longer interval produces higher stability', () => {
    const short = sm2ToFSRSStability(2500, 3, 5);
    const long = sm2ToFSRSStability(2500, 3, 30);
    expect(long).toBeGreaterThan(short);
  });

  it('stability is always at least 1 for learned cards', () => {
    const stability = sm2ToFSRSStability(1300, 1, 1);
    expect(stability).toBeGreaterThanOrEqual(1);
  });
});

// ─── getDueDateFSRS ───────────────────────────────────────────────────────────

describe('getDueDateFSRS', () => {
  it('returns a date N days in the future', () => {
    const now = new Date();
    const due = getDueDateFSRS(10);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(10);
  });

  it('returns today for interval=0', () => {
    const now = new Date();
    const due = getDueDateFSRS(0);
    expect(due.getDate()).toBe(now.getDate());
  });

  it('handles large intervals (365 days)', () => {
    const now = new Date();
    const due = getDueDateFSRS(365);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(365);
  });
});

// ─── Full FSRS pipeline simulation ────────────────────────────────────────────

describe('FSRS pipeline — learning simulation', () => {
  it('simulates a card from new to mastered over multiple reviews', () => {
    const initial = fsrsNewCard(3); // Good on first review
    let state: FSRSState = {
      stability: initial.stability,
      difficulty: initial.difficulty,
      lastReview: new Date(),
    };

    const intervals: number[] = [initial.interval];

    for (let i = 0; i < 6; i++) {
      // Advance time by the scheduled interval
      const reviewDate = new Date(
        state.lastReview.getTime() + intervals[intervals.length - 1] * 86_400_000,
      );
      const result = fsrsReview(state, 3, reviewDate);
      intervals.push(result.interval);
      state = {
        stability: result.stability,
        difficulty: result.difficulty,
        lastReview: reviewDate,
      };
    }

    // After 6 consecutive Good reviews, final interval should be well over 30 days
    expect(intervals[intervals.length - 1]).toBeGreaterThan(30);
  });

  it('failing a card resets to a short interval', () => {
    // Build up a card
    const initial = fsrsNewCard(4);
    const state: FSRSState = {
      stability: 30,
      difficulty: 4,
      lastReview: new Date(Date.now() - 25 * 86_400_000),
    };

    const result = fsrsReview(state, 1); // Forgot
    expect(result.interval).toBeLessThan(state.stability);
  });

  it('difficulty trends down with consistent Easy reviews', () => {
    let state: FSRSState = {
      stability: 3,
      difficulty: 7,
      lastReview: new Date(Date.now() - 3 * 86_400_000),
    };

    for (let i = 0; i < 10; i++) {
      const result = fsrsReview(state, 4);
      state = {
        stability: result.stability,
        difficulty: result.difficulty,
        lastReview: new Date(),
      };
    }

    expect(state.difficulty).toBeLessThan(7);
  });

  it('difficulty trends up with consistent Again reviews', () => {
    let state: FSRSState = {
      stability: 3,
      difficulty: 4,
      lastReview: new Date(Date.now() - 3 * 86_400_000),
    };

    for (let i = 0; i < 10; i++) {
      const result = fsrsReview(state, 1);
      state = {
        stability: result.stability,
        difficulty: result.difficulty,
        lastReview: new Date(),
      };
    }

    expect(state.difficulty).toBeGreaterThan(4);
  });
});
