import { useCallback } from 'react';
import type { Settings } from '../../types/settings';
import type { StageResult } from '../../types/adventure';
import type { ToastNotification } from '../../types/gamification';
import { useAdventure } from '../../hooks/useAdventure';
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
}

export function AdventurePage({
  settings,
  onBack,
  addXp,
  addToast,
  unlockAchievements,
  triggerSync,
}: AdventurePageProps) {
  const adventure = useAdventure();
  const stageConfig = adventure.getActiveStageConfig();

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

    // Perfect stage (3 stars)
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
    if (result.cleared) {
      const allCleared = [1, 2, 3, 4, 5].every(id => {
        if (id === result.stageId) return true;
        return !!adventure.progress.stages[id]?.clearedAt;
      });
      if (allCleared) {
        achievementIds.push('adventure-world-1');
      }
    }

    if (achievementIds.length > 0) {
      unlockAchievements(achievementIds, addToast);
    }

    triggerSync();
  }, [adventure, addXp, addToast, stageConfig, unlockAchievements, triggerSync]);

  return (
    <>
      {adventure.view === 'map' && (
        <WorldMap
          progress={adventure.progress}
          isStageUnlocked={adventure.isStageUnlocked}
          onSelectStage={adventure.startStage}
          onBack={onBack}
        />
      )}

      {adventure.view === 'combat' && stageConfig && (
        <CombatScene
          key={`${stageConfig.id}-${adventure.lastResult ? 'retry' : 'new'}`}
          stageConfig={stageConfig}
          settings={settings}
          onComplete={handleCombatComplete}
          onBack={adventure.returnToMap}
        />
      )}

      {adventure.view === 'result' && adventure.lastResult && stageConfig && (
        <StageComplete
          result={adventure.lastResult}
          stageConfig={stageConfig}
          onRetry={adventure.retryStage}
          onNextStage={adventure.nextStage}
          onReturnToMap={adventure.returnToMap}
          isNextUnlocked={adventure.isStageUnlocked(adventure.lastResult.stageId + 1)}
        />
      )}
    </>
  );
}
