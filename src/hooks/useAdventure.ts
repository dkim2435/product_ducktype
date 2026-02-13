import { useState, useCallback } from 'react';
import type {
  AdventureProgress,
  AdventureView,
  StageResult,
  StageProgress,
  WorldProgress,
  DifficultyStats,
} from '../types/adventure';
import { WORLDS, PREMIUM_WORLDS } from '../constants/adventure';
import { isAdminUser } from '../utils/admin';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = 'adventure_progress';

function createDefaultProgress(): AdventureProgress {
  return {
    worlds: {},
  };
}

/** Migrate old single-world format { worldId, stages, totalXpEarned } → new multi-world format */
function migrateProgress(raw: unknown): AdventureProgress {
  if (!raw || typeof raw !== 'object') return createDefaultProgress();

  const obj = raw as Record<string, unknown>;

  // Already new format
  if (obj.worlds && typeof obj.worlds === 'object') {
    return obj as unknown as AdventureProgress;
  }

  // Old format: { worldId, stages, totalXpEarned }
  if (obj.stages && typeof obj.stages === 'object') {
    const worldId = (obj.worldId as number) || 1;
    const newProgress: AdventureProgress = {
      worlds: {
        [worldId]: {
          stages: obj.stages as Record<number, StageProgress>,
          totalXpEarned: (obj.totalXpEarned as number) || 0,
        },
      },
    };
    // Save migrated data
    setItem(STORAGE_KEY, newProgress);
    return newProgress;
  }

  return createDefaultProgress();
}

function getWorldProgress(progress: AdventureProgress, worldId: number): WorldProgress {
  return progress.worlds[worldId] ?? { stages: {}, totalXpEarned: 0 };
}

