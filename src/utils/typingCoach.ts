import type { TestResult } from '../types/stats';
import type { KeyStats } from '../types/gamification';

export interface CoachTip {
  id: string;
  icon: string;
  title: string;     // i18n key
  message: string;   // i18n key
  priority: number;  // higher = show first
}

export function generateCoachTips(
  result: TestResult,
  weakKeys: KeyStats[],
  recentHistory: TestResult[],
): CoachTip[] {
  const tips: CoachTip[] = [];

  // 1. Speed analysis
  if (result.wpm < 30) {
    tips.push({
      id: 'speed-beginner',
      icon: '🐣',
      title: 'coach.speedBeginner',
      message: 'coach.speedBeginnerMsg',
      priority: 10,
    });
  } else if (result.wpm >= 80 && result.accuracy < 92) {
    tips.push({
      id: 'speed-vs-accuracy',
      icon: '🎯',
      title: 'coach.slowDown',
      message: 'coach.slowDownMsg',
      priority: 9,
    });
  }

  // 2. Accuracy feedback
  if (result.accuracy >= 98) {
    tips.push({
      id: 'accuracy-great',
      icon: '💎',
      title: 'coach.accuracyGreat',
      message: 'coach.accuracyGreatMsg',
      priority: 5,
    });
  } else if (result.accuracy < 90) {
    tips.push({
      id: 'accuracy-low',
      icon: '⚠️',
      title: 'coach.accuracyLow',
      message: 'coach.accuracyLowMsg',
      priority: 8,
    });
  }

  // 3. Consistency analysis
  if (result.consistency < 60) {
    tips.push({
      id: 'consistency-low',
      icon: '📊',
      title: 'coach.consistencyLow',
      message: 'coach.consistencyLowMsg',
      priority: 7,
    });
  } else if (result.consistency >= 90) {
    tips.push({
      id: 'consistency-great',
      icon: '🎵',
      title: 'coach.consistencyGreat',
      message: 'coach.consistencyGreatMsg',
      priority: 4,
    });
  }

  // 4. Weak keys (top 3)
  if (weakKeys.length > 0) {
    tips.push({
      id: 'weak-keys',
      icon: '🔑',
      title: 'coach.weakKeys',
      message: 'coach.weakKeysMsg',
      priority: 8,
    });
  }

  // 5. Trend analysis (compare with recent history)
  if (recentHistory.length >= 3) {
    const recentAvg = recentHistory.slice(0, 5).reduce((s, r) => s + r.wpm, 0) / Math.min(recentHistory.length, 5);
    const diff = result.wpm - recentAvg;

    if (diff >= 5) {
      tips.push({
        id: 'trend-improving',
        icon: '📈',
        title: 'coach.improving',
        message: 'coach.improvingMsg',
        priority: 6,
      });
    } else if (diff <= -10) {
      tips.push({
        id: 'trend-declining',
        icon: '💤',
        title: 'coach.takeBreak',
        message: 'coach.takeBreakMsg',
        priority: 7,
      });
    }
  }

  // 6. Raw vs Net WPM gap (too many errors)
  const wpmGap = result.rawWpm - result.wpm;
  if (wpmGap > 15) {
    tips.push({
      id: 'error-heavy',
      icon: '🔧',
      title: 'coach.tooManyErrors',
      message: 'coach.tooManyErrorsMsg',
      priority: 9,
    });
  }

  // Sort by priority (highest first), return top 3
  return tips.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
