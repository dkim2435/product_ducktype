import { describe, it, expect } from 'vitest';
import { getWpmPercentile } from '../percentile';

describe('getWpmPercentile', () => {
  it('returns high percentile (top X%) for slow typist', () => {
    // 20 WPM is below average → high "top X%" number
    const result = getWpmPercentile(20);
    expect(result).toBeGreaterThan(70);
  });

  it('returns around 50 for average typist', () => {
    // 42 WPM is the mean → should be around top 50%
    const result = getWpmPercentile(42);
    expect(result).toBeGreaterThan(40);
    expect(result).toBeLessThan(60);
  });

  it('returns low percentile for fast typist', () => {
    // 100 WPM is very fast → low "top X%" number
    const result = getWpmPercentile(100);
    expect(result).toBeLessThan(5);
  });

  it('clamps minimum to 1', () => {
    // Extremely fast → should not go below 1
    const result = getWpmPercentile(200);
    expect(result).toBe(1);
  });

  it('clamps maximum to 99', () => {
    // Extremely slow → should not go above 99
    const result = getWpmPercentile(0);
    expect(result).toBeLessThanOrEqual(99);
  });

  it('returns integer values', () => {
    const result = getWpmPercentile(65);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('returns values between 1 and 99', () => {
    for (const wpm of [10, 30, 50, 70, 90, 110, 130]) {
      const result = getWpmPercentile(wpm);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(99);
    }
  });

  it('monotonically decreases (faster = lower top%)', () => {
    const wpmValues = [20, 40, 60, 80, 100, 120];
    const percentiles = wpmValues.map(getWpmPercentile);
    for (let i = 1; i < percentiles.length; i++) {
      expect(percentiles[i]).toBeLessThanOrEqual(percentiles[i - 1]);
    }
  });
});
