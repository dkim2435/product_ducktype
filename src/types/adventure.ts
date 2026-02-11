// ---- Word Difficulty ----
export interface WordDifficulty {
  minLen: number;
  maxLen: number;
}

// ---- Enemy Config ----
export interface EnemyConfig {
  name: string;
  emoji: string;
  hp: number;
  attackDamage: number;
}

// ---- Boss Phase Config ----
export interface BossPhaseConfig {
  hpThreshold: number; // percentage (e.g. 0.6 = 60%)
  wordDifficulty: WordDifficulty;
  spawnInterval: number; // ms between word spawns
  dialogue: string;
}

// ---- Boss Config ----
export interface BossConfig {
  phases: BossPhaseConfig[];
}

// ---- Wave Config ----
export interface WaveConfig {
  wordDifficulty: WordDifficulty;
  wordCount: number; // total words in wave
  spawnInterval: number; // ms between word spawns
  timeoutMs: number; // ms before word expires
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
  bossConfig?: BossConfig;
}

// ---- World Config ----
export interface WorldConfig {
  id: number;
  name: string;
  stages: StageConfig[];
  requiresLogin: boolean;
}

// ---- Star Thresholds ----
export interface StarThresholds {
  one: { minAccuracy: number; minHpPercent: number };
  two: { minAccuracy: number; minHpPercent: number; minWpm: number };
  three: { minAccuracy: number; minHpPercent: number; minWpm: number };
}

// ---- Active Word (in combat) ----
export interface ActiveWord {
  id: number;
  word: string;
  spawnedAt: number;
  timeoutMs: number;
  typed: string; // characters typed so far
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

// ---- Combat State ----
export interface CombatState {
  phase: CombatPhase;
  stageConfig: StageConfig;
  currentWave: number; // 0-indexed
  bossPhase: number; // 0-indexed, only for boss stages

  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;

  activeWords: ActiveWord[];
  currentInput: string;
  matchedWordId: number | null;

  combo: number;
  maxCombo: number;
  totalWordsTyped: number;
  totalCharsTyped: number;
  correctChars: number;
  totalKeystrokes: number;

  startTime: number | null;
  endTime: number | null;
  waveStartTime: number | null;

  // Floating damage numbers
  damageNumbers: DamageNumber[];

  // Boss dialogue
  bossDialogue: string | null;
}

// ---- Damage Number (floating) ----
export interface DamageNumber {
  id: number;
  value: number;
  x: number; // percentage position
  createdAt: number;
  isPlayer: boolean; // true = player took damage
}

// ---- Stage Result ----
export interface StageResult {
  stageId: number;
  cleared: boolean;
  stars: number; // 0-3
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
  clearedAt: number | null; // timestamp
  attempts: number;
}

// ---- Adventure Progress (saved to localStorage) ----
export interface AdventureProgress {
  worldId: number;
  stages: Record<number, StageProgress>;
  totalXpEarned: number;
}

// ---- Adventure View ----
export type AdventureView = 'map' | 'combat' | 'result';
