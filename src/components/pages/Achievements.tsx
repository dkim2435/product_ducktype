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
    <div className="fade-in w-full max-w-[700px] mx-auto" style={{ padding: 'var(--page-vertical-padding) 0' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sub text-[13px] mb-6 flex items-center gap-[6px]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('achievements.title')}
      </button>

      {/* Progress counter */}
      <div className="text-sm text-sub mb-5">
        {unlockedCount} / {ACHIEVEMENTS.length} {t('achievements.unlocked').toLowerCase()}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-[14px] py-[6px] text-xs rounded-default transition-all"
            style={{
              backgroundColor: activeCategory === cat.key ? 'var(--main-color)' : 'var(--sub-alt-color)',
              color: activeCategory === cat.key ? 'var(--bg-color)' : 'var(--sub-color)',
              fontWeight: activeCategory === cat.key ? 600 : 400,
              transitionDuration: 'var(--transition-speed)',
            }}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {filtered.map(achievement => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const unlockData = unlockedMap.get(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`p-4 bg-sub-alt rounded-default ${isUnlocked ? 'achievement-pop opacity-100 border-l-[3px] border-main' : 'opacity-40 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-[10px] mb-2">
                <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </span>
                <div className={`text-[13px] font-semibold ${isUnlocked ? 'text-text' : 'text-sub'}`}>
                  {achievement.name}
                </div>
              </div>
              <div className={`text-[11px] text-sub ${unlockData ? 'mb-[6px]' : ''}`}>
                {achievement.description}
              </div>
              {unlockData && (
                <div className="text-[10px] text-main">
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
