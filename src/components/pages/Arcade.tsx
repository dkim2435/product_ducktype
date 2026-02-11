import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { DuckHuntHighScore } from '../../types/arcade';
import type { DuckRaceHighScore } from '../../types/duckRace';

interface ArcadeProps {
  onBack: () => void;
  onPlayDuckHunt: () => void;
  onPlayDuckRace: () => void;
  duckHuntHighScore: DuckHuntHighScore | null;
  duckRaceHighScore: DuckRaceHighScore | null;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export function Arcade({ onBack, onPlayDuckHunt, onPlayDuckRace, duckHuntHighScore, duckRaceHighScore, isLoggedIn, onLoginClick }: ArcadeProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

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
          position: 'relative',
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
        <span style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '999px',
          backgroundColor: '#ff4d4f',
          color: '#fff',
        }}>
          🔥 HOT
        </span>
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
          🎯
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
          onClick={e => { e.stopPropagation(); onPlayDuckHunt(); }}
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--bg-color)',
            backgroundColor: 'var(--main-color)',
            borderRadius: 'var(--border-radius)',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          {t('arcade.play')}
        </button>
      </div>

      {/* Duck Race card + perks bubble */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        marginTop: '16px',
        alignItems: isMobile ? 'stretch' : 'stretch',
      }}>
        {/* Duck Race card */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid transparent',
            transition: 'border-color 0.15s',
          }}
          onClick={isLoggedIn ? onPlayDuckRace : onLoginClick}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--main-color)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
        >
          {/* Card content */}
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--sub-alt-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            filter: isLoggedIn ? 'none' : 'blur(3px)',
            opacity: isLoggedIn ? 1 : 0.5,
            transition: 'filter 0.2s, opacity 0.2s',
            pointerEvents: 'none',
            height: '100%',
            boxSizing: 'border-box',
          }}>
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
              🏎️
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
            {isLoggedIn && (
              <button
                onClick={e => { e.stopPropagation(); onPlayDuckRace(); }}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--bg-color)',
                  backgroundColor: 'var(--main-color)',
                  borderRadius: 'var(--border-radius)',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                {t('arcade.play')}
              </button>
            )}
          </div>

          {/* NEW badge */}
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: '#4caf50',
            color: '#fff',
            zIndex: 2,
          }}>
            ✨ NEW
          </span>

          {/* Lock overlay (logged out only) */}
          {!isLoggedIn && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              zIndex: 1,
            }}>
              <span style={{ fontSize: '24px' }}>🔒</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-color)',
              }}>
                {t('arcade.loginToPlay')}
              </span>
            </div>
          )}
        </div>

        {/* Perks bubble (logged out only) — right side on desktop, below on mobile */}
        {!isLoggedIn && (
          <div
            onClick={onLoginClick}
            style={{
              position: 'relative',
              width: isMobile ? '100%' : '220px',
              flexShrink: 0,
              padding: '16px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--main-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* Arrow pointing left (desktop) or up (mobile) */}
            <div style={{
              position: 'absolute',
              ...(isMobile
                ? { top: '-7px', left: '32px' }
                : { top: '50%', left: '-7px', marginTop: '-6px' }
              ),
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--sub-alt-color)',
              border: '1px solid var(--main-color)',
              borderRight: 'none',
              borderBottom: isMobile ? 'none' : undefined,
              borderTop: isMobile ? undefined : 'none',
              transform: isMobile ? 'rotate(45deg)' : 'rotate(45deg)',
              clipPath: isMobile
                ? 'polygon(0 0, 100% 0, 0 100%)'
                : 'polygon(0 0, 0 100%, 100% 100%)',
            }} />

            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-color)',
              marginBottom: '10px',
            }}>
              {t('arcade.loginFree')}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '11px',
              color: 'var(--sub-color)',
            }}>
              {['arcade.perk1', 'arcade.perk2', 'arcade.perk3', 'arcade.perk4'].map((key) => (
                <span key={key}>✓ {t(key)}</span>
              ))}
            </div>
            <div style={{
              marginTop: '12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--main-color)',
            }}>
              {t('arcade.loginCta')} →
            </div>
          </div>
        )}
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
