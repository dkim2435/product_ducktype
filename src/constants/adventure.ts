import type {
  WorldConfig,
  StageConfig,
  WaveConfig,
  EnemyConfig,
  BossConfig,
  DifficultyLevel,
  DifficultyConfig,
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
export const BOSS_DEATH_DELAY_MS = 2500;
export const DAMAGE_NUMBER_DURATION_MS = 1200;
export const KILL_EFFECT_DURATION_MS = 600;
export const WORD_SPAWN_INITIAL_DELAY_MS = 800;

// ---- Difficulty Configs ----
export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  beginner: { mistypeDamage: 0, maxStars: 1, xpMultiplier: 0.5, label: 'Beginner', color: '#4caf50' },
  intermediate: { mistypeDamage: 2, maxStars: 2, xpMultiplier: 1.0, label: 'Intermediate', color: '#ff9800' },
  expert: { mistypeDamage: 4, maxStars: 3, xpMultiplier: 1.5, label: 'Expert', color: '#f44336' },
};

// ---- Poison Debuff ----
export const POISON_DAMAGE_PER_SECOND = 0.3;
export const POISON_TICK_INTERVAL_MS = 1000;

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
const WOLF_PUP: EnemyConfig = { name: 'Wolf Pup', emoji: '/images/adventure/monsters/w1/wolf-pup.png', hp: 0, attackDamage: 8 };
const WOLF_SCOUT: EnemyConfig = { name: 'Wolf Scout', emoji: '/images/adventure/monsters/w1/wolf-scout.png', hp: 0, attackDamage: 10 };
const SPEEDY_FOX: EnemyConfig = { name: 'Speedy Fox', emoji: '/images/adventure/monsters/w1/speedy-fox.png', hp: 0, attackDamage: 12 };
const PUMBA: EnemyConfig = { name: 'Pumba', emoji: '/images/adventure/monsters/w1/pumba.png', hp: 0, attackDamage: 14 };
const RASCAL_RACCOON: EnemyConfig = { name: 'Rascal Raccoon', emoji: '/images/adventure/monsters/w1/rascal-raccoon.png', hp: 0, attackDamage: 15 };
const GRUMPY_BEAR: EnemyConfig = { name: 'Grumpy Bear', emoji: '/images/adventure/monsters/w1/grumpy-bear.png', hp: 0, attackDamage: 16 };
const LION_NOT_KING: EnemyConfig = { name: 'Lion Not King', emoji: '/images/adventure/monsters/w1/lion-not-king.png', hp: 0, attackDamage: 18 };
const GAEBI: EnemyConfig = { name: 'Gaebi the Oni', emoji: '/images/adventure/monsters/w1/gaebi.png', hp: 600, attackDamage: 20 };

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
const GAEBI_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w1/wolf-scout.png',
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
  subtitle: 'A speedy fox dashes through the town!',
  enemyConfig: SPEEDY_FOX,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 6 }, 2200, 6000),
  xpReward: 20, isBoss: false,
};

const STAGE_4: StageConfig = {
  id: 4, name: "Elder's Garden",
  subtitle: 'Pumba charges through the sacred garden!',
  enemyConfig: PUMBA,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 7 }, 2000, 5500),
  xpReward: 25, isBoss: false,
};

const STAGE_5: StageConfig = {
  id: 5, name: 'Dark Forest',
  subtitle: 'Raccoons lurk between the twisted trees.',
  enemyConfig: RASCAL_RACCOON,
  waves: makeWaves(5, 6, { minLen: 5, maxLen: 7 }, 1800, 5000),
  xpReward: 30, isBoss: false,
};

const STAGE_6: StageConfig = {
  id: 6, name: 'Mountain Pass',
  subtitle: 'A grumpy bear blocks the mountain path.',
  enemyConfig: GRUMPY_BEAR,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4500),
  xpReward: 35, isBoss: false,
};

const STAGE_7: StageConfig = {
  id: 7, name: 'Wolf Den',
  subtitle: 'The lion stands guard before the final lair.',
  enemyConfig: LION_NOT_KING,
  waves: makeWaves(6, 7, { minLen: 6, maxLen: 9 }, 1400, 4000),
  xpReward: 40, isBoss: false,
};

const STAGE_8_BOSS: StageConfig = {
  id: 8, name: "Gaebi's Lair",
  subtitle: 'Face Gaebi the Oni and save the village!',
  enemyConfig: GAEBI,
  waves: [],
  xpReward: 75, isBoss: true, bossConfig: GAEBI_BOSS,
};

// ---- World 1 ----
export const WORLD_1: WorldConfig = {
  id: 1,
  name: 'Duck Village',
  stages: [STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5, STAGE_6, STAGE_7, STAGE_8_BOSS],
  requiresLogin: false,
  starsRequired: 0,
};

