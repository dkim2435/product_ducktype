export interface DummyLeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
}

// Base dummy data for 45s mode. Other modes are derived with multipliers.
const BASE_DUMMIES: DummyLeaderboardEntry[] = [
  { username: 'swiftfingers', wpm: 142, accuracy: 97.8 },
  { username: 'typeracer99', wpm: 136, accuracy: 96.8 },
  { username: 'qwerty_ninja', wpm: 131, accuracy: 98.1 },
  { username: 'keyhero_kr', wpm: 126, accuracy: 95.5 },
  { username: 'velocity_typ', wpm: 122, accuracy: 96.3 },
  { username: 'ducky_master', wpm: 118, accuracy: 97.8 },
  { username: 'blazekeys', wpm: 114, accuracy: 94.2 },
  { username: 'turbotypist', wpm: 110, accuracy: 95.9 },
  { username: 'fingerflow', wpm: 107, accuracy: 96.7 },
  { username: 'clickclack42', wpm: 103, accuracy: 93.4 },
  { username: 'speedwpm', wpm: 100, accuracy: 97.1 },
  { username: 'typist_cloud', wpm: 97, accuracy: 94.8 },
  { username: 'phantom_typ', wpm: 94, accuracy: 96.4 },
  { username: 'dash_type', wpm: 91, accuracy: 95.2 },
  { username: 'keeb_lover', wpm: 88, accuracy: 92.6 },
  { username: 'wpm_hunter', wpm: 85, accuracy: 96.0 },
  { username: 'fast_duck', wpm: 83, accuracy: 93.1 },
  { username: 'echo_keys', wpm: 80, accuracy: 95.7 },
  { username: 'typingpro_x', wpm: 78, accuracy: 94.5 },
  { username: 'keywarrior', wpm: 75, accuracy: 91.8 },
  { username: 'wordsmith_22', wpm: 73, accuracy: 95.3 },
  { username: 'neon_typist', wpm: 71, accuracy: 93.6 },
  { username: 'typeflow_kr', wpm: 69, accuracy: 90.7 },
  { username: 'quicktype_j', wpm: 67, accuracy: 93.9 },
  { username: 'pixel_keys', wpm: 65, accuracy: 92.2 },
  { username: 'cyber_typer', wpm: 63, accuracy: 91.5 },
  { username: 'aurora_wpm', wpm: 61, accuracy: 94.1 },
  { username: 'solar_keys', wpm: 59, accuracy: 90.3 },
  { username: 'duck_novice', wpm: 57, accuracy: 89.4 },
  { username: 'retro_type', wpm: 55, accuracy: 91.8 },
  { username: 'cosmic_typ', wpm: 53, accuracy: 88.9 },
  { username: 'byte_runner', wpm: 51, accuracy: 92.7 },
  { username: 'newbie_keys', wpm: 49, accuracy: 88.2 },
  { username: 'cloud_nine', wpm: 47, accuracy: 90.1 },
  { username: 'zen_typer', wpm: 45, accuracy: 87.6 },
  { username: 'learner_01', wpm: 43, accuracy: 87.5 },
  { username: 'nova_keys', wpm: 41, accuracy: 89.3 },
  { username: 'first_steps', wpm: 38, accuracy: 85.1 },
  { username: 'starter_typ', wpm: 35, accuracy: 84.7 },
  { username: 'baby_duck', wpm: 32, accuracy: 82.3 },
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
