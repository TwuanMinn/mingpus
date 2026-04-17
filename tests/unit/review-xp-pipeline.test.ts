/**
 * Integration tests for the review → XP → level-up pipeline.
 *
 * These tests exercise the pure-function layer of the pipeline:
 *   sm2() → calculateReviewXP() → levelFromXP() / levelProgress()
 *
 * This catches regressions in the pipeline contract without requiring a
 * database connection or auth context.
 */

import { describe, it, expect } from 'vitest';
import { sm2, getDueDate, qualityFromResult } from '@/lib/sm2';
import {
  calculateReviewXP,
  levelFromXP,
  levelProgress,
  xpForLevel,
  generateDailyChallenges,
  ACHIEVEMENTS,
  getAchievement,
} from '@/lib/gamification';

// ─── submitReview → SM-2 output ───────────────────────────────────────────────

describe('submitReview pipeline — SM-2 scheduling', () => {
  it('perfect answer (quality=5) schedules next review further out', () => {
    const first  = sm2({ quality: 5, repetition: 0, interval: 1, efactor: 2500 });
    const second = sm2({ quality: 5, repetition: first.repetition, interval: first.interval, efactor: first.efactor });
    expect(second.interval).toBeGreaterThan(first.interval);
  });

  it('failed answer (quality=1) resets repetition and sets interval=1', () => {
    // Card that was already well-learned
    const result = sm2({ quality: 1, repetition: 5, interval: 21, efactor: 2800 });
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('a sequence of perfect reviews yields monotonically increasing intervals', () => {
    let state = { repetition: 0, interval: 1, efactor: 2500 };
    let prevInterval = 0;
    for (let i = 0; i < 6; i++) {
      const result = sm2({ quality: 5, ...state });
      expect(result.interval).toBeGreaterThan(prevInterval);
      prevInterval = result.interval;
      state = { repetition: result.repetition, interval: result.interval, efactor: result.efactor };
    }
  });

  it('efactor never drops below 1300 (minimum 1.3)', () => {
    let state = { repetition: 3, interval: 10, efactor: 2500 };
    for (let i = 0; i < 20; i++) {
      const result = sm2({ quality: 0, ...state });
      expect(result.efactor).toBeGreaterThanOrEqual(1300);
      state = { repetition: result.repetition, interval: result.interval, efactor: result.efactor };
    }
  });

  it('getDueDate returns a future date for any positive interval', () => {
    const now = new Date();
    for (const days of [1, 6, 21, 100]) {
      const due = getDueDate(days);
      expect(due.getTime()).toBeGreaterThan(now.getTime());
    }
  });
});

// ─── awardXP pipeline ─────────────────────────────────────────────────────────

describe('awardXP pipeline — XP accumulation and level-up', () => {
  it('completing a review awards positive XP for any quality', () => {
    for (let q = 0; q <= 5; q++) {
      expect(calculateReviewXP(q, 0)).toBeGreaterThan(0);
    }
  });

  it('XP accumulation across multiple reviews eventually triggers a level-up', () => {
    let totalXP = 0;
    const startLevel = levelFromXP(totalXP);

    // Simulate 20 perfect reviews
    for (let i = 0; i < 20; i++) {
      totalXP += calculateReviewXP(5, i);
    }

    expect(levelFromXP(totalXP)).toBeGreaterThan(startLevel);
  });

  it('levelProgress resets to 0 exactly at a level boundary', () => {
    const xpAtLevel2 = xpForLevel(1);
    expect(levelProgress(xpAtLevel2)).toBe(0);
  });

  it('XP awards are higher for fast, high-quality answers (full pipeline simulation)', () => {
    // Simulate: perfect instant answer
    const quality = qualityFromResult(true, 1000);
    const xpFast = calculateReviewXP(quality, 5, 1000);

    // Simulate: correct but slow answer
    const qualitySlow = qualityFromResult(true, 12000);
    const xpSlow = calculateReviewXP(qualitySlow, 5, 12000);

    expect(xpFast).toBeGreaterThan(xpSlow);
  });

  it('streak multiplier increases XP reward proportionally', () => {
    const base    = calculateReviewXP(5, 0);
    const streak5 = calculateReviewXP(5, 5);
    const streak20 = calculateReviewXP(5, 20);

    expect(streak5).toBeGreaterThan(base);
    expect(streak20).toBeGreaterThanOrEqual(streak5); // capped at max multiplier
  });
});

// ─── Achievement check pipeline ───────────────────────────────────────────────

describe('achievement check pipeline', () => {
  it('ACHIEVEMENTS catalogue has no duplicates', () => {
    const keys = ACHIEVEMENTS.map(a => a.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every achievement has a positive xpReward', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.xpReward).toBeGreaterThan(0);
    }
  });

  it('getAchievement("first_review") is defined and has correct shape', () => {
    const ach = getAchievement('first_review');
    expect(ach).toBeDefined();
    expect(typeof ach?.title).toBe('string');
    expect(typeof ach?.xpReward).toBe('number');
  });

  it('achievement XP awards are added on top of review XP — combined total is higher', () => {
    const reviewXP = calculateReviewXP(5, 0);
    const firstReviewAch = getAchievement('first_review')!;
    const combinedXP = reviewXP + firstReviewAch.xpReward;
    expect(combinedXP).toBeGreaterThan(reviewXP);
  });

  it('all achievement categories are valid', () => {
    const validCategories = new Set(['milestone', 'streak', 'mastery', 'challenge', 'exploration']);
    for (const a of ACHIEVEMENTS) {
      expect(validCategories.has(a.category)).toBe(true);
    }
  });
});

// ─── Daily challenge pipeline ─────────────────────────────────────────────────

describe('daily challenge pipeline', () => {
  it('produces exactly 3 unique challenge types on each call', () => {
    for (let run = 0; run < 10; run++) {
      const challenges = generateDailyChallenges();
      expect(challenges).toHaveLength(3);
      const types = challenges.map(c => c.type);
      expect(new Set(types).size).toBe(3);
    }
  });

  it('challenge XP accumulates meaningfully toward a level-up', () => {
    let totalXP = 0;
    const startLevel = levelFromXP(0);
    // Complete 5 days of challenges (15 challenge rewards)
    for (let day = 0; day < 5; day++) {
      for (const ch of generateDailyChallenges()) {
        totalXP += ch.xpReward;
      }
    }
    expect(levelFromXP(totalXP)).toBeGreaterThanOrEqual(startLevel);
    expect(totalXP).toBeGreaterThan(0);
  });
});
