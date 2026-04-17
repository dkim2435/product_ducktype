const PREFIX = 'ducktype_';

const PROGRESS_KEYS = new Set([
  'profile', 'achievements', 'streak', 'key_stats',
  'history', 'pb', 'daily_challenge', 'lesson_progress',
  'adventure_progress',
]);

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    // Migration: move data from sessionStorage to localStorage if present
    if (PROGRESS_KEYS.has(key)) {
      const sessionRaw = sessionStorage.getItem(PREFIX + key);
      if (sessionRaw !== null) {
        try {
          localStorage.setItem(PREFIX + key, sessionRaw);
          sessionStorage.removeItem(PREFIX + key);
        } catch {
          // localStorage full — fall through to read sessionStorage value
        }
      }
    }

    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function clearProgressData(): void {
  for (const key of PROGRESS_KEYS) {
    try { sessionStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}
