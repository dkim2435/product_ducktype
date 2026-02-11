import type { SoundTheme } from '../types/settings';

export interface SoundThemeDef {
  id: SoundTheme;
  name: string;
  unlockLevel: number;
  description: string;
}

export const SOUND_THEMES: SoundThemeDef[] = [
  { id: 'default', name: 'Default', unlockLevel: 1, description: 'Classic click' },
  { id: 'typewriter', name: 'Typewriter', unlockLevel: 3, description: 'Retro clack' },
  { id: 'mechanical', name: 'Mechanical', unlockLevel: 7, description: 'MX-style click' },
  { id: 'bubble', name: 'Bubble', unlockLevel: 12, description: 'Soft pop' },
  { id: 'laser', name: 'Laser', unlockLevel: 18, description: 'Frequency sweep' },
  { id: 'piano', name: 'Piano', unlockLevel: 25, description: 'Musical tone' },
  { id: 'retro', name: 'Retro', unlockLevel: 35, description: '8-bit game' },
  { id: 'crystal', name: 'Crystal', unlockLevel: 50, description: 'High chime' },
];

export function getSoundThemeDef(id: SoundTheme): SoundThemeDef {
  return SOUND_THEMES.find(t => t.id === id) || SOUND_THEMES[0];
}
