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
  { username: 'sprint_queen',  baseWpm: 52, peakWpm: 148, accuracy: 95.4, bestMode: 15,  level: 45 },
  { username: 'blitz_keys',    baseWpm: 53, peakWpm: 141, accuracy: 96.1, bestMode: 30,  level: 38 },
  { username: 'swiftfingers',  baseWpm: 56, peakWpm: 145, accuracy: 97.8, bestMode: 60,  level: 62 },
  { username: 'typeracer99',   baseWpm: 54, peakWpm: 138, accuracy: 96.8, bestMode: 60,  level: 55 },
  { username: 'marathon_typ',  baseWpm: 51, peakWpm: 134, accuracy: 97.2, bestMode: 120, level: 71 },

  // --- Upper mid: some grinders (high lv, ok wpm), some casuals ---
  { username: 'keyhero_kr',    baseWpm: 54, peakWpm: 62, accuracy: 95.5, bestMode: 30,  level: 28 },
  { username: 'velocity_typ',  baseWpm: 52, peakWpm: 60, accuracy: 96.3, bestMode: 15,  level: 16 },
  { username: 'ducky_master',  baseWpm: 50, peakWpm: 57, accuracy: 97.8, bestMode: 60,  level: 42 },
  { username: 'blazekeys',     baseWpm: 48, peakWpm: 55, accuracy: 94.2, bestMode: 45,  level: 19 },
  { username: 'turbotypist',   baseWpm: 47, peakWpm: 54, accuracy: 95.9, bestMode: 120, level: 33 },

  // --- Mid tier ---
  { username: 'fingerflow',    baseWpm: 45, peakWpm: 52, accuracy: 96.7, bestMode: 30,  level: 15 },
  { username: 'clickclack42',  baseWpm: 43, peakWpm: 49, accuracy: 93.4, bestMode: 15,  level: 24 },
  { username: 'speedwpm',      baseWpm: 42, peakWpm: 48, accuracy: 97.1, bestMode: 60,  level: 18 },
  { username: 'typist_cloud',  baseWpm: 40, peakWpm: 46, accuracy: 94.8, bestMode: 45,  level: 10 },
  { username: 'phantom_typ',   baseWpm: 39, peakWpm: 45, accuracy: 96.4, bestMode: 120, level: 31 },
  { username: 'dash_type',     baseWpm: 37, peakWpm: 42, accuracy: 95.2, bestMode: 30,  level: 8 },
  { username: 'keeb_lover',    baseWpm: 36, peakWpm: 41, accuracy: 92.6, bestMode: 15,  level: 14 },
  { username: 'wpm_hunter',    baseWpm: 34, peakWpm: 39, accuracy: 96.0, bestMode: 60,  level: 9 },
  { username: 'fast_duck',     baseWpm: 33, peakWpm: 38, accuracy: 93.1, bestMode: 45,  level: 7 },
  { username: 'echo_keys',     baseWpm: 31, peakWpm: 36, accuracy: 95.7, bestMode: 120, level: 21 },

  // --- Low-mid tier ---
  { username: 'typingpro_x',   baseWpm: 30, peakWpm: 34, accuracy: 94.5, bestMode: 30,  level: 6 },
  { username: 'keywarrior',    baseWpm: 28, peakWpm: 32, accuracy: 91.8, bestMode: 15,  level: 11 },
  { username: 'wordsmith_22',  baseWpm: 27, peakWpm: 31, accuracy: 95.3, bestMode: 60,  level: 8 },
  { username: 'neon_typist',   baseWpm: 25, peakWpm: 29, accuracy: 93.6, bestMode: 45,  level: 4 },
  { username: 'typeflow_kr',   baseWpm: 24, peakWpm: 28, accuracy: 90.7, bestMode: 120, level: 13 },
  { username: 'quicktype_j',   baseWpm: 23, peakWpm: 26, accuracy: 93.9, bestMode: 30,  level: 3 },
  { username: 'pixel_keys',    baseWpm: 22, peakWpm: 25, accuracy: 92.2, bestMode: 15,  level: 5 },
  { username: 'cyber_typer',   baseWpm: 21, peakWpm: 24, accuracy: 91.5, bestMode: 60,  level: 7 },

  // --- Beginners ---
  { username: 'aurora_wpm',    baseWpm: 19, peakWpm: 22, accuracy: 94.1, bestMode: 45,  level: 3 },
  { username: 'solar_keys',    baseWpm: 18, peakWpm: 21, accuracy: 90.3, bestMode: 30,  level: 2 },
  { username: 'duck_novice',   baseWpm: 17, peakWpm: 20, accuracy: 89.4, bestMode: 120, level: 4 },
  { username: 'retro_type',    baseWpm: 16, peakWpm: 18, accuracy: 91.8, bestMode: 15,  level: 1 },
  { username: 'cosmic_typ',    baseWpm: 15, peakWpm: 17, accuracy: 88.9, bestMode: 60,  level: 2 },
  { username: 'byte_runner',   baseWpm: 14, peakWpm: 16, accuracy: 92.7, bestMode: 45,  level: 1 },
  { username: 'newbie_keys',   baseWpm: 13, peakWpm: 15, accuracy: 88.2, bestMode: 30,  level: 1 },
  { username: 'cloud_nine',    baseWpm: 12, peakWpm: 14, accuracy: 90.1, bestMode: 120, level: 3 },
  { username: 'zen_typer',     baseWpm: 11, peakWpm: 13, accuracy: 87.6, bestMode: 15,  level: 1 },
  { username: 'first_steps',   baseWpm: 10, peakWpm: 12, accuracy: 85.1, bestMode: 60,  level: 1 },
  { username: 'baby_duck',     baseWpm: 9,  peakWpm: 10, accuracy: 82.3, bestMode: 45,  level: 1 },
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
  const rand = seedRand(modeValue * 7919);

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
