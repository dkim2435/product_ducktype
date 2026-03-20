import type { StreakState } from '../../types/gamification';

interface StreakBadgeProps {
  streak: StreakState;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak.currentStreak === 0) return null;

  return (
    <div
      className="flex items-center gap-1 cursor-default"
      title={`Current streak: ${streak.currentStreak} days\nLongest: ${streak.longestStreak} days`}
    >
      <span
        className={`text-sm ${streak.currentStreak >= 7 ? 'streak-flame' : ''}`}
      >
        🔥
      </span>
      <span className={`text-xs font-semibold ${streak.currentStreak >= 7 ? 'text-main' : 'text-sub'}`}>
        {streak.currentStreak}
      </span>
    </div>
  );
}
