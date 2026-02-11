// ---- Player Profile ----
export interface PlayerProfile {
  totalXp: number;
  level: number;
  testsCompleted: number;
  totalTimeTyping: number; // seconds
  joinedAt: number; // timestamp
}

// ---- XP ----
export interface XpGain {
  base: number;
  accuracyBonus: number;
  lengthBonus: number;
  streakBonus: number;
  dailyChallengeBonus: number;
  shareBonus: number;
  total: number;
}

// ---- Duck Ranks ----
export type DuckRank =
  | 'Egg'
  | 'Duckling'
  | 'Fledgling'
  | 'Mallard'
  | 'Teal'
  | 'Mandarin'
  | 'Golden Duck'
  | 'Diamond Duck'
  | 'Legendary Duck'
  | 'Duck King'
  | 'Creator';

// ---- Achievements ----
export type AchievementCategory =
  | 'speed'
  | 'accuracy'
  | 'consistency'
  | 'volume'
  | 'streak'
  | 'special';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // timestamp
}

export interface AchievementsState {
  unlocked: UnlockedAchievement[];
}

// ---- Daily Challenge ----
export interface DailyChallengeResult {
  date: string; // YYYY-MM-DD
  wpm: number;
  accuracy: number;
  completedAt: number;
}

export interface DailyChallengeState {
  results: DailyChallengeResult[];
  currentStreak: number;
  longestStreak: number;
}

// ---- Streak ----
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
}

// ---- Key Stats ----
export interface KeyStats {
  key: string;
  totalAttempts: number;
  errors: number;
  errorRate: number; // 0-1
}

export type KeyStatsMap = Record<string, KeyStats>;

// ---- Lessons ----
export type LessonId =
  | 'home-row'
  | 'top-row'
  | 'bottom-row'
  | 'home-top'
  | 'home-bottom'
  | 'all-alpha'
  | 'number-row'
  | 'full-keyboard'
  | 'weak-keys';

export interface LessonDef {
  id: LessonId;
  name: string;
  description: string;
  targetKeys: string[];
  prerequisite: LessonId | null;
}

export interface LessonProgress {
  lessonId: LessonId;
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  completedAt: number | null; // timestamp of first completion
}

export type LessonProgressMap = Record<string, LessonProgress>;

// ---- Toast ----
export type ToastType = 'xp' | 'achievement' | 'levelup' | 'streak' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon?: string;
}
