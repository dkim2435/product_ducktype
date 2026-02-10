import type { StreakState } from '../types/gamification';

function getDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
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
  let newCurrentStreak: number;

  if (prev.lastActivityDate === yesterday) {
    // Consecutive day
    newCurrentStreak = prev.currentStreak + 1;
  } else if (prev.lastActivityDate === '') {
    // First activity ever
    newCurrentStreak = 1;
  } else {
    // Streak broken
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(prev.longestStreak, newCurrentStreak);

  return {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActivityDate: today,
  };
}

export function getTodayString(): string {
  return getDateString();
}