// ========== WORLD 2: Venom Jungle ==========

// ---- Enemy Definitions (W2) ----
const POISON_FROG: EnemyConfig = { name: 'Poison Frog', emoji: '/images/adventure/monsters/w2/poison-frog.png', hp: 0, attackDamage: 10 };
const VINE_SNAKE: EnemyConfig = { name: 'Vine Snake', emoji: '/images/adventure/monsters/w2/vine-snake.png', hp: 0, attackDamage: 12 };
const ACID_SLIME: EnemyConfig = { name: 'Acid Slime', emoji: '/images/adventure/monsters/w2/acid-slime.png', hp: 0, attackDamage: 13 };
const SWAMP_CRAWLER: EnemyConfig = { name: 'Swamp Crawler', emoji: '/images/adventure/monsters/w2/swamp-crawler.png', hp: 0, attackDamage: 14 };
const JUNGLE_STALKER: EnemyConfig = { name: 'Jungle Stalker', emoji: '/images/adventure/monsters/w2/jungle-stalker.png', hp: 0, attackDamage: 15 };
const TOXIC_BLOOM: EnemyConfig = { name: 'Toxic Bloom', emoji: '/images/adventure/monsters/w2/toxic-bloom.png', hp: 0, attackDamage: 16 };
const VENOM_BRUTE: EnemyConfig = { name: 'Venom Brute', emoji: '/images/adventure/monsters/w2/venom-brute.png', hp: 0, attackDamage: 18 };
const JUNGLE_WARDEN: EnemyConfig = { name: 'Jungle Warden', emoji: '/images/adventure/monsters/w2/jungle-warden.png', hp: 0, attackDamage: 19 };
const GIANT_VIPER: EnemyConfig = { name: 'Giant Viper', emoji: '/images/adventure/monsters/w2/giant-viper.png', hp: 750, attackDamage: 22 };

// ---- Boss Config (W2) ----
const GIANT_VIPER_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w2/vine-snake.png',
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
  description: 'Poison -0.3 HP/s',
  icon: '☠️',
};

// ---- World 2 ----
export const WORLD_2: WorldConfig = {
  id: 2,
  name: 'Venom Jungle',
  stages: [W2_STAGE_1, W2_STAGE_2, W2_STAGE_3, W2_STAGE_4, W2_STAGE_5, W2_STAGE_6, W2_STAGE_7, W2_STAGE_8, W2_STAGE_9_BOSS],
  requiresLogin: false,
  debuff: WORLD_2_DEBUFF,
  starsRequired: 15,
  loginGateStageId: 3,
};

// ========== WORLD 3: Misty Harbor (11 stages, mid-boss at 6) ==========

// ---- Enemy Definitions (W3) ----
const HARBOR_RAT: EnemyConfig = { name: 'Harbor Rat', emoji: '/images/adventure/monsters/w3/harbor-rat.png', hp: 0, attackDamage: 12 };
const FOG_GULL: EnemyConfig = { name: 'Fog Gull', emoji: '/images/adventure/monsters/w3/fog-gull.png', hp: 0, attackDamage: 13 };
const DOCK_CRAB: EnemyConfig = { name: 'Dock Crab', emoji: '/images/adventure/monsters/w3/dock-crab.png', hp: 0, attackDamage: 14 };
const MIST_JELLYFISH: EnemyConfig = { name: 'Mist Jellyfish', emoji: '/images/adventure/monsters/w3/mist-jellyfish.png', hp: 0, attackDamage: 15 };
const BARNACLE_THUG: EnemyConfig = { name: 'Barnacle Thug', emoji: '/images/adventure/monsters/w3/barnacle-thug.png', hp: 0, attackDamage: 16 };
const SIREN: EnemyConfig = { name: 'Siren', emoji: '/images/adventure/monsters/w3/siren.png', hp: 500, attackDamage: 18 };
const GHOST_SAILOR: EnemyConfig = { name: 'Ghost Sailor', emoji: '/images/adventure/monsters/w3/ghost-sailor.png', hp: 0, attackDamage: 17 };
const FOG_SERPENT: EnemyConfig = { name: 'Fog Serpent', emoji: '/images/adventure/monsters/w3/fog-serpent.png', hp: 0, attackDamage: 18 };
const ANCHOR_GOLEM: EnemyConfig = { name: 'Anchor Golem', emoji: '/images/adventure/monsters/w3/anchor-golem.png', hp: 0, attackDamage: 19 };
const TIDE_LURKER: EnemyConfig = { name: 'Tide Lurker', emoji: '/images/adventure/monsters/w3/tide-lurker.png', hp: 0, attackDamage: 20 };
const KRAKEN: EnemyConfig = { name: 'Kraken', emoji: '/images/adventure/monsters/w3/kraken.png', hp: 900, attackDamage: 24 };

