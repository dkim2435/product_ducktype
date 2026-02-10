import { useState, useCallback } from 'react';
import type { LessonId, LessonProgress, LessonProgressMap, KeyStatsMap } from '../types/gamification';
import { getItem, setItem } from '../utils/storage';
import { LESSONS, LESSON_WORD_COUNT } from '../constants/lessons';
import { generateLessonWords, generateWeakKeyWords } from '../utils/lessonWords';

const LESSON_KEY = 'lesson_progress';

export function useLessons() {
  const [lessonProgress, setLessonProgress] = useState<LessonProgressMap>(() =>
    getItem<LessonProgressMap>(LESSON_KEY, {})
  );

  const isLessonUnlocked = useCallback((lessonId: LessonId): boolean => {
    const lesson = LESSONS.find(l => l.id === lessonId);
    if (!lesson) return false;

    // weak-keys is always unlocked
    if (lessonId === 'weak-keys') return true;

    // First lesson (home-row) is always unlocked
    if (!lesson.prerequisite) return true;

    // Check if prerequisite is completed
    const prereq = lessonProgress[lesson.prerequisite];
    return prereq?.completedAt != null;
  }, [lessonProgress]);

  const getLessonWords = useCallback((lessonId: LessonId, keyStats?: KeyStatsMap): string[] => {
    if (lessonId === 'weak-keys' && keyStats) {
      return generateWeakKeyWords(keyStats, LESSON_WORD_COUNT);
    }

    const lesson = LESSONS.find(l => l.id === lessonId);
    if (!lesson) return [];

    return generateLessonWords(lesson.targetKeys, LESSON_WORD_COUNT);
  }, []);

  const saveLessonResult = useCallback((lessonId: LessonId, wpm: number, accuracy: number) => {
    setLessonProgress(prev => {
      const existing = prev[lessonId];
      const updated: LessonProgress = {
        lessonId,
        bestWpm: Math.max(existing?.bestWpm || 0, wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy || 0, accuracy),
        attempts: (existing?.attempts || 0) + 1,
        completedAt: existing?.completedAt || Date.now(),
      };

      const newProgress = { ...prev, [lessonId]: updated };
      setItem(LESSON_KEY, newProgress);
      return newProgress;
    });
  }, []);

  const getNextLesson = useCallback((): LessonId | null => {
    for (const lesson of LESSONS) {
      if (lesson.id === 'weak-keys') continue;
      if (!lessonProgress[lesson.id]?.completedAt) {
        return lesson.id;
      }
    }
    return null;
  }, [lessonProgress]);

  return {
    lessonProgress,
    isLessonUnlocked,
    getLessonWords,
    saveLessonResult,
    getNextLesson,
  };
}
