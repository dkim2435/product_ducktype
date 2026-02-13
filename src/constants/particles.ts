import type { ParticleTier } from '../types/settings';

export interface ParticleTierConfig {
  id: ParticleTier;
  name: string;
  unlockLevel: number;
  count: number;
  colors: string[] | 'theme';
  glow: boolean;
  premium?: boolean;
  premiumSet?: string;
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
  // --- Premium Neon Particles ---
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    unlockLevel: 1,
    count: 5,
    colors: ['#ff2d95', '#ff69b4', '#00d4ff', '#00a8cc'],
    glow: true,
    premium: true,
    premiumSet: 'neon-cyber',
  },
  {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    unlockLevel: 1,
    count: 5,
    colors: ['#ff6e27', '#ff9a56', '#a83cff', '#d17aff'],
    glow: true,
    premium: true,
    premiumSet: 'neon-synthwave',
  },
  {
    id: 'neon-toxic',
    name: 'Neon Toxic',
    unlockLevel: 1,
    count: 5,
    colors: ['#39ff14', '#7dff5e', '#00cc00', '#b4ff9a'],
    glow: true,
    premium: true,
    premiumSet: 'neon-toxic',
  },
  {
    id: 'neon-aurora',
    name: 'Neon Aurora',
    unlockLevel: 1,
    count: 5,
    colors: ['#00fff5', '#00ccbb', '#7fffed', '#00e5ff'],
    glow: true,
    premium: true,
    premiumSet: 'neon-aurora',
  },
  {
    id: 'neon-sunset',
    name: 'Neon Sunset',
    unlockLevel: 1,
    count: 5,
    colors: ['#ff4f81', '#ff7eb3', '#ffaa00', '#ffd166'],
    glow: true,
    premium: true,
    premiumSet: 'neon-sunset',
  },
];
