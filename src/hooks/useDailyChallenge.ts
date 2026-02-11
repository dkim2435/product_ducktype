import { useState, useCallback } from 'react';
import type { DailyChallengeState, DailyChallengeResult } from '../types/gamification';
import { getItem, setItem } from '../utils/storage';
import { getDailyChallengeWords, getTodayDateString } from '../utils/dailyChallenge';

const DAILY_KEY = 'daily_challenge';

function createDefaultState(): DailyChallengeState {
  return { results: [], currentStreak: 0, longestStreak: 0 };
}

export function useDailyChallenge() {
  const [state, setState] = useState<DailyChallengeState>(() => {
    const stored = getItem<DailyChallengeState>(DAILY_KEY, createDefaultState());
    if (!Array.isArray(stored.results)) return createDefaultState();
    return stored;
  });

  const today = getTodayDateString();
  const results = Array.isArray(state.results) ? state.results : [];
  const todayResult = results.find(r => r.date === today);
  const hasCompletedToday = !!todayResult;

  const getWords = useCallback((date?: string) => {
    return getDailyChallengeWords(date || today);
  }, [today]);

  const saveDailyChallengeResult = useCallback((wpm: number, accuracy: number) => {
    const result: DailyChallengeResult = {
      date: today,
      wpm,
      accuracy,
      completedAt: Date.now(),
    };

    setState(prev => {
      // Don't overwrite if already completed
      const prevResults = Array.isArray(prev.results) ? prev.results : [];
      if (prevResults.find(r => r.date === today)) return prev;

      const newResults = [...prevResults, result];

      // Calculate streak
      let currentStreak = 1;
      const sortedDates = newResults
        .map(r => r.date)
        .sort()
        .reverse();

      for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i - 1]);
        const prev = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }

      const newState: DailyChallengeState = {
        results: newResults,
        currentStreak,
        longestStreak: Math.max(prev.longestStreak, currentStreak),
      };

      setItem(DAILY_KEY, newState);
      return newState;
    });
  }, [today]);

  return {
    dailyChallengeState: state,
    hasCompletedToday,
    todayResult,
    dailyStreak: state.currentStreak,
    getWords,
    saveDailyChallengeResult,
  };
}
