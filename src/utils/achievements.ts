import type { TestResult } from '../types/stats';
import type { PlayerProfile, AchievementsState, StreakState, DailyChallengeState, LessonProgressMap } from '../types/gamification';
import { ACHIEVEMENTS } from '../constants/achievements';
import { LESSONS } from '../constants/lessons';
import { getEffectiveLevel } from './admin';

interface CheckContext {
  result: TestResult;
  profile: PlayerProfile;
  streak: StreakState;
  dailyChallenge: DailyChallengeState;
  lessonProgress: LessonProgressMap;
  allLanguages: Set<string>;
  hasShared?: boolean;
  userId?: string | null;
}

function checkAchievement(id: string, ctx: CheckContext): boolean {
  const { result, profile, streak, dailyChallenge, lessonProgress } = ctx;

  switch (id) {
    // Speed
    case 'speed-50': return result.wpm >= 50;
    case 'speed-75': return result.wpm >= 75;
    case 'speed-100': return result.wpm >= 100;
    case 'speed-125': return result.wpm >= 125;
    case 'speed-150': return result.wpm >= 150;

    // Accuracy
    case 'acc-95': return result.accuracy >= 95;
    case 'acc-98': return result.accuracy >= 98;
    case 'acc-100': return result.accuracy >= 100;

    // Consistency
    case 'cons-90': return result.consistency >= 90;
    case 'cons-95': return result.consistency >= 95;

    // Volume
    case 'tests-1': return profile.testsCompleted >= 1;
    case 'tests-10': return profile.testsCompleted >= 10;
    case 'tests-50': return profile.testsCompleted >= 50;
    case 'tests-100': return profile.testsCompleted >= 100;
    case 'tests-500': return profile.testsCompleted >= 500;
    case 'tests-1000': return profile.testsCompleted >= 1000;

    // Streak
    case 'streak-3': return streak.currentStreak >= 3;
    case 'streak-7': return streak.currentStreak >= 7;
    case 'streak-14': return streak.currentStreak >= 14;
    case 'streak-30': return streak.currentStreak >= 30;
    case 'streak-100': return streak.currentStreak >= 100;

    // Special
    case 'night-owl': {
      const hour = new Date(result.timestamp).getHours();
      return hour >= 22 || hour < 4;
    }
    case 'early-bird': {
      const hour = new Date(result.timestamp).getHours();
      return hour >= 5 && hour < 7;
    }
    case 'marathon':
      return result.mode === 'time' && result.modeValue >= 120 && result.wpm >= 100;
    case 'perfectionist':
      return result.accuracy >= 100 && result.wpm >= 50;
    case 'polyglot':
      return ctx.allLanguages.size >= 2;
    case 'daily-7':
      return dailyChallenge.currentStreak >= 7;
    case 'level-25': return getEffectiveLevel(profile.level, ctx.userId) >= 25;
    case 'level-50': return getEffectiveLevel(profile.level, ctx.userId) >= 50;
    case 'level-100': return getEffectiveLevel(profile.level, ctx.userId) >= 100;
    case 'all-lessons': {
      const mainLessons = LESSONS.filter(l => l.id !== 'weak-keys');
      return mainLessons.every(l => lessonProgress[l.id]?.completedAt != null);
    }
    case 'first-share': return !!ctx.hasShared;

    default: return false;
  }
}

export function checkNewAchievements(
  currentState: AchievementsState,
  ctx: CheckContext
): string[] {
  const unlockedIds = new Set(currentState.unlocked.map(a => a.id));
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (checkAchievement(achievement.id, ctx)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}
