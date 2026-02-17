import { describe, it, expect } from 'vitest';
import { calculateConsistency } from '../consistency';

describe('calculateConsistency', () => {
  it('returns 100 for empty array', () => {
    expect(calculateConsistency([])).toBe(100);
  });

  it('returns 100 for single sample', () => {
    expect(calculateConsistency([50])).toBe(100);
  });

  it('returns 100 for identical samples', () => {
    expect(calculateConsistency([60, 60, 60, 60])).toBe(100);
  });

  it('returns lower value for inconsistent samples', () => {
    // Very varied samples should give low consistency
    const result = calculateConsistency([20, 80, 30, 90, 10]);
    expect(result).toBeLessThan(50);
  });

  it('returns high value for slightly varied samples', () => {
    // Slightly varied around 60
    const result = calculateConsistency([58, 60, 62, 59, 61]);
    expect(result).toBeGreaterThan(95);
  });

  it('filters out zero values', () => {
    // Zeros are filtered out, so only [50, 50] remain → consistent
    expect(calculateConsistency([50, 0, 50, 0])).toBe(100);
  });

  it('returns 100 when all samples are zero', () => {
    expect(calculateConsistency([0, 0, 0])).toBe(100);
  });

  it('returns 100 when only one positive sample after filtering', () => {
    expect(calculateConsistency([0, 0, 50])).toBe(100);
  });

  it('never returns negative', () => {
    // Extremely varied data
    const result = calculateConsistency([1, 1000, 1, 1000, 1]);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('returns value between 0 and 100', () => {
    const result = calculateConsistency([30, 50, 70, 40, 60]);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
