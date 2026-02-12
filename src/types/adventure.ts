// ---- Debuff System ----
export type DebuffType = 'none' | 'poison' | 'fog' | 'freeze' | 'darkness' | 'reverse';

export interface WorldDebuff {
  type: DebuffType;
  intensity: number;
  description: string;
  icon: string;
}

// ---- Word Difficulty ----
export interface WordDifficulty {
  minLen: number;
  maxLen: number;
}

// ---- Enemy Config ----
export interface EnemyConfig {
  name: string;
  emoji: string;
  hp: number;          // boss HP (unused for normal minion stages)
  attackDamage: number; // damage on timeout
}

// ---- Boss Phase Config ----
export interface BossPhaseConfig {
  hpThreshold: number;
  bossWordDifficulty: WordDifficulty;
  bossWordTimeoutMs: number;
  bossWordsCount: number;      // how many boss words to spawn simultaneously (1, 2, 3)
  minionWordDifficulty: WordDifficulty;
  minionTimeoutMs: number;
  minionsPerWave: number;
  dialogue: string;
}

// ---- Boss Config ----
export interface BossConfig {
  minionEmoji: string;
  minionAttackDamage: number;
  phases: BossPhaseConfig[];
}

// ---- Wave Config ----
export interface WaveConfig {
  wordDifficulty: WordDifficulty;
  wordCount: number;
  spawnInterval: number;
  timeoutMs: number;
}

// ---- Stage Config ----
export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  enemyConfig: EnemyConfig;
  waves: WaveConfig[];
  xpReward: number;
  isBoss: boolean;
  isMidBoss?: boolean;
  bossConfig?: BossConfig;
}

// ---- World Config ----
export interface WorldConfig {
  id: number;
  name: string;
  stages: StageConfig[];
  requiresLogin: boolean;
  debuff?: WorldDebuff;
}

// ---- Star Thresholds ----
export interface StarThresholds {
  one: { minAccuracy: number; minHpPercent: number };
  two: { minAccuracy: number; minHpPercent: number; minWpm: number };
  three: { minAccuracy: number; minHpPercent: number; minWpm: number };
}

// ---- Field Minion (on battlefield) ----
export interface FieldMinion {
  id: number;
  word: string;
  spawnedAt: number;
  timeoutMs: number;
  x: number; // percentage on field (0-100)
  y: number; // percentage on field (0=top/far, 100=bottom/near)
  isBossWord?: boolean; // true = typing this damages the boss
}

// ---- Combat Phase ----
export type CombatPhase =
  | 'intro'
  | 'countdown'
  | 'fighting'
  | 'wave-clear'
  | 'boss-transition'
  | 'victory'
  | 'defeat';

// ---- Damage Number (floating) ----
export interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  createdAt: number;
  isPlayer: boolean;
}

// ---- Kill Effect ----
export interface KillEffect {
  id: number;
  x: number;
  y: number;
  createdAt: number;
}

// ---- Combat State ----
export interface CombatState {
  phase: CombatPhase;
  stageConfig: StageConfig;
  currentWave: number;

  playerHp: number;
  playerMaxHp: number;

  // Debuff
  activeDebuff: DebuffType;
  poisonLastTick: number | null;

  // Field minions
  minions: FieldMinion[];

  // Boss state (only for boss stages)
  bossHp: number;
  bossMaxHp: number;
  bossPhase: number;
  bossDialogue: string | null;

  // Input
  currentInput: string;
  matchedMinionId: number | null;

  // Stats
  combo: number;
  maxCombo: number;
  totalWordsTyped: number;
  totalCharsTyped: number;
  correctChars: number;
  totalKeystrokes: number;

  startTime: number | null;
  endTime: number | null;

  // Visual effects
  damageNumbers: DamageNumber[];
  killEffects: KillEffect[];
}

// ---- Stage Result ----
export interface StageResult {
  stageId: number;
  cleared: boolean;
  stars: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  hpRemaining: number;
  hpMax: number;
  timeMs: number;
  xpEarned: number;
}

// ---- Stage Progress (saved) ----
export interface StageProgress {
  stageId: number;
  bestStars: number;
  bestWpm: number;
  bestAccuracy: number;
  clearedAt: number | null;
  attempts: number;
}

// ---- Per-World Progress ----
export interface WorldProgress {
  stages: Record<number, StageProgress>;
  totalXpEarned: number;
}

// ---- Adventure Progress (saved to localStorage) ----
export interface AdventureProgress {
  worlds: Record<number, WorldProgress>;
}

// ---- Adventure View ----
export type AdventureView = 'map' | 'combat' | 'result';
