import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import type { PlayerProfile, StreakState, KeyStatsMap } from '../../types/gamification';
import { xpToNextLevel, getRank } from '../../constants/gamification';
import { KeyboardHeatmap } from '../profile/KeyboardHeatmap';
import { StreakCalendar } from '../profile/StreakCalendar';

interface ProfileProps {
  profile: PlayerProfile;
  streak: StreakState;
  keyStats: KeyStatsMap;
  onBack: () => void;
  user?: User | null;
  isSupabaseConfigured?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function Profile({ profile, streak, keyStats, onBack, user, isSupabaseConfigured, onLoginClick, onLogout }: ProfileProps) {
  const { t } = useTranslation();
  const rank = getRank(profile.level);
  const { current, needed, progress } = xpToNextLevel(profile.totalXp);

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
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('profile.title')}
      </button>

      {/* Account section */}
      {isSupabaseConfigured && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          {user ? (
            <>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--sub-color)',
                  marginBottom: '2px',
                }}>
                  {t('auth.syncedToCloud')}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-color)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--sub-alt-color)',
                  background: 'none',
                  color: 'var(--sub-color)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-color)',
                  marginBottom: '2px',
                }}>
                  {t('auth.savePromptTitle')}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--sub-color)',
                }}>
                  {t('auth.savePromptDesc')}
                </div>
              </div>
              <button
                onClick={onLoginClick}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--main-color)',
                  color: 'var(--bg-color)',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('auth.login')}
              </button>
            </>
          )}
        </div>
      )}

      {/* Level + Rank header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '48px' }}>{rank.emoji}</div>
        <div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--main-color)',
          }}>
            {t('gamification.level')} {profile.level}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--sub-color)',
          }}>
            {rank.name}
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--sub-color)',
          marginBottom: '4px',
        }}>
          <span>{current} / {needed} XP</span>
          <span>{t('gamification.totalXp')}: {profile.totalXp}</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.round(progress * 100)}%`,
            height: '100%',
            backgroundColor: 'var(--main-color)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <StatItem label={t('gamification.testsCompleted')} value={profile.testsCompleted.toString()} />
        <StatItem label={t('gamification.totalTime')} value={formatTime(profile.totalTimeTyping)} />
        <StatItem
          label={t('gamification.currentStreak')}
          value={streak.currentStreak > 0 ? `${streak.currentStreak} ${t('gamification.days')}` : t('gamification.noStreak')}
        />
        <StatItem
          label={t('gamification.longestStreak')}
          value={`${streak.longestStreak} ${t('gamification.days')}`}
        />
        <StatItem label={t('gamification.joined')} value={formatDate(profile.joinedAt)} />
      </div>

      {/* Keyboard Heatmap */}
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-color)',
          marginBottom: '4px',
        }}>
          {t('profile.keyboardHeatmap')}
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--sub-color)',
          marginBottom: '16px',
        }}>
          {t('profile.heatmapDesc')}
        </div>
        <KeyboardHeatmap keyStats={keyStats} />
      </div>

      {/* Streak Calendar */}
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: '24px',
      }}>
        <StreakCalendar streak={streak} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'var(--sub-alt-color)',
      borderRadius: 'var(--border-radius)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--sub-color)', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-color)' }}>
        {value}
      </div>
    </div>
  );
}
