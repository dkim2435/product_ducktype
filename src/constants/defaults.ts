import type { Settings } from '../types/settings';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'ducktype-dark',
  language: 'en',
  mode: 'time',
  timeLimit: 30,
  wordCount: 25,
  fontFamily: 'default',
  fontSize: 24,
  caretStyle: 'line',
  smoothCaret: true,
  soundEnabled: false,
  soundVolume: 0.5,
  showLiveWpm: true,
  showLiveAccuracy: true,
  showTimer: true,
  punctuation: false,
  numbers: false,
  difficulty: 'normal',
  freedomMode: false,
  uiLanguage: 'en',
};

export const TIME_OPTIONS = [15, 30, 60, 120];
export const WORD_OPTIONS = [10, 25, 50, 100];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

export const FONT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'mono', label: 'Monospace' },
  { value: 'roboto-mono', label: 'Roboto Mono' },
  { value: 'fira-code', label: 'Fira Code' },
  { value: 'source-code-pro', label: 'Source Code Pro' },
];

export const MAX_HISTORY = 100;
export const WPM_SAMPLE_INTERVAL = 1; // seconds
