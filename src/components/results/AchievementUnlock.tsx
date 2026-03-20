import { useTranslation } from 'react-i18next';
import { getAchievementDef } from '../../constants/achievements';

interface AchievementUnlockProps {
  achievementIds: string[];
}

export function AchievementUnlock({ achievementIds }: AchievementUnlockProps) {
  const { t } = useTranslation();

  if (achievementIds.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 p-4 bg-sub-alt rounded-default border-l-[3px] border-l-main">
      <div className="text-xs font-semibold text-main uppercase tracking-[0.5px]">
        {t('gamification.achievementUnlocked')}
      </div>
      {achievementIds.map(id => {
        const def = getAchievementDef(id);
        if (!def) return null;
        return (
          <div
            key={id}
            className="achievement-pop flex items-center gap-[10px]"
          >
            <span className="text-2xl">{def.icon}</span>
            <div>
              <div className="text-sm font-semibold text-text">
                {def.name}
              </div>
              <div className="text-[11px] text-sub">
                {def.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
