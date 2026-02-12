import type {
  WorldConfig,
  StageConfig,
  WaveConfig,
  EnemyConfig,
  BossConfig,
  StarThresholds,
  WorldDebuff,
} from '../types/adventure';

// ---- Player Constants ----
export const PLAYER_MAX_HP = 100;
export const PLAYER_BASE_DAMAGE = 10;

// ---- Damage Formula Constants (boss hits) ----
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
export const KILL_EFFECT_DURATION_MS = 600;
export const WORD_SPAWN_INITIAL_DELAY_MS = 800;

// ---- Mistype Penalty ----
export const MISTYPE_DAMAGE = 5;

// ---- Poison Debuff ----
export const POISON_DAMAGE_PER_SECOND = 1;
export const POISON_TICK_INTERVAL_MS = 1000;

// ---- Star Thresholds ----
export const STAR_THRESHOLDS: StarThresholds = {
  one: { minAccuracy: 0, minHpPercent: 0 },
  two: { minAccuracy: 0.80, minHpPercent: 0.30, minWpm: 30 },
  three: { minAccuracy: 0.92, minHpPercent: 0.60, minWpm: 50 },
};

// ---- Calculate Damage (boss hits) ----
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

// ---- Minion Field Positions ----
const MINION_SLOTS = [
  { x: 18, y: 12 }, { x: 48, y: 10 }, { x: 75, y: 14 },
  { x: 14, y: 32 }, { x: 42, y: 28 }, { x: 70, y: 34 },
  { x: 22, y: 50 }, { x: 52, y: 46 }, { x: 78, y: 52 },
  { x: 32, y: 64 }, { x: 62, y: 60 },
];

export function getMinionPosition(
  minionId: number,
  existing: { x: number; y: number }[],
  minY = 0,
): { x: number; y: number } {
  const slots = minY > 0 ? MINION_SLOTS.filter(s => s.y >= minY) : MINION_SLOTS;
  const occupied = new Set(existing.map(m => `${Math.round(m.x / 12)},${Math.round(m.y / 12)}`));
  for (let i = 0; i < slots.length; i++) {
    const idx = (minionId + i) % slots.length;
    const slot = slots[idx];
    const key = `${Math.round(slot.x / 12)},${Math.round(slot.y / 12)}`;
    if (!occupied.has(key)) {
      return {
        x: slot.x + ((minionId * 7) % 5) - 2,
        y: slot.y + ((minionId * 13) % 5) - 2,
      };
    }
  }
  const fallbackMinY = Math.max(minY, 15);
  return { x: 20 + ((minionId * 17) % 55), y: fallbackMinY + ((minionId * 23) % 40) };
}

// ---- Enemy Definitions ----
const WOLF_PUP: EnemyConfig = { name: 'Wolf Pup', emoji: '🐕', hp: 0, attackDamage: 8 };
const WOLF_SCOUT: EnemyConfig = { name: 'Wolf Scout', emoji: '🐺', hp: 0, attackDamage: 10 };
const WOLF_WARRIOR: EnemyConfig = { name: 'Wolf Warrior', emoji: '🦊', hp: 0, attackDamage: 12 };
const WOLF_GUARD: EnemyConfig = { name: 'Wolf Guard', emoji: '🐗', hp: 0, attackDamage: 14 };
const SHADOW_STALKER: EnemyConfig = { name: 'Shadow Stalker', emoji: '🦝', hp: 0, attackDamage: 15 };
const DIRE_WOLF: EnemyConfig = { name: 'Dire Wolf', emoji: '🐻', hp: 0, attackDamage: 16 };
const PACK_LEADER: EnemyConfig = { name: 'Pack Leader', emoji: '🦁', hp: 0, attackDamage: 18 };
const SHADOW_WOLF: EnemyConfig = { name: 'Shadow Wolf', emoji: '👹', hp: 600, attackDamage: 20 };

// ---- Boss Word Positions (below boss, not overlapping) ----
export function getBossWordPositions(count: number): { x: number; y: number }[] {
  switch (count) {
    case 1: return [{ x: 50, y: 38 }];
    case 2: return [{ x: 32, y: 38 }, { x: 68, y: 38 }];
    case 3: return [{ x: 20, y: 38 }, { x: 50, y: 38 }, { x: 80, y: 38 }];
    default: return [{ x: 50, y: 38 }];
  }
}

