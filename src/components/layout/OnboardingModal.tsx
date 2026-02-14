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
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isMobile ? '100%' : '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-color)',
          borderRadius: isMobile ? '16px 16px 0 0' : 'var(--border-radius)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '6px' }}>🦆</div>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--main-color)',
            marginBottom: '4px',
          }}>
            {t('onboarding.title')}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--sub-color)',
          }}>
            {t('onboarding.subtitle')}
          </div>
        </div>

        {/* Features */}
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--sub-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px',
          }}>
            {t('onboarding.featuresTitle')}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                ...(f.highlight ? {
                  gridColumn: '1 / -1',
                  border: '1.5px solid var(--main-color)',
                  background: 'linear-gradient(135deg, var(--sub-alt-color) 0%, rgba(255,179,71,0.08) 100%)',
                } : {}),
              }}>
                <div style={{ fontSize: f.highlight ? '22px' : '18px', marginBottom: '6px' }}>{f.emoji}</div>
                <div style={{
                  fontSize: f.highlight ? '14px' : '13px',
                  fontWeight: f.highlight ? 700 : 600,
                  color: f.highlight ? 'var(--main-color)' : 'var(--text-color)',
                  marginBottom: '2px',
                }}>
                  {f.title}
                  {f.highlight && <span style={{ fontSize: '10px', marginLeft: '8px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--main-color)', color: 'var(--bg-color)', fontWeight: 800 }}>NEW</span>}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                  lineHeight: 1.4,
                }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level Up Unlocks */}
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--sub-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px',
          }}>
            {t('onboarding.levelTitle')}
          </div>

          {/* Rank progression */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            marginBottom: '8px',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-color)',
              marginBottom: '8px',
            }}>
              {t('onboarding.rankEvolution')}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap',
              fontSize: '11px',
              color: 'var(--sub-color)',
            }}>
              {ranks.map((r, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '16px' }}>{r.emoji}</span>
                  <span style={{ fontSize: '10px' }}>Lv.{r.level}</span>
                  {i < ranks.length - 1 && <span style={{ margin: '0 2px', opacity: 0.4 }}>→</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Unlock categories */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-color)',
              marginBottom: '8px',
            }}>
              {t('onboarding.unlockItems')}
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}>
              {unlockCategories.map((c, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                  padding: '3px 10px',
                  backgroundColor: 'var(--bg-color)',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>{c.range}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Login perks */}
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--sub-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px',
          }}>
            {t('onboarding.loginTitle')}
          </div>
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--main-color)',
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--main-color)',
              marginBottom: '8px',
            }}>
              {t('onboarding.loginFree')}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--sub-color)',
            }}>
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
          style={{
            alignSelf: 'center',
            padding: '10px 36px',
            backgroundColor: 'var(--main-color)',
            color: 'var(--bg-color)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('onboarding.gotIt')}
        </button>
      </div>
    </div>
  );
}