// ---- Mid-Boss Config (W3 — Siren) ----
const SIREN_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w3/harbor-rat.png',
  minionAttackDamage: 13,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 5 },
      bossWordTimeoutMs: 10000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"My song will lure you to a watery grave..."',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 4, maxLen: 7 },
      bossWordTimeoutMs: 8000,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4000,
      minionsPerWave: 3,
      dialogue: '"SILENCE! The harbor belongs to ME!"',
    },
  ],
};

// ---- Boss Config (W3 — Kraken) ----
const KRAKEN_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w3/harbor-rat.png',
  minionAttackDamage: 14,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 6 },
      bossWordTimeoutMs: 10000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"The fog answers to ME, little duck..."',
    },
    {
      hpThreshold: 0.55,
      bossWordDifficulty: { minLen: 5, maxLen: 8 },
      bossWordTimeoutMs: 8500,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4500,
      minionsPerWave: 3,
      dialogue: '"My tentacles will drag you to the depths!"',
    },
    {
      hpThreshold: 0.2,
      bossWordDifficulty: { minLen: 6, maxLen: 10 },
      bossWordTimeoutMs: 7000,
      bossWordsCount: 3,
      minionWordDifficulty: { minLen: 5, maxLen: 7 },
      minionTimeoutMs: 3500,
      minionsPerWave: 4,
      dialogue: '"RELEASE THE KRAKEN! ...wait, I AM the Kraken!"',
    },
  ],
};

// ---- 11 Stage Definitions (W3) ----
const W3_STAGE_1: StageConfig = {
  id: 1, name: 'Harbor Gate',
  subtitle: 'Rats scurry along the misty docks...',
  enemyConfig: HARBOR_RAT,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 5 }, 2500, 6200),
  xpReward: 20, isBoss: false,
};

const W3_STAGE_2: StageConfig = {
  id: 2, name: 'Foggy Pier',
  subtitle: 'Gulls cry out from within the thick fog.',
  enemyConfig: FOG_GULL,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 5 }, 2400, 6000),
  xpReward: 22, isBoss: false,
};

const W3_STAGE_3: StageConfig = {
  id: 3, name: 'Crab Wharf',
  subtitle: 'Crabs snap their claws on the old wooden docks.',
  enemyConfig: DOCK_CRAB,
  waves: makeWaves(3, 6, { minLen: 3, maxLen: 6 }, 2300, 5800),
  xpReward: 25, isBoss: false,
};

const W3_STAGE_4: StageConfig = {
  id: 4, name: 'Jellyfish Cove',
  subtitle: 'Bioluminescent jellyfish drift through the mist.',
  enemyConfig: MIST_JELLYFISH,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 6 }, 2100, 5500),
  xpReward: 28, isBoss: false,
};

const W3_STAGE_5: StageConfig = {
  id: 5, name: 'Barnacle Alley',
  subtitle: 'Rough thugs guard the narrow harbor passage.',
  enemyConfig: BARNACLE_THUG,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 7 }, 2000, 5200),
  xpReward: 32, isBoss: false,
};

const W3_STAGE_6_MIDBOSS: StageConfig = {
  id: 6, name: "Siren's Grotto",
  subtitle: 'A haunting melody echoes from the sea cave...',
  enemyConfig: SIREN,
  waves: [],
  xpReward: 65, isBoss: true, isMidBoss: true, bossConfig: SIREN_BOSS,
};

const W3_STAGE_7: StageConfig = {
  id: 7, name: 'Ghost Ship',
  subtitle: 'A phantom crew haunts the abandoned vessel.',
  enemyConfig: GHOST_SAILOR,
  waves: makeWaves(4, 7, { minLen: 5, maxLen: 7 }, 1800, 4800),
  xpReward: 38, isBoss: false,
};

const W3_STAGE_8: StageConfig = {
  id: 8, name: 'Serpent Canal',
  subtitle: 'A massive serpent lurks in the foggy canal.',
  enemyConfig: FOG_SERPENT,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4500),
  xpReward: 42, isBoss: false,
};

const W3_STAGE_9: StageConfig = {
  id: 9, name: 'Anchor Graveyard',
  subtitle: 'Ancient golems rise from the rusted anchors.',
  enemyConfig: ANCHOR_GOLEM,
  waves: makeWaves(5, 7, { minLen: 6, maxLen: 8 }, 1500, 4200),
  xpReward: 46, isBoss: false,
};

const W3_STAGE_10: StageConfig = {
  id: 10, name: 'Abyssal Tide',
  subtitle: 'Something massive stirs beneath the dark waters.',
  enemyConfig: TIDE_LURKER,
  waves: makeWaves(5, 8, { minLen: 6, maxLen: 9 }, 1400, 3800),
  xpReward: 50, isBoss: false,
};

