import type { GhostDef, GhostProgressSample } from '../types/duckRace';
import { GHOST_DUCKS } from '../data/ghostDucks';

/**
 * Generate realistic WPM samples for a ghost duck over a race duration.
 * Produces one sample per second with natural speed variations.
 */
export function generateGhostSamples(
  ghost: GhostDef,
  totalChars: number,
  durationSeconds: number,
): GhostProgressSample[] {
  const samples: GhostProgressSample[] = [];
  const base = ghost.baseWpm;
  // Random phase offset for breathing rhythm
  const phaseOffset = Math.random() * Math.PI * 2;
  let cumulativeChars = 0;

  for (let t = 1; t <= durationSeconds; t++) {
    // 1. Warmup: ramp from 60% to 100% in first 5 seconds
    const warmup = t <= 5 ? 0.6 + 0.4 * (t / 5) : 1.0;

    // 2. Breathing rhythm: ±8% sinusoidal variation
    const breathing = 1 + Math.sin(t * 0.7 + phaseOffset) * 0.08;

    // 3. Micro-pause: 5% chance of 20-30% dip
    const microPause = Math.random() < 0.05
      ? 1 - (0.2 + Math.random() * 0.1)
      : 1.0;

    // 4. Burst: 3% chance of 10-15% boost
    const burst = Math.random() < 0.03
      ? 1 + (0.1 + Math.random() * 0.05)
      : 1.0;

    // 5. Fatigue: last 20% of duration, WPM * 0.95
    const fatigue = t > durationSeconds * 0.8 ? 0.95 : 1.0;

    const instantWpm = Math.round(base * warmup * breathing * microPause * burst * fatigue);

    // Characters typed this second: WPM * 5 chars/word / 60 seconds
    const charsThisSecond = (instantWpm * 5) / 60;
    cumulativeChars += charsThisSecond;

    const progress = Math.min(1.0, cumulativeChars / totalChars);

    samples.push({ time: t, progress, wpm: instantWpm });

    // If ghost finished, fill remaining with progress=1
    if (progress >= 1.0) {
      for (let remaining = t + 1; remaining <= durationSeconds; remaining++) {
        samples.push({ time: remaining, progress: 1.0, wpm: 0 });
      }
      break;
    }
  }

  return samples;
}

/**
 * Select ghost opponents based on user average WPM.
 * Distribution: 1 easy (-20%), 1-2 competitive (±10%), 1 target (+15-25%)
 */
export function selectGhosts(userAverageWpm: number | null, count: number): GhostDef[] {
  const avgWpm = userAverageWpm ?? 60;

  // Target WPMs for each opponent slot
  const targets: number[] = [];
  if (count >= 1) targets.push(avgWpm * 0.8);             // easy
  if (count >= 2) targets.push(avgWpm * (0.9 + Math.random() * 0.2)); // competitive
  if (count >= 3) targets.push(avgWpm * (1.15 + Math.random() * 0.1)); // target
  if (count >= 4) targets.push(avgWpm * (1.0 + Math.random() * 0.2 - 0.1)); // wildcard

  const selected: GhostDef[] = [];
  const used = new Set<string>();

  for (const target of targets) {
    // Find closest ghost not yet used
    let bestGhost: GhostDef | null = null;
    let bestDist = Infinity;
    for (const g of GHOST_DUCKS) {
      if (used.has(g.id)) continue;
      const dist = Math.abs(g.baseWpm - target);
      if (dist < bestDist) {
        bestDist = dist;
        bestGhost = g;
      }
    }
    if (bestGhost) {
      // Create a copy with adjusted baseWpm closer to the target
      const adjustedWpm = Math.round(target + (bestGhost.baseWpm - target) * 0.3);
      selected.push({ ...bestGhost, baseWpm: Math.max(20, adjustedWpm) });
      used.add(bestGhost.id);
    }
  }

  return selected;
}

/**
 * Interpolate ghost progress at an arbitrary time between samples.
 */
export function interpolateGhostProgress(
  samples: GhostProgressSample[],
  time: number,
): { progress: number; wpm: number } {
  if (samples.length === 0) return { progress: 0, wpm: 0 };
  if (time <= 0) return { progress: 0, wpm: samples[0]?.wpm ?? 0 };

  const lastSample = samples[samples.length - 1];
  if (time >= lastSample.time) {
    return { progress: lastSample.progress, wpm: lastSample.wpm };
  }

  // Find surrounding samples
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (samples[mid].time <= time) lo = mid;
    else hi = mid;
  }

  const a = samples[lo];
  const b = samples[hi];
  const frac = (time - a.time) / (b.time - a.time);

  return {
    progress: a.progress + (b.progress - a.progress) * frac,
    wpm: Math.round(a.wpm + (b.wpm - a.wpm) * frac),
  };
}
