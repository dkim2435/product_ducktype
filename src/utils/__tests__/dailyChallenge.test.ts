import { describe, it, expect, vi, afterEach } from 'vitest';
import { getDailyChallengeWords, getTodayDateString } from '../dailyChallenge';

afterEach(() => {
  vi.useRealTimers();
});

describe('getTodayDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T08:00:00Z'));
    expect(getTodayDateString()).toBe('2026-03-15');
  });
});

describe('getDailyChallengeWords', () => {
  it('returns 100 words', () => {
    const words = getDailyChallengeWords('2026-02-17');
    expect(words.length).toBe(100);
  });

  it('returns the same words for the same date (deterministic)', () => {
    const words1 = getDailyChallengeWords('2026-02-17');
    const words2 = getDailyChallengeWords('2026-02-17');
    expect(words1).toEqual(words2);
  });

  it('returns different words for different dates', () => {
    const words1 = getDailyChallengeWords('2026-02-17');
    const words2 = getDailyChallengeWords('2026-02-18');
    // They should not be exactly equal (astronomically unlikely)
    expect(words1).not.toEqual(words2);
  });

  it('all words are non-empty strings', () => {
    const words = getDailyChallengeWords('2026-01-01');
    for (const word of words) {
      expect(typeof word).toBe('string');
      expect(word.length).toBeGreaterThan(0);
    }
  });

  it('some words may have punctuation', () => {
    const words = getDailyChallengeWords('2026-06-15');
    const hasPunctuation = words.some(w => /[.,!?;:]/.test(w));
    // With 100 words and ~15% chance each, punctuation is very likely
    expect(hasPunctuation).toBe(true);
  });

  it('some words may be capitalized', () => {
    const words = getDailyChallengeWords('2026-06-15');
    // Check words after the first (index > 0 can be capitalized)
    const hasCapitalized = words.slice(1).some(w => w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase());
    expect(hasCapitalized).toBe(true);
  });
});
