import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const features = [
    { emoji: '⚔️', title: t('onboarding.featAdventure'), desc: t('onboarding.featAdventureDesc'), highlight: true },
    { emoji: '⌨️', title: t('onboarding.featTyping'), desc: t('onboarding.featTypingDesc') },
    { emoji: '📅', title: t('onboarding.featDaily'), desc: t('onboarding.featDailyDesc') },
    { emoji: '📖', title: t('onboarding.featLessons'), desc: t('onboarding.featLessonsDesc') },
  ];

  const ranks = [
    { emoji: '🥚', level: 1 },
    { emoji: '🐣', level: 5 },
    { emoji: '🐥', level: 10 },
    { emoji: '🦆', level: 20 },
    { emoji: '🦢', level: 30 },
    { emoji: '✨', level: 50 },
    { emoji: '💎', level: 65 },
    { emoji: '👑', level: 95 },
  ];

  const unlockCategories = [
    { emoji: '🎨', label: 'Themes', count: 16, range: 'Lv.3–65' },
    { emoji: '🔊', label: 'Sounds', count: 8, range: 'Lv.3–50' },
    { emoji: '🖼️', label: 'Frames', count: 5, range: 'Lv.5–70' },
    { emoji: '▌', label: 'Carets', count: 3, range: 'Lv.5–22' },
    { emoji: 'Aa', label: 'Fonts', count: 3, range: 'Lv.8–35' },
  ];

  return (
    <div
      role="presentation"
      onClick={onClose}
      className={`fixed inset-0 z-[1000] flex justify-center ${isMobile ? 'items-end' : 'items-center'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className={`slide-up flex flex-col gap-6 overflow-y-auto bg-bg ${
          isMobile ? 'w-full rounded-t-[16px]' : 'w-[480px] rounded-default'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '85vh',
          padding: '28px 24px',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-[32px] mb-[6px]">🦆</div>
          <div className="text-[22px] font-bold text-main mb-1">
            {t('onboarding.title')}
          </div>
          <div className="text-[13px] text-sub">
            {t('onboarding.subtitle')}
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="text-[13px] font-bold text-sub uppercase tracking-[0.5px] mb-[10px]">
            {t('onboarding.featuresTitle')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f, i) => (
              <div key={i} className={`p-3 bg-sub-alt rounded-default ${f.highlight ? 'col-span-2 border-[1.5px] border-main' : ''}`}
                style={f.highlight ? { background: 'linear-gradient(135deg, var(--sub-alt-color) 0%, rgba(255,179,71,0.08) 100%)' } : undefined}
              >
                <div className={`mb-[6px] ${f.highlight ? 'text-[22px]' : 'text-lg'}`}>{f.emoji}</div>
                <div className={`mb-[2px] ${f.highlight ? 'text-sm font-bold text-main' : 'text-[13px] font-semibold text-text'}`}>
                  {f.title}
                  {f.highlight && <span className="text-[10px] ml-2 py-[1px] px-[6px] rounded-[4px] bg-main text-bg font-extrabold">NEW</span>}
                </div>
                <div className="text-[11px] text-sub leading-[1.4]">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Up Unlocks */}
        <div>
          <div className="text-[13px] font-bold text-sub uppercase tracking-[0.5px] mb-[10px]">
            {t('onboarding.levelTitle')}
          </div>

          {/* Rank progression */}
          <div className="py-3 px-[14px] bg-sub-alt rounded-default mb-2">
            <div className="text-xs font-semibold text-text mb-2">
              {t('onboarding.rankEvolution')}
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[11px] text-sub">
              {ranks.map((r, i) => (
                <span key={i} className="inline-flex items-center gap-[2px]">
                  <span className="text-base">{r.emoji}</span>
                  <span className="text-[10px]">Lv.{r.level}</span>
                  {i < ranks.length - 1 && <span className="mx-[2px] opacity-40">→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Unlock categories */}
          <div className="py-3 px-[14px] bg-sub-alt rounded-default">
            <div className="text-xs font-semibold text-text mb-2">
              {t('onboarding.unlockItems')}
            </div>
            <div className="flex flex-wrap gap-[6px]">
              {unlockCategories.map((c, i) => (
                <span key={i} className="text-[11px] text-sub py-[3px] px-[10px] bg-bg rounded-full inline-flex items-center gap-1">
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-[10px] opacity-70">{c.range}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Login perks */}
        <div>
          <div className="text-[13px] font-bold text-sub uppercase tracking-[0.5px] mb-[10px]">
            {t('onboarding.loginTitle')}
          </div>
          <div className="py-3 px-[14px] bg-sub-alt rounded-default border border-main">
            <div className="text-xs font-semibold text-main mb-2">
              {t('onboarding.loginFree')}
            </div>
            <div className="flex flex-col gap-1 text-xs text-sub">
              <span>✓ {t('onboarding.loginPerk1')}</span>
              <span>✓ {t('onboarding.loginPerk2')}</span>
              <span>✓ {t('onboarding.loginPerk3')}</span>
              <span>✓ {t('onboarding.loginPerk4')}</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="self-center py-[10px] px-9 bg-main text-bg border-none rounded-default text-[15px] font-semibold cursor-pointer"
        >
          {t('onboarding.gotIt')}
        </button>
      </div>
    </div>
  );
}
