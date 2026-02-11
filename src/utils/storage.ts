const PREFIX = 'ducktype_';

const PROGRESS_KEYS = new Set([
  'profile', 'achievements', 'streak', 'key_stats',
  'history', 'pb', 'daily_challenge', 'lesson_progress',
  'duck_hunt_high_score',
]);

let _persistProgress = false;

export function setPersistProgress(enabled: boolean): void {
  _persistProgress = enabled;
}

function storageFor(key: string): Storage {
  return PROGRESS_KEYS.has(key) ? sessionStorage : localStorage;
}

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = storageFor(key).getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (PROGRESS_KEYS.has(key) && !_persistProgress) return;
  try {
    storageFor(key).setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function clearProgressData(): void {
  for (const key of PROGRESS_KEYS) {
    try { sessionStorage.removeItem(PREFIX + key); } catch {}
    try { localStorage.removeItem(PREFIX + key); } catch {}
  }
}

export function removeItem(key: string): void {
  try {
    storageFor(key).removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}
