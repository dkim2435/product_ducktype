import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdventureProgress } from '../../types/adventure';
import type { WorldConfig } from '../../types/adventure';
import { WORLD_PREVIEWS } from '../../constants/adventure';
import { useIsMobile } from '../../hooks/useIsMobile';

interface WorldMapProps {
  progress: AdventureProgress;
  currentWorldId: number;
  onChangeWorld: (worldId: number) => void;
  isWorldUnlocked: (worldId: number) => boolean;
  isStageUnlocked: (worldId: number, stageId: number) => boolean;
  onSelectStage: (stageId: number) => void;
  onBack: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  activeWorlds: WorldConfig[];
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

// World-themed background gradients (subtle, dark-toned for immersion)
// World 1: no custom bg (default theme)
const WORLD_BG: Record<number, string> = {
  1: 'radial-gradient(ellipse at 50% 0%, rgba(255, 190, 50, 0.22) 0%, transparent 65%), radial-gradient(ellipse at 75% 40%, rgba(255, 160, 30, 0.15) 0%, transparent 55%), radial-gradient(ellipse at 25% 70%, rgba(255, 180, 40, 0.13) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(255, 170, 35, 0.09) 0%, transparent 50%)',
  2: 'radial-gradient(ellipse at 50% 0%, rgba(20, 60, 20, 0.45) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(10, 50, 15, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(15, 45, 10, 0.25) 0%, transparent 45%)',
  // Future worlds:
  // 3: misty harbor — blue-gray
  // 4: glacier peak — icy blue
  // 5: crypt of shadows — deep purple-black
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
  isLoggedIn,
  onLoginClick,
  activeWorlds,
}: WorldMapProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [copiedWorldId, setCopiedWorldId] = useState<number | null>(null);

  const currentPreview = WORLD_PREVIEWS.find(w => w.id === currentWorldId)!;
  const prevWorld = WORLD_PREVIEWS.find(w => w.id === currentWorldId - 1);
  const nextWorld = WORLD_PREVIEWS.find(w => w.id === currentWorldId + 1);

  const worldConfig = activeWorlds.find(w => w.id === currentWorldId);
  const isPlayable = !!worldConfig && isWorldUnlocked(currentWorldId);
  const stages = worldConfig?.stages ?? [];
  const worldDebuff = worldConfig?.debuff;

  const wp = getWorldProgress(progress, currentWorldId);

  const prevWorldLockInfo = (() => {
    if (currentWorldId === 1) return { bossCleared: true, starsOk: true, prevStars: 0, starsRequired: 0 };
    const prevWorldConfig = activeWorlds.find(w => w.id === currentWorldId - 1);
    if (!prevWorldConfig) return { bossCleared: false, starsOk: true, prevStars: 0, starsRequired: 0 };
    const bossStage = prevWorldConfig.stages[prevWorldConfig.stages.length - 1];
    const prevWp = getWorldProgress(progress, currentWorldId - 1);
    const bossCleared = !!prevWp.stages[bossStage.id]?.clearedAt;
    const prevStars = Object.values(prevWp.stages).reduce((sum, s) => sum + s.bestStars, 0);
    const starsReq = worldConfig?.starsRequired ?? 0;
    return { bossCleared, starsOk: prevStars >= starsReq, prevStars, starsRequired: starsReq };
  })();

  const totalStars = isPlayable
    ? Object.values(wp.stages).reduce((sum, s) => sum + s.bestStars, 0)
    : 0;
  const maxStars = isPlayable ? stages.length * 3 : 0;

  // Compute boss bestStars for difficulty gating
  const bossStage = stages[stages.length - 1];
  const bossBestStars = bossStage ? (wp.stages[bossStage.id]?.bestStars ?? 0) : 0;

  // Determine highest unlocked difficulty per stage (0=beginner, 1=intermediate, 2=expert)
  const getCorruptionTier = (stageIdx: number): number => {
    const prevStageStars = stageIdx > 0
      ? (wp.stages[stages[stageIdx - 1].id]?.bestStars ?? 0)
      : -1; // -1 = first stage

    // Expert unlocked?
    if (bossBestStars >= 2 && (prevStageStars === -1 || prevStageStars >= 3)) return 2;
    // Intermediate unlocked?
    if (bossBestStars >= 1 && (prevStageStars === -1 || prevStageStars >= 2)) return 1;
    return 0;
  };

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

