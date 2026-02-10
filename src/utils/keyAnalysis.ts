import type { TestState } from '../types/test';
import type { KeyStats, KeyStatsMap } from '../types/gamification';

/**
 * Extract per-key stats from a completed test.
 * We look at each letter in each word and track attempts/errors.
 */
export function extractKeyStats(testState: TestState): KeyStatsMap {
  const stats: KeyStatsMap = {};

  for (const word of testState.words) {
    for (const letter of word.letters) {
      if (letter.state === 'pending') continue; // untouched
      if (letter.state === 'extra') continue; // extra chars don't map to a specific key

      const key = letter.char.toLowerCase();
      if (!stats[key]) {
        stats[key] = { key, totalAttempts: 0, errors: 0, errorRate: 0 };
      }
      stats[key].totalAttempts++;
      if (letter.state === 'incorrect') {
        stats[key].errors++;
      }
    }
  }

  // Calculate error rates
  for (const k of Object.keys(stats)) {
    const s = stats[k];
    s.errorRate = s.totalAttempts > 0 ? s.errors / s.totalAttempts : 0;
  }

  return stats;
}

/**
 * Merge new key stats into cumulative stats.
 */
export function mergeKeyStats(cumulative: KeyStatsMap, incoming: KeyStatsMap): KeyStatsMap {
  const merged = { ...cumulative };

  for (const [key, stat] of Object.entries(incoming)) {
    if (!merged[key]) {
      merged[key] = { ...stat };
    } else {
      merged[key] = {
        key,
        totalAttempts: merged[key].totalAttempts + stat.totalAttempts,
        errors: merged[key].errors + stat.errors,
        errorRate: 0,
      };
    }
    // Recalculate error rate
    merged[key].errorRate = merged[key].totalAttempts > 0
      ? merged[key].errors / merged[key].totalAttempts
      : 0;
  }

  return merged;
}

/**
 * Get the top N weakest keys (highest error rate), with minimum attempts threshold.
 */
export function getWeakKeys(keyStats: KeyStatsMap, count: number = 5, minAttempts: number = 10): KeyStats[] {
  return Object.values(keyStats)
    .filter(s => s.totalAttempts >= minAttempts && s.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, count);
}
