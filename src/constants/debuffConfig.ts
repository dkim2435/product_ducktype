import type { DebuffType } from '../types/adventure';

export interface DebuffAuraConfig {
  filter: string;
  overlay: string;
  color: string;
  label: string;
}

export const DEBUFF_AURA: Partial<Record<DebuffType, DebuffAuraConfig>> = {
  poison: {
    filter: 'drop-shadow(0 0 14px rgba(160, 0, 255, 0.9)) drop-shadow(0 0 6px rgba(120, 0, 200, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(160, 0, 255, 0.06) 100%)',
    color: '#a000ff',
    label: '☠️ POISON',
  },
  fog: {
    filter: 'drop-shadow(0 0 14px rgba(200, 200, 220, 0.9)) drop-shadow(0 0 6px rgba(170, 170, 190, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(200, 200, 220, 0.06) 100%)',
    color: '#c8c8dc',
    label: '🌫️ FOG',
  },
  freeze: {
    filter: 'drop-shadow(0 0 14px rgba(0, 200, 255, 0.9)) drop-shadow(0 0 6px rgba(0, 150, 220, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 200, 255, 0.06) 100%)',
    color: '#00c8ff',
    label: '❄️ FREEZE',
  },
  darkness: {
    filter: 'drop-shadow(0 0 14px rgba(80, 0, 120, 0.9)) drop-shadow(0 0 6px rgba(40, 0, 80, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(80, 0, 120, 0.06) 100%)',
    color: '#500078',
    label: '🌑 DARKNESS',
  },
  mirage: {
    filter: 'drop-shadow(0 0 14px rgba(255, 200, 0, 0.9)) drop-shadow(0 0 6px rgba(220, 160, 0, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 200, 0, 0.06) 100%)',
    color: '#ffc800',
    label: '🏜️ MIRAGE',
  },
  burn: {
    filter: 'drop-shadow(0 0 14px rgba(255, 80, 0, 0.9)) drop-shadow(0 0 6px rgba(220, 40, 0, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 80, 0, 0.06) 100%)',
    color: '#ff5000',
    label: '🔥 BURN',
  },
  storm: {
    filter: 'drop-shadow(0 0 14px rgba(0, 150, 255, 0.9)) drop-shadow(0 0 6px rgba(50, 100, 255, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 150, 255, 0.06) 100%)',
    color: '#0096ff',
    label: '⚡ STORM',
  },
  pressure: {
    filter: 'drop-shadow(0 0 14px rgba(0, 40, 150, 0.9)) drop-shadow(0 0 6px rgba(0, 20, 120, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 40, 150, 0.06) 100%)',
    color: '#002896',
    label: '🌊 PRESSURE',
  },
  reverse: {
    filter: 'drop-shadow(0 0 14px rgba(255, 0, 160, 0.9)) drop-shadow(0 0 6px rgba(200, 0, 120, 0.7))',
    overlay: 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 0, 160, 0.06) 100%)',
    color: '#ff00a0',
    label: '🌀 REVERSE',
  },
};
