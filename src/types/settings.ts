export type CaretStyle = 'line' | 'block' | 'underline' | 'outline';
export type FontFamily = 'default' | 'mono' | 'roboto-mono' | 'fira-code' | 'source-code-pro';
export type SoundVolume = 0 | 0.25 | 0.5 | 0.75 | 1;
export type SmoothCaret = boolean;
export type Difficulty = 'normal' | 'expert' | 'master';
export type SoundTheme = 'default' | 'typewriter' | 'mechanical' | 'bubble' | 'laser' | 'piano' | 'retro' | 'crystal';
export type ProfileFrame = 'none' | 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond';
export type ParticleTier = 'none' | 'basic-sparks' | 'colorful' | 'gold' | 'rainbow';

export interface Settings {
  theme: string;
  language: string;
  mode: 'time' | 'words';
  timeLimit: number;
  wordCount: number;
  fontFamily: FontFamily;
  fontSize: number;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  soundEnabled: boolean;
  soundVolume: SoundVolume;
  soundTheme: SoundTheme;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showTimer: boolean;
  punctuation: boolean;
  numbers: boolean;
  difficulty: Difficulty;
  freedomMode: boolean;
  uiLanguage: string;
  profileFrame: ProfileFrame;
  particleTier: ParticleTier;
}
