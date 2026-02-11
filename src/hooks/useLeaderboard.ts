import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getDummyLeaderboard } from '../data/leaderboard-dummy';

export interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  user_id?: string;
  is_dummy?: boolean;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async (modeValue: number) => {
    setLoading(true);
    let realEntries: LeaderboardEntry[] = [];

    if (supabase) {
      try {
        const { data } = await supabase
          .from('leaderboard')
          .select('username, wpm, accuracy, user_id')
          .eq('mode', 'time')
          .eq('mode_value', modeValue)
          .order('wpm', { ascending: false })
          .limit(100);

        if (data) {
          realEntries = data.map((d) => ({
            username: d.username,
            wpm: d.wpm,
            accuracy: Number(d.accuracy),
            user_id: d.user_id,
          }));
        }
      } catch { /* network error */ }
    }

    // Merge with dummy data
    const dummies = getDummyLeaderboard(modeValue).map((d) => ({
      ...d,
      is_dummy: true,
    }));

    // Combine and sort by WPM descending
    const combined = [...realEntries, ...dummies]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 100);

    setEntries(combined);
    setLoading(false);
  }, []);

  const submitScore = useCallback(async (
    userId: string,
    username: string,
    wpm: number,
    accuracy: number,
    mode: string,
    modeValue: number,
  ) => {
    if (!supabase || !username) return;

    try {
      // Check if user already has an entry for this mode
      const { data: existing } = await supabase
        .from('leaderboard')
        .select('wpm')
        .eq('user_id', userId)
        .eq('mode', mode)
        .eq('mode_value', modeValue)
        .single();

      // Only update if new score is higher
      if (existing && existing.wpm >= wpm) return;

      const { error: upsertError } = await supabase.from('leaderboard').upsert({
        user_id: userId,
        username,
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 100) / 100,
        mode,
        mode_value: modeValue,
        recorded_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,mode,mode_value',
      });
      if (upsertError) console.error('Leaderboard upsert:', upsertError.message);
    } catch { /* network error */ }
  }, []);

  return { entries, loading, fetchLeaderboard, submitScore };
}
