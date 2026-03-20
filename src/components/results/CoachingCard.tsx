import { useTranslation } from 'react-i18next';
import type { CoachTip } from '../../utils/typingCoach';
import type { KeyStats } from '../../types/gamification';

interface CoachingCardProps {
  tips: CoachTip[];
  weakKeys: KeyStats[];
}

export function CoachingCard({ tips, weakKeys }: CoachingCardProps) {
  const { t } = useTranslation();

  if (tips.length === 0) return null;

  const weakKeyNames = weakKeys.slice(0, 3).map(k => k.key).join(', ');

  return (
    <div className="w-full max-w-[600px] mt-4">
      <div className="text-[13px] font-semibold text-sub mb-2 flex items-center gap-[6px]">
        🤖 {t('coach.title')}
      </div>
      <div className="flex flex-col gap-2">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="py-3 px-4 bg-sub-alt rounded-default border-l-[3px] border-l-main"
          >
            <div className="text-[13px] font-semibold text-text mb-1 flex items-center gap-[6px]">
              <span>{tip.icon}</span>
              {t(tip.title)}
            </div>
            <div className="text-xs text-sub leading-[1.4]">
              {tip.id === 'weak-keys'
                ? t(tip.message, { keys: weakKeyNames })
                : t(tip.message)
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
