import { describe, it, expect } from 'vitest';
import { calculateXpGain } from '../xp';

describe('calculateXpGain', () => {
  it('calculates base XP from WPM', () => {
    // wpm=100, base = floor(100 * 0.5) = 50
    const result = calculateXpGain(100, 80, 60, 0, false, false);
    expect(result.base).toBe(50);
  });

  it('gives accuracy bonus when accuracy >= 90%', () => {
    const result = calculateXpGain(100, 95, 60, 0, false, false);
    // base = 50, accuracyBonus = floor(50 * 0.5) = 25
    expect(result.accuracyBonus).toBe(25);
  });

  it('gives no accuracy bonus when accuracy < 90%', () => {
    const result = calculateXpGain(100, 89, 60, 0, false, false);
    expect(result.accuracyBonus).toBe(0);
  });

  it('gives accuracy bonus at exactly 90%', () => {
    const result = calculateXpGain(100, 90, 60, 0, false, false);
    expect(result.accuracyBonus).toBe(25);
  });

  it('calculates length bonus (min at 15s)', () => {
    // At 15s: lengthMultiplier = 1.0 → lengthBonus = 0
    const result = calculateXpGain(100, 80, 15, 0, false, false);
    expect(result.lengthBonus).toBe(0);
  });

  it('calculates length bonus (max at 120s)', () => {
    // At 120s: lengthMultiplier = 2.0 → lengthBonus = floor(50 * 1) = 50
    const result = calculateXpGain(100, 80, 120, 0, false, false);
    expect(result.lengthBonus).toBe(50);
  });

  it('clamps length bonus below 15s', () => {
    const result5 = calculateXpGain(100, 80, 5, 0, false, false);
    const result15 = calculateXpGain(100, 80, 15, 0, false, false);
    expect(result5.lengthBonus).toBe(result15.lengthBonus);
  });

  it('clamps length bonus above 120s', () => {
    const result200 = calculateXpGain(100, 80, 200, 0, false, false);
    const result120 = calculateXpGain(100, 80, 120, 0, false, false);
    expect(result200.lengthBonus).toBe(result120.lengthBonus);
  });

  it('calculates streak bonus', () => {
    // streak=10, streakMultiplier = min(10*0.05, 0.5) = 0.5
    // streakBonus = floor(50 * 0.5) = 25
    const result = calculateXpGain(100, 80, 60, 10, false, false);
    expect(result.streakBonus).toBe(25);
  });

  it('caps streak bonus at 50%', () => {
    // streak=20 → multiplier = min(20*0.05, 0.5) = min(1.0, 0.5) = 0.5
    const result = calculateXpGain(100, 80, 60, 20, false, false);
    expect(result.streakBonus).toBe(25); // floor(50 * 0.5)
  });

  it('gives zero streak bonus for streak 0', () => {
    const result = calculateXpGain(100, 80, 60, 0, false, false);
    expect(result.streakBonus).toBe(0);
  });

  it('adds daily challenge flat bonus', () => {
    const result = calculateXpGain(100, 80, 60, 0, true, false);
    expect(result.dailyChallengeBonus).toBe(50);
  });

  it('no daily challenge bonus when not daily', () => {
    const result = calculateXpGain(100, 80, 60, 0, false, false);
    expect(result.dailyChallengeBonus).toBe(0);
  });

  it('applies daily boost multiplier', () => {
    // Without boost
    const noBoosted = calculateXpGain(100, 80, 60, 0, false, false);
    // With boost
    const boosted = calculateXpGain(100, 80, 60, 0, false, true);
    // dailyBoostBonus = floor(subtotal * 0.5)
    expect(boosted.dailyBoostBonus).toBe(Math.floor(noBoosted.total * 0.5));
    expect(boosted.total).toBeGreaterThan(noBoosted.total);
  });

  it('total equals sum of all bonuses', () => {
    const result = calculateXpGain(80, 95, 90, 5, true, true);
    const subtotal = result.base + result.accuracyBonus + result.lengthBonus +
                     result.streakBonus + result.dailyChallengeBonus;
    expect(result.total).toBe(subtotal + result.dailyBoostBonus);
  });

  it('shareBonus is always 0 from calculateXpGain', () => {
    const result = calculateXpGain(100, 100, 120, 10, true, true);
    expect(result.shareBonus).toBe(0);
  });

  it('returns 0 base for 0 WPM', () => {
    const result = calculateXpGain(0, 100, 60, 0, false, false);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });
});
