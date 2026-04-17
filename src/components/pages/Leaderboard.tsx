import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import { getRank } from '../../constants/gamification';
import { isAdminUser } from '../../utils/admin';
import type { LeaderboardEntry } from '../../hooks/useLeaderboard';

const TIME_OPTIONS = [15, 30, 45, 60, 120];

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_HEIGHTS = [120, 90, 70];
const PODIUM_HEIGHTS_MOBILE = [90, 68, 54];

const devBadgeStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  padding: '1px 4px',
  borderRadius: '3px',
  backgroundColor: 'var(--main-color)',
  color: 'var(--bg-color)',
  lineHeight: 1.2,
  flexShrink: 0,
};

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
    // Reset row-reveal animation on time filter change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimatedCount(0);
  }, [selectedTime, onFetch]);

  // Staggered animation: reveal rows one by one
  useEffect(() => {
    if (loading || entries.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    return getRank(level, isAdminUser(entry.user_id)).emoji;
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
    <div className="fade-in w-full max-w-[700px] mx-auto" style={{ padding: 'var(--page-vertical-padding) 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sub text-[13px] mb-6 flex items-center gap-[6px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('leaderboard.title')}
      </button>

      {/* Time filter tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {TIME_OPTIONS.map((tv) => (
          <button
            key={tv}
            onClick={() => setSelectedTime(tv)}
            className="rounded-[6px] border-none cursor-pointer text-[13px] font-semibold font-[inherit] transition-[background-color,color] duration-150"
            style={{
              padding: isMobile ? '6px 14px' : '6px 16px',
              backgroundColor: selectedTime === tv ? 'var(--main-color)' : 'var(--sub-alt-color)',
              color: selectedTime === tv ? 'var(--bg-color)' : 'var(--sub-color)',
            }}
          >
            {tv}s
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-[60px] text-sub text-sm">
          {t('leaderboard.loading')}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-[60px] text-sub text-sm">
          {t('leaderboard.empty')}
        </div>
      ) : (
        <>
          {/* Podium — Top 3 */}
          {top3.length >= 3 && (
            <div className="flex justify-center items-end mb-7 px-2" style={{ gap: isMobile ? '8px' : '12px' }}>
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
                    className="flex flex-col items-center flex-1"
                    style={{
                      maxWidth: isMobile ? '110px' : '150px',
                      opacity: animatedCount >= 3 ? 1 : 0,
                      transform: animatedCount >= 3 ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.5s ease ${rank === 1 ? '0.1s' : rank === 2 ? '0s' : '0.2s'}, transform 0.5s ease ${rank === 1 ? '0.1s' : rank === 2 ? '0s' : '0.2s'}`,
                    }}
                  >
                    {/* Medal */}
                    <div className="mb-1" style={{ fontSize: rank === 1 ? (isMobile ? '28px' : '36px') : (isMobile ? '22px' : '28px') }}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </div>

                    {/* Username */}
                    <div
                      className="font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-center flex items-center justify-center gap-[3px]"
                      style={{
                        fontSize: isMobile ? '11px' : '13px',
                        color: isUser ? 'var(--main-color)' : 'var(--text-color)',
                      }}
                    >
                      {getEntryRankEmoji(entry) && (
                        <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{getEntryRankEmoji(entry)}</span>
                      )}
                      <span>{entry.username}</span>
                      {isAdminUser(entry.user_id) && <span style={devBadgeStyle}>DEV</span>}
                    </div>

                    {/* Podium block */}
                    <div
                      className="w-full bg-sub-alt rounded-t-[8px] flex flex-col items-center justify-center gap-[2px] relative overflow-hidden"
                      style={{
                        height: `${podiumH}px`,
                        border: isUser ? '1.5px solid var(--main-color)' : '1px solid transparent',
                      }}
                    >
                      {/* Subtle gradient overlay for 1st place */}
                      {rank === 1 && (
                        <div className="absolute inset-0 rounded-[inherit]" style={{ background: `linear-gradient(180deg, ${MEDAL_COLORS[0]}15 0%, transparent 60%)` }} />
                      )}
                      <div
                        className="font-bold tabular-nums relative"
                        style={{
                          fontSize: rank === 1 ? (isMobile ? '24px' : '32px') : (isMobile ? '20px' : '26px'),
                          color: MEDAL_COLORS[rank - 1],
                        }}
                      >
                        {entry.wpm}
                      </div>
                      <div className="text-sub relative" style={{ fontSize: isMobile ? '10px' : '11px' }}>
                        {t('stats.wpm')}
                      </div>
                      <div className="text-sub opacity-70 relative" style={{ fontSize: isMobile ? '9px' : '10px' }}>
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
            <div className="mb-5 px-5 py-4 bg-sub-alt rounded-default border-[1.5px] border-main flex items-center gap-4">
              <div className="text-[28px] font-bold text-main tabular-nums min-w-[50px]">
                #{effectiveRank}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-text flex items-center gap-1">
                  {currentUserLevel && (
                    <span className="text-sm">{getRank(currentUserLevel, isAdminUser(currentUserId)).emoji}</span>
                  )}
                  {effectiveEntry.username}
                  {isAdminUser(currentUserId) && <span style={{ ...devBadgeStyle, marginLeft: '6px' }}>DEV</span>}
                </div>
                <div className="text-xs text-sub">
                  {t('leaderboard.yourRank')}
                  {percentile !== null && (
                    <span className="ml-2 text-main font-semibold">
                      — {t('leaderboard.topPercent', { percent: percentile > 0 ? percentile : '<1' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-main tabular-nums">
                  {effectiveEntry.wpm}
                </div>
                <div className="text-[11px] text-sub">
                  {effectiveEntry.accuracy}% acc
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard table (rank 4+) */}
          {tableEntries.length > 0 && (
            <div className="bg-sub-alt rounded-default overflow-hidden">
              {/* Header row */}
              <div
                className="px-4 py-[10px] text-[11px] font-semibold text-sub uppercase tracking-[0.5px] border-b border-bg"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '36px 1fr 60px' : '44px 1fr 1fr 70px',
                }}
              >
                <span>#</span>
                <span>{t('leaderboard.name')}</span>
                {!isMobile && <span>{t('stats.wpm')}</span>}
                <span className="text-right">{isMobile ? t('stats.wpm') : t('stats.accuracy')}</span>
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
                    className="px-4 py-[10px] text-[13px] relative transition-[opacity,transform,background-color] duration-[250ms] ease-[ease]"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '36px 1fr 60px' : '44px 1fr 1fr 70px',
                      borderBottom: i < tableEntries.length - 1 ? '1px solid var(--bg-color)' : undefined,
                      backgroundColor: isCurrentUser ? 'rgba(var(--main-color-rgb, 226,183,20), 0.1)' : undefined,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                    }}
                  >
                    <span className="font-bold tabular-nums text-sub">
                      {rank}
                    </span>
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-[3px]"
                      style={{
                        color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)',
                        fontWeight: isCurrentUser ? 600 : 400,
                      }}
                    >
                      {getEntryRankEmoji(entry) && (
                        <span className="text-[11px] shrink-0">{getEntryRankEmoji(entry)}</span>
                      )}
                      <span className="overflow-hidden text-ellipsis">{entry.username}</span>
                      {isAdminUser(entry.user_id) && <span style={devBadgeStyle}>DEV</span>}
                      {isCurrentUser && (
                        <span className="ml-[6px] text-[10px] text-main font-semibold">
                          ({t('leaderboard.you')})
                        </span>
                      )}
                    </span>
                    {/* WPM with bar (desktop) */}
                    {!isMobile && (
                      <span className="flex items-center gap-2">
                        <span
                          className="font-semibold tabular-nums min-w-[36px]"
                          style={{ color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)' }}
                        >
                          {entry.wpm}
                        </span>
                        <div className="flex-1 h-[6px] bg-bg rounded-[3px] overflow-hidden">
                          <div
                            className="h-full rounded-[3px] transition-[width] duration-[600ms] ease-[ease]"
                            style={{
                              width: isVisible ? `${barWidth}%` : '0%',
                              backgroundColor: isCurrentUser ? 'var(--main-color)' : 'var(--sub-color)',
                              opacity: isCurrentUser ? 0.8 : 0.4,
                            }}
                          />
                        </div>
                      </span>
                    )}
                    {/* WPM (mobile) or Accuracy (desktop) */}
                    <span
                      className="text-right tabular-nums"
                      style={isMobile
                        ? { fontWeight: 600, color: isCurrentUser ? 'var(--main-color)' : 'var(--text-color)' }
                        : { color: 'var(--sub-color)' }
                      }
                    >
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
