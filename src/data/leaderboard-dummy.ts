export interface DummyLeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  level: number;
}

// Each dummy has a "base" WPM (45s baseline) and a specialty mode where they excel.
// The specialty boost makes them jump up in their best mode,
// while staying mid-range in other modes — creating natural rank shuffling.
// Level is NOT perfectly correlated with WPM — some grinders have high levels
// with average WPM, while some naturals type fast but are low level.
interface DummyProfile {
  username: string;
  baseWpm: number;
  peakWpm: number;
  accuracy: number;
  bestMode: number;
  level: number;
}

const DUMMY_POOL: DummyProfile[] = [
  // --- Specialists: skilled players, varied levels ---
  { username: 'minjii',        baseWpm: 68, peakWpm: 148, accuracy: 95.4, bestMode: 15,  level: 45 },
  { username: 'otter256',      baseWpm: 72, peakWpm: 141, accuracy: 96.1, bestMode: 30,  level: 38 },
  { username: 'ghostpepper',   baseWpm: 75, peakWpm: 145, accuracy: 97.8, bestMode: 60,  level: 62 },
  { username: 'juno',          baseWpm: 70, peakWpm: 138, accuracy: 96.8, bestMode: 60,  level: 55 },
  { username: 'sleepyowl',     baseWpm: 65, peakWpm: 134, accuracy: 97.2, bestMode: 120, level: 71 },

  // --- Upper mid: some grinders (high lv, ok wpm), some casuals ---
  { username: 'hyunwoo97',     baseWpm: 63, peakWpm: 72, accuracy: 95.5, bestMode: 30,  level: 28 },
  { username: 'noodleboy',     baseWpm: 60, peakWpm: 69, accuracy: 96.3, bestMode: 15,  level: 16 },
  { username: 'duckling03',    baseWpm: 56, peakWpm: 64, accuracy: 97.8, bestMode: 60,  level: 42 },
  { username: 'pepperoni',     baseWpm: 53, peakWpm: 61, accuracy: 94.2, bestMode: 45,  level: 19 },
  { username: 'bomnal',        baseWpm: 51, peakWpm: 59, accuracy: 95.9, bestMode: 120, level: 33 },

  // --- Mid tier ---
  { username: 'mochi22',       baseWpm: 45, peakWpm: 52, accuracy: 96.7, bestMode: 30,  level: 15 },
  { username: 'clicky',        baseWpm: 43, peakWpm: 49, accuracy: 93.4, bestMode: 15,  level: 24 },
  { username: 'tofu88',        baseWpm: 42, peakWpm: 48, accuracy: 97.1, bestMode: 60,  level: 18 },
  { username: 'rainyday',      baseWpm: 40, peakWpm: 46, accuracy: 94.8, bestMode: 45,  level: 10 },
  { username: 'soondae',       baseWpm: 39, peakWpm: 45, accuracy: 96.4, bestMode: 120, level: 31 },
  { username: 'boba7',         baseWpm: 37, peakWpm: 42, accuracy: 95.2, bestMode: 30,  level: 8 },
  { username: 'wafflecat',     baseWpm: 36, peakWpm: 41, accuracy: 92.6, bestMode: 15,  level: 14 },
  { username: 'june04',        baseWpm: 34, peakWpm: 39, accuracy: 96.0, bestMode: 60,  level: 9 },
  { username: 'quokka',        baseWpm: 33, peakWpm: 38, accuracy: 93.1, bestMode: 45,  level: 7 },
  { username: 'lumos',         baseWpm: 31, peakWpm: 36, accuracy: 95.7, bestMode: 120, level: 21 },

  // --- Low-mid tier ---
  { username: 'cherry90',      baseWpm: 30, peakWpm: 34, accuracy: 94.5, bestMode: 30,  level: 6 },
  { username: 'tangerine',     baseWpm: 28, peakWpm: 32, accuracy: 91.8, bestMode: 15,  level: 11 },
  { username: 'haru',          baseWpm: 27, peakWpm: 31, accuracy: 95.3, bestMode: 60,  level: 8 },
  { username: 'jellybee',      baseWpm: 25, peakWpm: 29, accuracy: 93.6, bestMode: 45,  level: 4 },
  { username: 'dongdong',      baseWpm: 24, peakWpm: 28, accuracy: 90.7, bestMode: 120, level: 13 },
  { username: 'soda51',        baseWpm: 23, peakWpm: 26, accuracy: 93.9, bestMode: 30,  level: 3 },
  { username: 'marshmallow',   baseWpm: 22, peakWpm: 25, accuracy: 92.2, bestMode: 15,  level: 5 },
  { username: 'oliver',        baseWpm: 21, peakWpm: 24, accuracy: 91.5, bestMode: 60,  level: 7 },

  // --- Beginners ---
  { username: 'bunny112',      baseWpm: 19, peakWpm: 22, accuracy: 94.1, bestMode: 45,  level: 3 },
  { username: 'pancake',       baseWpm: 18, peakWpm: 21, accuracy: 90.3, bestMode: 30,  level: 2 },
  { username: 'dabom',         baseWpm: 17, peakWpm: 20, accuracy: 89.4, bestMode: 120, level: 4 },
  { username: 'pingu3',        baseWpm: 16, peakWpm: 18, accuracy: 91.8, bestMode: 15,  level: 1 },
  { username: 'coconut',       baseWpm: 15, peakWpm: 17, accuracy: 88.9, bestMode: 60,  level: 2 },
  { username: 'minji',         baseWpm: 14, peakWpm: 16, accuracy: 92.7, bestMode: 45,  level: 1 },
  { username: 'lemonade',      baseWpm: 13, peakWpm: 15, accuracy: 88.2, bestMode: 30,  level: 1 },
  { username: 'cloudyy',       baseWpm: 12, peakWpm: 14, accuracy: 90.1, bestMode: 120, level: 3 },
  { username: 'mango55',       baseWpm: 11, peakWpm: 13, accuracy: 87.6, bestMode: 15,  level: 1 },
  { username: 'potato',        baseWpm: 10, peakWpm: 12, accuracy: 85.1, bestMode: 60,  level: 1 },
  { username: 'littleduck',    baseWpm: 9,  peakWpm: 10, accuracy: 82.3, bestMode: 45,  level: 1 },
];

// Simple deterministic pseudo-random for per-mode jitter
function seedRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// General mode multiplier (shorter tests → slightly higher WPM)
const MODE_BASE_MULT: Record<number, number> = {
  15: 1.08,
  30: 1.03,
  45: 1.0,
  60: 0.97,
  120: 0.94,
};

export function getDummyLeaderboard(modeValue: number): DummyLeaderboardEntry[] {
  const baseMult = MODE_BASE_MULT[modeValue] ?? 1.0;
  // Rotate seed daily so dummy rankings shift each day
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const rand = seedRand(modeValue * 7919 + daySeed);

  return DUMMY_POOL.map((d) => {
    // Use peakWpm in specialty mode, baseWpm otherwise
    const rawWpm = d.bestMode === modeValue ? d.peakWpm : d.baseWpm;

    // Small per-user per-mode jitter (±4%) for natural feel
    const jitter = 0.96 + rand() * 0.08;

    // Slight accuracy variation
    const accJitter = -0.4 + rand() * 0.8;

    return {
      username: d.username,
      wpm: Math.round(rawWpm * baseMult * jitter),
      accuracy: Math.round((d.accuracy + accJitter) * 10) / 10,
      level: d.level,
    };
  }).sort((a, b) => b.wpm - a.wpm);
}
