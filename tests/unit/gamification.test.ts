import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  levelFromXP,
  levelProgress,
  calculateReviewXP,
  getLevelInfo,
  LEVEL_TIERS,
  ACHIEVEMENTS,
  generateDailyChallenges,
  CHALLENGE_TEMPLATES,
  getAchievement,
} from '@/lib/gamification';

// ─── XP & Level System ────────────────────────────────────────────────────────

describe('xpForLevel', () => {
  it('returns 100 for level 1 (base case)', () => {
    expect(xpForLevel(1)).toBe(100);
  });

  it('grows exponentially — each level costs more than the previous', () => {
    for (let lvl = 1; lvl < 20; lvl++) {
      expect(xpForLevel(lvl + 1)).toBeGreaterThan(xpForLevel(lvl));
    }
  });

  it('returns a positive integer for any level', () => {
    for (const lvl of [1, 5, 10, 20, 50]) {
      const xp = xpForLevel(lvl);
      expect(xp).toBeGreaterThan(0);
      expect(Number.isInteger(xp)).toBe(true);
    }
  });
});

describe('levelFromXP', () => {
  it('returns 1 for 0 XP', () => {
    expect(levelFromXP(0)).toBe(1);
  });

  it('returns 2 after crossing the first level threshold', () => {
    expect(levelFromXP(xpForLevel(1))).toBe(2);
  });

  it('is monotonically non-decreasing', () => {
    let prev = levelFromXP(0);
    for (let xp = 0; xp <= 5000; xp += 50) {
      const current = levelFromXP(xp);
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }
  });

  it('is consistent with xpForLevel — earning exactly enough XP levels up', () => {
    let totalXP = 0;
    for (let expectedLevel = 1; expectedLevel <= 8; expectedLevel++) {
      expect(levelFromXP(totalXP)).toBe(expectedLevel);
      totalXP += xpForLevel(expectedLevel);
    }
  });
});

describe('levelProgress', () => {
  it('returns 0 at the start of a level', () => {
    // At 0 XP the user is at the very start of level 1
    expect(levelProgress(0)).toBe(0);
  });

  it('returns a value in [0, 1) within a level', () => {
    const halfwayXP = Math.floor(xpForLevel(1) / 2);
    const progress = levelProgress(halfwayXP);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });

  it('returns exactly 0 when total XP equals the cost of completed levels', () => {
    const xpAtLevel2 = xpForLevel(1);
    expect(levelProgress(xpAtLevel2)).toBe(0);
  });
});

// ─── calculateReviewXP ────────────────────────────────────────────────────────

describe('calculateReviewXP', () => {
  it('awards more XP for higher quality answers', () => {
    const q5 = calculateReviewXP(5, 0);
    const q4 = calculateReviewXP(4, 0);
    const q3 = calculateReviewXP(3, 0);
    const q0 = calculateReviewXP(0, 0);
    expect(q5).toBeGreaterThan(q4);
    expect(q4).toBeGreaterThan(q3);
    expect(q3).toBeGreaterThan(q0);
  });

  it('streak multiplier increases XP up to the maximum cap', () => {
    const noStreak = calculateReviewXP(5, 0);
    const streak10 = calculateReviewXP(5, 10);
    const streak100 = calculateReviewXP(5, 100);
    expect(streak10).toBeGreaterThan(noStreak);
    // After the max multiplier (streak * 0.1 capped at 2.0 = 20 streak) it plateaus
    expect(streak100).toBe(streak10 > streak100 ? streak10 : streak100); // non-decreasing after cap
  });

  it('awards a speed bonus for responses under 3 seconds', () => {
    const fast  = calculateReviewXP(5, 0, 2000);
    const slow  = calculateReviewXP(5, 0, 5000);
    expect(fast).toBeGreaterThan(slow);
  });

  it('no speed bonus for responses at or above 3 seconds', () => {
    const at3000 = calculateReviewXP(5, 0, 3000);
    const above  = calculateReviewXP(5, 0, 3001);
    expect(at3000).toBe(above);
  });

  it('returns a positive integer for any valid quality + streak', () => {
    for (let q = 0; q <= 5; q++) {
      for (const streak of [0, 1, 10, 20]) {
        const xp = calculateReviewXP(q, streak);
        expect(xp).toBeGreaterThan(0);
        expect(Number.isInteger(xp)).toBe(true);
      }
    }
  });
});