const W3_STAGE_11_BOSS: StageConfig = {
  id: 11, name: "Kraken's Abyss",
  subtitle: 'Face the Kraken and clear the harbor fog!',
  enemyConfig: KRAKEN,
  waves: [],
  xpReward: 120, isBoss: true, bossConfig: KRAKEN_BOSS,
};

// ---- World 3 Debuff ----
const WORLD_3_DEBUFF: WorldDebuff = {
  type: 'fog',
  intensity: 0.3,
  description: 'Fog: words appear blurry',
  icon: '🌫️',
};

// ---- World 3 ----
export const WORLD_3: WorldConfig = {
  id: 3,
  name: 'Misty Harbor',
  stages: [W3_STAGE_1, W3_STAGE_2, W3_STAGE_3, W3_STAGE_4, W3_STAGE_5, W3_STAGE_6_MIDBOSS, W3_STAGE_7, W3_STAGE_8, W3_STAGE_9, W3_STAGE_10, W3_STAGE_11_BOSS],
  requiresLogin: false,
  debuff: WORLD_3_DEBUFF,
  starsRequired: 30,
};

// ========== WORLD 4: Glacier Peak (12 stages, mid-boss at 4 & 8) ==========

// ---- Enemy Definitions (W4) ----
const SNOW_HARE: EnemyConfig = { name: 'Snow Hare', emoji: '/images/adventure/monsters/w4/snow-hare.png', hp: 0, attackDamage: 14 };
const ICE_FOX: EnemyConfig = { name: 'Ice Fox', emoji: '/images/adventure/monsters/w4/ice-fox.png', hp: 0, attackDamage: 15 };
const FROST_OWL: EnemyConfig = { name: 'Frost Owl', emoji: '/images/adventure/monsters/w4/frost-owl.png', hp: 0, attackDamage: 16 };
const FROST_TROLL: EnemyConfig = { name: 'Frost Troll', emoji: '/images/adventure/monsters/w4/frost-troll.png', hp: 550, attackDamage: 17 };
const GLACIER_WOLF: EnemyConfig = { name: 'Glacier Wolf', emoji: '/images/adventure/monsters/w4/glacier-wolf.png', hp: 0, attackDamage: 17 };
const BLIZZARD_YAK: EnemyConfig = { name: 'Blizzard Yak', emoji: '/images/adventure/monsters/w4/blizzard-yak.png', hp: 0, attackDamage: 18 };
const ICE_GOLEM: EnemyConfig = { name: 'Ice Golem', emoji: '/images/adventure/monsters/w4/ice-golem.png', hp: 0, attackDamage: 19 };
const FROST_WYVERN: EnemyConfig = { name: 'Frost Wyvern', emoji: '/images/adventure/monsters/w4/frost-wyvern.png', hp: 700, attackDamage: 20 };
const AVALANCHE_TITAN: EnemyConfig = { name: 'Avalanche Titan', emoji: '/images/adventure/monsters/w4/avalanche-titan.png', hp: 0, attackDamage: 21 };
const CRYSTAL_SENTINEL: EnemyConfig = { name: 'Crystal Sentinel', emoji: '/images/adventure/monsters/w4/crystal-sentinel.png', hp: 0, attackDamage: 22 };
const PERMAFROST_MAMMOTH: EnemyConfig = { name: 'Permafrost Mammoth', emoji: '/images/adventure/monsters/w4/permafrost-mammoth.png', hp: 0, attackDamage: 23 };
const FROSTBITE_KING: EnemyConfig = { name: 'Frostbite King', emoji: '/images/adventure/monsters/w4/frostbite-king.png', hp: 1050, attackDamage: 26 };

// ---- Mid-Boss Config (W4 — Frost Troll, stage 4) ----
const FROST_TROLL_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w4/snow-hare.png',
  minionAttackDamage: 15,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 5 },
      bossWordTimeoutMs: 10000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"TROLL SMASH TINY DUCK!"',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 4, maxLen: 7 },
      bossWordTimeoutMs: 8000,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4000,
      minionsPerWave: 3,
      dialogue: '"TROLL NOT DONE! TROLL ANGRY!!"',
    },
  ],
};

// ---- Mid-Boss Config (W4 — Frost Wyvern, stage 8) ----
const FROST_WYVERN_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w4/ice-fox.png',
  minionAttackDamage: 16,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 4, maxLen: 6 },
      bossWordTimeoutMs: 9000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 6 },
      minionTimeoutMs: 4500,
      minionsPerWave: 2,
      dialogue: '"My icy breath will freeze you solid!"',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 5, maxLen: 8 },
      bossWordTimeoutMs: 7500,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 7 },
      minionTimeoutMs: 3500,
      minionsPerWave: 4,
      dialogue: '"The blizzard obeys MY command!"',
    },
  ],
};

