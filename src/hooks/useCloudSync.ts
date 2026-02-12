import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getItem, setItem } from '../utils/storage';

const STORAGE_TO_DB: Record<string, string> = {
  profile: 'profile',
  settings: 'settings',
  history: 'history',
  pb: 'personal_bests',
  achievements: 'achievements',
  streak: 'streak',
  key_stats: 'key_stats',
  daily_challenge: 'daily_challenge',
  lesson_progress: 'lesson_progress',
};

function collectLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [storageKey, dbColumn] of Object.entries(STORAGE_TO_DB)) {
    const defaultValue = storageKey === 'history' ? [] : {};
    data[dbColumn] = getItem(storageKey, defaultValue);
  }
  return data;
}

function writeLocalData(dbRow: Record<string, unknown>) {
  for (const [storageKey, dbColumn] of Object.entries(STORAGE_TO_DB)) {
    const value = dbRow[dbColumn];
    if (value === undefined || value === null) continue;
    // Skip empty objects — let hooks use their built-in defaults
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0) continue;
    setItem(storageKey, value);
  }
}

export function useCloudSync() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSyncRef = useRef<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  // Cache the auth token so flushSync can use it synchronously
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      accessTokenRef.current = session?.access_token ?? null;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      accessTokenRef.current = session?.access_token ?? null;
    });
    return () => subscription.unsubscribe();
  }, []);

  const flushSync = useCallback(() => {
    const userId = pendingSyncRef.current;
    const token = accessTokenRef.current;
    if (!supabase || !userId || !token) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingSyncRef.current = null;

    const localData = collectLocalData();
    const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_data?on_conflict=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ id: userId, ...localData }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  // Flush pending sync on tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSyncRef.current) flushSync();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushSync]);

  const loadFromCloud = useCallback(async (userId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row exists — first login, upsert local data (safe against race conditions)
        const localData = collectLocalData();
        await supabase.from('user_data').upsert({ id: userId, ...localData });
        return false;
      }

      if (error || !data) return false;

      // Check if DB has meaningful data (profile with testsCompleted > 0)
      const dbProfile = data.profile as Record<string, unknown> | null;
      if (dbProfile && typeof dbProfile === 'object' && (dbProfile.testsCompleted as number) > 0) {
        writeLocalData(data);
        return true; // signal caller to remount
      }

      // DB row exists but empty — push local data up
      const localData = collectLocalData();
      await supabase.from('user_data').upsert({ id: userId, ...localData });
      return false;
    } catch {
      return false;
    }
  }, []);

  const requestSync = useCallback((userId: string) => {
    const client = supabase;
    if (!client) return;

    pendingSyncRef.current = userId;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      pendingSyncRef.current = null;
      try {
        const localData = collectLocalData();
        await client.from('user_data').upsert({ id: userId, ...localData });
      } catch { /* network error — will retry on next change */ }
    }, 2000);
  }, []);

  const cancelSync = useCallback(() => {
    pendingSyncRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { loadFromCloud, requestSync, cancelSync };
}