// ─── getLevelInfo / LEVEL_TIERS ───────────────────────────────────────────────

describe('getLevelInfo', () => {
  it('returns the first tier for level 1', () => {
    const info = getLevelInfo(1);
    expect(info.minLevel).toBe(1);
  });

  it('returns a higher tier as level increases', () => {
    const tier1  = getLevelInfo(1);
    const tier10 = getLevelInfo(10);
    expect(tier10.minLevel).toBeGreaterThanOrEqual(tier1.minLevel);
  });

  it('returns the highest applicable tier (not one above)', () => {
    // level 14 should be tier with minLevel <= 14
    const info = getLevelInfo(14);
    expect(info.minLevel).toBeLessThanOrEqual(14);
  });

  it('handles extremely high levels by returning the last tier', () => {
    const lastTier = LEVEL_TIERS[LEVEL_TIERS.length - 1];
    expect(getLevelInfo(999).minLevel).toBe(lastTier.minLevel);
  });

  it('every tier has required fields', () => {
    for (const tier of LEVEL_TIERS) {
      expect(typeof tier.title).toBe('string');
      expect(typeof tier.titleCN).toBe('string');
      expect(typeof tier.icon).toBe('string');
      expect(typeof tier.minLevel).toBe('number');
    }
  });
});

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

describe('ACHIEVEMENTS', () => {
  it('has no duplicate keys', () => {
    const keys = ACHIEVEMENTS.map(a => a.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('every achievement has required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.key).toBe('string');
      expect(a.key.length).toBeGreaterThan(0);
      expect(typeof a.title).toBe('string');
      expect(typeof a.description).toBe('string');
      expect(typeof a.xpReward).toBe('number');
      expect(a.xpReward).toBeGreaterThan(0);
      expect(['milestone', 'streak', 'mastery', 'challenge', 'exploration']).toContain(a.category);
    }
  });

  it('getAchievement returns the correct definition', () => {
    const def = getAchievement('first_review');
    expect(def).toBeDefined();
    expect(def?.key).toBe('first_review');
  });

  it('getAchievement returns undefined for unknown keys', () => {
    expect(getAchievement('not_a_real_achievement')).toBeUndefined();
  });
});

// ─── generateDailyChallenges ──────────────────────────────────────────────────

describe('generateDailyChallenges', () => {
  it('returns exactly 3 challenges', () => {
    expect(generateDailyChallenges()).toHaveLength(3);
  });

  it('each challenge has a valid type from CHALLENGE_TEMPLATES', () => {
    const validTypes = new Set(CHALLENGE_TEMPLATES.map(t => t.type));
    for (const ch of generateDailyChallenges()) {
      expect(validTypes.has(ch.type)).toBe(true);
    }
  });

  it('each challenge target is within the defined range for its template', () => {
    // Run several times to catch random boundary issues
    for (let i = 0; i < 20; i++) {
      for (const ch of generateDailyChallenges()) {
        const tmpl = CHALLENGE_TEMPLATES.find(t => t.type === ch.type)!;
        const [min, max] = tmpl.targetRange;
        expect(ch.target).toBeGreaterThanOrEqual(min);
        expect(ch.target).toBeLessThanOrEqual(max);
      }
    }
  });

  it('xpReward matches the template xpReward', () => {
    for (const ch of generateDailyChallenges()) {
      const tmpl = CHALLENGE_TEMPLATES.find(t => t.type === ch.type)!;
      expect(ch.xpReward).toBe(tmpl.xpReward);
    }
  });

  it('no duplicate challenge types in a single day', () => {
    for (let i = 0; i < 10; i++) {
      const challenges = generateDailyChallenges();
      const types = challenges.map(c => c.type);
      const unique = new Set(types);
      expect(unique.size).toBe(types.length);
    }
  });
});
