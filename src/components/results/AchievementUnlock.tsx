import { useTranslation } from 'react-i18next';
import { getAchievementDef } from '../../constants/achievements';

interface AchievementUnlockProps {
  achievementIds: string[];
}

export function AchievementUnlock({ achievementIds }: AchievementUnlockProps) {
  const { t } = useTranslation();

  if (achievementIds.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
      backgroundColor: 'var(--sub-alt-color)',
      borderRadius: 'var(--border-radius)',
      borderLeft: '3px solid var(--main-color)',
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--main-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {t('gamification.achievementUnlocked')}
      </div>
      {achievementIds.map(id => {
        const def = getAchievementDef(id);
        if (!def) return null;
        return (
          <div
            key={id}
            className="achievement-pop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{def.icon}</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-color)' }}>
                {def.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
                {def.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
