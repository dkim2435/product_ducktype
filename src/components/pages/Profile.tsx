import React, { useState, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@supabase/supabase-js';
import type { PlayerProfile, StreakState, KeyStatsMap } from '../../types/gamification';
import type { TestResult } from '../../types/stats';
import { xpToNextLevel, getRank, RANKS, CREATOR_RANK } from '../../constants/gamification';
import { isAdminUser } from '../../utils/admin';
import { KeyboardHeatmap } from '../profile/KeyboardHeatmap';
import { StreakCalendar } from '../profile/StreakCalendar';

const WpmTrendChart = React.lazy(() =>
  import('../profile/WpmTrendChart').then(m => ({ default: m.WpmTrendChart }))
);

interface ProfileProps {
  profile: PlayerProfile;
  streak: StreakState;
  keyStats: KeyStatsMap;
  history?: TestResult[];
  onBack: () => void;
  user?: User | null;
  isSupabaseConfigured?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  currentUsername?: string | null;
  onUpdateUsername?: (newUsername: string) => Promise<void>;
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

export function Profile({ profile, streak, keyStats, history, onBack, user, isSupabaseConfigured, onLoginClick, onLogout, currentUsername, onUpdateUsername }: ProfileProps) {
  const { t } = useTranslation();
  const isAdmin = isAdminUser(user?.id);
  const rank = getRank(profile.level, isAdmin);
  const { current, needed, progress } = xpToNextLevel(profile.totalXp);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const handleStartEdit = useCallback(() => {
    setEditName(currentUsername || '');
    setNameError('');
    setIsEditingName(true);
  }, [currentUsername]);

  const handleSaveName = useCallback(async () => {
    const trimmed = editName.trim();
    if (trimmed.length < 3 || trimmed.length > 16) {
      setNameError(t('auth.errorUsernameLength'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setNameError(t('auth.errorUsernameChars'));
      return;
    }
    if (trimmed === currentUsername) {
      setIsEditingName(false);
      return;
    }
    setNameSaving(true);
    try {
      await onUpdateUsername?.(trimmed);
      setIsEditingName(false);
    } catch (err) {
      const msg = err instanceof Error && err.message === 'USERNAME_TAKEN'
        ? t('auth.errorUsernameTaken')
        : t('auth.errorGeneric');
      setNameError(msg);
    } finally {
      setNameSaving(false);
    }
  }, [editName, currentUsername, onUpdateUsername, t]);

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
              <div style={{ minWidth: 0, flex: 1 }}>
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
                  marginBottom: '6px',
                }}>
                  {user.email}
                </div>

                {/* Username display / edit */}
                {isEditingName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setNameError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                        autoFocus
                        maxLength={16}
                        style={{
                          padding: '4px 8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          color: 'var(--text-color)',
                          backgroundColor: 'var(--bg-color)',
                          border: `1.5px solid ${nameError ? 'var(--error-color)' : 'var(--main-color)'}`,
                          borderRadius: '4px',
                          outline: 'none',
                          width: '140px',
                        }}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={nameSaving}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          color: 'var(--bg-color)',
                          backgroundColor: 'var(--main-color)',
                          borderRadius: '4px',
                          cursor: nameSaving ? 'default' : 'pointer',
                          opacity: nameSaving ? 0.6 : 1,
                        }}
                      >
                        {nameSaving ? '...' : t('profile.save')}
                      </button>
                      <button
                        onClick={() => setIsEditingName(false)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          color: 'var(--sub-color)',
                          background: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                    {nameError && (
                      <div style={{ fontSize: '11px', color: 'var(--error-color)' }}>
                        {nameError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--main-color)',
                    }}>
                      {currentUsername || user.email?.split('@')[0]}
                    </span>
                    {onUpdateUsername && (
                      <button
                        onClick={handleStartEdit}
                        title={t('profile.editUsername')}
                        style={{
                          padding: '2px',
                          background: 'none',
                          color: 'var(--sub-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.6,
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
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
                  alignSelf: 'flex-start',
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
            {t('gamification.level')} {isAdmin ? 'MAX' : profile.level}
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
          <span>{isAdmin ? 'MAX' : `${current} / ${needed} XP`}</span>
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
            width: isAdmin ? '100%' : `${Math.round(progress * 100)}%`,
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
        marginBottom: '24px',
      }}>
        <StreakCalendar streak={streak} />
      </div>

      {/* WPM Trend Chart */}
      {history && history.length > 0 && (
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
            {t('profile.wpmTrend')}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--sub-color)',
            marginBottom: '16px',
          }}>
            {t('profile.wpmTrendDesc')}
          </div>
          <Suspense fallback={
            <div style={{
              height: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sub-color)',
              fontSize: '13px',
            }}>
              Loading...
            </div>
          }>
            <WpmTrendChart history={history} />
          </Suspense>
        </div>
      )}

      {/* Rank Roadmap */}
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: '24px',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-color)',
          marginBottom: '4px',
        }}>
          {t('profile.rankRoadmap')}
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--sub-color)',
          marginBottom: '20px',
        }}>
          {t('profile.rankUnlocksAt')}
        </div>

        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '4px',
            bottom: '4px',
            width: '2px',
            backgroundColor: 'var(--sub-alt-color)',
            borderLeft: '2px solid var(--sub-color)',
            opacity: 0.3,
          }} />

          {(isAdmin ? [...RANKS, CREATOR_RANK] : RANKS).map((r, i) => {
            const isCurrent = rank.name === r.name;
            const isPast = profile.level >= r.minLevel && !isCurrent;
            const isFuture = profile.level < r.minLevel;

            return (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                  opacity: isFuture ? 0.5 : 1,
                  position: 'relative',
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '-25px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? 'var(--main-color)' : isPast ? 'var(--main-color)' : 'var(--sub-alt-color)',
                  border: isCurrent ? '2px solid var(--main-color)' : '2px solid var(--sub-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }} />

                {/* Emoji */}
                <span style={{ fontSize: '20px', minWidth: '28px', textAlign: 'center' }}>
                  {r.emoji}
                </span>

                {/* Name + level */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isCurrent ? 700 : 400,
                    color: isCurrent ? 'var(--main-color)' : 'var(--text-color)',
                  }}>
                    {r.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--sub-color)',
                    marginLeft: '8px',
                  }}>
                    Lv.{r.minLevel}
                  </span>
                </div>

                {/* Status */}
                {isCurrent && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--main-color)',
                    color: 'var(--bg-color)',
                    fontWeight: 600,
                  }}>
                    {t('profile.currentRank')}
                  </span>
                )}
                {isPast && (
                  <span style={{ fontSize: '14px', color: 'var(--main-color)' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
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
