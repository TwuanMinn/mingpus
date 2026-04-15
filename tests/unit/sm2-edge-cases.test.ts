import { describe, it, expect } from 'vitest';
import { sm2, getDueDate, qualityFromResult } from '@/lib/sm2';

describe('SM-2 Algorithm — Edge Cases & Stress', () => {
  describe('boundary quality values', () => {
    it('handles quality=3 (barely correct) as passing', () => {
      const result = sm2({ quality: 3, repetition: 0, interval: 0, efactor: 2500 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(1);
    });

    it('handles quality=2 (incorrect) as failing', () => {
      const result = sm2({ quality: 2, repetition: 5, interval: 60, efactor: 2500 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(0);
    });

    it('quality=5 produces highest efactor increase', () => {
      const q5 = sm2({ quality: 5, repetition: 3, interval: 15, efactor: 2500 });
      const q4 = sm2({ quality: 4, repetition: 3, interval: 15, efactor: 2500 });
      expect(q5.efactor).toBeGreaterThan(q4.efactor);
    });

    it('quality=0 produces the steepest efactor decrease', () => {
      const q0 = sm2({ quality: 0, repetition: 0, interval: 0, efactor: 2500 });
      const q1 = sm2({ quality: 1, repetition: 0, interval: 0, efactor: 2500 });
      expect(q0.efactor).toBeLessThan(q1.efactor);
    });
  });

  describe('efactor floor enforcement', () => {
    it('clamps efactor to 1300 minimum after repeated failures', () => {
      let state = { quality: 0, repetition: 0, interval: 0, efactor: 2500 };
      for (let i = 0; i < 20; i++) {
        const result = sm2(state);
        state = { quality: 0, repetition: result.repetition, interval: result.interval, efactor: result.efactor };
      }
      expect(state.efactor).toBe(1300);
    });

    it('never produces efactor below 1300 on any quality value', () => {
      for (let q = 0; q <= 5; q++) {
        const result = sm2({ quality: q, repetition: 0, interval: 0, efactor: 1300 });
        expect(result.efactor).toBeGreaterThanOrEqual(1300);
      }
    });
  });

  describe('interval growth progression', () => {
    it('follows 1 → 6 → EF*interval pattern for consecutive correct', () => {
      let state = { repetition: 0, interval: 0, efactor: 2500 };

      // First correct: interval = 1
      let r = sm2({ ...state, quality: 5 });
      expect(r.interval).toBe(1);
      state = { repetition: r.repetition, interval: r.interval, efactor: r.efactor };

      // Second correct: interval = 6
      r = sm2({ ...state, quality: 5 });
      expect(r.interval).toBe(6);
      state = { repetition: r.repetition, interval: r.interval, efactor: r.efactor };

      // Third correct: interval = round(6 * ef)
      r = sm2({ ...state, quality: 5 });
      const expectedInterval = Math.round(6 * (state.efactor / 1000));
      expect(r.interval).toBe(expectedInterval);
    });

    it('resets to 1 after a failure mid-streak', () => {
      // Build up a streak
      let state = { quality: 5, repetition: 5, interval: 60, efactor: 2600 };
      const result = sm2({ ...state, quality: 1 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(0);
    });
  });

  describe('large interval stress', () => {
    it('handles very large intervals gracefully', () => {
      const result = sm2({ quality: 5, repetition: 20, interval: 365, efactor: 2500 });
      expect(result.interval).toBeGreaterThan(365);
      expect(result.interval).toBeLessThan(10000);
    });

    it('produces consistent results across multiple runs', () => {
      const input = { quality: 4, repetition: 3, interval: 15, efactor: 2500 };
      const r1 = sm2(input);
      const r2 = sm2(input);
      expect(r1).toEqual(r2);
    });
  });

  describe('getDueDate edge cases', () => {
    it('returns a date exactly 1 day ahead for interval=1', () => {
      const now = new Date();
      const due = getDueDate(1);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(1);
    });

    it('handles large intervals (365 days)', () => {
      const now = new Date();
      const due = getDueDate(365);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(365);
    });
  });

  describe('qualityFromResult boundary times', () => {
    it('returns 4 for exactly 5001ms (just over threshold)', () => {
      expect(qualityFromResult(true, 5001)).toBe(4);
    });

    it('returns 5 for exactly 5000ms (at threshold)', () => {
      expect(qualityFromResult(true, 5000)).toBe(5);
    });

    it('returns 3 for exactly 10001ms (just over slow threshold)', () => {
      expect(qualityFromResult(true, 10001)).toBe(3);
    });

    it('returns 4 for exactly 10000ms (at slow threshold)', () => {
      expect(qualityFromResult(true, 10000)).toBe(4);
    });

    it('returns 3 for very slow response (60 seconds)', () => {
      expect(qualityFromResult(true, 60000)).toBe(3);
    });

    it('returns 1 for incorrect regardless of speed', () => {
      expect(qualityFromResult(false, 100)).toBe(1);
      expect(qualityFromResult(false, 50000)).toBe(1);
    });

    it('returns 5 for correct with 0ms time', () => {
      expect(qualityFromResult(true, 0)).toBe(5);
    });
  });

  describe('full learning simulation', () => {
    it('simulates a learner going from new → mastered over multiple reviews', () => {
      let state = { repetition: 0, interval: 0, efactor: 2500 };
      const intervals: number[] = [];

      // Simulate 8 perfect reviews
      for (let i = 0; i < 8; i++) {
        const result = sm2({ ...state, quality: 5 });
        intervals.push(result.interval);
        state = { repetition: result.repetition, interval: result.interval, efactor: result.efactor };
      }

      // Intervals should be strictly increasing after the first two
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(6);
      for (let i = 2; i < intervals.length; i++) {
        expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
      }
    });

    it('simulates a struggling learner with mixed results', () => {
      let state = { repetition: 0, interval: 0, efactor: 2500 };
      // More failures than successes to push efactor down
      const qualities = [2, 5, 2, 2, 5, 3, 2, 5];

      for (const q of qualities) {
        const result = sm2({ ...state, quality: q });
        state = { repetition: result.repetition, interval: result.interval, efactor: result.efactor };
      }

      // After mostly-failing performance, efactor should be lower than initial
      expect(state.efactor).toBeLessThan(2500);
      // But should still be above minimum
      expect(state.efactor).toBeGreaterThanOrEqual(1300);
    });
  });
});
