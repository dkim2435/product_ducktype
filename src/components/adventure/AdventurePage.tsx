import { useState, useCallback, useRef } from 'react';
import type { Settings } from '../../types/settings';
import type { StageResult, DifficultyLevel } from '../../types/adventure';
import type { ToastNotification } from '../../types/gamification';
import { useAdventure } from '../../hooks/useAdventure';
import { WORLD_PREVIEWS } from '../../constants/adventure';
import { WorldMap } from './WorldMap';
import { CombatScene } from './CombatScene';
import { StageComplete } from './StageComplete';

interface AdventurePageProps {
  settings: Settings;
  onBack: () => void;
  addXp: (amount: number) => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  unlockAchievements: (ids: string[], addToast: (toast: Omit<ToastNotification, 'id'>) => void) => void;
  triggerSync: () => void;
  initialWorldId?: number;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onShareClick: () => void;
  onTypingStateChange?: (active: boolean) => void;
  userId?: string | null;
}

export function AdventurePage({
  settings,
  onBack,
  addXp,
  addToast,
  unlockAchievements,
  triggerSync,
  initialWorldId,
  isLoggedIn,
  onLoginClick,
  onShareClick,
  onTypingStateChange,
  userId,
}: AdventurePageProps) {
  const adventure = useAdventure(userId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner');
  const prevUnlockedRef = useRef<Set<number>>(new Set(
    adventure.activeWorlds.map(w => w.id).filter(id => adventure.isWorldUnlocked(id))
  ));
  const stageConfig = adventure.getActiveStageConfig();
  const worldConfig = adventure.getCurrentWorldConfig();
  const debuffType = worldConfig.debuff?.type ?? 'none';

  // Navigate to initial world if provided
  if (initialWorldId && initialWorldId !== adventure.currentWorldId && adventure.view === 'map') {
    adventure.changeWorld(initialWorldId);
  }

  const handleCombatComplete = useCallback((result: StageResult) => {
    adventure.saveStageResult(result);

    // Award XP
    if (result.xpEarned > 0) {
      addXp(result.xpEarned);
      addToast({
        type: 'xp',
        title: result.cleared ? 'Stage Clear!' : 'Stage Failed',
        message: `+${result.xpEarned} XP`,
        icon: result.cleared ? '⚔️' : '💀',
      });
    }

    // Check achievements
    const achievementIds: string[] = [];

    // First stage clear
    if (result.cleared) {
      achievementIds.push('adventure-first-clear');
    }

    // Expert clear (3 stars)
    if (result.stars >= 3) {
      achievementIds.push('adventure-perfect-stage');
    }

    // Boss slayer
    if (result.cleared && stageConfig?.isBoss) {
      achievementIds.push('adventure-boss-slayer');
    }

    // Combo master
    if (result.maxCombo >= 15) {
      achievementIds.push('adventure-combo-master');
    }

    // World 1 complete — check if all stages cleared
    if (result.cleared && adventure.currentWorldId === 1) {
      const w1Stages = worldConfig.stages;
      const allCleared = w1Stages.every(s => {
        if (s.id === result.stageId) return true;
        return !!adventure.getStageProgress(1, s.id)?.clearedAt;
      });
      if (allCleared) {
        achievementIds.push('adventure-world-1');
      }
    }

    // World 2 complete
    if (result.cleared && adventure.currentWorldId === 2) {
      const w2Stages = worldConfig.stages;
      const allCleared = w2Stages.every(s => {
        if (s.id === result.stageId) return true;
        return !!adventure.getStageProgress(2, s.id)?.clearedAt;
      });
      if (allCleared) {
        achievementIds.push('adventure-world-2');
      }
    }

    if (achievementIds.length > 0) {
      unlockAchievements(achievementIds, addToast);
    }

    triggerSync();

    // Check if a new world just became unlocked
    setTimeout(() => {
      adventure.activeWorlds.forEach(w => {
        if (!prevUnlockedRef.current.has(w.id) && adventure.isWorldUnlocked(w.id)) {
          const preview = WORLD_PREVIEWS.find(p => p.id === w.id);
          if (preview) {
            addToast({
              type: 'achievement',
              title: `${preview.emoji} ${preview.name} Unlocked!`,
              message: 'A new world awaits you!',
              icon: '🗺️',
            });
          }
          prevUnlockedRef.current.add(w.id);
        }
      });
    }, 0);
  }, [adventure, addXp, addToast, stageConfig, worldConfig, unlockAchievements, triggerSync]);

  return (
    <>
      {adventure.view === 'map' && (
        <WorldMap
          progress={adventure.progress}
          currentWorldId={adventure.currentWorldId}
          onChangeWorld={adventure.changeWorld}
          isWorldUnlocked={adventure.isWorldUnlocked}
          isStageUnlocked={adventure.isStageUnlocked}
          onSelectStage={adventure.startStage}
          onBack={onBack}
          isLoggedIn={isLoggedIn}
          onLoginClick={onLoginClick}
          activeWorlds={adventure.activeWorlds}
        />
      )}

      {adventure.view === 'combat' && stageConfig && (() => {
        const stages = worldConfig.stages;
        const bossStage = stages[stages.length - 1];
        const bossBestStars = adventure.getStageProgress(adventure.currentWorldId, bossStage.id)?.bestStars ?? 0;
        const stageIdx = stages.findIndex(s => s.id === stageConfig.id);
        const prevStageStars = stageIdx > 0
          ? adventure.getStageProgress(adventure.currentWorldId, stages[stageIdx - 1].id)?.bestStars ?? 0
          : -1; // -1 = first stage (no prev requirement)
        return (
          <CombatScene
            key={`${adventure.currentWorldId}-${stageConfig.id}-${adventure.lastResult ? 'retry' : 'new'}`}
            stageConfig={stageConfig}
            settings={settings}
            onComplete={handleCombatComplete}
            onBack={adventure.returnToMap}
            worldId={adventure.currentWorldId}
            debuff={debuffType}
            difficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            stageBestStars={adventure.getStageProgress(adventure.currentWorldId, stageConfig.id)?.bestStars ?? 0}
            bossBestStars={bossBestStars}
            prevStageBestStars={prevStageStars}
            onTypingStateChange={onTypingStateChange}
          />
        );
      })()}

      {adventure.view === 'result' && adventure.lastResult && stageConfig && (
        <StageComplete
          result={adventure.lastResult}
          stageConfig={stageConfig}
          onRetry={adventure.retryStage}
          onNextStage={adventure.nextStage}
          onReturnToMap={adventure.returnToMap}
          isNextUnlocked={(() => {
            const stages = worldConfig.stages;
            const currentIdx = stages.findIndex(s => s.id === adventure.lastResult!.stageId);
            const nextStage = stages[currentIdx + 1];
            return nextStage ? adventure.isStageUnlocked(adventure.currentWorldId, nextStage.id) : false;
          })()}
          isNextLoginGated={(() => {
            const stages = worldConfig.stages;
            const currentIdx = stages.findIndex(s => s.id === adventure.lastResult!.stageId);
            const nextStage = stages[currentIdx + 1];
            if (!nextStage) return false;
            const loginGate = worldConfig.loginGateStageId;
            if (!isLoggedIn && loginGate !== undefined && nextStage.id >= loginGate) {
              return !adventure.getStageProgress(adventure.currentWorldId, nextStage.id)?.clearedAt;
            }
            return false;
          })()}
          onLoginClick={onLoginClick}
          onShareClick={onShareClick}
          worldStages={worldConfig.stages}
          difficulty={selectedDifficulty}
          worldId={adventure.currentWorldId}
        />
      )}
    </>
  );
}
