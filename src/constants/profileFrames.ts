import type { ProfileFrame } from '../types/settings';

export interface ProfileFrameConfig {
  id: ProfileFrame;
  name: string;
  unlockLevel: number;
  border: string;
  glow?: string;
  animation?: string;
}

export const PROFILE_FRAMES: ProfileFrameConfig[] = [
  {
    id: 'none',
    name: 'None',
    unlockLevel: 1,
    border: 'none',
  },
  {
    id: 'basic',
    name: 'Basic',
    unlockLevel: 5,
    border: '2px solid var(--sub-color)',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    unlockLevel: 15,
    border: '2px solid #CD7F32',
    glow: '0 0 8px rgba(205,127,50,0.4)',
  },
  {
    id: 'silver',
    name: 'Silver',
    unlockLevel: 30,
    border: '2px solid #C0C0C0',
    glow: '0 0 10px rgba(192,192,192,0.5)',
  },
  {
    id: 'gold',
    name: 'Gold',
    unlockLevel: 50,
    border: '3px solid #FFD700',
    glow: '0 0 12px rgba(255,215,0,0.5)',
    animation: 'frame-gold-pulse 2s ease-in-out infinite',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    unlockLevel: 70,
    border: '3px solid #B9F2FF',
    glow: '0 0 14px rgba(185,242,255,0.5), 0 0 28px rgba(185,242,255,0.2)',
    animation: 'frame-diamond-sparkle 3s ease-in-out infinite',
  },
];
