import { useCallback, useRef } from 'react';

interface UseSoundOptions {
  enabled: boolean;
  volume: number;
}

export function useSound({ enabled, volume }: UseSoundOptions) {
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
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio not available
    }
  }, [enabled, volume, getAudioContext]);

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
