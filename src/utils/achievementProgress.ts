import { ACHIEVEMENTS } from '../constants/achievements';
import type { TestResult } from '../types/stats';
import type { StreakState } from '../types/gamification';

export interface NextAchievement {
  id: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  progress: number; // 0~1
}

interface ProgressContext {
  result: TestResult;
  testsCompleted: number;
  streak: StreakState;
  unlockedIds: Set<string>;
}

function getAchievementProgress(id: string, ctx: ProgressContext): { current: number; target: number; unit: string } | null {
  const { result, testsCompleted, streak } = ctx;

  // Speed achievements
  if (id === 'speed-50') return { current: result.wpm, target: 50, unit: 'WPM' };
  if (id === 'speed-75') return { current: result.wpm, target: 75, unit: 'WPM' };
  if (id === 'speed-100') return { current: result.wpm, target: 100, unit: 'WPM' };
  if (id === 'speed-125') return { current: result.wpm, target: 125, unit: 'WPM' };
  if (id === 'speed-150') return { current: result.wpm, target: 150, unit: 'WPM' };

  // Accuracy achievements
  if (id === 'acc-95') return { current: result.accuracy, target: 95, unit: '%' };
  if (id === 'acc-98') return { current: result.accuracy, target: 98, unit: '%' };
  if (id === 'acc-100') return { current: result.accuracy, target: 100, unit: '%' };

  // Consistency achievements
  if (id === 'cons-90') return { current: result.consistency, target: 90, unit: '%' };
  if (id === 'cons-95') return { current: result.consistency, target: 95, unit: '%' };

  // Volume achievements
  if (id === 'tests-1') return { current: testsCompleted, target: 1, unit: '' };
  if (id === 'tests-10') return { current: testsCompleted, target: 10, unit: '' };
  if (id === 'tests-50') return { current: testsCompleted, target: 50, unit: '' };
  if (id === 'tests-100') return { current: testsCompleted, target: 100, unit: '' };
  if (id === 'tests-500') return { current: testsCompleted, target: 500, unit: '' };
  if (id === 'tests-1000') return { current: testsCompleted, target: 1000, unit: '' };

  // Streak achievements
  if (id === 'streak-3') return { current: streak.currentStreak, target: 3, unit: '' };
  if (id === 'streak-7') return { current: streak.currentStreak, target: 7, unit: '' };
  if (id === 'streak-14') return { current: streak.currentStreak, target: 14, unit: '' };
  if (id === 'streak-30') return { current: streak.currentStreak, target: 30, unit: '' };
  if (id === 'streak-100') return { current: streak.currentStreak, target: 100, unit: '' };

  return null;
}

export function getNextAchievement(
  result: TestResult,
  testsCompleted: number,
  streak: StreakState,
  unlockedIds: string[],
): NextAchievement | null {
  const unlockedSet = new Set(unlockedIds);
  const ctx: ProgressContext = { result, testsCompleted, streak, unlockedIds: unlockedSet };

  let best: NextAchievement | null = null;

  for (const ach of ACHIEVEMENTS) {
    if (unlockedSet.has(ach.id)) continue;

    const prog = getAchievementProgress(ach.id, ctx);
    if (!prog) continue;

    const progress = Math.min(prog.current / prog.target, 1);

    if (!best || progress > best.progress) {
      best = {
        id: ach.id,
        name: ach.name,
        icon: ach.icon,
        current: Math.min(prog.current, prog.target),
        target: prog.target,
        unit: prog.unit,
        progress,
      };
    }
  }

  return best;
}
