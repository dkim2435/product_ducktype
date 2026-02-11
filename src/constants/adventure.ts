import type {
  WorldConfig,
  StageConfig,
  WaveConfig,
  EnemyConfig,
  BossConfig,
  StarThresholds,
} from '../types/adventure';

// ---- Player Constants ----
export const PLAYER_MAX_HP = 100;
export const PLAYER_BASE_DAMAGE = 10;

// ---- Damage Formula Constants ----
export const WPM_BASE = 40;
export const WPM_SCALE = 0.015;
export const WPM_MULT_MIN = 0.5;
export const COMBO_SCALE = 0.1;
export const COMBO_MULT_MAX = 3.0;
export const ACCURACY_BONUS_THRESHOLD = 0.95;
export const ACCURACY_BONUS_MULT = 1.2;

// ---- Timing ----
export const COUNTDOWN_SECONDS = 3;
export const WAVE_CLEAR_DELAY_MS = 1500;
export const BOSS_TRANSITION_DELAY_MS = 2000;
export const DAMAGE_NUMBER_DURATION_MS = 1200;
export const WORD_SPAWN_INITIAL_DELAY_MS = 800;

// ---- Star Thresholds ----
export const STAR_THRESHOLDS: StarThresholds = {
  one: { minAccuracy: 0, minHpPercent: 0 },
  two: { minAccuracy: 0.80, minHpPercent: 0.30, minWpm: 30 },
  three: { minAccuracy: 0.92, minHpPercent: 0.60, minWpm: 50 },
};

// ---- Calculate Damage ----
export function calculateDamage(
  wordWpm: number,
  combo: number,
  overallAccuracy: number,
): number {
  const wpmMult = Math.max(WPM_MULT_MIN, 1 + (wordWpm - WPM_BASE) * WPM_SCALE);
  const comboMult = Math.min(COMBO_MULT_MAX, 1 + combo * COMBO_SCALE);
  const accBonus = overallAccuracy >= ACCURACY_BONUS_THRESHOLD ? ACCURACY_BONUS_MULT : 1.0;
  return Math.round(PLAYER_BASE_DAMAGE * wpmMult * comboMult * accBonus);
}

// ---- Calculate Stars ----
export function calculateStars(
  accuracy: number,
  hpPercent: number,
  wpm: number,
): number {
  if (
    accuracy >= STAR_THRESHOLDS.three.minAccuracy &&
    hpPercent >= STAR_THRESHOLDS.three.minHpPercent &&
    wpm >= STAR_THRESHOLDS.three.minWpm
  ) return 3;
  if (
    accuracy >= STAR_THRESHOLDS.two.minAccuracy &&
    hpPercent >= STAR_THRESHOLDS.two.minHpPercent &&
    wpm >= STAR_THRESHOLDS.two.minWpm
  ) return 2;
  return 1;
}

// ---- Enemy Definitions ----
const WOLF_PUP: EnemyConfig = {
  name: 'Wolf Pup',
  emoji: '🐺',
  hp: 80,
  attackDamage: 8,
};

const WOLF_SCOUT: EnemyConfig = {
  name: 'Wolf Scout',
  emoji: '🐺',
  hp: 120,
  attackDamage: 10,
};

const WOLF_WARRIOR: EnemyConfig = {
  name: 'Wolf Warrior',
  emoji: '🐺',
  hp: 180,
  attackDamage: 12,
};

const WOLF_ALPHA: EnemyConfig = {
  name: 'Wolf Alpha',
  emoji: '🐺',
  hp: 250,
  attackDamage: 14,
};

const SHADOW_WOLF: EnemyConfig = {
  name: 'Shadow Wolf',
  emoji: '🐺',
  hp: 400,
  attackDamage: 15,
};

