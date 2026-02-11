const PREFIX = 'ducktype_';

const PROGRESS_KEYS = new Set([
  'profile', 'achievements', 'streak', 'key_stats',
  'history', 'pb', 'daily_challenge', 'lesson_progress',
]);

let _persistProgress = false;

export function setPersistProgress(enabled: boolean): void {
  _persistProgress = enabled;
}

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (PROGRESS_KEYS.has(key) && !_persistProgress) return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function clearProgressData(): void {
  for (const key of PROGRESS_KEYS) {
    removeItem(key);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}
