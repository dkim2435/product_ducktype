import { describe, it, expect } from 'vitest';
import { calculateWpm, calculateRawWpm, calculateCpm } from '../wpm';

describe('calculateWpm', () => {
  it('returns 0 when elapsed time is 0', () => {
    expect(calculateWpm(100, 0)).toBe(0);
  });

  it('returns 0 when elapsed time is negative', () => {
    expect(calculateWpm(100, -5)).toBe(0);
  });

  it('calculates WPM correctly for 60 seconds', () => {
    // 300 correct chars / 5 = 60 words, / 1 min = 60 WPM
    expect(calculateWpm(300, 60)).toBe(60);
  });

  it('calculates WPM correctly for 30 seconds', () => {
    // 150 correct chars / 5 = 30 words, / 0.5 min = 60 WPM
    expect(calculateWpm(150, 30)).toBe(60);
  });

  it('calculates WPM correctly for 120 seconds', () => {
    // 500 correct chars / 5 = 100 words, / 2 min = 50 WPM
    expect(calculateWpm(500, 120)).toBe(50);
  });

  it('returns 0 when no correct chars', () => {
    expect(calculateWpm(0, 60)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    // 123 / 5 = 24.6 words, / (45/60) = 32.8 → rounds to 33
    expect(calculateWpm(123, 45)).toBe(33);
  });
});

describe('calculateRawWpm', () => {
  it('returns 0 when elapsed time is 0', () => {
    expect(calculateRawWpm(100, 0)).toBe(0);
  });

  it('returns 0 when elapsed time is negative', () => {
    expect(calculateRawWpm(100, -1)).toBe(0);
  });

  it('calculates raw WPM including incorrect chars', () => {
    // 400 total chars / 5 = 80 words, / 1 min = 80 WPM
    expect(calculateRawWpm(400, 60)).toBe(80);
  });
});

describe('calculateCpm', () => {
  it('returns 0 when elapsed time is 0', () => {
    expect(calculateCpm(100, 0)).toBe(0);
  });

  it('returns 0 when elapsed time is negative', () => {
    expect(calculateCpm(100, -1)).toBe(0);
  });

  it('calculates CPM correctly', () => {
    // 300 chars / 1 min = 300 CPM
    expect(calculateCpm(300, 60)).toBe(300);
  });

  it('calculates CPM for 30 seconds', () => {
    // 150 chars / 0.5 min = 300 CPM
    expect(calculateCpm(150, 30)).toBe(300);
  });
});
