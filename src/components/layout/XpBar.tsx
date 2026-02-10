import type { PlayerProfile } from '../../types/gamification';
import { xpToNextLevel, getRank } from '../../constants/gamification';

interface XpBarProps {
  profile: PlayerProfile;
}

export function XpBar({ profile }: XpBarProps) {
  const { progress } = xpToNextLevel(profile.totalXp);
  const rank = getRank(profile.level);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'default',
      }}
      title={`${rank.name} - Level ${profile.level} - ${profile.totalXp} XP`}
    >
      <span style={{ fontSize: '16px' }}>{rank.emoji}</span>
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--main-color)',
        minWidth: '20px',
      }}>
        {profile.level}
      </span>
      <div style={{
        width: '80px',
        height: '6px',
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div
          className="xp-fill"
          style={{
            width: `${Math.round(progress * 100)}%`,
            height: '100%',
            backgroundColor: 'var(--main-color)',
            borderRadius: '3px',
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>
    </div>
  );
}