// ---- Boss Config ----
const SHADOW_WOLF_BOSS: BossConfig = {
  minionEmoji: '🐺',
  minionAttackDamage: 12,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 6 },
      bossWordTimeoutMs: 10000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5500,
      minionsPerWave: 2,
      dialogue: '"You dare challenge me, little duck?"',
    },
    {
      hpThreshold: 0.6,
      bossWordDifficulty: { minLen: 5, maxLen: 8 },
      bossWordTimeoutMs: 9000,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 5000,
      minionsPerWave: 3,
      dialogue: '"Not bad... but I\'m just getting started!"',
    },
    {
      hpThreshold: 0.25,
      bossWordDifficulty: { minLen: 6, maxLen: 10 },
      bossWordTimeoutMs: 8000,
      bossWordsCount: 3,
      minionWordDifficulty: { minLen: 5, maxLen: 7 },
      minionTimeoutMs: 4000,
      minionsPerWave: 4,
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

// ---- 8 Stage Definitions ----
const STAGE_1: StageConfig = {
  id: 1, name: 'Forest Edge',
  subtitle: 'Wolf pups lurk at the forest border...',
  enemyConfig: WOLF_PUP,
  waves: makeWaves(3, 5, { minLen: 2, maxLen: 4 }, 2800, 7000),
  xpReward: 10, isBoss: false,
};

const STAGE_2: StageConfig = {
  id: 2, name: 'Village Bridge',
  subtitle: 'Scouts guard the bridge to the village.',
  enemyConfig: WOLF_SCOUT,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 5 }, 2500, 6500),
  xpReward: 15, isBoss: false,
};

const STAGE_3: StageConfig = {
  id: 3, name: 'Town Square',
  subtitle: 'Warriors storm the town center!',
  enemyConfig: WOLF_WARRIOR,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 6 }, 2200, 6000),
  xpReward: 20, isBoss: false,
};

const STAGE_4: StageConfig = {
  id: 4, name: "Elder's Garden",
  subtitle: 'Guards surround the sacred garden.',
  enemyConfig: WOLF_GUARD,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 7 }, 2000, 5500),
  xpReward: 25, isBoss: false,
};

const STAGE_5: StageConfig = {
  id: 5, name: 'Dark Forest',
  subtitle: 'Shadows move between the twisted trees.',
  enemyConfig: SHADOW_STALKER,
  waves: makeWaves(5, 6, { minLen: 5, maxLen: 7 }, 1800, 5000),
  xpReward: 30, isBoss: false,
};

const STAGE_6: StageConfig = {
  id: 6, name: 'Mountain Pass',
  subtitle: 'Dire wolves howl from the cliff tops.',
  enemyConfig: DIRE_WOLF,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4500),
  xpReward: 35, isBoss: false,
};

const STAGE_7: StageConfig = {
  id: 7, name: 'Wolf Den',
  subtitle: 'The pack leaders make their last stand.',
  enemyConfig: PACK_LEADER,
  waves: makeWaves(6, 7, { minLen: 6, maxLen: 9 }, 1400, 4000),
  xpReward: 40, isBoss: false,
};

const STAGE_8_BOSS: StageConfig = {
  id: 8, name: "Shadow Wolf's Lair",
  subtitle: 'Face the Shadow Wolf and save the village!',
  enemyConfig: SHADOW_WOLF,
  waves: [],
  xpReward: 75, isBoss: true, bossConfig: SHADOW_WOLF_BOSS,
};

// ---- World 1 ----
export const WORLD_1: WorldConfig = {
  id: 1,
  name: 'Duck Village',
  stages: [STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5, STAGE_6, STAGE_7, STAGE_8_BOSS],
  requiresLogin: false,
};

// ========== WORLD 2: Venom Jungle ==========

// ---- Enemy Definitions (W2) ----
const POISON_FROG: EnemyConfig = { name: 'Poison Frog', emoji: '🐸', hp: 0, attackDamage: 10 };
const VINE_SNAKE: EnemyConfig = { name: 'Vine Snake', emoji: '🐍', hp: 0, attackDamage: 12 };
const ACID_SLIME: EnemyConfig = { name: 'Acid Slime', emoji: '🟢', hp: 0, attackDamage: 13 };
const SWAMP_CRAWLER: EnemyConfig = { name: 'Swamp Crawler', emoji: '🦎', hp: 0, attackDamage: 14 };
const JUNGLE_STALKER: EnemyConfig = { name: 'Jungle Stalker', emoji: '🐆', hp: 0, attackDamage: 15 };
const TOXIC_BLOOM: EnemyConfig = { name: 'Toxic Bloom', emoji: '🌺', hp: 0, attackDamage: 16 };
const VENOM_BRUTE: EnemyConfig = { name: 'Venom Brute', emoji: '🦍', hp: 0, attackDamage: 18 };
const JUNGLE_WARDEN: EnemyConfig = { name: 'Jungle Warden', emoji: '🌿', hp: 0, attackDamage: 19 };
const GIANT_VIPER: EnemyConfig = { name: 'Giant Viper', emoji: '🐲', hp: 750, attackDamage: 22 };

// ---- Boss Config (W2) ----
const GIANT_VIPER_BOSS: BossConfig = {
  minionEmoji: '🐍',
  minionAttackDamage: 14,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 6 },
      bossWordTimeoutMs: 9500,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"Ssssso... another fool wandersss in."',
    },
    {
      hpThreshold: 0.55,
      bossWordDifficulty: { minLen: 5, maxLen: 8 },
      bossWordTimeoutMs: 8500,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4500,
      minionsPerWave: 3,
      dialogue: '"My venom coursssesss through your veinsss!"',
    },
    {
      hpThreshold: 0.2,
      bossWordDifficulty: { minLen: 6, maxLen: 10 },
      bossWordTimeoutMs: 7500,
      bossWordsCount: 3,
      minionWordDifficulty: { minLen: 5, maxLen: 7 },
      minionTimeoutMs: 3800,
      minionsPerWave: 4,
      dialogue: '"FEEL THE FULL FORCE OF MY FANGSSS!"',
    },
  ],
};

