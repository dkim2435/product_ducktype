import { describe, it, expect } from 'vitest';
import { xpForLevel, levelFromXp, xpToNextLevel, getRank } from '../../constants/gamification';

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('returns 0 for level 0', () => {
    expect(xpForLevel(0)).toBe(0);
  });

  it('returns 100 for level 2', () => {
    // 100 * (2-1)^1.5 = 100 * 1 = 100
    expect(xpForLevel(2)).toBe(100);
  });

  it('returns correct XP for level 3', () => {
    // 100 * (3-1)^1.5 = 100 * 2.828... = 282
    expect(xpForLevel(3)).toBe(282);
  });

  it('increases monotonically', () => {
    let prev = 0;
    for (let level = 1; level <= 100; level++) {
      const xp = xpForLevel(level);
      expect(xp).toBeGreaterThanOrEqual(prev);
      prev = xp;
    }
  });
});

describe('levelFromXp', () => {
  it('returns level 1 for 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('returns level 1 for 99 XP', () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it('returns level 2 for 100 XP', () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it('returns level 2 for 281 XP', () => {
    expect(levelFromXp(281)).toBe(2);
  });

  it('returns level 3 for 282 XP', () => {
    expect(levelFromXp(282)).toBe(3);
  });

  it('caps at level 100', () => {
    expect(levelFromXp(999999999)).toBe(100);
  });

  it('is consistent with xpForLevel', () => {
    for (let level = 1; level <= 100; level++) {
      const xp = xpForLevel(level);
      expect(levelFromXp(xp)).toBe(level);
    }
  });
});

describe('xpToNextLevel', () => {
  it('returns full progress at max level', () => {
    const result = xpToNextLevel(xpForLevel(100));
    expect(result.progress).toBe(1);
    expect(result.needed).toBe(0);
  });

  it('returns correct progress at level boundary', () => {
    const result = xpToNextLevel(100); // exactly level 2
    expect(result.current).toBe(0);
    expect(result.needed).toBe(xpForLevel(3) - xpForLevel(2));
    expect(result.progress).toBe(0);
  });

  it('returns correct progress midway', () => {
    const xp = xpForLevel(2) + 50; // level 2 + 50
    const result = xpToNextLevel(xp);
    expect(result.current).toBe(50);
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
  });
});

describe('getRank', () => {
  it('returns Egg for level 1', () => {
    expect(getRank(1).name).toBe('Egg');
  });

  it('returns Duckling for level 5', () => {
    expect(getRank(5).name).toBe('Duckling');
  });

  it('returns Mallard for level 20', () => {
    expect(getRank(20).name).toBe('Mallard');
  });

  it('returns Duck King for level 95', () => {
    expect(getRank(95).name).toBe('Duck King');
  });

  it('returns Creator for admin', () => {
    expect(getRank(1, true).name).toBe('Creator');
  });

  it('returns highest rank at boundary level', () => {
    // level 30 should be Teal (minLevel 30)
    expect(getRank(30).name).toBe('Teal');
  });

  it('returns previous rank just below boundary', () => {
    // level 29 should still be Mallard (minLevel 20)
    expect(getRank(29).name).toBe('Mallard');
  });

  it('always includes an emoji', () => {
    for (const level of [1, 5, 10, 20, 30, 40, 50, 65, 80, 95]) {
      expect(getRank(level).emoji).toBeTruthy();
    }
  });
});
