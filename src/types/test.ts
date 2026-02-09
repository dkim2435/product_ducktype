export type TestMode = 'time' | 'words';

export type LetterState = 'correct' | 'incorrect' | 'extra' | 'pending';

export interface LetterData {
  char: string;
  state: LetterState;
  typed?: string;
}

export interface WordData {
  letters: LetterData[];
  isActive: boolean;
  isCompleted: boolean;
}

export type TestPhase = 'waiting' | 'running' | 'finished';

export interface TestConfig {
  mode: TestMode;
  timeLimit: number;    // seconds for time mode
  wordCount: number;    // word count for words mode
  language: string;     // 'en' | 'ko' | 'zh' | 'ja'
  punctuation: boolean;
  numbers: boolean;
}

export interface TestState {
  phase: TestPhase;
  words: WordData[];
  currentWordIndex: number;
  currentLetterIndex: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number | null;
  endTime: number | null;
  wpmHistory: WpmSample[];
  rawWpmHistory: WpmSample[];
  errorHistory: WpmSample[];
}

export interface WpmSample {
  time: number;  // seconds elapsed
  value: number;
}
