import { describe, it, expect } from 'vitest';
import { extractKeyStats, mergeKeyStats, getWeakKeys } from '../keyAnalysis';
import type { TestState } from '../../types/test';
import type { KeyStatsMap } from '../../types/gamification';

function makeTestState(words: { char: string; state: 'correct' | 'incorrect' | 'extra' | 'pending' }[][]): TestState {
  return {
    phase: 'finished',
    words: words.map(letters => ({
      letters: letters.map(l => ({ char: l.char, state: l.state })),
      isActive: false,
      isCompleted: true,
    })),
    currentWordIndex: 0,
    currentLetterIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    startTime: null,
    endTime: null,
    wpmHistory: [],
    rawWpmHistory: [],
    errorHistory: [],
  };
}

describe('extractKeyStats', () => {
  it('counts correct letters', () => {
    const state = makeTestState([
      [
        { char: 'h', state: 'correct' },
        { char: 'i', state: 'correct' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['h'].totalAttempts).toBe(1);
    expect(stats['h'].errors).toBe(0);
    expect(stats['i'].totalAttempts).toBe(1);
    expect(stats['i'].errors).toBe(0);
  });

  it('counts incorrect letters as errors', () => {
    const state = makeTestState([
      [
        { char: 'a', state: 'incorrect' },
        { char: 'b', state: 'correct' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['a'].errors).toBe(1);
    expect(stats['a'].totalAttempts).toBe(1);
    expect(stats['a'].errorRate).toBe(1);
    expect(stats['b'].errors).toBe(0);
  });

  it('skips pending letters', () => {
    const state = makeTestState([
      [
        { char: 'a', state: 'correct' },
        { char: 'b', state: 'pending' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['a']).toBeDefined();
    expect(stats['b']).toBeUndefined();
  });

  it('skips extra letters', () => {
    const state = makeTestState([
      [
        { char: 'x', state: 'extra' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['x']).toBeUndefined();
  });

  it('converts keys to lowercase', () => {
    const state = makeTestState([
      [
        { char: 'A', state: 'correct' },
        { char: 'a', state: 'correct' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['a'].totalAttempts).toBe(2);
  });

  it('calculates error rate correctly', () => {
    const state = makeTestState([
      [
        { char: 'e', state: 'correct' },
        { char: 'e', state: 'incorrect' },
        { char: 'e', state: 'correct' },
        { char: 'e', state: 'incorrect' },
      ],
    ]);
    const stats = extractKeyStats(state);
    expect(stats['e'].totalAttempts).toBe(4);
    expect(stats['e'].errors).toBe(2);
    expect(stats['e'].errorRate).toBe(0.5);
  });

  it('handles empty test state', () => {
    const state = makeTestState([]);
    const stats = extractKeyStats(state);
    expect(Object.keys(stats).length).toBe(0);
  });
});

describe('mergeKeyStats', () => {
  it('merges new keys into empty cumulative', () => {
    const cumulative: KeyStatsMap = {};
    const incoming: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 10, errors: 2, errorRate: 0.2 },
    };
    const merged = mergeKeyStats(cumulative, incoming);
    expect(merged['a'].totalAttempts).toBe(10);
    expect(merged['a'].errors).toBe(2);
    expect(merged['a'].errorRate).toBe(0.2);
  });

  it('merges overlapping keys by summing', () => {
    const cumulative: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 10, errors: 2, errorRate: 0.2 },
    };
    const incoming: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 10, errors: 3, errorRate: 0.3 },
    };
    const merged = mergeKeyStats(cumulative, incoming);
    expect(merged['a'].totalAttempts).toBe(20);
    expect(merged['a'].errors).toBe(5);
    expect(merged['a'].errorRate).toBe(0.25);
  });

  it('preserves existing keys not in incoming', () => {
    const cumulative: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 10, errors: 1, errorRate: 0.1 },
    };
    const incoming: KeyStatsMap = {
      b: { key: 'b', totalAttempts: 5, errors: 0, errorRate: 0 },
    };
    const merged = mergeKeyStats(cumulative, incoming);
    expect(merged['a']).toBeDefined();
    expect(merged['b']).toBeDefined();
  });

  it('does not mutate original objects', () => {
    const cumulative: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 10, errors: 1, errorRate: 0.1 },
    };
    const incoming: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 5, errors: 1, errorRate: 0.2 },
    };
    mergeKeyStats(cumulative, incoming);
    expect(cumulative['a'].totalAttempts).toBe(10);
  });
});

describe('getWeakKeys', () => {
  it('returns empty when no keys have errors', () => {
    const stats: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 20, errors: 0, errorRate: 0 },
      b: { key: 'b', totalAttempts: 20, errors: 0, errorRate: 0 },
    };
    expect(getWeakKeys(stats)).toEqual([]);
  });

  it('filters by minimum attempts', () => {
    const stats: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 5, errors: 3, errorRate: 0.6 },
      b: { key: 'b', totalAttempts: 15, errors: 3, errorRate: 0.2 },
    };
    // Default minAttempts=10, so 'a' is filtered out
    const result = getWeakKeys(stats);
    expect(result.length).toBe(1);
    expect(result[0].key).toBe('b');
  });

  it('sorts by error rate descending', () => {
    const stats: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 20, errors: 2, errorRate: 0.1 },
      b: { key: 'b', totalAttempts: 20, errors: 6, errorRate: 0.3 },
      c: { key: 'c', totalAttempts: 20, errors: 4, errorRate: 0.2 },
    };
    const result = getWeakKeys(stats);
    expect(result[0].key).toBe('b');
    expect(result[1].key).toBe('c');
    expect(result[2].key).toBe('a');
  });

  it('limits to count parameter', () => {
    const stats: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 20, errors: 1, errorRate: 0.05 },
      b: { key: 'b', totalAttempts: 20, errors: 2, errorRate: 0.1 },
      c: { key: 'c', totalAttempts: 20, errors: 3, errorRate: 0.15 },
      d: { key: 'd', totalAttempts: 20, errors: 4, errorRate: 0.2 },
    };
    const result = getWeakKeys(stats, 2);
    expect(result.length).toBe(2);
  });

  it('uses custom minAttempts', () => {
    const stats: KeyStatsMap = {
      a: { key: 'a', totalAttempts: 3, errors: 2, errorRate: 0.67 },
    };
    expect(getWeakKeys(stats, 5, 10)).toEqual([]);
    expect(getWeakKeys(stats, 5, 3).length).toBe(1);
  });
});
