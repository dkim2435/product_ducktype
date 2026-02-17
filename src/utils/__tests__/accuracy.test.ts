import { describe, it, expect } from 'vitest';
import { calculateAccuracy } from '../accuracy';

describe('calculateAccuracy', () => {
  it('returns 100 when no keystrokes', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('returns 100 when total keystrokes is negative', () => {
    expect(calculateAccuracy(0, -1)).toBe(100);
  });

  it('returns 100% for perfect typing', () => {
    expect(calculateAccuracy(100, 100)).toBe(100);
  });

  it('calculates accuracy with some errors', () => {
    // 90 correct / 100 total = 90%
    expect(calculateAccuracy(90, 100)).toBe(90);
  });

  it('handles two decimal places', () => {
    // 97 / 103 = 94.17475...% → rounds to 94.17
    expect(calculateAccuracy(97, 103)).toBe(94.17);
  });

  it('returns 0 when all keystrokes are wrong', () => {
    expect(calculateAccuracy(0, 50)).toBe(0);
  });

  it('handles single keystroke correctly', () => {
    expect(calculateAccuracy(1, 1)).toBe(100);
  });

  it('handles very high accuracy', () => {
    // 999 / 1000 = 99.9%
    expect(calculateAccuracy(999, 1000)).toBe(99.9);
  });
});
