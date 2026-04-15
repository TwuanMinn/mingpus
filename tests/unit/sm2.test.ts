import { describe, it, expect } from 'vitest';
import { sm2, getDueDate, qualityFromResult } from '@/lib/sm2';

describe('SM-2 Algorithm', () => {
  describe('sm2()', () => {
    it('returns interval=1 for first correct response', () => {
      const result = sm2({ quality: 4, repetition: 0, interval: 0, efactor: 2500 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(1);
    });

    it('returns interval=6 for second correct response', () => {
      const result = sm2({ quality: 4, repetition: 1, interval: 1, efactor: 2500 });
      expect(result.interval).toBe(6);
      expect(result.repetition).toBe(2);
    });

    it('applies efactor multiplier from third correct response', () => {
      const result = sm2({ quality: 4, repetition: 2, interval: 6, efactor: 2500 });
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
      expect(result.repetition).toBe(3);
    });

    it('resets on incorrect response (quality < 3)', () => {
      const result = sm2({ quality: 2, repetition: 5, interval: 30, efactor: 2500 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(0);
    });

    it('never lets efactor drop below 1.3 (stored as 1300)', () => {
      const result = sm2({ quality: 0, repetition: 0, interval: 0, efactor: 1300 });
      expect(result.efactor).toBeGreaterThanOrEqual(1300);
    });

    it('increases efactor for perfect responses', () => {
      const result = sm2({ quality: 5, repetition: 3, interval: 15, efactor: 2500 });
      expect(result.efactor).toBeGreaterThan(2500);
    });

    it('decreases efactor for barely-correct responses', () => {
      const result = sm2({ quality: 3, repetition: 3, interval: 15, efactor: 2500 });
      expect(result.efactor).toBeLessThan(2500);
    });

    it('handles quality=0 (complete blackout)', () => {
      const result = sm2({ quality: 0, repetition: 10, interval: 90, efactor: 2800 });
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(0);
    });

    it('handles efactor stored as integer correctly', () => {
      // 2500 means 2.5, interval 10 * 2.5 = 25
      const result = sm2({ quality: 4, repetition: 5, interval: 10, efactor: 2500 });
      expect(result.interval).toBe(25);
    });
  });

  describe('getDueDate()', () => {
    it('returns a date N days in the future', () => {
      const now = new Date();
      const due = getDueDate(7);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });

    it('returns today for interval=0', () => {
      const now = new Date();
      const due = getDueDate(0);
      expect(due.getDate()).toBe(now.getDate());
    });
  });

  describe('qualityFromResult()', () => {
    it('returns 1 for incorrect answers', () => {
      expect(qualityFromResult(false)).toBe(1);
    });

    it('returns 5 for fast correct answers', () => {
      expect(qualityFromResult(true, 2000)).toBe(5);
    });

    it('returns 4 for hesitant correct answers', () => {
      expect(qualityFromResult(true, 7000)).toBe(4);
    });

    it('returns 3 for slow correct answers', () => {
      expect(qualityFromResult(true, 15000)).toBe(3);
    });

    it('returns 5 when no time is provided', () => {
      expect(qualityFromResult(true)).toBe(5);
    });
  });
});
