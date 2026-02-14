import type { Settings, CaretStyle, FontFamily } from '../types/settings';

export const DEFAULT_SETTINGS: Settings = {
  theme: 'ducktype-dark',
  language: 'en',
  mode: 'time',
  timeLimit: 45,
  wordCount: 25,
  fontFamily: 'default',
  fontSize: 28,
  caretStyle: 'line',
  smoothCaret: true,
  soundEnabled: true,
  soundVolume: 0.5,
  soundTheme: 'default',
  showLiveWpm: true,
  showLiveAccuracy: true,
  showTimer: true,
  punctuation: false,
  numbers: false,
  difficulty: 'normal',
  freedomMode: false,
  uiLanguage: 'en',
  profileFrame: 'none',
  particleTier: 'none',
};

export const CARET_UNLOCK: Record<CaretStyle, number> = {
  line: 1,
  block: 5,
  underline: 12,
  outline: 22,
};

export const FONT_UNLOCK: Record<FontFamily, number> = {
  default: 1,
  mono: 1,
  'roboto-mono': 8,
  'fira-code': 20,
  'source-code-pro': 35,
};

export const TIME_OPTIONS = [15, 30, 45, 60, 120];
export const WORD_OPTIONS = [10, 25, 50, 100];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
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
