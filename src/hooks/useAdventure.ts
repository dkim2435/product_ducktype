import { useState, useCallback } from 'react';
import type {
  AdventureProgress,
  AdventureView,
  StageResult,
  StageProgress,
} from '../types/adventure';
import { WORLD_1 } from '../constants/adventure';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = 'adventure_progress';

function createDefaultProgress(): AdventureProgress {
  return {
    worldId: 1,
    stages: {},
    totalXpEarned: 0,
  };
}

export function useAdventure() {
  const [progress, setProgress] = useState<AdventureProgress>(() =>
    getItem<AdventureProgress>(STORAGE_KEY, createDefaultProgress())
  );
  const [view, setView] = useState<AdventureView>('map');
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<StageResult | null>(null);

  const isStageUnlocked = useCallback((stageId: number): boolean => {
    if (stageId === 1) return true;
    const prevStage = progress.stages[stageId - 1];
    return !!prevStage?.clearedAt;
  }, [progress]);

  const getStageProgress = useCallback((stageId: number): StageProgress | undefined => {
    return progress.stages[stageId];
  }, [progress]);

  const startStage = useCallback((stageId: number) => {
    if (!isStageUnlocked(stageId)) return;
    setActiveStageId(stageId);
    setLastResult(null);
    setView('combat');
  }, [isStageUnlocked]);

  const saveStageResult = useCallback((result: StageResult) => {
    setLastResult(result);

    setProgress(prev => {
      const existing = prev.stages[result.stageId];
      const newStageProgress: StageProgress = {
        stageId: result.stageId,
        bestStars: Math.max(existing?.bestStars ?? 0, result.stars),
        bestWpm: Math.max(existing?.bestWpm ?? 0, result.wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, result.accuracy),
        clearedAt: result.cleared ? (existing?.clearedAt ?? Date.now()) : (existing?.clearedAt ?? null),
        attempts: (existing?.attempts ?? 0) + 1,
      };

      const newProgress: AdventureProgress = {
        ...prev,
        stages: {
          ...prev.stages,
          [result.stageId]: newStageProgress,
        },
        totalXpEarned: prev.totalXpEarned + result.xpEarned,
      };

      setItem(STORAGE_KEY, newProgress);
      return newProgress;
    });

    setView('result');
  }, []);

  const returnToMap = useCallback(() => {
    setView('map');
    setActiveStageId(null);
    setLastResult(null);
  }, []);

  const retryStage = useCallback(() => {
    if (activeStageId) {
      setLastResult(null);
      setView('combat');
    }
  }, [activeStageId]);

  const nextStage = useCallback(() => {
    if (!activeStageId) return;
    const nextId = activeStageId + 1;
    const exists = WORLD_1.stages.find(s => s.id === nextId);
    if (exists && isStageUnlocked(nextId)) {
      setActiveStageId(nextId);
      setLastResult(null);
      setView('combat');
    } else {
      returnToMap();
    }
  }, [activeStageId, isStageUnlocked, returnToMap]);

  const getActiveStageConfig = useCallback(() => {
    if (!activeStageId) return null;
    return WORLD_1.stages.find(s => s.id === activeStageId) ?? null;
  }, [activeStageId]);

  return {
    progress,
    view,
    activeStageId,
    lastResult,
    isStageUnlocked,
    getStageProgress,
    startStage,
    saveStageResult,
    returnToMap,
    retryStage,
    nextStage,
    getActiveStageConfig,
  };
}
