import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDefaultStreak, updateStreak, isGracePeriod, getTodayString } from '../streak';

function mockDate(dateStr: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(dateStr + 'T12:00:00Z'));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('createDefaultStreak', () => {
  it('returns default values', () => {
    const streak = createDefaultStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
    expect(streak.lastActivityDate).toBe('');
  });
});

describe('getTodayString', () => {
  it('returns YYYY-MM-DD format', () => {
    mockDate('2026-02-17');
    expect(getTodayString()).toBe('2026-02-17');
  });
});

describe('updateStreak', () => {
  it('starts streak at 1 for first activity', () => {
    mockDate('2026-02-17');
    const result = updateStreak({ currentStreak: 0, longestStreak: 0, lastActivityDate: '' });
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActivityDate).toBe('2026-02-17');
  });

  it('does not change if already active today', () => {
    mockDate('2026-02-17');
    const prev = { currentStreak: 5, longestStreak: 10, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result).toBe(prev); // same reference
  });

  it('increments streak for consecutive day', () => {
    mockDate('2026-02-18');
    const prev = { currentStreak: 3, longestStreak: 5, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result.currentStreak).toBe(4);
    expect(result.lastActivityDate).toBe('2026-02-18');
  });

  it('keeps streak alive during grace period (1 day missed)', () => {
    mockDate('2026-02-19');
    const prev = { currentStreak: 3, longestStreak: 5, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result.currentStreak).toBe(4); // still increments
  });

  it('resets streak after 2+ days missed', () => {
    mockDate('2026-02-20');
    const prev = { currentStreak: 10, longestStreak: 10, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10); // preserves longest
  });

  it('updates longest streak when current exceeds it', () => {
    mockDate('2026-02-18');
    const prev = { currentStreak: 5, longestStreak: 5, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('preserves longest streak when current is below', () => {
    mockDate('2026-02-20');
    const prev = { currentStreak: 3, longestStreak: 20, lastActivityDate: '2026-02-17' };
    const result = updateStreak(prev);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(20);
  });
});

describe('isGracePeriod', () => {
  it('returns false for empty date', () => {
    expect(isGracePeriod('')).toBe(false);
  });

  it('returns false when last activity is today', () => {
    mockDate('2026-02-17');
    expect(isGracePeriod('2026-02-17')).toBe(false);
  });

  it('returns false when last activity was yesterday (still consecutive)', () => {
    mockDate('2026-02-17');
    expect(isGracePeriod('2026-02-16')).toBe(false);
  });

  it('returns true when last activity was day before yesterday', () => {
    mockDate('2026-02-17');
    expect(isGracePeriod('2026-02-15')).toBe(true);
  });

  it('returns false when last activity was 3+ days ago', () => {
    mockDate('2026-02-17');
    expect(isGracePeriod('2026-02-14')).toBe(false);
  });
});
