import { useTranslation } from 'react-i18next';
import type { AdventureProgress } from '../../types/adventure';
import { WORLD_1 } from '../../constants/adventure';
import { useIsMobile } from '../../hooks/useIsMobile';

interface WorldMapProps {
  progress: AdventureProgress;
  isStageUnlocked: (stageId: number) => boolean;
  onSelectStage: (stageId: number) => void;
  onBack: () => void;
}

export function WorldMap({ progress, isStageUnlocked, onSelectStage, onBack }: WorldMapProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const stages = WORLD_1.stages;

  // Calculate total stars
  const totalStars = Object.values(progress.stages).reduce((sum, s) => sum + s.bestStars, 0);
  const maxStars = stages.length * 3;

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          color: 'var(--sub-color)',
          fontSize: '13px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('adventure.back')}
      </button>

      {/* World title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🐤</div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-color)',
          marginBottom: '4px',
        }}>
          {t('adventure.worldName')}
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--sub-color)',
        }}>
          {t('adventure.worldDesc')}
        </p>

        {/* Star counter */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          padding: '6px 14px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: '999px',
          fontSize: '13px',
          color: 'var(--sub-color)',
        }}>
          <span style={{ color: '#fbbf24' }}>★</span>
          {totalStars} / {maxStars}
        </div>
      </div>

      {/* Stage nodes */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        position: 'relative',
      }}>
        {stages.map((stage, idx) => {
          const unlocked = isStageUnlocked(stage.id);
          const stageProgress = progress.stages[stage.id];
          const cleared = !!stageProgress?.clearedAt;
          const stars = stageProgress?.bestStars ?? 0;
          const isNext = unlocked && !cleared;
          const isBoss = stage.isBoss;
          const nodeSize = isBoss ? (isMobile ? 70 : 80) : (isMobile ? 56 : 64);

          return (
            <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* Connector line */}
              {idx > 0 && (
                <div style={{
                  width: '2px',
                  height: '16px',
                  backgroundColor: cleared || unlocked ? 'var(--main-color)' : 'var(--sub-alt-color)',
                  marginTop: '-8px',
                  marginBottom: '-8px',
                  opacity: cleared || unlocked ? 0.6 : 0.3,
                }} />
              )}

              {/* Node */}
              <button
                onClick={() => unlocked && onSelectStage(stage.id)}
                disabled={!unlocked}
                style={{
                  width: `${nodeSize}px`,
                  height: `${nodeSize}px`,
                  borderRadius: '50%',
                  border: cleared
                    ? '3px solid var(--main-color)'
                    : isNext
                      ? '3px solid var(--main-color)'
                      : '2px solid var(--sub-alt-color)',
                  backgroundColor: cleared
                    ? 'var(--main-color)'
                    : isNext
                      ? 'var(--bg-color)'
                      : 'var(--sub-alt-color)',
                  color: cleared
                    ? 'var(--bg-color)'
                    : isNext
                      ? 'var(--main-color)'
                      : 'var(--sub-color)',
                  fontSize: isBoss ? '28px' : '22px',
                  fontWeight: 700,
                  cursor: unlocked ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: unlocked ? 1 : 0.5,
                  position: 'relative',
                  animation: isNext ? 'pulse 2s infinite' : undefined,
                  boxShadow: isBoss && unlocked
                    ? '0 0 20px rgba(var(--main-color-rgb, 0,0,0), 0.3)'
                    : undefined,
                }}
              >
                {!unlocked ? '🔒' : cleared ? '✓' : stage.enemyConfig.emoji}
              </button>

              {/* Stage info */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: unlocked ? 'var(--text-color)' : 'var(--sub-color)',
                  opacity: unlocked ? 1 : 0.6,
                }}>
                  {stage.name}
                </div>

                {/* Stars */}
                {cleared && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2px',
                    marginTop: '4px',
                  }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{
                        fontSize: '14px',
                        color: s <= stars ? '#fbbf24' : 'var(--sub-alt-color)',
                      }}>
                        ★
                      </span>
                    ))}
                  </div>
                )}

                {/* "BOSS" label */}
                {isBoss && unlocked && !cleared && (
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--error-color)',
                    letterSpacing: '1px',
                    marginTop: '4px',
                  }}>
                    BOSS
                  </div>
                )}

                {/* XP reward */}
                {isNext && (
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--sub-color)',
                    marginTop: '2px',
                  }}>
                    +{stage.xpReward} XP
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
