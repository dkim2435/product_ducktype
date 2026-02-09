export interface TestResult {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  mode: 'time' | 'words';
  modeValue: number;  // time in seconds or word count
  language: string;
  timestamp: number;
  wpmHistory: { time: number; value: number }[];
  rawWpmHistory: { time: number; value: number }[];
  errorHistory: { time: number; value: number }[];
}

export interface PersonalBest {
  wpm: number;
  accuracy: number;
  timestamp: number;
}

export interface PersonalBests {
  [key: string]: PersonalBest;  // key: "language-mode-value"
}
