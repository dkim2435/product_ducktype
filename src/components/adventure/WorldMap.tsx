import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdventureProgress } from '../../types/adventure';
import { WORLDS, WORLD_PREVIEWS } from '../../constants/adventure';
import { useIsMobile } from '../../hooks/useIsMobile';

interface WorldMapProps {
  progress: AdventureProgress;
  currentWorldId: number;
  onChangeWorld: (worldId: number) => void;
  isWorldUnlocked: (worldId: number) => boolean;
  isStageUnlocked: (worldId: number, stageId: number) => boolean;
  onSelectStage: (stageId: number) => void;
  onBack: () => void;
}

// Stage thumbnail themes — World 1 (Duck Village)
const STAGE_THUMBS_W1: Record<number, { bg: string; emoji: string }> = {
  1: { bg: 'linear-gradient(135deg, #2d5a27 0%, #4a8c3f 100%)', emoji: '🌲' },
  2: { bg: 'linear-gradient(135deg, #3a6b8c 0%, #5a9ab5 100%)', emoji: '🌉' },
  3: { bg: 'linear-gradient(135deg, #8c7a5a 0%, #b5a07a 100%)', emoji: '⛲' },
  4: { bg: 'linear-gradient(135deg, #4a8c4a 0%, #7ab57a 100%)', emoji: '🌸' },
  5: { bg: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)', emoji: '🌑' },
  6: { bg: 'linear-gradient(135deg, #6b6b7a 0%, #9a9aaa 100%)', emoji: '⛰️' },
  7: { bg: 'linear-gradient(135deg, #4a2d1a 0%, #6b4a2d 100%)', emoji: '🦴' },
  8: { bg: 'linear-gradient(135deg, #2d1a3a 0%, #4a2d5a 100%)', emoji: '👹' },
};

// Stage thumbnail themes — World 2 (Venom Jungle)
const STAGE_THUMBS_W2: Record<number, { bg: string; emoji: string }> = {
  1: { bg: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a20 100%)', emoji: '🐸' },
  2: { bg: 'linear-gradient(135deg, #1a4a1a 0%, #3a6a28 100%)', emoji: '🐍' },
  3: { bg: 'linear-gradient(135deg, #2a3a1a 0%, #4a5a20 100%)', emoji: '🟢' },
  4: { bg: 'linear-gradient(135deg, #2a3020 0%, #4a4a28 100%)', emoji: '🦎' },
  5: { bg: 'linear-gradient(135deg, #1a2a10 0%, #3a4a18 100%)', emoji: '🐆' },
  6: { bg: 'linear-gradient(135deg, #2a1a2a 0%, #4a2a40 100%)', emoji: '🌺' },
  7: { bg: 'linear-gradient(135deg, #1a2010 0%, #2a3a14 100%)', emoji: '🦍' },
  8: { bg: 'linear-gradient(135deg, #0a1a08 0%, #1a2a10 100%)', emoji: '🌿' },
  9: { bg: 'linear-gradient(135deg, #0a0e08 0%, #1a1e10 100%)', emoji: '🐲' },
};

const STAGE_THUMBS_BY_WORLD: Record<number, Record<number, { bg: string; emoji: string }>> = {
  1: STAGE_THUMBS_W1,
  2: STAGE_THUMBS_W2,
};

function getWorldProgress(progress: AdventureProgress, worldId: number) {
  return progress.worlds[worldId] ?? { stages: {}, totalXpEarned: 0 };
}