// ---- Boss Config (W4 — Frostbite King) ----
const FROSTBITE_KING_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w4/snow-hare.png',
  minionAttackDamage: 16,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 6 },
      bossWordTimeoutMs: 9500,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"Kneel before the frost, foolish duck."',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 5, maxLen: 8 },
      bossWordTimeoutMs: 8000,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4000,
      minionsPerWave: 3,
      dialogue: '"Your feathers will freeze and SHATTER!"',
    },
    {
      hpThreshold: 0.18,
      bossWordDifficulty: { minLen: 6, maxLen: 10 },
      bossWordTimeoutMs: 6500,
      bossWordsCount: 3,
      minionWordDifficulty: { minLen: 5, maxLen: 7 },
      minionTimeoutMs: 3500,
      minionsPerWave: 5,
      dialogue: '"ETERNAL WINTER DESCENDS UPON YOU!"',
    },
  ],
};

// ---- 12 Stage Definitions (W4) ----
const W4_STAGE_1: StageConfig = {
  id: 1, name: 'Snowfield Path',
  subtitle: 'White hares dash across the frozen tundra.',
  enemyConfig: SNOW_HARE,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 5 }, 2400, 6000),
  xpReward: 25, isBoss: false,
};

const W4_STAGE_2: StageConfig = {
  id: 2, name: 'Frozen Creek',
  subtitle: 'Cunning ice foxes hunt along the frozen stream.',
  enemyConfig: ICE_FOX,
  waves: makeWaves(3, 5, { minLen: 3, maxLen: 6 }, 2300, 5800),
  xpReward: 28, isBoss: false,
};

const W4_STAGE_3: StageConfig = {
  id: 3, name: 'Blizzard Canopy',
  subtitle: 'Silent owls watch from frost-covered branches.',
  enemyConfig: FROST_OWL,
  waves: makeWaves(3, 6, { minLen: 4, maxLen: 6 }, 2100, 5500),
  xpReward: 32, isBoss: false,
};

const W4_STAGE_4_MIDBOSS: StageConfig = {
  id: 4, name: "Troll's Bridge",
  subtitle: 'A massive troll blocks the frozen bridge!',
  enemyConfig: FROST_TROLL,
  waves: [],
  xpReward: 70, isBoss: true, isMidBoss: true, bossConfig: FROST_TROLL_BOSS,
};

const W4_STAGE_5: StageConfig = {
  id: 5, name: 'Howling Ridge',
  subtitle: 'Glacier wolves howl atop the icy ridge.',
  enemyConfig: GLACIER_WOLF,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 7 }, 2000, 5200),
  xpReward: 36, isBoss: false,
};

const W4_STAGE_6: StageConfig = {
  id: 6, name: 'Yak Plateau',
  subtitle: 'Massive yaks charge through the blizzard.',
  enemyConfig: BLIZZARD_YAK,
  waves: makeWaves(4, 7, { minLen: 5, maxLen: 7 }, 1800, 4800),
  xpReward: 40, isBoss: false,
};

const W4_STAGE_7: StageConfig = {
  id: 7, name: 'Ice Cavern',
  subtitle: 'Golems of pure ice guard the frozen cave.',
  enemyConfig: ICE_GOLEM,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4500),
  xpReward: 44, isBoss: false,
};

const W4_STAGE_8_MIDBOSS: StageConfig = {
  id: 8, name: 'Wyvern Nest',
  subtitle: 'A frost wyvern guards its glacial nest!',
  enemyConfig: FROST_WYVERN,
  waves: [],
  xpReward: 85, isBoss: true, isMidBoss: true, bossConfig: FROST_WYVERN_BOSS,
};

const W4_STAGE_9: StageConfig = {
  id: 9, name: 'Avalanche Summit',
  subtitle: 'The mountain itself seems to come alive.',
  enemyConfig: AVALANCHE_TITAN,
  waves: makeWaves(5, 7, { minLen: 6, maxLen: 8 }, 1500, 4200),
  xpReward: 48, isBoss: false,
};

const W4_STAGE_10: StageConfig = {
  id: 10, name: 'Crystal Cavern',
  subtitle: 'Crystal sentinels guard the shimmering depths.',
  enemyConfig: CRYSTAL_SENTINEL,
  waves: makeWaves(5, 8, { minLen: 6, maxLen: 9 }, 1400, 3800),
  xpReward: 52, isBoss: false,
};

const W4_STAGE_11: StageConfig = {
  id: 11, name: 'Mammoth Graveyard',
  subtitle: 'Ancient mammoths roam the frozen wastes.',
  enemyConfig: PERMAFROST_MAMMOTH,
  waves: makeWaves(6, 8, { minLen: 6, maxLen: 9 }, 1300, 3600),
  xpReward: 56, isBoss: false,
};

