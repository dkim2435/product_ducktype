import type { XpGain } from '../types/gamification';
import {
  XP_WPM_MULTIPLIER,
  XP_ACCURACY_BONUS_THRESHOLD,
  XP_ACCURACY_BONUS_MULTIPLIER,
  XP_STREAK_BONUS_PER_DAY,
  XP_STREAK_BONUS_MAX,
  XP_DAILY_CHALLENGE_BONUS,
  XP_DAILY_BOOST_MULTIPLIER,
  XP_LENGTH_MIN_SECONDS,
  XP_LENGTH_MAX_SECONDS,
  XP_LENGTH_MIN_MULTIPLIER,
  XP_LENGTH_MAX_MULTIPLIER,
} from '../constants/gamification';

export function calculateXpGain(
  wpm: number,
  accuracy: number,
  elapsedSeconds: number,
  currentStreak: number,
  isDailyChallenge: boolean,
  hasDailyBoost: boolean
): XpGain {
  // Base XP from WPM
  const base = Math.floor(wpm * XP_WPM_MULTIPLIER);

  // Accuracy bonus: +50% of base if accuracy >= 90%
  const accuracyBonus = accuracy >= XP_ACCURACY_BONUS_THRESHOLD
    ? Math.floor(base * XP_ACCURACY_BONUS_MULTIPLIER)
    : 0;

  // Length bonus: linear interpolation 15s=1x to 120s=2x
  const clampedTime = Math.max(XP_LENGTH_MIN_SECONDS, Math.min(XP_LENGTH_MAX_SECONDS, elapsedSeconds));
  const lengthRatio = (clampedTime - XP_LENGTH_MIN_SECONDS) / (XP_LENGTH_MAX_SECONDS - XP_LENGTH_MIN_SECONDS);
  const lengthMultiplier = XP_LENGTH_MIN_MULTIPLIER + lengthRatio * (XP_LENGTH_MAX_MULTIPLIER - XP_LENGTH_MIN_MULTIPLIER);
  const lengthBonus = Math.floor(base * (lengthMultiplier - 1));

  // Streak bonus: 5% per day, max 50%
  const streakMultiplier = Math.min(currentStreak * XP_STREAK_BONUS_PER_DAY, XP_STREAK_BONUS_MAX);
  const streakBonus = Math.floor(base * streakMultiplier);

  // Daily challenge flat bonus
  const dailyChallengeBonus = isDailyChallenge ? XP_DAILY_CHALLENGE_BONUS : 0;

  const subtotal = base + accuracyBonus + lengthBonus + streakBonus + dailyChallengeBonus;

  // Daily boost: 1.5x when daily challenge completed today
  const dailyBoostBonus = hasDailyBoost ? Math.floor(subtotal * (XP_DAILY_BOOST_MULTIPLIER - 1)) : 0;

  const total = subtotal + dailyBoostBonus;

  return { base, accuracyBonus, lengthBonus, streakBonus, dailyChallengeBonus, dailyBoostBonus, shareBonus: 0, total };
}