// ---- Boss Config ----
const SHADOW_WOLF_BOSS: BossConfig = {
  phases: [
    {
      hpThreshold: 1.0, // Phase 1: 100% - 60%
      wordDifficulty: { minLen: 3, maxLen: 5 },
      spawnInterval: 3000,
      dialogue: '"You dare challenge me, little duck?"',
    },
    {
      hpThreshold: 0.6, // Phase 2: 60% - 25%
      wordDifficulty: { minLen: 4, maxLen: 7 },
      spawnInterval: 2200,
      dialogue: '"Not bad... but I\'m just getting started!"',
    },
    {
      hpThreshold: 0.25, // Phase 3: 25% - 0%
      wordDifficulty: { minLen: 5, maxLen: 9 },
      spawnInterval: 1500,
      dialogue: '"ENOUGH! Feel the full power of the Shadow Pack!"',
    },
  ],
};

// ---- Wave Helpers ----
function makeWaves(
  count: number,
  wordsPerWave: number,
  difficulty: { minLen: number; maxLen: number },
  spawnInterval: number,
  timeoutMs: number,
): WaveConfig[] {
  return Array.from({ length: count }, () => ({
    wordDifficulty: { ...difficulty },
    wordCount: wordsPerWave,
    spawnInterval,
    timeoutMs,
  }));
}

// ---- Stage Definitions ----
const STAGE_1: StageConfig = {
  id: 1,
  name: 'Forest Edge',
  subtitle: 'The wolves appear at the forest border...',
  enemyConfig: WOLF_PUP,
  waves: makeWaves(3, 4, { minLen: 2, maxLen: 4 }, 3200, 8000),
  xpReward: 50,
  isBoss: false,
};

const STAGE_2: StageConfig = {
  id: 2,
  name: 'Village Bridge',
  subtitle: 'Scouts guard the bridge to the village.',
  enemyConfig: WOLF_SCOUT,
  waves: makeWaves(4, 4, { minLen: 3, maxLen: 5 }, 2800, 7000),
  xpReward: 75,
  isBoss: false,
};

const STAGE_3: StageConfig = {
  id: 3,
  name: 'Town Square',
  subtitle: 'Warriors storm the town center!',
  enemyConfig: WOLF_WARRIOR,
  waves: makeWaves(4, 5, { minLen: 5, maxLen: 7 }, 2500, 6500),
  xpReward: 100,
  isBoss: false,
};

const STAGE_4: StageConfig = {
  id: 4,
  name: "Elder's Garden",
  subtitle: 'The Alpha leads the final assault.',
  enemyConfig: WOLF_ALPHA,
  waves: makeWaves(5, 5, { minLen: 6, maxLen: 8 }, 2200, 6000),
  xpReward: 125,
  isBoss: false,
};

const STAGE_5_BOSS: StageConfig = {
  id: 5,
  name: "Shadow Wolf's Lair",
  subtitle: 'Face the Shadow Wolf and save the village!',
  enemyConfig: SHADOW_WOLF,
  waves: [
    // Boss uses phase-based spawning, but we need one "wave" entry per phase
    { wordDifficulty: { minLen: 3, maxLen: 5 }, wordCount: 99, spawnInterval: 3000, timeoutMs: 7000 },
    { wordDifficulty: { minLen: 4, maxLen: 7 }, wordCount: 99, spawnInterval: 2200, timeoutMs: 6000 },
    { wordDifficulty: { minLen: 5, maxLen: 9 }, wordCount: 99, spawnInterval: 1500, timeoutMs: 5000 },
  ],
  xpReward: 250,
  isBoss: true,
  bossConfig: SHADOW_WOLF_BOSS,
};

// ---- World 1 ----
export const WORLD_1: WorldConfig = {
  id: 1,
  name: 'Duck Village',
  stages: [STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5_BOSS],
  requiresLogin: false,
};

// ---- All Worlds (for future expansion) ----
export const WORLDS: WorldConfig[] = [WORLD_1];

// ---- Helper: pick word from list by length ----
export function pickWordByLength(
  words: string[],
  minLen: number,
  maxLen: number,
): string {
  const filtered = words.filter(w => w.length >= minLen && w.length <= maxLen);
  const pool = filtered.length > 0 ? filtered : words;
  return pool[Math.floor(Math.random() * pool.length)];
}
