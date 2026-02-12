import { useState, useCallback, useRef } from 'react';
import type { TestResult } from '../types/stats';
import type { TestState } from '../types/test';
import type {
  PlayerProfile,
  AchievementsState,
  StreakState,
  KeyStatsMap,
  XpGain,
  ToastNotification,
} from '../types/gamification';
import { getItem, setItem } from '../utils/storage';
import { createDefaultProfile, levelFromXp, getRank, XP_SHARE_BONUS } from '../constants/gamification';
import { getAchievementDef } from '../constants/achievements';
import { calculateXpGain } from '../utils/xp';
import { checkNewAchievements } from '../utils/achievements';
import { updateStreak, createDefaultStreak } from '../utils/streak';
import { extractKeyStats, mergeKeyStats } from '../utils/keyAnalysis';

const PROFILE_KEY = 'profile';
const ACHIEVEMENTS_KEY = 'achievements';
const STREAK_KEY = 'streak';
const KEY_STATS_KEY = 'key_stats';
const LAST_SHARE_DATE_KEY = 'ducktype_last_share_date';

export function useGamification() {
  const [profile, setProfile] = useState<PlayerProfile>(() =>
    getItem<PlayerProfile>(PROFILE_KEY, createDefaultProfile())
  );
  const [achievements, setAchievements] = useState<AchievementsState>(() => {
    const stored = getItem<AchievementsState>(ACHIEVEMENTS_KEY, { unlocked: [] });
    if (!Array.isArray(stored.unlocked)) return { unlocked: [] };
    return stored;
  });
  const [streak, setStreak] = useState<StreakState>(() =>
    getItem<StreakState>(STREAK_KEY, createDefaultStreak())
  );
  const [keyStats, setKeyStats] = useState<KeyStatsMap>(() =>
    getItem<KeyStatsMap>(KEY_STATS_KEY, {})
  );

  const [lastXpGain, setLastXpGain] = useState<XpGain | null>(null);
  const [lastNewAchievements, setLastNewAchievements] = useState<string[]>([]);

  // Collect unique languages from history for polyglot achievement
  const languagesRef = useRef<Set<string>>(new Set(
    getItem<TestResult[]>('history', []).map(r => r.language)
  ));

  const processTestResult = useCallback((
    result: TestResult,
    testState: TestState,
    isDailyChallenge: boolean,
    addToast: (toast: Omit<ToastNotification, 'id'>) => void,
    dailyChallengeState?: import('../types/gamification').DailyChallengeState,
    lessonProgress?: import('../types/gamification').LessonProgressMap,
    userId?: string | null,
  ) => {
    // 1. Update streak
    const newStreak = updateStreak(streak);

    // 2. Calculate XP
    const elapsed = result.wpmHistory.length > 0
      ? result.wpmHistory[result.wpmHistory.length - 1].time
      : 0;
    const xpGain = calculateXpGain(
      result.wpm,
      result.accuracy,
      elapsed,
      newStreak.currentStreak,
      isDailyChallenge
    );

    // 3. Update profile
    const newTotalXp = profile.totalXp + xpGain.total;
    const oldLevel = profile.level;
    const newLevel = levelFromXp(newTotalXp);

    const newProfile: PlayerProfile = {
      ...profile,
      totalXp: newTotalXp,
      level: newLevel,
      testsCompleted: profile.testsCompleted + 1,
      totalTimeTyping: profile.totalTimeTyping + elapsed,
    };

    // 4. Extract and merge key stats
    const newKeyStatsFromTest = extractKeyStats(testState);
    const mergedKeyStats = mergeKeyStats(keyStats, newKeyStatsFromTest);

    // 5. Track languages
    languagesRef.current.add(result.language);

    // 6. Check achievements
    const newAchievementIds = checkNewAchievements(achievements, {
      result,
      profile: newProfile,
      streak: newStreak,
      dailyChallenge: dailyChallengeState || { results: [], currentStreak: 0, longestStreak: 0 },
      lessonProgress: lessonProgress || {},
      allLanguages: languagesRef.current,
      userId,
    });

    const newAchievementsState: AchievementsState = {
      unlocked: [
        ...achievements.unlocked,
        ...newAchievementIds.map(id => ({ id, unlockedAt: Date.now() })),
      ],
    };

    // 7. Adventure promo toast (first test only)
    if (profile.testsCompleted === 0 && !localStorage.getItem('ducktype_adventure_promo_shown')) {
      localStorage.setItem('ducktype_adventure_promo_shown', '1');
      setTimeout(() => {
        addToast({
          type: 'info',
          title: 'Try Adventure Mode!',
          message: 'Fight monsters with your typing skills ⚔️',
          icon: '🗺️',
        });
      }, 1500);
    }

    // 8. Generate toasts
    if (newLevel > oldLevel) {
      const rank = getRank(newLevel);
      addToast({
        type: 'levelup',
        title: `Level ${newLevel}!`,
        message: `${rank.emoji} ${rank.name}`,
        icon: rank.emoji,
      });
    }

    for (const achId of newAchievementIds) {
      const def = getAchievementDef(achId);
      if (def) {
        addToast({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${def.icon} ${def.name}`,
          icon: def.icon,
        });
      }
    }

    // 9. Save to localStorage
    setProfile(newProfile);
    setAchievements(newAchievementsState);
    setStreak(newStreak);
    setKeyStats(mergedKeyStats);
    setLastXpGain(xpGain);
    setLastNewAchievements(newAchievementIds);

    setItem(PROFILE_KEY, newProfile);
    setItem(ACHIEVEMENTS_KEY, newAchievementsState);
    setItem(STREAK_KEY, newStreak);
    setItem(KEY_STATS_KEY, mergedKeyStats);

    return { xpGain, newAchievementIds, newLevel, oldLevel };
  }, [profile, achievements, streak, keyStats]);

  const awardShareBonus = useCallback((
    addToast: (toast: Omit<ToastNotification, 'id'>) => void,
  ): boolean => {
    // Daily limit: check if already awarded today
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const lastShareDate = localStorage.getItem(LAST_SHARE_DATE_KEY);
    if (lastShareDate === today) {
      // Calculate hours until midnight
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const hoursLeft = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
      addToast({
        type: 'info',
        title: 'Share Bonus Claimed',
        message: hoursLeft <= 1
          ? 'Resets in less than 1 hour!'
          : `Resets in ~${hoursLeft} hours`,
        icon: '⏳',
      });
      return false;
    }

    // Award XP
    const newTotalXp = profile.totalXp + XP_SHARE_BONUS;
    const oldLevel = profile.level;
    const newLevel = levelFromXp(newTotalXp);

    const newProfile: PlayerProfile = {
      ...profile,
      totalXp: newTotalXp,
      level: newLevel,
    };

    // Save share date
    localStorage.setItem(LAST_SHARE_DATE_KEY, today);

    // Check "first-share" achievement
    const unlockedIds = new Set(achievements.unlocked.map(a => a.id));
    const newAchievementIds: string[] = [];
    if (!unlockedIds.has('first-share')) {
      newAchievementIds.push('first-share');
    }

    const newAchievementsState: AchievementsState = {
      unlocked: [
        ...achievements.unlocked,
        ...newAchievementIds.map(id => ({ id, unlockedAt: Date.now() })),
      ],
    };

    // Update state
    setProfile(newProfile);
    setAchievements(newAchievementsState);
    setItem(PROFILE_KEY, newProfile);
    setItem(ACHIEVEMENTS_KEY, newAchievementsState);

    // Update lastXpGain to reflect share bonus
    if (lastXpGain) {
      const updatedXpGain = {
        ...lastXpGain,
        shareBonus: XP_SHARE_BONUS,
        total: lastXpGain.total + XP_SHARE_BONUS,
      };
      setLastXpGain(updatedXpGain);
    }

    // Toasts
    addToast({
      type: 'xp',
      title: `+${XP_SHARE_BONUS} XP`,
      message: 'Share Bonus!',
      icon: '📢',
    });

    if (newLevel > oldLevel) {
      const rank = getRank(newLevel);
      addToast({
        type: 'levelup',
        title: `Level ${newLevel}!`,
        message: `${rank.emoji} ${rank.name}`,
        icon: rank.emoji,
      });
    }

    for (const achId of newAchievementIds) {
      const def = getAchievementDef(achId);
      if (def) {
        addToast({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${def.icon} ${def.name}`,
          icon: def.icon,
        });
      }
    }

    return true;
  }, [profile, achievements, lastXpGain]);

  const addXp = useCallback((amount: number) => {
    const newTotalXp = profile.totalXp + amount;
    const newLevel = levelFromXp(newTotalXp);
    const newProfile: PlayerProfile = { ...profile, totalXp: newTotalXp, level: newLevel };
    setProfile(newProfile);
    setItem(PROFILE_KEY, newProfile);
  }, [profile]);

  const unlockAchievements = useCallback((
    ids: string[],
    addToast: (toast: Omit<ToastNotification, 'id'>) => void,
  ) => {
    const unlockedIds = new Set(achievements.unlocked.map(a => a.id));
    const newIds = ids.filter(id => !unlockedIds.has(id));
    if (newIds.length === 0) return;

    const newAchievementsState: AchievementsState = {
      unlocked: [
        ...achievements.unlocked,
        ...newIds.map(id => ({ id, unlockedAt: Date.now() })),
      ],
    };

    setAchievements(newAchievementsState);
    setItem(ACHIEVEMENTS_KEY, newAchievementsState);

    for (const achId of newIds) {
      const def = getAchievementDef(achId);
      if (def) {
        addToast({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${def.icon} ${def.name}`,
          icon: def.icon,
        });
      }
    }
  }, [achievements]);

  return {
    profile,
    achievements,
    streak,
    keyStats,
    lastXpGain,
    lastNewAchievements,
    processTestResult,
    awardShareBonus,
    addXp,
    unlockAchievements,
  };
}