// ---- 9 Stage Definitions (W2) ----
const W2_STAGE_1: StageConfig = {
  id: 1, name: 'Jungle Entrance',
  subtitle: 'Poisonous frogs guard the jungle gate...',
  enemyConfig: POISON_FROG,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 5 }, 2600, 6500),
  xpReward: 15, isBoss: false,
};

const W2_STAGE_2: StageConfig = {
  id: 2, name: 'Vine Canopy',
  subtitle: 'Snakes slither through the tangled vines.',
  enemyConfig: VINE_SNAKE,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 6 }, 2400, 6000),
  xpReward: 20, isBoss: false,
};

const W2_STAGE_3: StageConfig = {
  id: 3, name: 'Acid Swamp',
  subtitle: 'Acidic slimes bubble up from the murky water.',
  enemyConfig: ACID_SLIME,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 6 }, 2200, 5800),
  xpReward: 25, isBoss: false,
};

const W2_STAGE_4: StageConfig = {
  id: 4, name: 'Crawling Marsh',
  subtitle: 'Lizards crawl through the dense swamp grass.',
  enemyConfig: SWAMP_CRAWLER,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 7 }, 2000, 5500),
  xpReward: 30, isBoss: false,
};

const W2_STAGE_5: StageConfig = {
  id: 5, name: 'Predator Trail',
  subtitle: 'Something dangerous stalks the jungle path.',
  enemyConfig: JUNGLE_STALKER,
  waves: makeWaves(5, 6, { minLen: 5, maxLen: 7 }, 1800, 5000),
  xpReward: 35, isBoss: false,
};

const W2_STAGE_6: StageConfig = {
  id: 6, name: 'Bloom Garden',
  subtitle: 'Beautiful but deadly flowers fill the air with poison.',
  enemyConfig: TOXIC_BLOOM,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4500),
  xpReward: 40, isBoss: false,
};

const W2_STAGE_7: StageConfig = {
  id: 7, name: 'Venom Gorge',
  subtitle: 'Massive brutes guard the gorge with toxic fury.',
  enemyConfig: VENOM_BRUTE,
  waves: makeWaves(5, 7, { minLen: 6, maxLen: 8 }, 1500, 4200),
  xpReward: 45, isBoss: false,
};

const W2_STAGE_8: StageConfig = {
  id: 8, name: 'Ancient Grove',
  subtitle: 'Ancient wardens protect the path to the Viper\'s nest.',
  enemyConfig: JUNGLE_WARDEN,
  waves: makeWaves(6, 7, { minLen: 6, maxLen: 9 }, 1400, 4000),
  xpReward: 50, isBoss: false,
};

const W2_STAGE_9_BOSS: StageConfig = {
  id: 9, name: "Giant Viper's Nest",
  subtitle: 'Face the Giant Viper and cleanse the jungle!',
  enemyConfig: GIANT_VIPER,
  waves: [],
  xpReward: 100, isBoss: true, bossConfig: GIANT_VIPER_BOSS,
};

// ---- World 2 Debuff ----
const WORLD_2_DEBUFF: WorldDebuff = {
  type: 'poison',
  intensity: POISON_DAMAGE_PER_SECOND,
  description: 'Poison -1 HP/s',
  icon: '☠️',
};

// ---- World 2 ----
export const WORLD_2: WorldConfig = {
  id: 2,
  name: 'Venom Jungle',
  stages: [W2_STAGE_1, W2_STAGE_2, W2_STAGE_3, W2_STAGE_4, W2_STAGE_5, W2_STAGE_6, W2_STAGE_7, W2_STAGE_8, W2_STAGE_9_BOSS],
  requiresLogin: false,
  debuff: WORLD_2_DEBUFF,
};

// ---- All Worlds ----
export const WORLDS: WorldConfig[] = [WORLD_1, WORLD_2];

// ---- World Previews (for map navigation) ----
export const WORLD_PREVIEWS = [
  { id: 1, name: 'Duck Village', emoji: '🐤', desc: 'Wolves are invading the duck village! Defend your home with the power of typing.' },
  { id: 2, name: 'Venom Jungle', emoji: '🐍', desc: 'Poison fills the jungle air. Type fast before your HP drains away!' },
  { id: 3, name: 'Misty Harbor', emoji: '⚓', desc: 'Thick fog hides the words. Can you guess what lies beneath?' },
  { id: 4, name: 'Glacier Peak', emoji: '❄️', desc: 'One wrong key and you freeze. Precision is everything.' },
  { id: 5, name: 'Crypt of Shadows', emoji: '💀', desc: 'Words appear and vanish into darkness. Remember them quickly.' },
  { id: 6, name: 'The Rift', emoji: '🌀', desc: 'Reality is reversed. Type backwards to survive the rift.' },
] as const;

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
