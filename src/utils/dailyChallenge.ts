import { getWordListSync } from './words';

// Mulberry32 PRNG - deterministic from seed
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Generate deterministic daily challenge words.
 * Same date always produces the same words.
 * Fixed: 60 seconds, English, with punctuation.
 */
export function getDailyChallengeWords(date: string = getTodayDateString()): string[] {
  const seed = dateToSeed(date);
  const rng = mulberry32(seed);

  const wordList = getWordListSync('en');
  const count = 100; // enough for 60 seconds
  const words: string[] = [];
  const punctuationMarks = ['.', ',', '!', '?', ';', ':'];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * wordList.length);
    let word = wordList[idx];

    // Add punctuation deterministically
    const r = rng();
    if (r < 0.1 && i > 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    if (r >= 0.1 && r < 0.25 && i < count - 1) {
      const markIdx = Math.floor(rng() * punctuationMarks.length);
      word = word + punctuationMarks[markIdx];
    }

    words.push(word);
  }

  return words;
}
