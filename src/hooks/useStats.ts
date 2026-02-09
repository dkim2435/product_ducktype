import { useState, useCallback } from 'react';
import type { TestResult, PersonalBests } from '../types/stats';
import type { TestState } from '../types/test';
import type { Settings } from '../types/settings';
import { getItem, setItem } from '../utils/storage';
import { calculateWpm, calculateRawWpm } from '../utils/wpm';
import { calculateAccuracy } from '../utils/accuracy';
import { calculateConsistency } from '../utils/consistency';
import { MAX_HISTORY } from '../constants/defaults';

export function useStats() {
  const [history, setHistory] = useState<TestResult[]>(() =>
    getItem<TestResult[]>('history', [])
  );
  const [personalBests, setPersonalBests] = useState<PersonalBests>(() =>
    getItem<PersonalBests>('pb', {})
  );

  const saveResult = useCallback((testState: TestState, settings: Settings): TestResult => {
    const elapsed = testState.startTime && testState.endTime
      ? (testState.endTime - testState.startTime) / 1000
      : 0;

    const wpm = calculateWpm(testState.correctChars, elapsed);
    const rawWpm = calculateRawWpm(
      testState.correctChars + testState.incorrectChars + testState.extraChars,
      elapsed
    );
    const accuracy = calculateAccuracy(testState.correctKeystrokes, testState.totalKeystrokes);
    const consistency = calculateConsistency(
      testState.wpmHistory.map(s => s.value)
    );

    const result: TestResult = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      wpm,
      rawWpm,
      accuracy,
      consistency,
      correctChars: testState.correctChars,
      incorrectChars: testState.incorrectChars,
      extraChars: testState.extraChars,
      missedChars: testState.missedChars,
      mode: settings.mode,
      modeValue: settings.mode === 'time' ? settings.timeLimit : settings.wordCount,
      language: settings.language,
      timestamp: Date.now(),
      wpmHistory: testState.wpmHistory,
      rawWpmHistory: testState.rawWpmHistory,
      errorHistory: testState.errorHistory,
    };

    // Update history
    setHistory(prev => {
      const updated = [result, ...prev].slice(0, MAX_HISTORY);
      setItem('history', updated);
      return updated;
    });

    // Check personal best
    const pbKey = `${settings.language}-${settings.mode}-${
      settings.mode === 'time' ? settings.timeLimit : settings.wordCount
    }`;
    setPersonalBests(prev => {
      const currentBest = prev[pbKey];
      if (!currentBest || wpm > currentBest.wpm) {
        const updated = {
          ...prev,
          [pbKey]: { wpm, accuracy, timestamp: Date.now() },
        };
        setItem('pb', updated);
        return updated;
      }
      return prev;
    });

    return result;
  }, []);

  const getPersonalBest = useCallback((language: string, mode: string, value: number) => {
    const key = `${language}-${mode}-${value}`;
    return personalBests[key] || null;
  }, [personalBests]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setPersonalBests({});
    setItem('history', []);
    setItem('pb', {});
  }, []);

  return { history, personalBests, saveResult, getPersonalBest, clearHistory };
}
