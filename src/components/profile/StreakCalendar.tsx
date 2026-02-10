import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StreakState } from '../../types/gamification';
import type { TestResult } from '../../types/stats';
import { getItem } from '../../utils/storage';

interface StreakCalendarProps {
  streak: StreakState;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.getDate().toString();
}

export function StreakCalendar({ streak: _streak }: StreakCalendarProps) {
  const { t } = useTranslation();

  // Get activity dates from test history
  const activeDates = useMemo(() => {
    const history = getItem<TestResult[]>('history', []);
    const dates = new Set<string>();
    for (const r of history) {
      dates.add(new Date(r.timestamp).toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const days = getLast30Days();

  // Group into weeks (rows of 7)
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div style={{
        fontSize: '13px',
        color: 'var(--sub-color)',
        marginBottom: '12px',
      }}>
        {t('profile.streakCalendar')}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} style={{ display: 'flex', gap: '3px' }}>
            {week.map(day => {
              const isActive = activeDates.has(day);
              const isToday = day === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={day}
                  title={`${day}${isActive ? ' (active)' : ''}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'var(--main-color)' : 'var(--sub-alt-color)',
                    opacity: isActive ? 1 : 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: isToday ? 700 : 400,
                    color: isActive ? 'var(--bg-color)' : 'var(--sub-color)',
                    border: isToday ? '1px solid var(--text-color)' : 'none',
                  }}
                >
                  {getDayLabel(day)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