export function useAdventure(userId?: string | null) {
  const activeWorlds = isAdminUser(userId) ? [...WORLDS, ...PREMIUM_WORLDS] : WORLDS;

  const [progress, setProgress] = useState<AdventureProgress>(() => {
    const raw = getItem<unknown>(STORAGE_KEY, null);
    return migrateProgress(raw);
  });
  const [currentWorldId, setCurrentWorldId] = useState(1);
  const [view, setView] = useState<AdventureView>('map');
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<StageResult | null>(null);

  const getCurrentWorldConfig = useCallback(() => {
    return activeWorlds.find(w => w.id === currentWorldId) ?? activeWorlds[0];
  }, [currentWorldId, activeWorlds]);

  const isWorldUnlocked = useCallback((worldId: number): boolean => {
    if (worldId === 1) return true;
    // Admin skips all unlock requirements
    if (isAdminUser(userId)) return true;
    // Previous world's boss must be cleared
    const prevWorld = activeWorlds.find(w => w.id === worldId - 1);
    if (!prevWorld) return false;
    const bossStage = prevWorld.stages[prevWorld.stages.length - 1];
    const prevProgress = getWorldProgress(progress, worldId - 1);
    if (!prevProgress.stages[bossStage.id]?.clearedAt) return false;
    // Check star requirement
    const currentWorld = activeWorlds.find(w => w.id === worldId);
    if (currentWorld && currentWorld.starsRequired > 0) {
      const prevStars = Object.values(prevProgress.stages).reduce((sum, s) => sum + s.bestStars, 0);
      if (prevStars < currentWorld.starsRequired) return false;
    }
    return true;
  }, [progress, activeWorlds]);

  const isStageUnlocked = useCallback((worldId: number, stageId: number): boolean => {
    if (isAdminUser(userId)) return true;
    if (!isWorldUnlocked(worldId)) return false;
    if (stageId === 1) return true;
    const wp = getWorldProgress(progress, worldId);
    // Find the previous stage id in the world
    const world = activeWorlds.find(w => w.id === worldId);
    if (!world) return false;
    const stageIdx = world.stages.findIndex(s => s.id === stageId);
    if (stageIdx <= 0) return stageIdx === 0;
    const prevStageId = world.stages[stageIdx - 1].id;
    return !!wp.stages[prevStageId]?.clearedAt;
  }, [progress, isWorldUnlocked, activeWorlds]);

  const getStageProgress = useCallback((worldId: number, stageId: number): StageProgress | undefined => {
    return getWorldProgress(progress, worldId).stages[stageId];
  }, [progress]);

  const startStage = useCallback((stageId: number) => {
    if (!isStageUnlocked(currentWorldId, stageId)) return;
    setActiveStageId(stageId);
    setLastResult(null);
    setView('combat');
  }, [currentWorldId, isStageUnlocked]);

  const saveStageResult = useCallback((result: StageResult) => {
    setLastResult(result);

    setProgress(prev => {
      const wp = getWorldProgress(prev, currentWorldId);
      const existing = wp.stages[result.stageId];

      // --- byDifficulty update ---
      const existingDiff = existing?.byDifficulty?.[result.difficulty];
      const newDiffStats: DifficultyStats = {
        bestWpm: Math.max(existingDiff?.bestWpm ?? 0, result.wpm),
        bestAccuracy: Math.max(existingDiff?.bestAccuracy ?? 0, result.accuracy),
        bestCombo: Math.max(existingDiff?.bestCombo ?? 0, result.maxCombo),
        clearedAt: result.cleared
          ? (existingDiff?.clearedAt ?? Date.now())
          : (existingDiff?.clearedAt ?? null),
        attempts: (existingDiff?.attempts ?? 0) + 1,
        bestTimeMs: result.cleared
          ? Math.min(existingDiff?.bestTimeMs ?? Infinity, result.timeMs)
          : (existingDiff?.bestTimeMs ?? null),
      };
      // Normalize Infinity → null (first clear sets actual time)
      if (newDiffStats.bestTimeMs === Infinity) {
        newDiffStats.bestTimeMs = null;
      }

      const newStageProgress: StageProgress = {
        stageId: result.stageId,
        bestStars: Math.max(existing?.bestStars ?? 0, result.stars),
        bestWpm: Math.max(existing?.bestWpm ?? 0, result.wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, result.accuracy),
        clearedAt: result.cleared ? (existing?.clearedAt ?? Date.now()) : (existing?.clearedAt ?? null),
        attempts: (existing?.attempts ?? 0) + 1,
        byDifficulty: {
          ...existing?.byDifficulty,
          [result.difficulty]: newDiffStats,
        },
      };

      const newWorldProgress: WorldProgress = {
        stages: {
          ...wp.stages,
          [result.stageId]: newStageProgress,
        },
        totalXpEarned: wp.totalXpEarned + result.xpEarned,
        completedAt: wp.completedAt,
      };

      // --- World completion check for this difficulty ---
      const world = activeWorlds.find(w => w.id === currentWorldId);
      if (world && result.cleared && !newWorldProgress.completedAt?.[result.difficulty]) {
        const allCleared = world.stages.every(stage => {
          const sp = newWorldProgress.stages[stage.id];
          return sp?.byDifficulty?.[result.difficulty]?.clearedAt != null;
        });
        if (allCleared) {
          newWorldProgress.completedAt = {
            ...newWorldProgress.completedAt,
            [result.difficulty]: Date.now(),
          };
        }
      }

      const newProgress: AdventureProgress = {
        worlds: {
          ...prev.worlds,
          [currentWorldId]: newWorldProgress,
        },
      };

      setItem(STORAGE_KEY, newProgress);
      return newProgress;
    });

    setView('result');
  }, [currentWorldId]);

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
    const world = getCurrentWorldConfig();
    const currentIdx = world.stages.findIndex(s => s.id === activeStageId);
    const nextStageConfig = world.stages[currentIdx + 1];
    if (nextStageConfig && isStageUnlocked(currentWorldId, nextStageConfig.id)) {
      setActiveStageId(nextStageConfig.id);
      setLastResult(null);
      setView('combat');
    } else {
      returnToMap();
    }
  }, [activeStageId, currentWorldId, getCurrentWorldConfig, isStageUnlocked, returnToMap]);

  const getActiveStageConfig = useCallback(() => {
    if (!activeStageId) return null;
    const world = getCurrentWorldConfig();
    return world.stages.find(s => s.id === activeStageId) ?? null;
  }, [activeStageId, getCurrentWorldConfig]);

  const changeWorld = useCallback((worldId: number) => {
    setCurrentWorldId(worldId);
  }, []);

  return {
    progress,
    currentWorldId,
    view,
    activeStageId,
    lastResult,
    activeWorlds,
    isWorldUnlocked,
    isStageUnlocked,
    getStageProgress,
    startStage,
    saveStageResult,
    returnToMap,
    retryStage,
    nextStage,
    getActiveStageConfig,
    getCurrentWorldConfig,
    changeWorld,
  };
}
