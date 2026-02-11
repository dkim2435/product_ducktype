import { useCallback, useRef } from 'react';
import type { SoundTheme } from '../types/settings';

interface UseSoundOptions {
  enabled: boolean;
  volume: number;
  theme?: SoundTheme;
}

export function useSound({ enabled, volume, theme = 'default' }: UseSoundOptions) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playClick = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      switch (theme) {
        case 'typewriter': {
          // Low-frequency clack with noise burst
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(150, now);
          osc.type = 'square';
          gain.gain.setValueAtTime(volume * 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);

          // Noise burst via short buffer
          const bufferSize = ctx.sampleRate * 0.02;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
          const noise = ctx.createBufferSource();
          const noiseGain = ctx.createGain();
          noise.buffer = buffer;
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noiseGain.gain.setValueAtTime(volume * 0.08, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          noise.start(now);
          break;
        }
        case 'mechanical': {
          // MX-style click with resonance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(3500, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);
          osc.type = 'square';
          gain.gain.setValueAtTime(volume * 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);

          // Resonance body
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(400, now);
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(volume * 0.05, now + 0.01);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc2.start(now);
          osc2.stop(now + 0.06);
          break;
        }
        case 'bubble': {
          // Soft pop — sine sweep up
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
          osc.type = 'sine';
          gain.gain.setValueAtTime(volume * 0.1, now);
          gain.gain.linearRampToValueAtTime(volume * 0.06, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
        case 'laser': {
          // Frequency sweep beep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.07);
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(volume * 0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }
        case 'piano': {
          // Musical tone — randomized from C-E-G pentatonic
          const notes = [523, 587, 659, 698, 784]; // C5 D5 E5 F5 G5
          const freq = notes[Math.floor(Math.random() * notes.length)];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, now);
          osc.type = 'triangle';
          gain.gain.setValueAtTime(volume * 0.1, now);
          gain.gain.exponentialRampToValueAtTime(volume * 0.04, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
        case 'retro': {
          // 8-bit game sound — square wave blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(660, now + 0.02);
          osc.type = 'square';
          gain.gain.setValueAtTime(volume * 0.06, now);
          gain.gain.setValueAtTime(volume * 0.04, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'crystal': {
          // High-pitched chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(2400, now);
          osc.type = 'sine';
          gain.gain.setValueAtTime(volume * 0.07, now);
          gain.gain.exponentialRampToValueAtTime(volume * 0.03, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);

          // Harmonic overtone
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(4800, now);
          osc2.type = 'sine';
          gain2.gain.setValueAtTime(volume * 0.03, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc2.start(now);
          osc2.stop(now + 0.08);
          break;
        }
        default: {
          // Default — 800Hz sine click (original)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(800, now);
          osc.type = 'sine';
          gain.gain.setValueAtTime(volume * 0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
      }
    } catch {
      // Audio not available
    }
  }, [enabled, volume, theme, getAudioContext]);

  const playError = useCallback(() => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio not available
    }
  }, [enabled, volume, getAudioContext]);

  return { playClick, playError };
}
