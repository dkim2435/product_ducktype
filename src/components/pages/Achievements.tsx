import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AchievementsState, AchievementCategory } from '../../types/gamification';
import { ACHIEVEMENTS } from '../../constants/achievements';

interface AchievementsProps {
  achievements: AchievementsState;
  onBack: () => void;
}

const CATEGORIES: { key: AchievementCategory | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'achievements.all' },
  { key: 'speed', labelKey: 'achievements.speed' },
  { key: 'accuracy', labelKey: 'achievements.accuracy' },
  { key: 'consistency', labelKey: 'achievements.consistency' },
  { key: 'volume', labelKey: 'achievements.volume' },
  { key: 'streak', labelKey: 'achievements.streak' },
  { key: 'special', labelKey: 'achievements.special' },
];

export function Achievements({ achievements, onBack }: AchievementsProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedIds = new Set(achievements.unlocked.map(a => a.id));
  const unlockedMap = new Map(achievements.unlocked.map(a => [a.id, a]));

  const filtered = activeCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === activeCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '40px 0',
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
        {t('achievements.title')}
      </button>

      {/* Progress counter */}
      <div style={{
        fontSize: '14px',
        color: 'var(--sub-color)',
        marginBottom: '20px',
      }}>
        {unlockedCount} / {ACHIEVEMENTS.length} {t('achievements.unlocked').toLowerCase()}
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: 'var(--border-radius)',
              backgroundColor: activeCategory === cat.key ? 'var(--main-color)' : 'var(--sub-alt-color)',
              color: activeCategory === cat.key ? 'var(--bg-color)' : 'var(--sub-color)',
              fontWeight: activeCategory === cat.key ? 600 : 400,
              transition: 'all var(--transition-speed)',
            }}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {filtered.map(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockData = unlockedMap.get(achievement.id);

          return (
            <div
              key={achievement.id}
              className={isUnlocked ? 'achievement-pop' : ''}
              style={{
                padding: '16px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                opacity: isUnlocked ? 1 : 0.4,
                borderLeft: isUnlocked ? '3px solid var(--main-color)' : '3px solid transparent',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}>
                <span style={{
                  fontSize: '24px',
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                }}>
                  {achievement.icon}
                </span>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isUnlocked ? 'var(--text-color)' : 'var(--sub-color)',
                }}>
                  {achievement.name}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--sub-color)',
                marginBottom: unlockData ? '6px' : '0',
              }}>
                {achievement.description}
              </div>
              {unlockData && (
                <div style={{
                  fontSize: '10px',
                  color: 'var(--main-color)',
                }}>
                  {new Date(unlockData.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
