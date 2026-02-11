export interface GhostProgressSample {
  time: number;
  progress: number;
  wpm: number;
}

export interface GhostDef {
  id: string;
  name: string;
  emoji: string;
  personality: string;
  baseWpm: number;
}

export interface GhostRacer extends GhostDef {
  samples: GhostProgressSample[];
  currentProgress: number;
  currentWpm: number;
  finished: boolean;
  finishTime: number | null;
}

export type RaceMode = 'time' | 'words';

export interface DuckRaceSettings {
  mode: RaceMode;
  timeLimit: number;
  wordCount: number;
  opponentCount: number;
}

export type DuckRacePhase = 'intro' | 'countdown' | 'racing' | 'finished';

export interface DuckRaceState {
  phase: DuckRacePhase;
  ghosts: GhostRacer[];
  playerProgress: number;
  playerWpm: number;
  playerFinished: boolean;
  playerFinishTime: number | null;
  startTime: number | null;
  elapsedSeconds: number;
  totalCharsInText: number;
  rankings: RaceRanking[];
}

export interface RaceRanking {
  id: string;
  name: string;
  emoji: string;
  place: number;
  wpm: number;
  finishTime: number | null;
  isPlayer: boolean;
}

export interface DuckRaceResult {
  placement: number;
  playerWpm: number;
  playerAccuracy: number;
  opponentCount: number;
  mode: RaceMode;
  modeValue: number;
  raceTime: number;
  rankings: RaceRanking[];
  timestamp: number;
}

export interface DuckRaceHighScore {
  bestPlacement: number;
  bestWpm: number;
  racesCompleted: number;
  winsCount: number;
  timestamp: number;
}