const W4_STAGE_12_BOSS: StageConfig = {
  id: 12, name: 'Frostbite Throne',
  subtitle: 'Defeat the Frostbite King and thaw the peaks!',
  enemyConfig: FROSTBITE_KING,
  waves: [],
  xpReward: 140, isBoss: true, bossConfig: FROSTBITE_KING_BOSS,
};

// ---- World 4 Debuff ----
const WORLD_4_DEBUFF: WorldDebuff = {
  type: 'freeze',
  intensity: 1.5,
  description: 'Freeze: +50% mistype damage',
  icon: '❄️',
};

// ---- World 4 ----
export const WORLD_4: WorldConfig = {
  id: 4,
  name: 'Glacier Peak',
  stages: [W4_STAGE_1, W4_STAGE_2, W4_STAGE_3, W4_STAGE_4_MIDBOSS, W4_STAGE_5, W4_STAGE_6, W4_STAGE_7, W4_STAGE_8_MIDBOSS, W4_STAGE_9, W4_STAGE_10, W4_STAGE_11, W4_STAGE_12_BOSS],
  requiresLogin: false,
  debuff: WORLD_4_DEBUFF,
  starsRequired: 45,
};

// ========== WORLD 5: Crypt of Shadows (13 stages, mid-boss at 4 & 8) ==========

// ---- Enemy Definitions (W5) ----
const CRYPT_BAT: EnemyConfig = { name: 'Crypt Bat', emoji: '/images/adventure/monsters/w5/crypt-bat.png', hp: 0, attackDamage: 15 };
const BONE_RAT: EnemyConfig = { name: 'Bone Rat', emoji: '/images/adventure/monsters/w5/bone-rat.png', hp: 0, attackDamage: 16 };
const SHADOW_CAT: EnemyConfig = { name: 'Shadow Cat', emoji: '/images/adventure/monsters/w5/shadow-cat.png', hp: 0, attackDamage: 17 };
const TOMB_GUARDIAN: EnemyConfig = { name: 'Tomb Guardian', emoji: '/images/adventure/monsters/w5/tomb-guardian.png', hp: 600, attackDamage: 18 };
const TOMB_SPIDER: EnemyConfig = { name: 'Tomb Spider', emoji: '/images/adventure/monsters/w5/tomb-spider.png', hp: 0, attackDamage: 18 };
const PHANTOM_KNIGHT: EnemyConfig = { name: 'Phantom Knight', emoji: '/images/adventure/monsters/w5/phantom-knight.png', hp: 0, attackDamage: 19 };
const DEATH_HOUND: EnemyConfig = { name: 'Death Hound', emoji: '/images/adventure/monsters/w5/death-hound.png', hp: 0, attackDamage: 20 };
const NECROMANCER: EnemyConfig = { name: 'Necromancer', emoji: '/images/adventure/monsters/w5/necromancer.png', hp: 800, attackDamage: 21 };
const WRAITH: EnemyConfig = { name: 'Wraith', emoji: '/images/adventure/monsters/w5/wraith.png', hp: 0, attackDamage: 21 };
const SKELETON_LORD: EnemyConfig = { name: 'Skeleton Lord', emoji: '/images/adventure/monsters/w5/skeleton-lord.png', hp: 0, attackDamage: 22 };
const DOOM_REAPER: EnemyConfig = { name: 'Doom Reaper', emoji: '/images/adventure/monsters/w5/doom-reaper.png', hp: 0, attackDamage: 23 };
const SOUL_EATER: EnemyConfig = { name: 'Soul Eater', emoji: '/images/adventure/monsters/w5/soul-eater.png', hp: 0, attackDamage: 24 };
const LICH_KING: EnemyConfig = { name: 'Lich King', emoji: '/images/adventure/monsters/w5/lich-king.png', hp: 1200, attackDamage: 28 };

// ---- Mid-Boss Config (W5 — Tomb Guardian, stage 4) ----
const TOMB_GUARDIAN_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w5/crypt-bat.png',
  minionAttackDamage: 16,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 3, maxLen: 5 },
      bossWordTimeoutMs: 9500,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 5000,
      minionsPerWave: 2,
      dialogue: '"None shall pass beyond this tomb."',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 4, maxLen: 7 },
      bossWordTimeoutMs: 7500,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 6 },
      minionTimeoutMs: 4000,
      minionsPerWave: 3,
      dialogue: '"The dead will not be disturbed!"',
    },
  ],
};

// ---- Mid-Boss Config (W5 — Necromancer, stage 8) ----
const NECROMANCER_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w5/bone-rat.png',
  minionAttackDamage: 17,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 4, maxLen: 6 },
      bossWordTimeoutMs: 9000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 6 },
      minionTimeoutMs: 4500,
      minionsPerWave: 3,
      dialogue: '"Rise, my servants! Crush this intruder!"',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 5, maxLen: 9 },
      bossWordTimeoutMs: 7000,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 7 },
      minionTimeoutMs: 3500,
      minionsPerWave: 4,
      dialogue: '"DEATH MAGIC FLOWS THROUGH ME!"',
    },
  ],
};

