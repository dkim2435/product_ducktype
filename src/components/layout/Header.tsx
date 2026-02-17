import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
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
  user?: User | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
  isSupabaseConfigured?: boolean;
}

export function Header({ onSettingsClick, onNavigate, profile, streak, hidden, user, onLoginClick, onLogout, isSupabaseConfigured }: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  const [showSettingsHint, setShowSettingsHint] = useState(false);

  // Show settings hint once after a delay
  useEffect(() => {
    if (localStorage.getItem('ducktype_settings_hint_seen')) return;
    // Wait for onboarding to finish before showing
    const timer = setTimeout(() => {
      if (!localStorage.getItem('ducktype_settings_hint_seen')) {
        setShowSettingsHint(true);
        localStorage.setItem('ducktype_settings_hint_seen', '1');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!showSettingsHint) return;
    const timer = setTimeout(() => setShowSettingsHint(false), 6000);
    return () => clearTimeout(timer);
  }, [showSettingsHint]);

  const iconSize = isMobile ? 22 : 18;
  const settingsIconSize = isMobile ? 22 : 20;

  const mobileHidden = isMobile && hidden;

  const hasGamification = profile || (streak && streak.currentStreak > 0);

  const handleProfileClick = () => {
    if (isSupabaseConfigured && !user) {
      onLoginClick?.();
    } else {
      onNavigate('profile');
    }
  };

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
        width: '100%',
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

        <nav style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '2px' : '12px' }}>
          {/* XP Bar - desktop only in nav row */}
          {profile && !isMobile && (
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('profile')}
            >
              <XpBar profile={profile} userId={user?.id} />
            </div>
          )}

          {/* Streak Badge - desktop only in nav row */}
          {streak && !isMobile && (
            <StreakBadge streak={streak} />
          )}

          {/* Profile / Login — unified icon */}
          {isSupabaseConfigured && user ? (
            // Logged in: avatar with dropdown
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                style={{
                  width: isMobile ? 36 : 26,
                  height: isMobile ? 36 : 26,
                  borderRadius: '50%',
                  backgroundColor: 'var(--main-color)',
                  color: 'var(--bg-color)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={t('nav.profile')}
                title={user.email ?? ''}
              >
                {(user.email ?? '?')[0].toUpperCase()}
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--sub-alt-color)',
                  borderRadius: '8px',
                  padding: '8px 0',
                  minWidth: '180px',
                  zIndex: 200,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  <div style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    color: 'var(--sub-color)',
                    borderBottom: '1px solid var(--sub-alt-color)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.email}
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); onNavigate('profile'); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 14px',
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-color)',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {t('nav.profile')}
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 14px',
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-color)',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in (or supabase not configured): profile icon
            <button
              onClick={handleProfileClick}
              style={{
                padding: 'var(--nav-icon-padding)',
                color: 'var(--sub-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={t('nav.profile')}
              title={t('nav.profile')}
            >
              {/* User icon */}
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}

          {/* Leaderboard & Achievements — desktop only (accessible via profile on mobile) */}
          {!isMobile && (
            <button
              onClick={() => onNavigate('leaderboard')}
              style={{
                padding: 'var(--nav-icon-padding)',
                color: 'var(--sub-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={t('leaderboard.title')}
              title={t('leaderboard.title')}
            >
              {/* Leaderboard / bar-chart icon */}
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="3" width="4" height="18" rx="1" />
                <rect x="17" y="8" width="4" height="13" rx="1" />
              </svg>
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => onNavigate('achievements')}
              style={{
                padding: 'var(--nav-icon-padding)',
                color: 'var(--sub-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={t('nav.achievements')}
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
          )}

          <button
            onClick={() => onNavigate('practice')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={t('nav.practice')}
            title={t('nav.practice')}
          >
            {/* Book icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>

          <button
            onClick={() => onNavigate('adventure')}
            style={{
              padding: 'var(--nav-icon-padding)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
            aria-label={t('nav.adventure')}
            title={t('nav.adventure')}
          >
            <sup style={{
              position: 'absolute',
              top: isMobile ? -4 : -3,
              right: isMobile ? -8 : -6,
              fontSize: '9px',
              fontWeight: 700,
              color: '#ff5722',
              letterSpacing: '0.3px',
              pointerEvents: 'none',
            }}>
              HOT
            </sup>
            {/* Sword icon */}
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6-6" />
              <path d="M16 16l4 4" />
              <path d="M19 21l2-2" />
            </svg>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowSettingsHint(false); onSettingsClick(); }}
              style={{
                padding: 'var(--nav-icon-padding)',
                color: 'var(--sub-color)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Settings"
              title="Settings"
            >
              <svg width={settingsIconSize} height={settingsIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            {/* Settings hint tooltip */}
            {showSettingsHint && (
              <div
                className="fade-in"
                onClick={() => { setShowSettingsHint(false); onSettingsClick(); }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--main-color)',
                  color: 'var(--bg-color)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  lineHeight: 1.5,
                }}
              >
                <div>{t('header.settingsHint')}</div>
                <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.85 }}>
                  {t('header.settingsHintSub')}
                </div>
                {/* Arrow pointing up */}
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '14px',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid var(--main-color)',
                }} />
              </div>
            )}
          </div>
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
          {profile && <XpBar profile={profile} userId={user?.id} />}
          {streak && <StreakBadge streak={streak} />}
        </div>
      )}
    </header>
  );
}
