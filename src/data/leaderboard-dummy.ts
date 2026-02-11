export interface DummyLeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
}

// Base dummy data for 45s mode. Other modes are derived with multipliers.
const BASE_DUMMIES: DummyLeaderboardEntry[] = [
  { username: 'swiftfingers', wpm: 142, accuracy: 97.8 },
  { username: 'typeracer99', wpm: 136, accuracy: 96.8 },
  { username: 'qwerty_ninja', wpm: 51, accuracy: 98.1 },
  { username: 'keyhero_kr', wpm: 49, accuracy: 95.5 },
  { username: 'velocity_typ', wpm: 48, accuracy: 96.3 },
  { username: 'ducky_master', wpm: 46, accuracy: 97.8 },
  { username: 'blazekeys', wpm: 45, accuracy: 94.2 },
  { username: 'turbotypist', wpm: 44, accuracy: 95.9 },
  { username: 'fingerflow', wpm: 43, accuracy: 96.7 },
  { username: 'clickclack42', wpm: 42, accuracy: 93.4 },
  { username: 'speedwpm', wpm: 41, accuracy: 97.1 },
  { username: 'typist_cloud', wpm: 40, accuracy: 94.8 },
  { username: 'phantom_typ', wpm: 39, accuracy: 96.4 },
  { username: 'dash_type', wpm: 38, accuracy: 95.2 },
  { username: 'keeb_lover', wpm: 37, accuracy: 92.6 },
  { username: 'wpm_hunter', wpm: 36, accuracy: 96.0 },
  { username: 'fast_duck', wpm: 35, accuracy: 93.1 },
  { username: 'echo_keys', wpm: 34, accuracy: 95.7 },
  { username: 'typingpro_x', wpm: 33, accuracy: 94.5 },
  { username: 'keywarrior', wpm: 32, accuracy: 91.8 },
  { username: 'wordsmith_22', wpm: 31, accuracy: 95.3 },
  { username: 'neon_typist', wpm: 30, accuracy: 93.6 },
  { username: 'typeflow_kr', wpm: 29, accuracy: 90.7 },
  { username: 'quicktype_j', wpm: 28, accuracy: 93.9 },
  { username: 'pixel_keys', wpm: 27, accuracy: 92.2 },
  { username: 'cyber_typer', wpm: 26, accuracy: 91.5 },
  { username: 'aurora_wpm', wpm: 25, accuracy: 94.1 },
  { username: 'solar_keys', wpm: 24, accuracy: 90.3 },
  { username: 'duck_novice', wpm: 23, accuracy: 89.4 },
  { username: 'retro_type', wpm: 22, accuracy: 91.8 },
  { username: 'cosmic_typ', wpm: 21, accuracy: 88.9 },
  { username: 'byte_runner', wpm: 20, accuracy: 92.7 },
  { username: 'newbie_keys', wpm: 19, accuracy: 88.2 },
  { username: 'cloud_nine', wpm: 18, accuracy: 90.1 },
  { username: 'zen_typer', wpm: 17, accuracy: 87.6 },
  { username: 'learner_01', wpm: 16, accuracy: 87.5 },
  { username: 'nova_keys', wpm: 15, accuracy: 89.3 },
  { username: 'first_steps', wpm: 14, accuracy: 85.1 },
  { username: 'starter_typ', wpm: 13, accuracy: 84.7 },
  { username: 'baby_duck', wpm: 12, accuracy: 82.3 },
];

// Shorter tests → slightly higher WPM, longer → slightly lower
const MODE_MULTIPLIERS: Record<number, number> = {
  15: 1.12,
  30: 1.05,
  45: 1.0,
  60: 0.97,
  120: 0.93,
};

export function getDummyLeaderboard(modeValue: number): DummyLeaderboardEntry[] {
  const mult = MODE_MULTIPLIERS[modeValue] ?? 1.0;
  return BASE_DUMMIES.map((d) => ({
    ...d,
    wpm: Math.round(d.wpm * mult),
  }));
}
