import type { ParticleTier } from '../types/settings';

export interface ParticleTierConfig {
  id: ParticleTier;
  name: string;
  unlockLevel: number;
  count: number;
  colors: string[] | 'theme';
  glow: boolean;
}

export const PARTICLE_TIERS: ParticleTierConfig[] = [
  {
    id: 'none',
    name: 'None',
    unlockLevel: 1,
    count: 0,
    colors: [],
    glow: false,
  },
  {
    id: 'basic-sparks',
    name: 'Basic Sparks',
    unlockLevel: 8,
    count: 2,
    colors: ['#C0C0C0', '#D3D3D3', '#A9A9A9'],
    glow: false,
  },
  {
    id: 'colorful',
    name: 'Colorful',
    unlockLevel: 20,
    count: 3,
    colors: 'theme',
    glow: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    unlockLevel: 40,
    count: 4,
    colors: ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5'],
    glow: true,
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    unlockLevel: 60,
    count: 6,
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    glow: true,
  },
];
