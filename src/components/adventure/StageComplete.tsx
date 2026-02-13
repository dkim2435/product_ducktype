import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { StageResult, StageConfig, DifficultyLevel } from '../../types/adventure';
import { DIFFICULTY_CONFIGS } from '../../constants/adventure';
import { XP_SHARE_BONUS } from '../../constants/gamification';

const SITE_URL = 'https://ducktype.xyz';

interface StageCompleteProps {
  result: StageResult;
  stageConfig: StageConfig;
  onRetry: () => void;
  onNextStage: () => void;
  onReturnToMap: () => void;
  isNextUnlocked: boolean;
  isNextLoginGated?: boolean;
  onLoginClick?: () => void;
  onShareClick?: () => void;
  worldStages: StageConfig[];
  difficulty: DifficultyLevel;
  worldId: number;
}

function getShareText(stageConfig: StageConfig, result: StageResult, difficulty: DifficultyLevel): string {
  const diffLabel = DIFFICULTY_CONFIGS[difficulty].label;
  if (stageConfig.isBoss) {
    return `I defeated ${stageConfig.name} (${diffLabel}) with ${result.wpm} WPM / ${result.accuracy}% accuracy on DuckType Adventure! Can you beat it?`;
  }
  return `I cleared ${stageConfig.name} (${diffLabel}) with ${result.wpm} WPM / ${result.accuracy}% accuracy on DuckType Adventure!`;
}

function getShareUrl(worldId: number): string {
  return `${SITE_URL}/#adventure?world=${worldId}`;
}