// ---- Boss Config (W5 — Lich King) ----
const LICH_KING_BOSS: BossConfig = {
  minionEmoji: '/images/adventure/monsters/w5/crypt-bat.png',
  minionAttackDamage: 18,
  phases: [
    {
      hpThreshold: 1.0,
      bossWordDifficulty: { minLen: 4, maxLen: 6 },
      bossWordTimeoutMs: 9000,
      bossWordsCount: 1,
      minionWordDifficulty: { minLen: 3, maxLen: 5 },
      minionTimeoutMs: 4500,
      minionsPerWave: 3,
      dialogue: '"You dare disturb the eternal slumber?"',
    },
    {
      hpThreshold: 0.5,
      bossWordDifficulty: { minLen: 5, maxLen: 9 },
      bossWordTimeoutMs: 7500,
      bossWordsCount: 2,
      minionWordDifficulty: { minLen: 4, maxLen: 7 },
      minionTimeoutMs: 4000,
      minionsPerWave: 4,
      dialogue: '"Rise, my undead army! DESTROY THIS DUCK!"',
    },
    {
      hpThreshold: 0.15,
      bossWordDifficulty: { minLen: 7, maxLen: 11 },
      bossWordTimeoutMs: 6000,
      bossWordsCount: 3,
      minionWordDifficulty: { minLen: 5, maxLen: 8 },
      minionTimeoutMs: 3000,
      minionsPerWave: 5,
      dialogue: '"DEATH IS ONLY THE BEGINNING!"',
    },
  ],
};

// ---- 13 Stage Definitions (W5) ----
const W5_STAGE_1: StageConfig = {
  id: 1, name: 'Crypt Entrance',
  subtitle: 'Bats swarm from the ancient crypt doorway.',
  enemyConfig: CRYPT_BAT,
  waves: makeWaves(3, 6, { minLen: 3, maxLen: 5 }, 2300, 5800),
  xpReward: 30, isBoss: false,
};

const W5_STAGE_2: StageConfig = {
  id: 2, name: 'Bone Corridor',
  subtitle: 'Skeletal rats gnaw at the crumbling walls.',
  enemyConfig: BONE_RAT,
  waves: makeWaves(3, 6, { minLen: 3, maxLen: 6 }, 2200, 5600),
  xpReward: 33, isBoss: false,
};

const W5_STAGE_3: StageConfig = {
  id: 3, name: 'Shadow Hall',
  subtitle: 'Dark cats stalk through the flickering shadows.',
  enemyConfig: SHADOW_CAT,
  waves: makeWaves(4, 6, { minLen: 4, maxLen: 6 }, 2100, 5400),
  xpReward: 36, isBoss: false,
};

const W5_STAGE_4_MIDBOSS: StageConfig = {
  id: 4, name: 'Guardian Chamber',
  subtitle: 'An ancient guardian rises to protect the tomb!',
  enemyConfig: TOMB_GUARDIAN,
  waves: [],
  xpReward: 75, isBoss: true, isMidBoss: true, bossConfig: TOMB_GUARDIAN_BOSS,
};

const W5_STAGE_5: StageConfig = {
  id: 5, name: 'Spider Tomb',
  subtitle: 'Massive spiders weave webs between the coffins.',
  enemyConfig: TOMB_SPIDER,
  waves: makeWaves(4, 7, { minLen: 4, maxLen: 7 }, 2000, 5200),
  xpReward: 40, isBoss: false,
};

const W5_STAGE_6: StageConfig = {
  id: 6, name: 'Knight Gallery',
  subtitle: 'Phantom knights patrol the cursed gallery.',
  enemyConfig: PHANTOM_KNIGHT,
  waves: makeWaves(4, 7, { minLen: 5, maxLen: 7 }, 1800, 4800),
  xpReward: 44, isBoss: false,
};

const W5_STAGE_7: StageConfig = {
  id: 7, name: 'Hound Kennel',
  subtitle: 'Undead hounds howl in the depths below.',
  enemyConfig: DEATH_HOUND,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1700, 4500),
  xpReward: 48, isBoss: false,
};

const W5_STAGE_8_MIDBOSS: StageConfig = {
  id: 8, name: "Necromancer's Lair",
  subtitle: 'A dark sorcerer commands the undead legions!',
  enemyConfig: NECROMANCER,
  waves: [],
  xpReward: 90, isBoss: true, isMidBoss: true, bossConfig: NECROMANCER_BOSS,
};

