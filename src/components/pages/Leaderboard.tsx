import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import { getRank } from '../../constants/gamification';
import type { LeaderboardEntry } from '../../hooks/useLeaderboard';

const TIME_OPTIONS = [15, 30, 45, 60, 120];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_HEIGHTS = [120, 90, 70];
const PODIUM_HEIGHTS_MOBILE = [90, 68, 54];

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  onFetch: (modeValue: number) => void;
  onBack: () => void;
  currentUserId?: string | null;
  currentUsername?: string | null;
  currentUserLevel?: number;
}

export function Leaderboard({ entries, loading, onFetch, onBack, currentUserId, currentUsername, currentUserLevel }: LeaderboardProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [selectedTime, setSelectedTime] = useState(45);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    onFetch(selectedTime);
    setAnimatedCount(0);
  }, [selectedTime, onFetch]);

  // Staggered animation: reveal rows one by one
  useEffect(() => {
    if (loading || entries.length === 0) {
      setAnimatedCount(0);
      return;
    }
    // Animate podium first (instant), then rows
    setAnimatedCount(3);
    const timer = setInterval(() => {
      setAnimatedCount((c) => {
        if (c >= entries.length) {
          clearInterval(timer);
          return c;
        }
        return c + 3;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [entries, loading]);

  // Get rank emoji for an entry
  const getEntryRankEmoji = (entry: LeaderboardEntry) => {
    const isUser = currentUserId
      ? entry.user_id === currentUserId
      : entry.username === currentUsername;
    const level = isUser ? currentUserLevel : entry.level;
    if (!level) return null;
    return getRank(level).emoji;
  };

  // Find current user's rank
  const userRank = currentUserId
    ? entries.findIndex((e) => e.user_id === currentUserId) + 1
    : 0;
  const userEntry = userRank > 0 ? entries[userRank - 1] : null;

  const userRankByName = !userRank && currentUsername
    ? entries.findIndex((e) => e.username === currentUsername) + 1
    : 0;

  const effectiveRank = userRank || userRankByName;
  const effectiveEntry = userEntry || (userRankByName > 0 ? entries[userRankByName - 1] : null);

  // Percentile calculation
  const percentile = effectiveRank > 0 && entries.length > 0
    ? Math.round(((entries.length - effectiveRank) / entries.length) * 100)
    : null;

  // Max WPM for bar visualization
  const maxWpm = entries.length > 0 ? entries[0].wpm : 1;

  // Top 3 for podium (reorder: 2nd, 1st, 3rd)
  const top3 = entries.slice(0, 3);
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3;
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : top3.map((_, i) => i + 1);

  // Remaining entries (after top 3)
  const tableEntries = entries.slice(3);

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
        {t('leaderboard.title')}
      </button>

      {/* Time filter tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {TIME_OPTIONS.map((tv) => (
          <button
            key={tv}
            onClick={() => setSelectedTime(tv)}
            style={{
              padding: isMobile ? '6px 14px' : '6px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
              backgroundColor: selectedTime === tv ? 'var(--main-color)' : 'var(--sub-alt-color)',
              color: selectedTime === tv ? 'var(--bg-color)' : 'var(--sub-color)',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {tv}s
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sub-color)', fontSize: '14px' }}>
          {t('leaderboard.loading')}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sub-color)', fontSize: '14px' }}>
          {t('leaderboard.empty')}
        </div>
      ) : (
        <>
          {/* Podium — Top 3 */}
          {top3.length >= 3 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: isMobile ? '8px' : '12px',
              marginBottom: '28px',
              padding: '0 8px',
            }}>
              {podiumOrder.map((entry, i) => {
                const rank = podiumRanks[i];
                const heights = isMobile ? PODIUM_HEIGHTS_MOBILE : PODIUM_HEIGHTS;
                const podiumH = heights[rank - 1];
                const isUser = currentUserId
                  ? entry.user_id === currentUserId
                  : entry.username === currentUsername;

                return (
                  <div
                    key={entry.username}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                      maxWidth: isMobile ? '110px' : '150px',
                      opacity: animatedCount >= 3 ? 1 : 0,
                      transform: animatedCount >= 3 ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.5s ease ${rank === 1 ? '0.1s' : rank === 2 ? '0s' : '0.2s'}, transform 0.5s ease ${rank === 1 ? '0.1s' : rank === 2 ? '0s' : '0.2s'}`,
                    }}
                  >
                    {/* Medal */}
                    <div style={{
                      fontSize: rank === 1 ? (isMobile ? '28px' : '36px') : (isMobile ? '22px' : '28px'),
                      marginBottom: '4px',
                    }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </div>

                    {/* Username */}
                    <div style={{
                      fontSize: isMobile ? '11px' : '13px',
                      fontWeight: 600,
                      color: isUser ? 'var(--main-color)' : 'var(--text-color)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                    }}>
                      {getEntryRankEmoji(entry) && (
                        <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{getEntryRankEmoji(entry)}</span>
                      )}
                      <span>{entry.username}</span>
                    </div>

                    {/* Podium block */}
                    <div style={{
                      width: '100%',
                      height: `${podiumH}px`,
                      backgroundColor: 'var(--sub-alt-color)',
                      borderRadius: '8px 8px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      border: isUser ? '1.5px solid var(--main-color)' : '1px solid transparent',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Subtle gradient overlay for 1st place */}
                      {rank === 1 && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(180deg, ${MEDAL_COLORS[0]}15 0%, transparent 60%)`,
                          borderRadius: 'inherit',
                        }} />
                      )}
                      <div style={{
                        fontSize: rank === 1 ? (isMobile ? '24px' : '32px') : (isMobile ? '20px' : '26px'),
                        fontWeight: 700,
                        color: MEDAL_COLORS[rank - 1],
                        fontVariantNumeric: 'tabular-nums',
                        position: 'relative',
                      }}>
                        {entry.wpm}
                      </div>
                      <div style={{
                        fontSize: isMobile ? '10px' : '11px',
                        color: 'var(--sub-color)',
                        position: 'relative',
                      }}>
                        {t('stats.wpm')}
                      </div>
                      <div style={{
                        fontSize: isMobile ? '9px' : '10px',
                        color: 'var(--sub-color)',
                        opacity: 0.7,
                        position: 'relative',
                      }}>
                        {entry.accuracy}% acc
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User rank card with percentile */}
          {effectiveRank > 0 && effectiveEntry && (
            <div style={{
              marginBottom: '20px',
              padding: '16px 20px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              border: '1.5px solid var(--main-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--main-color)',
                fontVariantNumeric: 'tabular-nums',
                minWidth: '50px',
              }}>
                #{effectiveRank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {currentUserLevel && (
                    <span style={{ fontSize: '14px' }}>{getRank(currentUserLevel).emoji}</span>
                  )}
                  {effectiveEntry.username}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--sub-color)',
                }}>
                  {t('leaderboard.yourRank')}
                  {percentile !== null && (
                    <span style={{ marginLeft: '8px', color: 'var(--main-color)', fontWeight: 600 }}>
                      — {t('leaderboard.topPercent', { percent: percentile > 0 ? percentile : '<1' })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--main-color)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {effectiveEntry.wpm}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
                  {effectiveEntry.accuracy}% acc
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard table (rank 4+) */}
          {tableEntries.length > 0 && (
            <div style={{
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden',
            }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '36px 1fr 60px' : '44px 1fr 1fr 70px',
                padding: '10px 16px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--sub-color)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--bg-color)',
              }}>
                <span>#</span>
                <span>{t('leaderboard.name')}</span>
                {!isMobile && <span>{t('stats.wpm')}</span>}
                <span style={{ textAlign: 'right' }}>{isMobile ? t('stats.wpm') : t('stats.accuracy')}</span>
              </div>

              {/* Entries with WPM bar */}
              {tableEntries.map((entry, i) => {
                const rank = i + 4;
                const isCurrentUser = currentUserId
                  ? entry.user_id === currentUserId
                  : entry.username === currentUsername;
                const barWidth = maxWpm > 0 ? (entry.wpm / maxWpm) * 100 : 0;
                const isVisible = rank <= animatedCount;

                return (
                  <div
                    key={`${entry.username}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '36px 1fr 60px' : '44px 1fr 1fr 70px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      borderBottom: i < tableEntries.length - 1 ? '1px solid var(--bg-color)' : undefined,
                      backgroundColor: isCurrentUser ? 'rgba(var(--main-color-rgb, 226,183,20), 0.1)' : undefined,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                      transition: 'opacity 0.25s ease, transform 0.25s ease, background-color 0.15s',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--sub-color)',
                    }}>
                      {rank}
                    </span>
                    <span style={{
                      color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)',
                      fontWeight: isCurrentUser ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      {getEntryRankEmoji(entry) && (
                        <span style={{ fontSize: '11px', flexShrink: 0 }}>{getEntryRankEmoji(entry)}</span>
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.username}</span>
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '10px',
                          color: 'var(--main-color)',
                          fontWeight: 600,
                        }}>
                          ({t('leaderboard.you')})
                        </span>
                      )}
                    </span>
                    {/* WPM with bar (desktop) */}
                    {!isMobile && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          fontWeight: 600,
                          fontVariantNumeric: 'tabular-nums',
                          color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)',
                          minWidth: '36px',
                        }}>
                          {entry.wpm}
                        </span>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          backgroundColor: 'var(--bg-color)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: isVisible ? `${barWidth}%` : '0%',
                            height: '100%',
                            backgroundColor: isCurrentUser ? 'var(--main-color)' : 'var(--sub-color)',
                            borderRadius: '3px',
                            opacity: isCurrentUser ? 0.8 : 0.4,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </span>
                    )}
                    {/* WPM (mobile) or Accuracy (desktop) */}
                    <span style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      ...(isMobile
                        ? { fontWeight: 600, color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)' }
                        : { color: 'var(--sub-color)' }
                      ),
                    }}>
                      {isMobile ? entry.wpm : `${entry.accuracy}%`}
                    </span>
                  </div>
                );
              })}

            </div>
          )}
        </>
      )}
    </div>
  );
}