export function WorldMap({
  progress,
  currentWorldId,
  onChangeWorld,
  isWorldUnlocked,
  isStageUnlocked,
  onSelectStage,
  onBack,
}: WorldMapProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [copiedWorldId, setCopiedWorldId] = useState<number | null>(null);

  const currentPreview = WORLD_PREVIEWS.find(w => w.id === currentWorldId)!;
  const prevWorld = WORLD_PREVIEWS.find(w => w.id === currentWorldId - 1);
  const nextWorld = WORLD_PREVIEWS.find(w => w.id === currentWorldId + 1);

  const worldConfig = WORLDS.find(w => w.id === currentWorldId);
  const isPlayable = !!worldConfig && isWorldUnlocked(currentWorldId);
  const stages = worldConfig?.stages ?? [];
  const worldDebuff = worldConfig?.debuff;

  const wp = getWorldProgress(progress, currentWorldId);

  const isPrevWorldBossCleared = (() => {
    if (currentWorldId === 1) return true;
    const prevWorldConfig = WORLDS.find(w => w.id === currentWorldId - 1);
    if (!prevWorldConfig) return false;
    const bossStage = prevWorldConfig.stages[prevWorldConfig.stages.length - 1];
    const prevWp = getWorldProgress(progress, currentWorldId - 1);
    return !!prevWp.stages[bossStage.id]?.clearedAt;
  })();

  const totalStars = isPlayable
    ? Object.values(wp.stages).reduce((sum, s) => sum + s.bestStars, 0)
    : 0;
  const maxStars = isPlayable ? stages.length * 3 : 0;

  const cardW = isMobile ? 150 : 180;
  const cardH = isMobile ? 90 : 100;
  const zigzagOffset = isMobile ? 60 : 100;

  const connH = 44;
  const connMidY = connH / 2;
  const connSvgW = zigzagOffset * 2 + 4;

  const thumbs = STAGE_THUMBS_BY_WORLD[currentWorldId] ?? STAGE_THUMBS_W1;

  // Determine if world is "coming soon" (not in WORLDS array)
  const isComingSoon = !worldConfig;

  const handleShareClick = () => {
    const url = `${window.location.origin}/adventure?world=${currentWorldId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedWorldId(currentWorldId);
      setTimeout(() => setCopiedWorldId(null), 2000);
    }).catch(() => {});
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Left ghost preview */}
      {prevWorld && (
        <div style={{
          position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: isMobile ? '60px' : '120px', textAlign: 'center',
          opacity: 0.12, pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{ fontSize: isMobile ? '28px' : '48px', marginBottom: '8px' }}>{prevWorld.emoji}</div>
          {!isMobile && (
            <div style={{ fontSize: '12px', color: 'var(--text-color)', fontWeight: 700, lineHeight: 1.3 }}>
              {prevWorld.name}
            </div>
          )}
        </div>
      )}

      {/* Right ghost preview */}
      {nextWorld && (
        <div style={{
          position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
          width: isMobile ? '60px' : '120px', textAlign: 'center',
          opacity: 0.12, pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{ fontSize: isMobile ? '28px' : '48px', marginBottom: '8px' }}>{nextWorld.emoji}</div>
          {!isMobile && (
            <div style={{ fontSize: '12px', color: 'var(--text-color)', fontWeight: 700, lineHeight: 1.3 }}>
              {nextWorld.name}
            </div>
          )}
        </div>
      )}

      {/* Left arrow */}
      {prevWorld && (
        <button
          onClick={() => onChangeWorld(prevWorld.id)}
          style={{
            position: 'fixed', left: isMobile ? '8px' : '32px', top: '50%', transform: 'translateY(-50%)',
            width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px',
            borderRadius: '50%', backgroundColor: 'var(--sub-alt-color)', border: '1px solid var(--sub-color)',
            color: 'var(--text-color)', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, opacity: 0.6, transition: 'opacity 0.2s, background-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'var(--main-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'var(--sub-alt-color)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {nextWorld && (
        <button
          onClick={() => onChangeWorld(nextWorld.id)}
          style={{
            position: 'fixed', right: isMobile ? '8px' : '32px', top: '50%', transform: 'translateY(-50%)',
            width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px',
            borderRadius: '50%', backgroundColor: 'var(--sub-alt-color)', border: '1px solid var(--sub-color)',
            color: 'var(--text-color)', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, opacity: 0.6, transition: 'opacity 0.2s, background-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'var(--main-color)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'var(--sub-alt-color)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Main content */}
      <div className="fade-in" style={{
        width: '100%', maxWidth: '700px', margin: '0 auto',
        padding: 'var(--page-vertical-padding) 0', position: 'relative', zIndex: 1,
      }}>
        {/* Back button */}
        <button onClick={onBack} style={{
          color: 'var(--sub-color)', fontSize: '13px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('adventure.back')}
        </button>

        {/* World title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>{currentPreview.emoji}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)', marginBottom: '4px' }}>
            {currentWorldId === 1 ? t('adventure.worldName') : currentPreview.name}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--sub-color)' }}>
            {currentWorldId === 1 ? t('adventure.worldDesc') : currentPreview.desc}
          </p>

          {/* World debuff badge */}
          {worldDebuff && isPlayable && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '10px', padding: '5px 14px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '999px', fontSize: '12px', fontWeight: 700,
              color: '#4caf50',
            }}>
              <span>{worldDebuff.icon}</span>
              <span>{worldDebuff.description}</span>
            </div>
          )}

          {/* World indicator dots */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', marginTop: '14px',
          }}>
            {WORLD_PREVIEWS.map(w => (
              <button
                key={w.id}
                onClick={() => onChangeWorld(w.id)}
                style={{
                  width: w.id === currentWorldId ? '10px' : '7px',
                  height: w.id === currentWorldId ? '10px' : '7px',
                  borderRadius: '50%',
                  backgroundColor: w.id === currentWorldId ? 'var(--main-color)' : 'var(--sub-alt-color)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0,
                }}
              />
            ))}
          </div>

          {/* Stars + Share */}
          {isPlayable && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', marginTop: '12px',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px',
                backgroundColor: 'var(--sub-alt-color)', borderRadius: '999px',
                fontSize: '13px', color: 'var(--sub-color)',
              }}>
                <span style={{ color: '#fbbf24' }}>★</span>
                {totalStars} / {maxStars}
              </div>

              {/* Share button */}
              <button
                onClick={handleShareClick}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--sub-alt-color)', borderRadius: '999px',
                  fontSize: '12px', color: 'var(--sub-color)',
                  cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                  transition: 'color 0.2s',
                }}
              >
                {copiedWorldId === currentWorldId ? (
                  <span style={{ color: 'var(--main-color)', fontWeight: 600 }}>Copied!</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Stage path or Coming Soon */}
        {isPlayable ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0px', position: 'relative', paddingBottom: '20px',
          }}>
            {stages.map((stage, idx) => {
              const unlocked = isStageUnlocked(currentWorldId, stage.id);
              const stageProgress = wp.stages[stage.id];
              const cleared = !!stageProgress?.clearedAt;
              const stars = stageProgress?.bestStars ?? 0;
              const isNext = unlocked && !cleared;
              const isBoss = stage.isBoss;
              const thumb = thumbs[stage.id] ?? { bg: 'linear-gradient(135deg, #333 0%, #555 100%)', emoji: '?' };
              const isLeft = idx % 2 === 0;
              const offsetX = isLeft ? -zigzagOffset : zigzagOffset;

              return (
                <div key={stage.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  {/* Z-shaped connector */}
                  {idx > 0 && (() => {
                    const prevIsLeft = (idx - 1) % 2 === 0;
                    const isActive = cleared || unlocked;
                    const prevX = prevIsLeft ? 2 : connSvgW - 2;
                    const currX = isLeft ? 2 : connSvgW - 2;
                    const d = `M ${prevX},0 V ${connMidY} H ${currX} V ${connH}`;

                    return (
                      <svg width={connSvgW} height={connH} style={{ display: 'block' }}>
                        <path d={d} fill="none" style={{
                          stroke: isActive ? 'var(--main-color)' : 'var(--sub-alt-color)',
                          strokeWidth: 2,
                          opacity: isActive ? 0.5 : 0.25,
                        }} />
                      </svg>
                    );
                  })()}

                  {/* Stage card */}
                  <button
                    onClick={() => unlocked && onSelectStage(stage.id)}
                    disabled={!unlocked}
                    style={{
                      position: 'relative',
                      width: isBoss ? `${cardW + 20}px` : `${cardW}px`,
                      height: isBoss ? `${cardH + 10}px` : `${cardH}px`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: cleared
                        ? '2px solid var(--main-color)'
                        : isNext
                          ? '2px solid var(--main-color)'
                          : '1px solid var(--sub-alt-color)',
                      cursor: unlocked ? 'pointer' : 'default',
                      opacity: unlocked ? 1 : 0.45,
                      transform: `translateX(${offsetX}px)`,
                      transition: 'transform 0.2s, opacity 0.2s, box-shadow 0.2s',
                      animation: isNext ? 'pulse 2s infinite' : undefined,
                      boxShadow: isNext
                        ? '0 0 16px rgba(var(--main-color-rgb, 0,0,0), 0.25)'
                        : isBoss && unlocked
                          ? '0 0 20px rgba(var(--error-color-rgb, 200,50,50), 0.2)'
                          : '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      textAlign: 'center',
                    }}
                  >
                    {/* Background gradient */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: unlocked ? thumb.bg : 'var(--sub-alt-color)',
                      opacity: cleared ? 0.7 : unlocked ? 0.5 : 0.3,
                      pointerEvents: 'none',
                    }} />

                    {/* Boss badge */}
                    {(isBoss || stage.isMidBoss) && (
                      <div style={{
                        position: 'absolute', top: '5px', right: '6px', zIndex: 2,
                        padding: '2px 7px', borderRadius: '4px',
                        backgroundColor: stage.isMidBoss ? '#d97706' : '#dc2626',
                        color: '#fff', fontSize: '8px', fontWeight: 800,
                        letterSpacing: '0.5px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}>
                        {stage.isMidBoss ? 'MID BOSS' : 'BOSS'}
                      </div>
                    )}

                    {/* Content overlay */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: isBoss ? '28px' : '22px', marginBottom: '2px' }}>
                        {!unlocked ? '🔒' : thumb.emoji}
                      </div>

                      <div style={{
                        fontSize: isMobile ? '12px' : '13px', fontWeight: 700,
                        color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        lineHeight: 1.2, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '4px',
                      }}>
                        {stage.name}
                        {cleared && <span style={{ fontSize: '12px' }}>✅</span>}
                      </div>

                      {cleared && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '3px' }}>
                          {[1, 2, 3].map(s => (
                            <span key={s} style={{
                              fontSize: '12px',
                              color: s <= stars ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                            }}>★</span>
                          ))}
                        </div>
                      )}

                      {isNext && (
                        <div style={{
                          fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        }}>
                          +{stage.xpReward} XP
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Coming Soon */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.6 }}>🔒</div>
            <div style={{
              fontSize: '20px', fontWeight: 700,
              color: 'var(--text-color)', marginBottom: '8px',
            }}>
              Coming Soon
            </div>
            <p style={{
              fontSize: '13px', color: 'var(--sub-color)',
              maxWidth: '320px', margin: '0 auto', lineHeight: 1.6,
            }}>
              {isComingSoon
                ? 'This world will be available in a future update.'
                : !isPrevWorldBossCleared
                  ? `Defeat World ${currentWorldId - 1}'s Final Boss to unlock this world!`
                  : 'Complete the previous world to unlock!'}
            </p>

            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '12px', marginTop: '40px', opacity: 0.08, pointerEvents: 'none',
            }}>
              {Array.from({ length: currentWorldId + 7 }, (_, i) => (
                <div key={i} style={{
                  width: '160px', height: '70px', borderRadius: '12px',
                  backgroundColor: 'var(--text-color)',
                  transform: `translateX(${i % 2 === 0 ? -60 : 60}px)`,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