const W5_STAGE_9: StageConfig = {
  id: 9, name: 'Wraith Chamber',
  subtitle: 'Ethereal wraiths phase through the stone walls.',
  enemyConfig: WRAITH,
  waves: makeWaves(5, 7, { minLen: 5, maxLen: 8 }, 1600, 4200),
  xpReward: 52, isBoss: false,
};

const W5_STAGE_10: StageConfig = {
  id: 10, name: 'Ossuary',
  subtitle: 'A skeleton lord commands the bone-filled vault.',
  enemyConfig: SKELETON_LORD,
  waves: makeWaves(5, 8, { minLen: 6, maxLen: 8 }, 1500, 4000),
  xpReward: 56, isBoss: false,
};

const W5_STAGE_11: StageConfig = {
  id: 11, name: 'Death Row',
  subtitle: 'The Doom Reaper guards the final passage.',
  enemyConfig: DOOM_REAPER,
  waves: makeWaves(6, 8, { minLen: 6, maxLen: 9 }, 1400, 3600),
  xpReward: 60, isBoss: false,
};

const W5_STAGE_12: StageConfig = {
  id: 12, name: 'Soul Pit',
  subtitle: 'A soul eater feasts on the energy of the fallen.',
  enemyConfig: SOUL_EATER,
  waves: makeWaves(6, 8, { minLen: 6, maxLen: 10 }, 1300, 3400),
  xpReward: 65, isBoss: false,
};

const W5_STAGE_13_BOSS: StageConfig = {
  id: 13, name: "Lich King's Sanctum",
  subtitle: 'Defeat the Lich King and banish the darkness!',
  enemyConfig: LICH_KING,
  waves: [],
  xpReward: 160, isBoss: true, bossConfig: LICH_KING_BOSS,
};

// ---- World 5 Debuff ----
const WORLD_5_DEBUFF: WorldDebuff = {
  type: 'darkness',
  intensity: 1,
  description: 'Darkness: words flicker in and out',
  icon: '🌑',
};

// ---- World 5 ----
export const WORLD_5: WorldConfig = {
  id: 5,
  name: 'Crypt of Shadows',
  stages: [W5_STAGE_1, W5_STAGE_2, W5_STAGE_3, W5_STAGE_4_MIDBOSS, W5_STAGE_5, W5_STAGE_6, W5_STAGE_7, W5_STAGE_8_MIDBOSS, W5_STAGE_9, W5_STAGE_10, W5_STAGE_11, W5_STAGE_12, W5_STAGE_13_BOSS],
  requiresLogin: false,
  debuff: WORLD_5_DEBUFF,
  starsRequired: 60,
};

// ---- All Worlds ----
export const WORLDS: WorldConfig[] = [WORLD_1, WORLD_2];

// ---- World Victory Cinematics ----
export const WORLD_VICTORY_CINEMATICS: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Peace has returned to Duck Village.', subtitle: 'The Shadow Wolf is no more...' },
  2: { title: 'The jungle breathes freely once more.', subtitle: 'The Giant Viper has fallen...' },
  3: { title: 'The fog lifts from the harbor at last.', subtitle: 'The Kraken sleeps beneath the waves...' },
  4: { title: 'Warmth returns to the frozen peaks.', subtitle: 'The Frostbite King melts away...' },
  5: { title: 'Light floods the ancient crypt once more.', subtitle: 'The Lich King is vanquished forever...' },
};

// ---- World Previews (for map navigation) ----
export const WORLD_PREVIEWS = [
  { id: 1, name: 'Duck Village', emoji: '🐤', desc: 'Wolves are invading the duck village! Defend your home with the power of typing.' },
  { id: 2, name: 'Venom Jungle', emoji: '🐍', desc: 'Poison fills the jungle air. Type fast before your HP drains away!' },
  { id: 3, name: 'Misty Harbor', emoji: '⚓', desc: 'Thick fog hides the words. Can you guess what lies beneath?' },
  { id: 4, name: 'Glacier Peak', emoji: '❄️', desc: 'One wrong key and you freeze. Precision is everything.' },
  { id: 5, name: 'Crypt of Shadows', emoji: '💀', desc: 'Words appear and vanish into darkness. Remember them quickly.' },
  { id: 6, name: 'Sandstorm Citadel', emoji: '🏜️', desc: 'Mirages distort your vision. Focus through the shifting sands.' },
  { id: 7, name: 'Volcanic Forge', emoji: '🌋', desc: 'The heat intensifies. Type faster as timers accelerate!' },
  { id: 8, name: 'Thunder Peaks', emoji: '⚡', desc: 'Lightning blinds the sky. Type between the flashes.' },
  { id: 9, name: 'Abyssal Depths', emoji: '🌊', desc: 'Crushing pressure and murky waters. Poison and fog combine.' },
  { id: 10, name: 'The Rift', emoji: '🌀', desc: 'Reality is reversed. Type backwards to conquer the final frontier.' },
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
