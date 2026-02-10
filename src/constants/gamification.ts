import type { DuckRank } from '../types/gamification';

// ---- XP Formula Constants ----
export const XP_WPM_MULTIPLIER = 0.5;
export const XP_ACCURACY_BONUS_THRESHOLD = 90; // accuracy >= 90% gets bonus
export const XP_ACCURACY_BONUS_MULTIPLIER = 0.5; // +50% of base
export const XP_STREAK_BONUS_PER_DAY = 0.05; // 5% per streak day
export const XP_STREAK_BONUS_MAX = 0.5; // max 50%
export const XP_DAILY_CHALLENGE_BONUS = 50;

// Length bonus: 15s = 1x, 120s = 2x (linear interpolation)
export const XP_LENGTH_MIN_SECONDS = 15;
export const XP_LENGTH_MAX_SECONDS = 120;
export const XP_LENGTH_MIN_MULTIPLIER = 1;
export const XP_LENGTH_MAX_MULTIPLIER = 2;

// ---- Level System ----
// XP needed to reach level N: 100 * (N-1)^1.5
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp && level < 100) {
    level++;
  }
  return level;
}

export function xpToNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const level = levelFromXp(totalXp);
  if (level >= 100) return { current: 0, needed: 0, progress: 1 };
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const needed = nextLevelXp - currentLevelXp;
  const current = totalXp - currentLevelXp;
  return { current, needed, progress: needed > 0 ? current / needed : 1 };
}

// ---- Rank System ----
interface RankDef {
  name: DuckRank;
  emoji: string;
  minLevel: number;
}

const RANKS: RankDef[] = [
  { name: 'Egg', emoji: '🥚', minLevel: 1 },
  { name: 'Duckling', emoji: '🐣', minLevel: 5 },
  { name: 'Fledgling', emoji: '🐥', minLevel: 10 },
  { name: 'Mallard', emoji: '🦆', minLevel: 20 },
  { name: 'Teal', emoji: '🦢', minLevel: 30 },
  { name: 'Mandarin', emoji: '🌈', minLevel: 40 },
  { name: 'Golden Duck', emoji: '✨', minLevel: 50 },
  { name: 'Diamond Duck', emoji: '💎', minLevel: 65 },
  { name: 'Legendary Duck', emoji: '🔥', minLevel: 80 },
  { name: 'Duck King', emoji: '👑', minLevel: 95 },
];

export function getRank(level: number): { name: DuckRank; emoji: string } {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return { name: rank.name, emoji: rank.emoji };
}

// ---- Default Profile ----
export function createDefaultProfile(): import('../types/gamification').PlayerProfile {
  return {
    totalXp: 0,
    level: 1,
    testsCompleted: 0,
    totalTimeTyping: 0,
    joinedAt: Date.now(),
  };
}
