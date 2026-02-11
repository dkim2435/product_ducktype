import type { PlayerProfile } from '../../types/gamification';
import { xpToNextLevel, getRank } from '../../constants/gamification';
import { isAdminUser } from '../../utils/admin';

interface XpBarProps {
  profile: PlayerProfile;
  userId?: string | null;
}

export function XpBar({ profile, userId }: XpBarProps) {
  const { progress } = xpToNextLevel(profile.totalXp);
  const isAdmin = isAdminUser(userId);
  const rank = getRank(profile.level, isAdmin);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'default',
      }}
      title={`${rank.name} - ${isAdmin ? 'MAX' : `Level ${profile.level}`} - ${profile.totalXp} XP`}
    >
      <span style={{ fontSize: '16px' }}>{rank.emoji}</span>
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--main-color)',
        minWidth: '20px',
      }}>
        {isAdmin ? 'MAX' : profile.level}
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
            width: isAdmin ? '100%' : `${Math.round(progress * 100)}%`,
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
