import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StageConfig, StageResult, DebuffType, DifficultyLevel } from '../../types/adventure';
import { useCombat } from '../../hooks/useCombat';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  COUNTDOWN_SECONDS,
  DAMAGE_NUMBER_DURATION_MS,
  KILL_EFFECT_DURATION_MS,
  DIFFICULTY_CONFIGS,
  WORLD_VICTORY_CINEMATICS,
  WORLD_PREVIEWS,
} from '../../constants/adventure';
import { DEBUFF_AURA } from '../../constants/debuffConfig';
import { getStageTheme } from '../../constants/stageThemes';
import { useKeyboardHeight } from '../../hooks/useVisualViewport';
import { SpriteIcon, MinionWord } from './MinionWord';
import type { Settings } from '../../types/settings';

const PLAYER_IMG = '/images/adventure/player.png';

interface CombatSceneProps {
  stageConfig: StageConfig;
  settings: Settings;
  onComplete: (result: StageResult) => void;
  onBack: () => void;
  worldId: number;
  debuff: DebuffType;
  difficulty: DifficultyLevel;
  onDifficultyChange: (d: DifficultyLevel) => void;
  stageBestStars: number;     // 0=not cleared, 1=beginner cleared, 2=intermediate cleared, 3=expert cleared
  bossBestStars: number;      // boss stage bestStars — gates difficulty tiers
  prevStageBestStars: number; // previous stage bestStars (-1 = first stage, no prev requirement)
  onTypingStateChange?: (active: boolean) => void;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 420;


export function CombatScene({ stageConfig, settings, onComplete, onBack, worldId, debuff, difficulty, onDifficultyChange, stageBestStars, bossBestStars, prevStageBestStars, onTypingStateChange }: CombatSceneProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  // Sequential difficulty unlock:
  // Intermediate: boss cleared on Beginner + previous stage cleared on Intermediate (or first stage)
  // Expert: boss cleared on Intermediate + previous stage cleared on Expert (or first stage)
  const isDiffUnlocked = useCallback((d: DifficultyLevel) => {
    if (d === 'beginner') return true;
    if (d === 'intermediate') {
      if (bossBestStars < 1) return false; // boss not cleared on beginner
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 2; // prev stage cleared on intermediate
    }
    if (d === 'expert') {
      if (bossBestStars < 2) return false; // boss not cleared on intermediate
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 3; // prev stage cleared on expert
    }
    return false;
  }, [bossBestStars, prevStageBestStars]);

  // Auto-select highest unlocked difficulty
  useEffect(() => {
    const best: DifficultyLevel = isDiffUnlocked('expert') ? 'expert'
      : isDiffUnlocked('intermediate') ? 'intermediate'
      : 'beginner';
    if (difficulty !== best) {
      onDifficultyChange(best);
    }
  }, [isDiffUnlocked, onDifficultyChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveDifficulty = isDiffUnlocked(difficulty) ? difficulty : 'beginner';

  const { state, startCountdown, handleChar, handleBackspace } = useCombat(stageConfig, onComplete, debuff, effectiveDifficulty, stageBestStars);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [, setTick] = useState(0);

  // Re-render every 100ms during combat for smooth timer countdown
  useEffect(() => {
    if (state.phase !== 'fighting' && state.phase !== 'wave-clear' && state.phase !== 'boss-transition' && state.phase !== 'boss-death') return;
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'countdown') return;
    setCountdown(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase]);

  const onCharWrapped = useCallback((char: string) => {
    handleChar(char);
    playClick();
  }, [handleChar, playClick]);

  const onBackspaceWrapped = useCallback(() => {
    handleBackspace();
    playError();
  }, [handleBackspace, playError]);

  const { inputRef, focusInput } = useKeyboard({
    onChar: onCharWrapped,
    onSpace: () => { handleChar(' '); playClick(); },
    onBackspace: onBackspaceWrapped,
    onCjkInput: () => {},
    onTab: () => {},
    onEscape: () => {},
    enabled: state.phase === 'fighting',
  });

  useEffect(() => {
    if (state.phase === 'fighting') {
      focusInput();
      // Scroll game area into view on mobile when keyboard opens
      if (isMobile) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [state.phase, focusInput, isMobile]);

  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const inputDisplayRef = useRef<HTMLDivElement>(null);

  // Notify parent of typing state (all combat phases) to hide header/footer
  useEffect(() => {
    const active = state.phase === 'fighting' || state.phase === 'wave-clear' || state.phase === 'boss-transition' || state.phase === 'boss-death';
    onTypingStateChange?.(active);
    return () => onTypingStateChange?.(false);
  }, [state.phase, onTypingStateChange]);

  // Scroll input into view when virtual keyboard opens on mobile
  useEffect(() => {
    if (isMobile && keyboardOpen && inputDisplayRef.current) {
      inputDisplayRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isMobile, keyboardOpen]);

  const playerHpPercent = (state.playerHp / state.playerMaxHp) * 100;
  const bossHpPercent = state.bossMaxHp > 0 ? (state.bossHp / state.bossMaxHp) * 100 : 0;
  const now = Date.now();
  const theme = getStageTheme(worldId, stageConfig.id);

  // Mobile: use full width (content is %-positioned), only adjust height when keyboard is open
  const gameFieldHeight = isMobile
    ? (keyboardOpen
      ? Math.max(120, window.innerHeight - keyboardHeight - 100)
      : GAME_HEIGHT)
    : GAME_HEIGHT;
  const containerWidth = isMobile ? '100%' : `${GAME_WIDTH}px`;
  const isBoss = stageConfig.isBoss;
  const bossWordMinions = state.minions.filter(m => m.isBossWord);
  const shieldMinions = state.minions.filter(m => !m.isBossWord);
  const bossShielded = isBoss && shieldMinions.length > 0;
  const debuffAura = debuff !== 'none' ? DEBUFF_AURA[debuff] : undefined;
  const isPoisoned = debuff === 'poison';

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      padding: isMobile && state.phase === 'fighting' ? '0' : 'var(--page-vertical-padding) 0',
    }}>
      <textarea
        ref={inputRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          opacity: 0, width: '1px', height: '1px',
          padding: 0, border: 'none', outline: 'none', resize: 'none',
          fontSize: '16px', overflow: 'hidden', pointerEvents: 'none',
        }}
        autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
        tabIndex={-1}
      />

      {/* INTRO */}
      {state.phase === 'intro' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '20px', padding: '40px 20px',
        }}>
          <SpriteIcon src={stageConfig.enemyConfig.emoji} size={80} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)' }}>
            {stageConfig.name}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--sub-color)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
            {stageConfig.subtitle}
          </p>
          <div style={{
            display: 'flex', gap: '16px', alignItems: 'center',
            padding: '12px 20px', backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--sub-color)',
          }}>
            <span>{stageConfig.enemyConfig.name}</span>
            {isBoss && <span>HP: {stageConfig.enemyConfig.hp}</span>}
            {isBoss && <span style={{ color: 'var(--error-color)', fontWeight: 700 }}>BOSS</span>}
          </div>

          {/* Difficulty selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sub-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Difficulty
            </span>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {(['beginner', 'intermediate', 'expert'] as DifficultyLevel[]).map(d => {
                const cfg = DIFFICULTY_CONFIGS[d];
                const unlocked = isDiffUnlocked(d);
                const isSelected = d === effectiveDifficulty && unlocked;
                return (
                  <button
                    key={d}
                    onClick={() => unlocked && onDifficultyChange(d)}
                    disabled={!unlocked}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: '8px',
                      backgroundColor: isSelected ? `${cfg.color}18` : 'var(--sub-alt-color)',
                      border: isSelected ? `2px solid ${cfg.color}` : '2px solid transparent',
                      cursor: unlocked ? 'pointer' : 'default',
                      opacity: unlocked ? 1 : 0.4,
                      transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '14px', letterSpacing: '2px' }}>
                      {unlocked
                        ? <>{'★'.repeat(cfg.maxStars)}{'☆'.repeat(3 - cfg.maxStars)}</>
                        : '🔒'}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: 700,
                      color: isSelected ? cfg.color : 'var(--sub-color)',
                    }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--sub-color)', lineHeight: 1.3 }}>
                      {unlocked
                        ? <>{cfg.mistypeDamage === 0 ? 'No penalty' : `Mistype: -${cfg.mistypeDamage} HP`}{' · '}{cfg.xpMultiplier}x XP</>
                        : `Clear on ${d === 'intermediate' ? 'Beginner' : 'Intermediate'} first`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Debuff warning */}
          {isPoisoned && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '8px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              fontSize: '13px', fontWeight: 700, color: '#4caf50',
            }}>
              <span style={{ fontSize: '18px' }}>☠️</span>
              POISON: -0.3 HP per second during combat
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={onBack} style={{
              padding: '10px 24px', fontSize: '13px', fontWeight: 600,
              color: 'var(--sub-color)', backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)', cursor: 'pointer',
            }}>{t('adventure.back')}</button>
            <button onClick={() => { focusInput(); startCountdown(); }} style={{
              padding: '12px 36px', fontSize: '15px', fontWeight: 700,
              color: 'var(--bg-color)', backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)', cursor: 'pointer',
            }}>{t('adventure.fight')}</button>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {state.phase === 'countdown' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${GAME_HEIGHT}px` }}>
          <span style={{ fontSize: '96px', fontWeight: 700, color: 'var(--main-color)', animation: 'pulse 0.5s ease-in-out' }}>
            {countdown}
          </span>
        </div>
      )}

      {/* FIGHTING / WAVE-CLEAR / BOSS-TRANSITION / BOSS-DEATH */}
      {(state.phase === 'fighting' || state.phase === 'wave-clear' || state.phase === 'boss-transition' || state.phase === 'boss-death') && (
        <div onClick={focusInput} style={{ cursor: 'text' }}>
          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile && keyboardOpen ? '4px' : '8px', gap: '12px' }}>
            {/* Player HP */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile && keyboardOpen ? '10px' : '12px', color: 'var(--sub-color)', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                <span><SpriteIcon src={PLAYER_IMG} size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('adventure.player')}</span>
                <span>{Math.max(0, Math.round(state.playerHp))}/{state.playerMaxHp}</span>
              </div>
              <div style={{ height: isMobile && keyboardOpen ? '6px' : '8px', backgroundColor: 'var(--sub-alt-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${playerHpPercent}%`,
                  backgroundColor: playerHpPercent > 50 ? '#4caf50' : playerHpPercent > 25 ? '#ff9800' : '#f44336',
                  borderRadius: '4px', transition: 'width 0.3s, background-color 0.3s',
                }} />
              </div>
            </div>

            {/* Wave / Combo + Poison HUD */}
            <div style={{ textAlign: 'center', minWidth: isMobile ? '80px' : '100px' }}>
              {!isBoss && (
                <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
                  {t('adventure.wave')} {state.currentWave + 1}/{stageConfig.waves.length}
                </div>
              )}
              {isBoss && stageConfig.bossConfig && (
                <div style={{ fontSize: '11px', color: 'var(--error-color)', fontWeight: 700 }}>
                  Phase {state.bossPhase + 1}/{stageConfig.bossConfig.phases.length}
                </div>
              )}
              <div style={{
                fontSize: '14px', fontWeight: 700,
                color: state.combo >= 10 ? 'var(--main-color)' : 'var(--text-color)',
                visibility: state.combo > 0 ? 'visible' : 'hidden',
              }}>
                x{state.combo || 1} {state.combo >= 5 ? '🔥' : ''}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 700, marginTop: '2px',
                color: DIFFICULTY_CONFIGS[effectiveDifficulty].color,
              }}>
                {'★'.repeat(DIFFICULTY_CONFIGS[effectiveDifficulty].maxStars)} {DIFFICULTY_CONFIGS[effectiveDifficulty].label}
              </div>
              {debuffAura && (
                <div style={{ fontSize: '10px', fontWeight: 700, color: debuffAura.color, marginTop: '2px' }}>
                  {debuffAura.label}{isPoisoned ? ' -0.3/s' : ''}
                </div>
              )}
            </div>

            {/* Boss HP or enemy info */}
            {isBoss ? (
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile && keyboardOpen ? '10px' : '12px', color: 'var(--sub-color)', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                  <span>{Math.max(0, state.bossHp)}/{state.bossMaxHp}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><SpriteIcon src={stageConfig.enemyConfig.emoji} size={20} />{stageConfig.enemyConfig.name}</span>
                </div>
                <div style={{ height: isMobile && keyboardOpen ? '6px' : '8px', backgroundColor: 'var(--sub-alt-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${bossHpPercent}%`,
                    backgroundColor: '#f44336', borderRadius: '4px',
                    transition: 'width 0.3s', marginLeft: 'auto',
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <SpriteIcon src={stageConfig.enemyConfig.emoji} size={24} />
                <span style={{ fontSize: '12px', color: 'var(--sub-color)' }}>{stageConfig.enemyConfig.name}</span>
              </div>
            )}
          </div>

          {/* GAME FIELD */}
          <div style={{
            position: 'relative',
            width: containerWidth,
            height: `${gameFieldHeight}px`,
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            margin: '0 auto',
            background: theme.bg,
            border: '1px solid var(--sub-alt-color)',
          }}>
            {/* Decorations */}
            {theme.deco.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                fontSize: `${d.s}px`, opacity: d.o,
                userSelect: 'none', pointerEvents: 'none',
              }}>{d.e}</div>
            ))}

            {/* Ground */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px',
              background: theme.ground, pointerEvents: 'none',
            }} />

            {/* Debuff overlay */}
            {debuffAura && state.phase === 'fighting' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: debuffAura.overlay,
                pointerEvents: 'none', zIndex: 25,
              }} />
            )}

            {/* BOSS */}
            {isBoss && state.bossHp > 0 && (
              <div style={{
                position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                zIndex: 8,
              }}>
                <div style={{
                  filter: bossShielded ? 'brightness(0.8)' : undefined,
                  transition: 'filter 0.3s',
                }}>
                  <SpriteIcon src={stageConfig.enemyConfig.emoji} size={isMobile ? 117 : 155} />
                </div>
                {bossShielded && (
                  <div style={{
                    fontSize: '11px', fontWeight: 700, color: 'var(--sub-color)',
                    backgroundColor: 'var(--sub-alt-color)', padding: '2px 10px',
                    borderRadius: '4px', opacity: 0.8,
                  }}>
                    🛡️ SHIELDED
                  </div>
                )}
              </div>
            )}

            {/* BOSS WORD MINIONS */}
            {bossWordMinions.map(minion => (
              <MinionWord
                key={minion.id}
                minion={minion}
                isMatched={minion.id === state.matchedMinionId}
                typedLen={minion.id === state.matchedMinionId ? state.currentInput.length : 0}
                now={now}
                isMobile={isMobile}
                emoji={stageConfig.enemyConfig.emoji}
                isBossWord={true}
                dimmed={bossShielded}
              />
            ))}

            {/* SHIELD MINIONS */}
            {shieldMinions.map(minion => (
              <MinionWord
                key={minion.id}
                minion={minion}
                isMatched={minion.id === state.matchedMinionId}
                typedLen={minion.id === state.matchedMinionId ? state.currentInput.length : 0}
                now={now}
                isMobile={isMobile}
                emoji={isBoss && stageConfig.bossConfig ? stageConfig.bossConfig.minionEmoji : stageConfig.enemyConfig.emoji}
                isBossWord={false}
              />
            ))}

            {/* Kill effects */}
            {state.killEffects.map(k => {
              const age = now - k.createdAt;
              const progress = Math.min(1, age / KILL_EFFECT_DURATION_MS);
              return (
                <div key={k.id} style={{
                  position: 'absolute', left: `${k.x}%`, top: `${k.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 + progress * 0.5})`,
                  fontSize: '28px', opacity: 1 - progress, pointerEvents: 'none', zIndex: 15,
                }}>💥</div>
              );
            })}

            {/* Damage numbers */}
            {state.damageNumbers.map(dmg => {
              const age = now - dmg.createdAt;
              const progress = Math.min(1, age / DAMAGE_NUMBER_DURATION_MS);
              return (
                <div key={dmg.id} style={{
                  position: 'absolute', left: `${dmg.x}%`, top: `${dmg.y - progress * 15}%`,
                  fontSize: dmg.isPlayer ? '16px' : '22px', fontWeight: 700,
                  color: dmg.isPlayer ? '#f44336' : 'var(--main-color)',
                  opacity: 1 - progress, pointerEvents: 'none', transform: 'translateX(-50%)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)', zIndex: 20,
                }}>-{dmg.value}</div>
              );
            })}

            {/* Player duck */}
            <div style={{
              position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 6,
              animation: state.phase === 'wave-clear'
                ? 'player-bounce 0.8s ease-out'
                : debuffAura && state.phase === 'fighting'
                  ? 'player-debuff 2s ease-in-out infinite'
                  : undefined,
              filter: debuffAura && state.phase === 'fighting'
                ? debuffAura.filter
                : undefined,
              transition: 'filter 0.5s',
            }}>
              <SpriteIcon src={PLAYER_IMG} size={isMobile ? 80 : 100} />
            </div>

            {/* Waiting for words */}
            {state.minions.length === 0 && state.phase === 'fighting' && !isBoss && (
              <div style={{
                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '13px', color: 'var(--sub-color)', opacity: 0.5, pointerEvents: 'none',
              }}>
                {t('adventure.waitingForWords')}
              </div>
            )}

            {/* Wave clear overlay */}
            {state.phase === 'wave-clear' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.12)', zIndex: 30,
              }}>
                <div style={{
                  fontSize: '22px', fontWeight: 700, color: 'var(--main-color)',
                  backgroundColor: 'var(--bg-color)', padding: '14px 36px',
                  borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  animation: 'pulse 0.5s',
                }}>
                  {t('adventure.waveClear')}
                </div>
              </div>
            )}

            {/* Boss dialogue overlay */}
            {state.bossDialogue && state.phase === 'boss-transition' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 30,
              }}>
                <div style={{
                  fontSize: '15px', fontStyle: 'italic', fontWeight: 600,
                  color: 'var(--error-color)', backgroundColor: 'var(--bg-color)',
                  padding: '16px 28px', borderRadius: '12px',
                  border: '2px solid var(--error-color)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  maxWidth: '80%', textAlign: 'center', animation: 'fadeIn 0.5s',
                }}>
                  {state.bossDialogue}
                </div>
              </div>
            )}

            {/* Boss death overlay */}
            {state.phase === 'boss-death' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 35,
                pointerEvents: 'none',
              }}>
                {/* Boss sprite shaking and fading */}
                <div style={{
                  position: 'absolute', top: '2%', left: '50%',
                  animation: 'boss-shake 2.5s ease-out forwards',
                  zIndex: 36,
                }}>
                  <SpriteIcon src={stageConfig.enemyConfig.emoji} size={isMobile ? 117 : 155} />
                </div>

                {/* "꾸엑!!" death cry text */}
                <div style={{
                  position: 'absolute', top: '25%', left: '50%',
                  fontSize: isMobile ? '28px' : '36px', fontWeight: 900,
                  color: '#f44336',
                  textShadow: '0 2px 8px rgba(244,67,54,0.5)',
                  animation: 'boss-death-text 2s ease-out forwards',
                  zIndex: 37, whiteSpace: 'nowrap',
                }}>
                  QUACK!!
                </div>

                {/* Explosion effects */}
                {[
                  { x: 45, y: 8, delay: 0, size: 36 },
                  { x: 55, y: 12, delay: 0.2, size: 32 },
                  { x: 40, y: 18, delay: 0.4, size: 28 },
                  { x: 60, y: 15, delay: 0.6, size: 34 },
                  { x: 50, y: 5, delay: 0.8, size: 30 },
                ].map((exp, i) => (
                  <div key={i} style={{
                    position: 'absolute', left: `${exp.x}%`, top: `${exp.y}%`,
                    fontSize: `${exp.size}px`,
                    animation: `boss-death-explosion 0.8s ease-out ${exp.delay}s both`,
                    zIndex: 38,
                  }}>
                    💥
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input display */}
          {state.phase === 'fighting' && (
            <div ref={inputDisplayRef} style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '6px' : '12px' }}>
              <div style={{
                padding: '8px 24px', minWidth: '200px', textAlign: 'center',
                backgroundColor: 'var(--sub-alt-color)', borderRadius: 'var(--border-radius)',
                border: state.currentInput ? '2px solid var(--main-color)' : '2px solid transparent',
                fontSize: '18px', fontWeight: 600, fontFamily: 'monospace',
                color: state.currentInput ? 'var(--main-color)' : 'var(--sub-color)',
                transition: 'border-color 0.15s', minHeight: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {state.currentInput || (
                  <span style={{ opacity: 0.4, fontSize: '13px', fontFamily: 'inherit' }}>
                    {t('adventure.typeToAttack')}
                  </span>
                )}
                <span className="caret-blink" style={{
                  display: 'inline-block', width: '2px', height: '20px',
                  backgroundColor: 'var(--main-color)', marginLeft: '2px',
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VICTORY */}
      {state.phase === 'victory' && (
        isBoss && WORLD_VICTORY_CINEMATICS[worldId] ? (
          /* Cinematic victory for boss stages */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '20px', padding: '40px 20px',
            textAlign: 'center', minHeight: `${GAME_HEIGHT}px`,
            backgroundColor: 'var(--bg-color)',
          }}>
            {/* World emoji */}
            <div style={{
              fontSize: '64px',
              animation: 'cinematic-fade-in 1s ease-out both',
            }}>
              {WORLD_PREVIEWS.find(w => w.id === worldId)?.emoji ?? '🎉'}
            </div>

            {/* Cinematic title */}
            <h2 style={{
              fontSize: isMobile ? '20px' : '26px', fontWeight: 700,
              color: 'var(--text-color)',
              animation: 'cinematic-fade-in 1.2s ease-out 0.5s both',
              lineHeight: 1.4, maxWidth: '500px',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].title}
            </h2>

            {/* Cinematic subtitle */}
            <p style={{
              fontSize: isMobile ? '13px' : '15px', fontStyle: 'italic',
              color: 'var(--sub-color)',
              animation: 'cinematic-fade-in 1.2s ease-out 1.2s both',
              maxWidth: '400px',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].subtitle}
            </p>

            {/* Victory badge (delayed) */}
            <div style={{
              animation: 'cinematic-fade-in 0.8s ease-out 2s both',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ fontSize: '40px' }}>🎉</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--main-color)' }}>
                {t('adventure.victory')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--sub-color)' }}>
                {stageConfig.name} {t('adventure.cleared')}
              </p>
            </div>
          </div>
        ) : (
          /* Normal victory for regular stages */
          <div className="slide-up" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '16px', padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '56px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--main-color)' }}>
              {t('adventure.victory')}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
              {stageConfig.name} {t('adventure.cleared')}
            </p>
          </div>
        )
      )}

      {/* DEFEAT */}
      {state.phase === 'defeat' && (
        <div className="slide-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '16px', padding: '40px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '56px' }}>💀</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--error-color)' }}>
            {t('adventure.defeat')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
            {t('adventure.defeatMsg')}
          </p>
        </div>
      )}
    </div>
  );
}