export function StageComplete({
  result,
  stageConfig,
  onRetry,
  onNextStage,
  onReturnToMap,
  isNextUnlocked,
  isNextLoginGated,
  onLoginClick,
  onShareClick,
  worldStages,
  difficulty,
  worldId,
}: StageCompleteProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [visibleStars, setVisibleStars] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareBonusClaimed, setShareBonusClaimed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Animate stars appearing one by one
  useEffect(() => {
    if (!result.cleared) return;
    setVisibleStars(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= result.stars; i++) {
      timers.push(setTimeout(() => setVisibleStars(i), i * 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [result.stars, result.cleared]);

  // Close share menu on outside click
  useEffect(() => {
    if (!shareMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareMenuOpen]);

  const currentIdx = worldStages.findIndex(s => s.id === result.stageId);
  const hasNextStage = currentIdx >= 0 && currentIdx < worldStages.length - 1;
  const timeSeconds = Math.round(result.timeMs / 1000);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const shareText = getShareText(stageConfig, result, difficulty);
  const shareUrl = getShareUrl(worldId);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const triggerShare = () => {
    if (!shareBonusClaimed) {
      onShareClick?.();
      setShareBonusClaimed(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* ignore */ }
    triggerShare();
    setShareMenuOpen(false);
  };

  const handleX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=550,height=420');
    triggerShare();
    setShareMenuOpen(false);
  };

  const handleKakao = async () => {
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; Share: { sendDefault: (params: Record<string, unknown>) => void } } };
    if (w.Kakao && w.Kakao.isInitialized()) {
      w.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `DuckType Adventure - ${stageConfig.name}`,
          description: shareText,
          imageUrl: `${SITE_URL}/og-image.svg`,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [{ title: 'Play DuckType', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      });
      triggerShare();
      setShareMenuOpen(false);
      return;
    }
    if (navigator.share) {
      try { await navigator.share({ title: `DuckType Adventure - ${stageConfig.name}`, text: shareText, url: shareUrl }); } catch { /* cancelled */ }
      triggerShare();
      setShareMenuOpen(false);
      return;
    }
    await handleCopyLink();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
    triggerShare();
    setShareMenuOpen(false);
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'width=550,height=420');
    triggerShare();
    setShareMenuOpen(false);
  };

  const handleReddit = () => {
    window.open(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(`I cleared ${stageConfig.name} on DuckType Adventure!`)}`, '_blank');
    triggerShare();
    setShareMenuOpen(false);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `DuckType Adventure - ${stageConfig.name}`, text: shareText, url: shareUrl }); } catch { /* cancelled */ }
    }
    triggerShare();
    setShareMenuOpen(false);
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-color)',
    textAlign: 'left',
    borderRadius: '6px',
    transition: 'background-color 0.1s',
  };

  return (
    <div className="slide-up" style={{
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }}>
      {/* Header */}
      <div style={{ fontSize: '48px' }}>
        {result.cleared ? '🎉' : '💀'}
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: result.cleared ? 'var(--main-color)' : 'var(--error-color)',
      }}>
        {result.cleared ? t('adventure.victory') : t('adventure.defeat')}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
        {stageConfig.name}
      </p>
      {result.cleared && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '999px',
          backgroundColor: `${DIFFICULTY_CONFIGS[difficulty].color}15`,
          border: `1px solid ${DIFFICULTY_CONFIGS[difficulty].color}40`,
          fontSize: '12px', fontWeight: 700, color: DIFFICULTY_CONFIGS[difficulty].color,
        }}>
          {'★'.repeat(DIFFICULTY_CONFIGS[difficulty].maxStars)}
          {' '}{DIFFICULTY_CONFIGS[difficulty].label}
        </div>
      )}

      {/* Stars */}
      {result.cleared && (
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '36px',
        }}>
          {[1, 2, 3].map(s => (
            <span
              key={s}
              style={{
                color: s <= visibleStars ? '#fbbf24' : 'var(--sub-alt-color)',
                transition: 'color 0.3s, transform 0.3s',
                transform: s <= visibleStars ? 'scale(1.2)' : 'scale(1)',
                display: 'inline-block',
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
      }}>
        {[
          { label: t('adventure.wpm'), value: `${result.wpm}`, icon: '⌨️' },
          { label: t('adventure.accuracy'), value: `${result.accuracy}%`, icon: '🎯' },
          { label: t('adventure.maxCombo'), value: `${result.maxCombo}x`, icon: '🔥' },
          { label: t('adventure.hpLeft'), value: `${Math.round(result.hpRemaining)}/${result.hpMax}`, icon: '❤️' },
          { label: t('adventure.time'), value: timeStr, icon: '⏱️' },
          { label: 'XP', value: `+${result.xpEarned}`, icon: '✨' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            gap: '4px',
          }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-color)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Next Stage */}
      {result.cleared && hasNextStage && isNextUnlocked && (
        isNextLoginGated ? (
          <button
            onClick={onLoginClick}
            title="Login to play"
            style={{
              position: 'relative',
              width: '100%',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--bg-color)',
              backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
              opacity: 0.5,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.querySelector<HTMLElement>('[data-tooltip]')!.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.querySelector<HTMLElement>('[data-tooltip]')!.style.opacity = '0'; }}
          >
            🔒 {t('adventure.nextStage')}
            <span data-tooltip style={{
              position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
              padding: '4px 10px', borderRadius: '6px',
              backgroundColor: 'var(--sub-alt-color)', border: '1px solid var(--sub-color)',
              fontSize: '11px', fontWeight: 600, color: 'var(--text-color)',
              whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 0.15s',
              pointerEvents: 'none',
            }}>
              Login to play
            </span>
          </button>
        ) : (
          <button
            onClick={onNextStage}
            style={{
              width: '100%',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--bg-color)',
              backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)',
              cursor: 'pointer',
            }}
          >
            {t('adventure.nextStage')} →
          </button>
        )
      )}

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '8px',
      }}>
        <button
          onClick={onReturnToMap}
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-color)',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            border: '1px solid var(--sub-color)',
          }}
        >
          {t('adventure.toMap')}
        </button>
        <button
          onClick={onRetry}
          style={{
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-color)',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            border: '1px solid var(--sub-color)',
          }}
        >
          {t('adventure.retry')}
        </button>

        {/* Share button */}
        {result.cleared && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--bg-color)',
                  backgroundColor: 'var(--main-color)',
                  borderRadius: 'var(--border-radius)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" x2="12" y1="2" y2="15" />
                </svg>
                {t('results.share')}
              </button>

              {/* Backdrop for mobile */}
              {shareMenuOpen && isMobile && (
                <div
                  onClick={() => setShareMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                />
              )}

              {/* Share dropdown */}
              {shareMenuOpen && (
                <div
                  className="fade-in"
                  style={isMobile ? {
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 'calc(100vw - 48px)', maxWidth: '320px', maxHeight: '80vh', overflowY: 'auto',
                    backgroundColor: 'var(--sub-alt-color)', borderRadius: 'var(--border-radius)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: '6px', zIndex: 100,
                    display: 'flex', flexDirection: 'column', gap: '2px',
                  } : {
                    position: 'absolute', bottom: '100%', left: '50%', marginLeft: '-120px',
                    marginBottom: '8px', width: '240px',
                    backgroundColor: 'var(--sub-alt-color)', borderRadius: 'var(--border-radius)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: '6px', zIndex: 100,
                    display: 'flex', flexDirection: 'column', gap: '2px',
                  }}
                >
                  <button onClick={handleX} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </button>
                  <button onClick={handleKakao} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.514 6.467-.145.52-.93 3.346-.964 3.559 0 0-.019.159.084.22.103.06.224.013.224.013.296-.04 3.427-2.242 3.965-2.625.7.1 1.42.152 2.177.152 5.523 0 10-3.463 10-7.786S17.523 3 12 3z"/></svg>
                    KakaoTalk
                  </button>
                  <button onClick={handleWhatsApp} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </button>
                  <button onClick={handleFacebook} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                  <button onClick={handleReddit} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                    Reddit
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--sub-color)', opacity: 0.2, margin: '4px 0' }} />

                  <button onClick={handleCopyLink} style={btnStyle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {linkCopied ? t('results.copied') : t('results.copyLink')}
                  </button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <>
                      <div style={{ height: '1px', backgroundColor: 'var(--sub-color)', opacity: 0.2, margin: '4px 0' }} />
                      <button onClick={handleWebShare} style={btnStyle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                          <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                        </svg>
                        {t('results.moreOptions')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* +XP label */}
            {!shareBonusClaimed && (
              <span style={{
                fontSize: '11px',
                color: 'var(--main-color)',
                fontWeight: 600,
                opacity: 0.8,
                lineHeight: 1.2,
                textAlign: 'center',
              }}>
                +{XP_SHARE_BONUS}<br />XP
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
