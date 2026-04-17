import { describe, expect, it } from 'vitest';
import { QUALITY, QUALITY_ACTIONS } from '@/lib/practice-config';

describe('QUALITY constants', () => {
  it('matches the SM-2 / FSRS scale (1, 3, 4, 5)', () => {
    expect(QUALITY.AGAIN).toBe(1);
    expect(QUALITY.HARD).toBe(3);
    expect(QUALITY.GOOD).toBe(4);
    expect(QUALITY.EASY).toBe(5);
  });

  it('values are strictly increasing — UI buttons rely on order', () => {
    const values = [QUALITY.AGAIN, QUALITY.HARD, QUALITY.GOOD, QUALITY.EASY];
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

describe('QUALITY_ACTIONS', () => {
  it('exposes exactly four buttons', () => {
    expect(QUALITY_ACTIONS).toHaveLength(4);
  });

  it('every action carries a label, icon, key, and quality', () => {
    for (const action of QUALITY_ACTIONS) {
      expect(action.label).toBeTruthy();
      expect(action.icon).toBeTruthy();
      expect(action.key).toMatch(/^[1-4]$/);
      expect([QUALITY.AGAIN, QUALITY.HARD, QUALITY.GOOD, QUALITY.EASY]).toContain(action.quality);
    }
  });

  it('keyboard shortcuts 1..4 map to AGAIN..EASY in order', () => {
    expect(QUALITY_ACTIONS[0].key).toBe('1');
    expect(QUALITY_ACTIONS[0].quality).toBe(QUALITY.AGAIN);
    expect(QUALITY_ACTIONS[3].key).toBe('4');
    expect(QUALITY_ACTIONS[3].quality).toBe(QUALITY.EASY);
  });

  it('quality values are unique across actions', () => {
    const qualities = QUALITY_ACTIONS.map((a) => a.quality);
    expect(new Set(qualities).size).toBe(qualities.length);
  });
});
