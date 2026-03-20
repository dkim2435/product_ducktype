import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { XpGain } from '../../types/gamification';

interface XpGainDisplayProps {
  xpGain: XpGain;
}

export function XpGainDisplay({ xpGain }: XpGainDisplayProps) {
  const { t } = useTranslation();
  const [displayXp, setDisplayXp] = useState(0);

  // Animate counter
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const target = xpGain.total;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [xpGain.total]);

  const breakdownItems = [
    { label: t('gamification.xpBase'), value: xpGain.base },
    xpGain.accuracyBonus > 0 && { label: t('gamification.xpAccuracy'), value: xpGain.accuracyBonus },
    xpGain.lengthBonus > 0 && { label: t('gamification.xpLength'), value: xpGain.lengthBonus },
    xpGain.streakBonus > 0 && { label: t('gamification.xpStreak'), value: xpGain.streakBonus },
    xpGain.dailyChallengeBonus > 0 && { label: t('gamification.xpDaily'), value: xpGain.dailyChallengeBonus },
    xpGain.dailyBoostBonus > 0 && { label: t('gamification.xpDailyBoost'), value: xpGain.dailyBoostBonus },
    xpGain.shareBonus > 0 && { label: t('gamification.xpShare'), value: xpGain.shareBonus },
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-sub-alt rounded-default">
      <div className="text-2xl font-bold text-main">
        +{displayXp} XP
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {breakdownItems.map(item => (
          <span key={item.label} className="text-[11px] text-sub">
            {item.label}: +{item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