  const worldBg = WORLD_BG[currentWorldId]
    ?? (isComingSoon ? 'repeating-linear-gradient(135deg, rgba(80, 70, 30, 0.08) 0px, rgba(80, 70, 30, 0.08) 20px, transparent 20px, transparent 40px), radial-gradient(ellipse at 50% 50%, rgba(60, 50, 20, 0.2) 0%, transparent 60%)' : undefined);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* World-themed background overlay */}
      {worldBg && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: worldBg,
          pointerEvents: 'none', zIndex: 0,
          transition: 'opacity 0.5s',
        }} />
      )}
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

      {/* Right arrow + unlock requirement */}
      {nextWorld && (() => {
        const nextWorldConfig = activeWorlds.find(w => w.id === nextWorld.id);
        const nextWorldLocked = !isWorldUnlocked(nextWorld.id);
        const nextStarsRequired = nextWorldConfig?.starsRequired ?? 0;
        const currentWorldStars = Object.values(getWorldProgress(progress, currentWorldId).stages)
          .reduce((sum, s) => sum + s.bestStars, 0);

        return (
          <div style={{
            position: 'fixed', right: isMobile ? '8px' : '32px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            zIndex: 10,
          }}>
            {/* Unlock requirement text */}
            {nextWorldLocked && nextStarsRequired > 0 && (
              <div style={{
                padding: '3px 10px', borderRadius: '999px',
                backgroundColor: 'var(--sub-alt-color)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                fontSize: '11px', fontWeight: 700, color: 'var(--text-color)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#fbbf24' }}>★</span> {currentWorldStars}/{nextStarsRequired}
              </div>
            )}
            <button
              onClick={() => onChangeWorld(nextWorld.id)}
              style={{
                width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px',
                borderRadius: '50%', backgroundColor: 'var(--sub-alt-color)',
                border: nextWorldLocked ? '1px solid var(--sub-color)' : '1.5px solid var(--text-color)',
                color: nextWorldLocked ? 'var(--text-color)' : '#fff',
                fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, opacity: nextWorldLocked ? 0.6 : 0.85,
                transition: 'opacity 0.2s, background-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = 'var(--main-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = nextWorldLocked ? '0.6' : '0.85'; e.currentTarget.style.backgroundColor = 'var(--sub-alt-color)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        );
      })()}

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
              const corruptionTier = getCorruptionTier(idx);
              const loginGate = worldConfig?.loginGateStageId;
              // Only show login gate after the player has cleared the stage right before the gate
              const gateVisible = loginGate !== undefined && (() => {
                const gateIdx = stages.findIndex(s => s.id === loginGate);
                if (gateIdx <= 0) return true; // gate at first stage → always visible
                return !!wp.stages[stages[gateIdx - 1].id]?.clearedAt;
              })();
              const needsLogin = !isLoggedIn && gateVisible && loginGate !== undefined && stage.id >= loginGate && !cleared;
              const isNext = unlocked && !cleared && !needsLogin;
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

                  {/* Stage card — wrapper handles offset so pulse animation doesn't override translateX */}
                  <div style={{ transform: `translateX(${offsetX}px)`, transition: 'transform 0.2s' }}>
                  <button
                    onClick={() => {
                      if (needsLogin) { onLoginClick(); return; }
                      if (unlocked) onSelectStage(stage.id);
                    }}
                    disabled={!unlocked && !needsLogin}
                    style={{
                      position: 'relative',
                      width: isBoss ? `${cardW + 20}px` : `${cardW}px`,
                      height: isBoss ? `${cardH + 10}px` : `${cardH}px`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: corruptionTier >= 2
                        ? '2px solid rgba(160, 0, 255, 0.6)'
                        : corruptionTier >= 1
                          ? '2px solid rgba(128, 0, 255, 0.35)'
                          : cleared
                            ? '2px solid var(--main-color)'
                            : isNext
                              ? '2px solid var(--main-color)'
                              : needsLogin
                                ? '1.5px solid rgba(59, 130, 246, 0.4)'
                                : '1px solid var(--sub-alt-color)',
                      cursor: unlocked || needsLogin ? 'pointer' : 'default',
                      opacity: needsLogin ? 0.65 : unlocked ? 1 : 0.45,
                      transition: 'opacity 0.2s, box-shadow 0.2s',
                      animation: isNext ? 'pulse 2s infinite' : undefined,
                      boxShadow: corruptionTier >= 2
                        ? '0 0 18px rgba(160, 0, 255, 0.35), 0 0 6px rgba(128, 0, 255, 0.2)'
                        : corruptionTier >= 1
                          ? '0 0 12px rgba(128, 0, 255, 0.2)'
                          : isNext
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

                    {/* Corruption overlay — intermediate unlocked: visible cracks + tint */}
                    {corruptionTier === 1 && (
                      <>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'radial-gradient(ellipse at 25% 75%, rgba(128, 0, 255, 0.15) 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(100, 0, 200, 0.1) 0%, transparent 50%)',
                          pointerEvents: 'none', zIndex: 1,
                        }} />
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.45 }} viewBox="0 0 180 100" preserveAspectRatio="none">
                          {/* Main crack top-left to center */}
                          <path d="M 25,0 L 30,12 L 24,26 L 30,42 L 26,55" fill="none" stroke="rgba(200,150,255,0.9)" strokeWidth="1.2" />
                          <path d="M 24,26 L 14,30 L 6,26" fill="none" stroke="rgba(200,150,255,0.7)" strokeWidth="0.8" />
                          <path d="M 30,42 L 42,46 L 52,42" fill="none" stroke="rgba(200,150,255,0.6)" strokeWidth="0.7" />
                          {/* Secondary crack bottom-right */}
                          <path d="M 150,100 L 145,82 L 152,68 L 146,55" fill="none" stroke="rgba(200,150,255,0.8)" strokeWidth="1" />
                          <path d="M 152,68 L 164,64 L 174,68" fill="none" stroke="rgba(200,150,255,0.6)" strokeWidth="0.7" />
                        </svg>
                      </>
                    )}

                    {/* Corruption overlay — expert unlocked: shattered cracks + strong tint + glow */}
                    {corruptionTier >= 2 && (
                      <>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          background: 'radial-gradient(ellipse at 20% 75%, rgba(180, 0, 255, 0.22) 0%, transparent 50%), radial-gradient(ellipse at 80% 25%, rgba(140, 0, 220, 0.18) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(120, 0, 200, 0.08) 0%, transparent 60%)',
                          pointerEvents: 'none', zIndex: 1,
                        }} />
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          boxShadow: 'inset 0 0 18px rgba(140, 0, 255, 0.3)',
                          borderRadius: '12px',
                          pointerEvents: 'none', zIndex: 1,
                        }} />
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, opacity: 0.75 }} viewBox="0 0 180 100" preserveAspectRatio="none">
                          {/* === Major crack 1 — left-center, top to bottom === */}
                          <path d="M 45,0 L 50,8 L 42,18 L 48,30 L 42,42 L 48,54 L 44,66 L 50,80 L 46,90 L 48,100" fill="none" stroke="rgba(220,170,255,1)" strokeWidth="1.6" />
                          <path d="M 42,18 L 30,22 L 18,18 L 8,22" fill="none" stroke="rgba(220,170,255,0.9)" strokeWidth="1.1" />
                          <path d="M 48,30 L 62,34 L 74,30 L 82,34" fill="none" stroke="rgba(220,170,255,0.85)" strokeWidth="1" />
                          <path d="M 42,42 L 28,46 L 16,42 L 6,46" fill="none" stroke="rgba(220,170,255,0.8)" strokeWidth="0.9" />
                          <path d="M 48,54 L 64,58 L 76,54 L 86,58" fill="none" stroke="rgba(220,170,255,0.8)" strokeWidth="0.9" />
                          <path d="M 44,66 L 30,70 L 18,66" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          <path d="M 50,80 L 62,84 L 72,80" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          {/* === Major crack 2 — right side, top to bottom === */}
                          <path d="M 140,0 L 135,10 L 142,22 L 136,36 L 143,48 L 137,60 L 143,74 L 138,86 L 142,100" fill="none" stroke="rgba(220,170,255,1)" strokeWidth="1.4" />
                          <path d="M 142,22 L 154,26 L 166,22 L 176,26" fill="none" stroke="rgba(220,170,255,0.85)" strokeWidth="1" />
                          <path d="M 136,36 L 122,40 L 110,36 L 100,40" fill="none" stroke="rgba(220,170,255,0.8)" strokeWidth="0.9" />
                          <path d="M 143,48 L 156,52 L 168,48 L 178,52" fill="none" stroke="rgba(220,170,255,0.8)" strokeWidth="0.9" />
                          <path d="M 137,60 L 124,64 L 112,60" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          <path d="M 143,74 L 158,78 L 170,74" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          {/* === Major crack 3 — center, diagonal top-left to bottom-right === */}
                          <path d="M 80,0 L 84,12 L 78,24 L 86,38 L 82,50 L 90,62 L 86,76 L 92,88 L 88,100" fill="none" stroke="rgba(220,170,255,0.9)" strokeWidth="1.2" />
                          <path d="M 78,24 L 68,28 L 58,24" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          <path d="M 86,38 L 96,42 L 106,38" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.8" />
                          <path d="M 90,62 L 100,66 L 110,62" fill="none" stroke="rgba(220,170,255,0.65)" strokeWidth="0.7" />
                          <path d="M 86,76 L 74,80 L 64,76" fill="none" stroke="rgba(220,170,255,0.65)" strokeWidth="0.7" />
                          {/* === Horizontal stress fractures === */}
                          <path d="M 0,20 L 16,17 L 30,20 L 40,17" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.8" />
                          <path d="M 0,50 L 12,47 L 24,50 L 36,47" fill="none" stroke="rgba(220,170,255,0.55)" strokeWidth="0.7" />
                          <path d="M 0,80 L 14,77 L 28,80 L 38,77" fill="none" stroke="rgba(220,170,255,0.5)" strokeWidth="0.7" />
                          <path d="M 180,15 L 164,12 L 150,15 L 140,12" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.8" />
                          <path d="M 180,45 L 166,42 L 152,45 L 142,42" fill="none" stroke="rgba(220,170,255,0.55)" strokeWidth="0.7" />
                          <path d="M 180,75 L 168,72 L 154,75 L 144,72" fill="none" stroke="rgba(220,170,255,0.5)" strokeWidth="0.7" />
                          {/* === Corner spider cracks === */}
                          <path d="M 0,0 L 12,8 L 20,4 L 28,10" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.9" />
                          <path d="M 0,0 L 8,14 L 4,24" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.7" />
                          <path d="M 180,0 L 168,8 L 160,4 L 152,10" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.9" />
                          <path d="M 180,0 L 172,14 L 176,24" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.7" />
                          <path d="M 0,100 L 14,92 L 22,96 L 30,90" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.9" />
                          <path d="M 0,100 L 8,86 L 4,76" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.7" />
                          <path d="M 180,100 L 166,92 L 158,96 L 150,90" fill="none" stroke="rgba(220,170,255,0.7)" strokeWidth="0.9" />
                          <path d="M 180,100 L 172,86 L 176,76" fill="none" stroke="rgba(220,170,255,0.6)" strokeWidth="0.7" />
                          {/* === Small shatter fragments === */}
                          <path d="M 20,55 L 26,50 L 32,56 L 26,60 Z" fill="none" stroke="rgba(200,140,255,0.5)" strokeWidth="0.6" />
                          <path d="M 155,35 L 161,30 L 167,36 L 161,40 Z" fill="none" stroke="rgba(200,140,255,0.5)" strokeWidth="0.6" />
                          <path d="M 95,15 L 101,10 L 107,16 L 101,20 Z" fill="none" stroke="rgba(200,140,255,0.45)" strokeWidth="0.5" />
                          <path d="M 60,85 L 66,80 L 72,86 L 66,90 Z" fill="none" stroke="rgba(200,140,255,0.45)" strokeWidth="0.5" />
                          <path d="M 120,70 L 126,65 L 132,71 L 126,75 Z" fill="none" stroke="rgba(200,140,255,0.4)" strokeWidth="0.5" />
                        </svg>
                      </>
                    )}

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
                        {needsLogin ? '🔐' : !unlocked ? '🔒' : thumb.emoji}
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

                      {needsLogin && (
                        <div style={{
                          fontSize: '9px', color: '#93c5fd', marginTop: '2px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontWeight: 600,
                        }}>
                          Login to play
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
                </div>
              );
            })}
          </div>
        ) : (
          /* Locked or Coming Soon */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.6 }}>
              {isComingSoon ? '🚧' : '🔒'}
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 700,
              color: 'var(--text-color)', marginBottom: '8px',
            }}>
              {isComingSoon ? 'Coming Soon' : 'Locked'}
            </div>
            <p style={{
              fontSize: '13px', color: 'var(--sub-color)',
              maxWidth: '320px', margin: '0 auto', lineHeight: 1.6,
            }}>
              {isComingSoon
                ? 'This world will be available in a future update.'
                : !prevWorldLockInfo.bossCleared
                  ? `Defeat World ${currentWorldId - 1}'s Final Boss and earn ${prevWorldLockInfo.starsRequired} ★ to unlock!`
                  : `Need ${prevWorldLockInfo.starsRequired - prevWorldLockInfo.prevStars} more ★ from World ${currentWorldId - 1} (${prevWorldLockInfo.prevStars}/${prevWorldLockInfo.starsRequired})`}
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
