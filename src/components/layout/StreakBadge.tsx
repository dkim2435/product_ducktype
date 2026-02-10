import type { StreakState } from '../../types/gamification';

interface StreakBadgeProps {
  streak: StreakState;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak.currentStreak === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'default',
      }}
      title={`Current streak: ${streak.currentStreak} days\nLongest: ${streak.longestStreak} days`}
    >
      <span
        className={streak.currentStreak >= 7 ? 'streak-flame' : ''}
        style={{ fontSize: '14px' }}
      >
        🔥
      </span>
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: streak.currentStreak >= 7 ? 'var(--main-color)' : 'var(--sub-color)',
      }}>
        {streak.currentStreak}
      </span>
    </div>
  );
}
