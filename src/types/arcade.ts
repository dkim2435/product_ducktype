export interface Duck {
  id: number;
  word: string;
  x: number;
  y: number;
  vx: number;
  direction: 'left' | 'right';
  spawnedAt: number;
  isSpecial: boolean;
}

export interface DuckHuntState {
  phase: 'intro' | 'countdown' | 'playing' | 'gameover';
  ducks: Duck[];
  currentInput: string;
  matchedDuckId: number | null;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  ducksShot: number;
  ducksEscaped: number;
  difficulty: number;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
}

export interface DuckHuntResult {
  score: number;
  ducksShot: number;
  ducksEscaped: number;
  accuracy: number;
  maxCombo: number;
  duration: number;
}

export interface DuckHuntHighScore {
  score: number;
  ducksShot: number;
  maxCombo: number;
  timestamp: number;
}
