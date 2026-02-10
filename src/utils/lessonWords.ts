import { getWordListSync } from './words';
import type { KeyStatsMap } from '../types/gamification';
import { getWeakKeys } from './keyAnalysis';

/**
 * Filter word list to only words that contain at least one target key
 * and are composed entirely of target keys.
 */
function filterWordsByKeys(wordList: string[], targetKeys: string[]): string[] {
  const keySet = new Set(targetKeys.map(k => k.toLowerCase()));

  return wordList.filter(word => {
    const lower = word.toLowerCase();
    // Every character in the word must be in the target key set
    for (const ch of lower) {
      if (!keySet.has(ch)) return false;
    }
    return lower.length >= 2;
  });
}

/**
 * Shuffle array (Fisher-Yates).
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate words for a lesson based on target keys.
 */
export function generateLessonWords(targetKeys: string[], count: number): string[] {
  const wordList = getWordListSync('en');
  const filtered = filterWordsByKeys(wordList, targetKeys);

  if (filtered.length === 0) {
    // Fallback: generate simple combinations
    return generateSyntheticWords(targetKeys, count);
  }

  const words: string[] = [];
  while (words.length < count) {
    const shuffled = shuffle(filtered);
    words.push(...shuffled);
  }
  return words.slice(0, count);
}

/**
 * Generate synthetic words from target keys when no dictionary words match.
 */
function generateSyntheticWords(keys: string[], count: number): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const len = 3 + Math.floor(Math.random() * 4); // 3-6 chars
    let word = '';
    for (let j = 0; j < len; j++) {
      word += keys[Math.floor(Math.random() * keys.length)];
    }
    words.push(word);
  }
  return words;
}

/**
 * Generate words focusing on weak keys.
 */
export function generateWeakKeyWords(keyStats: KeyStatsMap, count: number): string[] {
  const weakKeys = getWeakKeys(keyStats, 8);
  if (weakKeys.length === 0) {
    // No weak keys data - use home row as default
    return generateLessonWords(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], count);
  }

  const targetKeys = weakKeys.map(k => k.key);
  // Also include some common keys to make real words possible
  const expandedKeys = [...new Set([...targetKeys, 'a', 'e', 'i', 'o', 'u', 's', 't', 'r', 'n'])];
  return generateLessonWords(expandedKeys, count);
}
