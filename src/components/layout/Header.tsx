import { useTranslation } from 'react-i18next';
import type { PlayerProfile, StreakState } from '../../types/gamification';
import { useIsMobile } from '../../hooks/useIsMobile';
import { XpBar } from './XpBar';
import { StreakBadge } from './StreakBadge';

interface HeaderProps {
  onSettingsClick: () => void;
  onNavigate: (page: string) => void;
  profile?: PlayerProfile;
  streak?: StreakState;
  hidden?: boolean;
}

export function Header({ onSettingsClick, onNavigate, profile, streak, hidden }: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const iconSize = isMobile ? 22 : 18;
  const settingsIconSize = isMobile ? 22 : 20;

  const mobileHidden = isMobile && hidden;

  const hasGamification = profile || (streak && streak.currentStreak > 0);

  return (
    <header style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: isMobile ? undefined : 'space-between',
      alignItems: isMobile ? undefined : 'center',
      padding: mobileHidden ? '0 12px' : 'var(--header-padding)',
      flexShrink: 0,
      maxHeight: mobileHidden ? 0 : '200px',
      overflow: mobileHidden ? 'hidden' : undefined,
      opacity: mobileHidden ? 0 : 1,
      transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
      gap: isMobile ? '6px' : undefined,
    }}>
      {/* Top row: logo + nav icons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: isMobile ? '100%' : undefined,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
          onClick={() => onNavigate('test')}
        >
          {/* Cute duck icon */}
          <svg width={isMobile ? 26 : 32} height={isMobile ? 26 : 32} viewBox="0 0 100 100" fill="none">
            {/* Body */}
            <ellipse cx="50" cy="62" rx="32" ry="26" fill="var(--main-color)" />
            {/* Head */}
            <circle cx="50" cy="34" r="20" fill="var(--main-color)" />
            {/* Eye left */}
            <circle cx="43" cy="30" r="4" fill="var(--bg-color)" />
            <circle cx="44" cy="29" r="1.5" fill="var(--text-color)" />
            {/* Eye right */}
            <circle cx="57" cy="30" r="4" fill="var(--bg-color)" />
            <circle cx="58" cy="29" r="1.5" fill="var(--text-color)" />
            {/* Beak */}
            <ellipse cx="50" cy="40" rx="10" ry="5" fill="#ff8c42" />
            {/* Wing */}
            <ellipse cx="35" cy="62" rx="12" ry="16" fill="var(--main-color)" opacity="0.7" transform="rotate(-10, 35, 62)" />
            {/* Cheek blush */}
            <circle cx="38" cy="36" r="3" fill="#ff8c42" opacity="0.3" />
            <circle cx="62" cy="36" r="3" fill="#ff8c42" opacity="0.3" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: isMobile ? '16px' : '22px',
              fontWeight: 700,
              color: 'var(--main-color)',
              letterSpacing: '0.5px',
              lineHeight: 1,
            }}>
              duck
              <span style={{ color: 'var(--text-color)', fontWeight: 300 }}>type</span>
              <span style={{ color: 'var(--main-color)' }}>.</span>
              <span style={{ color: 'var(--text-color)', fontWeight: 300 }}>xyz</span>
              {!isMobile && (
                <sup style={{
                  fontSize: '9px',
                  color: '#4caf50',
                  fontWeight: 500,
                  opacity: 0.85,
                  marginLeft: '2px',
                }}>
                  v{__APP_VERSION__}
                </sup>
              )}
            </span>
            {isMobile && (
              <span style={{
                fontSize: '9px',
                color: '#4caf50',
                fontWeight: 500,
                opacity: 0.85,
                marginTop: '2px',
              }}>
                v{__APP_VERSION__}
              </span>
            )}
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '12px' }}>
          {/* XP Bar - desktop only in nav row */}
          {profile && !isMobile && (
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('profile')}
            >
              <XpBar profile={profile} />
            </div>
          )}

          {/* Streak Badge - desktop only in nav row */}
          {streak && !isMobile && (
            <StreakBadge streak={streak} />
          )}

          {/* Nav icons */}
          <button
            onClick={() => onNavigate('profile')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={t('nav.profile')}
          >
            {/* User icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate('achievements')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={t('nav.achievements')}
          >
            {/* Trophy icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate('daily-challenge')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={t('nav.daily')}
          >
            {/* Calendar icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="m9 16 2 2 4-4" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            title={t('nav.practice')}
          >
            {/* Book icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>

          <button
            onClick={onSettingsClick}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Settings"
          >
            <svg width={settingsIconSize} height={settingsIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile second row: XP bar + Streak badge */}
      {isMobile && hasGamification && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
          onClick={() => profile && onNavigate('profile')}
        >
          {profile && <XpBar profile={profile} />}
          {streak && <StreakBadge streak={streak} />}
        </div>
      )}
    </header>
  );
}
