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
      className="flex items-center gap-2 cursor-default"
      title={`${rank.name} - ${isAdmin ? 'MAX' : `Level ${profile.level}`} - ${profile.totalXp} XP`}
    >
      <span className="text-base">{rank.emoji}</span>
      <span className="text-xs font-semibold text-main min-w-[20px]">
        {isAdmin ? 'MAX' : profile.level}
      </span>
      <div className="w-[80px] h-[6px] bg-sub-alt rounded-[3px] overflow-hidden">
        <div
          className="xp-fill h-full bg-main rounded-[3px] transition-[width] duration-500 ease-out"
          style={{
            width: isAdmin ? '100%' : `${Math.round(progress * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
