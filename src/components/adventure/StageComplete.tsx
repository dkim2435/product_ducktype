import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { StageResult, StageConfig } from '../../types/adventure';
import { WORLD_1 } from '../../constants/adventure';

interface StageCompleteProps {
  result: StageResult;
  stageConfig: StageConfig;
  onRetry: () => void;
  onNextStage: () => void;
  onReturnToMap: () => void;
  isNextUnlocked: boolean;
}

export function StageComplete({
  result,
  stageConfig,
  onRetry,
  onNextStage,
  onReturnToMap,
  isNextUnlocked,
}: StageCompleteProps) {
  const { t } = useTranslation();
  const [visibleStars, setVisibleStars] = useState(0);

  // Animate stars appearing one by one
  useEffect(() => {
    if (!result.cleared) return;
    setVisibleStars(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= result.stars; i++) {
      timers.push(setTimeout(() => setVisibleStars(i), i * 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [result.stars, result.cleared]);

  const hasNextStage = WORLD_1.stages.some(s => s.id === result.stageId + 1);
  const timeSeconds = Math.round(result.timeMs / 1000);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="slide-up" style={{
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }}>
      {/* Header */}
      <div style={{ fontSize: '48px' }}>
        {result.cleared ? '🎉' : '💀'}
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: result.cleared ? 'var(--main-color)' : 'var(--error-color)',
      }}>
        {result.cleared ? t('adventure.victory') : t('adventure.defeat')}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
        {stageConfig.name}
      </p>

      {/* Stars */}
      {result.cleared && (
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '36px',
        }}>
          {[1, 2, 3].map(s => (
            <span
              key={s}
              style={{
                color: s <= visibleStars ? '#fbbf24' : 'var(--sub-alt-color)',
                transition: 'color 0.3s, transform 0.3s',
                transform: s <= visibleStars ? 'scale(1.2)' : 'scale(1)',
                display: 'inline-block',
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
      }}>
        {[
          { label: t('adventure.wpm'), value: `${result.wpm}`, icon: '⌨️' },
          { label: t('adventure.accuracy'), value: `${result.accuracy}%`, icon: '🎯' },
          { label: t('adventure.maxCombo'), value: `${result.maxCombo}x`, icon: '🔥' },
          { label: t('adventure.hpLeft'), value: `${result.hpRemaining}/${result.hpMax}`, icon: '❤️' },
          { label: t('adventure.time'), value: timeStr, icon: '⏱️' },
          { label: 'XP', value: `+${result.xpEarned}`, icon: '✨' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            gap: '4px',
          }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-color)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '8px',
      }}>
        <button
          onClick={onReturnToMap}
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--sub-color)',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
          }}
        >
          {t('adventure.toMap')}
        </button>
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-color)',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            border: '1px solid var(--sub-color)',
          }}
        >
          {t('adventure.retry')}
        </button>
        {result.cleared && hasNextStage && isNextUnlocked && (
          <button
            onClick={onNextStage}
            style={{
              padding: '10px 28px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--bg-color)',
              backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
            }}
          >
            {t('adventure.nextStage')} →
          </button>
        )}
      </div>
    </div>
  );
}
