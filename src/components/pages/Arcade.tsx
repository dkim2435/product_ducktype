import { useTranslation } from 'react-i18next';
import type { DuckHuntHighScore } from '../../types/arcade';
import type { DuckRaceHighScore } from '../../types/duckRace';

interface ArcadeProps {
  onBack: () => void;
  onPlayDuckHunt: () => void;
  onPlayDuckRace: () => void;
  duckHuntHighScore: DuckHuntHighScore | null;
  duckRaceHighScore: DuckRaceHighScore | null;
}

export function Arcade({ onBack, onPlayDuckHunt, onPlayDuckRace, duckHuntHighScore, duckRaceHighScore }: ArcadeProps) {
  const { t } = useTranslation();

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '600px',
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
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('arcade.title')}
      </button>

      {/* Tagline */}
      <div style={{
        fontSize: '14px',
        color: 'var(--sub-color)',
        marginBottom: '20px',
      }}>
        {t('arcade.tagline')}
      </div>

      {/* Duck Hunt card */}
      <div
        style={{
          padding: '24px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'border-color 0.15s',
        }}
        onClick={onPlayDuckHunt}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--main-color)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0,
        }}>
          🦆
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-color)',
            marginBottom: '4px',
          }}>
            {t('duckHunt.title')}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--sub-color)',
            lineHeight: 1.4,
          }}>
            {t('duckHunt.description')}
          </div>
          {duckHuntHighScore && (
            <div style={{
              fontSize: '11px',
              color: 'var(--main-color)',
              marginTop: '6px',
              fontWeight: 600,
            }}>
              🏆 {t('arcade.highScore')}: {duckHuntHighScore.score}
            </div>
          )}
        </div>

        <button
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--bg-color)',
            backgroundColor: 'var(--main-color)',
            borderRadius: 'var(--border-radius)',
            flexShrink: 0,
          }}
        >
          {t('arcade.play')}
        </button>
      </div>

      {/* Duck Race card */}
      <div
        style={{
          marginTop: '16px',
          padding: '24px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'border-color 0.15s',
        }}
        onClick={onPlayDuckRace}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--main-color)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0,
        }}>
          🏁
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-color)',
            marginBottom: '4px',
          }}>
            {t('duckRace.title')}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--sub-color)',
            lineHeight: 1.4,
          }}>
            {t('duckRace.description')}
          </div>
          {duckRaceHighScore && (
            <div style={{
              fontSize: '11px',
              color: 'var(--main-color)',
              marginTop: '6px',
              fontWeight: 600,
            }}>
              🏆 {t('arcade.highScore')}: {duckRaceHighScore.bestWpm} WPM ({duckRaceHighScore.winsCount}W / {duckRaceHighScore.racesCompleted}R)
            </div>
          )}
        </div>

        <button
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--bg-color)',
            backgroundColor: 'var(--main-color)',
            borderRadius: 'var(--border-radius)',
            flexShrink: 0,
          }}
        >
          {t('arcade.play')}
        </button>
      </div>

      {/* Coming soon placeholder */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--sub-color)',
        fontSize: '13px',
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        opacity: 0.6,
      }}>
        {t('arcade.comingSoon')}
      </div>
    </div>
  );
}
