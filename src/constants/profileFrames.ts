import type { ProfileFrame } from '../types/settings';

export interface ProfileFrameConfig {
  id: ProfileFrame;
  name: string;
  unlockLevel: number;
  border: string;
  glow?: string;
  animation?: string;
  premium?: boolean;
  premiumSet?: string;
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
  // --- Premium Neon Frames ---
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    unlockLevel: 1,
    border: '3px solid #ff2d95',
    glow: '0 0 12px rgba(255,45,149,0.6), 0 0 30px rgba(255,45,149,0.25)',
    animation: 'frame-neon-pulse-cyber 2s ease-in-out infinite',
    premium: true,
    premiumSet: 'neon-cyber',
  },
  {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    unlockLevel: 1,
    border: '3px solid #ff6e27',
    glow: '0 0 12px rgba(255,110,39,0.6), 0 0 30px rgba(168,60,255,0.25)',
    animation: 'frame-neon-pulse-synthwave 2s ease-in-out infinite',
    premium: true,
    premiumSet: 'neon-synthwave',
  },
  {
    id: 'neon-toxic',
    name: 'Neon Toxic',
    unlockLevel: 1,
    border: '3px solid #39ff14',
    glow: '0 0 12px rgba(57,255,20,0.6), 0 0 30px rgba(57,255,20,0.25)',
    animation: 'frame-neon-flicker-toxic 3s ease-in-out infinite',
    premium: true,
    premiumSet: 'neon-toxic',
  },
  {
    id: 'neon-aurora',
    name: 'Neon Aurora',
    unlockLevel: 1,
    border: '3px solid #00fff5',
    glow: '0 0 12px rgba(0,255,245,0.6), 0 0 30px rgba(0,255,245,0.25)',
    animation: 'frame-neon-pulse-aurora 2s ease-in-out infinite',
    premium: true,
    premiumSet: 'neon-aurora',
  },
  {
    id: 'neon-sunset',
    name: 'Neon Sunset',
    unlockLevel: 1,
    border: '3px solid #ff4f81',
    glow: '0 0 12px rgba(255,79,129,0.6), 0 0 30px rgba(255,170,0,0.25)',
    animation: 'frame-neon-pulse-sunset 2s ease-in-out infinite',
    premium: true,
    premiumSet: 'neon-sunset',
  },
];
