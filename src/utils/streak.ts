import type { StreakState } from '../types/gamification';

function getDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

function getDayBeforeYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return getDateString(d);
}

export function createDefaultStreak(): StreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
  };
}

export function updateStreak(prev: StreakState): StreakState {
  const today = getDateString();

  // Already active today - no change
  if (prev.lastActivityDate === today) {
    return prev;
  }

  const yesterday = getYesterday();
  const dayBeforeYesterday = getDayBeforeYesterday();
  let newCurrentStreak: number;

  if (prev.lastActivityDate === yesterday) {
    // Consecutive day
    newCurrentStreak = prev.currentStreak + 1;
  } else if (prev.lastActivityDate === dayBeforeYesterday) {
    // Grace period: 1 day missed, keep streak alive
    newCurrentStreak = prev.currentStreak + 1;
  } else if (prev.lastActivityDate === '') {
    // First activity ever
    newCurrentStreak = 1;
  } else {
    // Streak broken (3+ days missed)
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(prev.longestStreak, newCurrentStreak);

  return {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
  };
}

/** Check if the user is currently in the 1-day grace period */
export function isGracePeriod(lastActivityDate: string): boolean {
  if (!lastActivityDate) return false;
  const today = getDateString();
  if (lastActivityDate === today) return false;
  const yesterday = getYesterday();
  if (lastActivityDate === yesterday) return false;
  const dayBeforeYesterday = getDayBeforeYesterday();
  return lastActivityDate === dayBeforeYesterday;
}

export function getTodayString(): string {
  return getDateString();
}
