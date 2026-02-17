import { describe, it, expect } from 'vitest';
import { getNextAchievement } from '../achievementProgress';
import type { TestResult } from '../../types/stats';
import type { StreakState } from '../../types/gamification';

function makeResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    id: 'test-1',
    wpm: 60,
    rawWpm: 65,
    accuracy: 95,
    consistency: 90,
    correctChars: 300,
    incorrectChars: 5,
    extraChars: 0,
    missedChars: 0,
    mode: 'time',
    modeValue: 60,
    language: 'en',
    timestamp: Date.now(),
    wpmHistory: [],
    rawWpmHistory: [],
    errorHistory: [],
    ...overrides,
  };
}

const defaultStreak: StreakState = { currentStreak: 0, longestStreak: 0, lastActivityDate: '' };

describe('getNextAchievement', () => {
  it('returns the closest unachieved achievement', () => {
    const result = makeResult({ wpm: 48 });
    const next = getNextAchievement(result, 1, defaultStreak, []);
    // 48/50 = 96% progress on speed-50, should be the closest
    expect(next).not.toBeNull();
    expect(next!.progress).toBeGreaterThan(0.9);
  });

  it('skips already unlocked achievements', () => {
    const result = makeResult({ wpm: 60, accuracy: 96 });
    const next = getNextAchievement(result, 1, defaultStreak, ['speed-50', 'acc-95', 'tests-1']);
    expect(next).not.toBeNull();
    expect(next!.id).not.toBe('speed-50');
    expect(next!.id).not.toBe('acc-95');
    expect(next!.id).not.toBe('tests-1');
  });

  it('returns null when all trackable achievements are unlocked', () => {
    // Unlock all achievements with progress tracking
    const allIds = [
      'speed-50', 'speed-75', 'speed-100', 'speed-125', 'speed-150',
      'acc-95', 'acc-98', 'acc-100',
      'cons-90', 'cons-95',
      'tests-1', 'tests-10', 'tests-50', 'tests-100', 'tests-500', 'tests-1000',
      'streak-3', 'streak-7', 'streak-14', 'streak-30', 'streak-100',
      // Special achievements don't have getAchievementProgress entries
      'night-owl', 'early-bird', 'marathon', 'perfectionist', 'polyglot',
      'daily-7', 'level-25', 'level-50', 'level-100', 'all-lessons', 'first-share',
    ];
    const result = makeResult({ wpm: 200 });
    const next = getNextAchievement(result, 1000, { currentStreak: 100, longestStreak: 100, lastActivityDate: '' }, allIds);
    expect(next).toBeNull();
  });

  it('returns progress between 0 and 1', () => {
    const result = makeResult({ wpm: 40 });
    const next = getNextAchievement(result, 5, defaultStreak, []);
    expect(next).not.toBeNull();
    expect(next!.progress).toBeGreaterThanOrEqual(0);
    expect(next!.progress).toBeLessThanOrEqual(1);
  });

  it('caps current at target', () => {
    const result = makeResult({ wpm: 200 });
    const next = getNextAchievement(result, 1, defaultStreak, []);
    // wpm 200 > speed-50 target 50, but current should be capped to 50
    if (next && next.id.startsWith('speed-')) {
      expect(next.current).toBeLessThanOrEqual(next.target);
    }
  });
});
