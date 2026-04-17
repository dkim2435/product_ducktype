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
import { getEffectiveLevel } from '../../utils/admin';

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
  playerLevel?: number;
  userId?: string | null;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 420;


export function CombatScene({ stageConfig, settings, onComplete, onBack, worldId, debuff, difficulty, onDifficultyChange, stageBestStars, bossBestStars, prevStageBestStars, onTypingStateChange, playerLevel = 1, userId }: CombatSceneProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  const effectiveLevel = getEffectiveLevel(playerLevel, userId);

  // Sequential difficulty unlock:
  // Intermediate: boss cleared on Beginner + previous stage cleared on Intermediate (or first stage)
  // Expert: boss cleared on Intermediate + previous stage cleared on Expert (or first stage) + Lv.15
  const isDiffUnlocked = useCallback((d: DifficultyLevel) => {
    if (d === 'beginner') return true;
    if (d === 'intermediate') {
      if (bossBestStars < 1) return false; // boss not cleared on beginner
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 2; // prev stage cleared on intermediate
    }
    if (d === 'expert') {
      if (effectiveLevel < 15) return false; // requires Lv.15
      if (bossBestStars < 2) return false; // boss not cleared on intermediate
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 3; // prev stage cleared on expert
    }
    return false;
  }, [bossBestStars, prevStageBestStars, effectiveLevel]);

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
  // useCombat ticks frequently via rAF; this reflects the current frame's timestamp
  // eslint-disable-next-line react-hooks/purity
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
    <div className="fade-in w-full max-w-[860px] mx-auto" style={{
      padding: isMobile && state.phase === 'fighting' ? '0' : 'var(--page-vertical-padding) 0',
    }}>
      <textarea
        ref={inputRef}
        className="fixed top-0 left-0 opacity-0 w-px h-px p-0 border-0 outline-none resize-none text-base overflow-hidden pointer-events-none"
        autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
        tabIndex={-1}
      />

      {/* INTRO */}
      {state.phase === 'intro' && (
        <div className="flex flex-col items-center gap-5" style={{ padding: '40px 20px' }}>
          <SpriteIcon src={stageConfig.enemyConfig.emoji} size={80} />
          <h2 className="text-2xl font-bold text-text">
            {stageConfig.name}
          </h2>
          <p className="text-sm text-sub text-center max-w-[400px] leading-[1.6]">
            {stageConfig.subtitle}
          </p>
          <div className="flex gap-4 items-center bg-sub-alt rounded-default text-[13px] text-sub" style={{ padding: '12px 20px' }}>
            <span>{stageConfig.enemyConfig.name}</span>
            {isBoss && <span>HP: {stageConfig.enemyConfig.hp}</span>}
            {isBoss && <span className="text-error font-bold">BOSS</span>}
          </div>

          {/* Difficulty selector */}
          <div className="flex flex-col items-center gap-2 w-full max-w-[400px]">
            <span className="text-xs font-semibold text-sub uppercase tracking-[1px]">
              Difficulty
            </span>
            <div className="flex gap-2 w-full">
              {(['beginner', 'intermediate', 'expert'] as DifficultyLevel[]).map(d => {
                const cfg = DIFFICULTY_CONFIGS[d];
                const unlocked = isDiffUnlocked(d);
                const isSelected = d === effectiveDifficulty && unlocked;
                return (
                  <button
                    key={d}
                    onClick={() => unlocked && onDifficultyChange(d)}
                    disabled={!unlocked}
                    className="flex-1 rounded-[8px] flex flex-col items-center gap-1 transition-all duration-150"
                    style={{
                      padding: '10px 8px',
                      backgroundColor: isSelected ? `${cfg.color}18` : 'var(--sub-alt-color)',
                      border: isSelected ? `2px solid ${cfg.color}` : '2px solid transparent',
                      cursor: unlocked ? 'pointer' : 'default',
                      opacity: unlocked ? 1 : 0.4,
                    }}
                  >
                    <div className="text-sm tracking-[2px]">
                      {unlocked
                        ? <>{'★'.repeat(cfg.maxStars)}{'☆'.repeat(3 - cfg.maxStars)}</>
                        : '🔒'}
                    </div>
                    <div className="text-xs font-bold" style={{
                      color: isSelected ? cfg.color : 'var(--sub-color)',
                    }}>
                      {cfg.label}
                    </div>
                    <div className="text-[10px] text-sub leading-tight">
                      {unlocked
                        ? <>{cfg.mistypeDamage === 0 ? 'No penalty' : `Mistype: -${cfg.mistypeDamage} HP`}{' · '}{cfg.xpMultiplier}x XP</>
                        : d === 'expert' && effectiveLevel < 15
                          ? 'Requires Lv.15'
                          : `Clear on ${d === 'intermediate' ? 'Beginner' : 'Intermediate'} first`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Debuff warning */}
          {debuffAura && (
            <div className="flex items-center gap-2 rounded-[8px] text-[13px] font-bold" style={{
              padding: '8px 18px',
              backgroundColor: `${debuffAura.color}18`,
              border: `1px solid ${debuffAura.color}4d`,
              color: debuffAura.color,
            }}>
              <span className="text-lg">{debuffAura.label.split(' ')[0]}</span>
              {debuff === 'poison' && 'POISON: -0.3 HP per second during combat'}
              {debuff === 'fog' && 'FOG: Words fade into mist over time. Type to clear the fog'}
              {debuff === 'freeze' && 'FREEZE: Mistypes freeze the word for 1.5 seconds'}
              {debuff === 'darkness' && 'DARKNESS: Unmatched words flicker in and out of sight'}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button onClick={onBack} className="text-[13px] font-semibold text-sub bg-sub-alt rounded-default cursor-pointer" style={{ padding: '10px 24px' }}>
              {t('adventure.back')}
            </button>
            <button onClick={() => { focusInput(); startCountdown(); }} className="text-[15px] font-bold text-bg bg-main rounded-default cursor-pointer" style={{ padding: '12px 36px' }}>
              {t('adventure.fight')}
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {state.phase === 'countdown' && (
        <div className="flex items-center justify-center" style={{ height: `${GAME_HEIGHT}px` }}>
          <span className="text-[96px] font-bold text-main" style={{ animation: 'pulse 0.5s ease-in-out' }}>
            {countdown}
          </span>
        </div>
      )}

      {/* FIGHTING / WAVE-CLEAR / BOSS-TRANSITION / BOSS-DEATH */}
      {(state.phase === 'fighting' || state.phase === 'wave-clear' || state.phase === 'boss-transition' || state.phase === 'boss-death') && (
        <div onClick={focusInput} className="cursor-text">
          {/* HUD */}
          <div className="flex justify-between items-center gap-3" style={{ marginBottom: isMobile && keyboardOpen ? '4px' : '8px' }}>
            {/* Player HP */}
            <div className="flex-1">
              <div className="flex justify-between text-sub" style={{ fontSize: isMobile && keyboardOpen ? '10px' : '12px', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                <span><SpriteIcon src={PLAYER_IMG} size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{t('adventure.player')}</span>
                <span>{Math.max(0, Math.round(state.playerHp))}/{state.playerMaxHp}</span>
              </div>
              <div className="rounded-[4px] overflow-hidden bg-sub-alt" style={{ height: isMobile && keyboardOpen ? '6px' : '8px' }}>
                <div className="h-full rounded-[4px] transition-[width,background-color] duration-300" style={{
                  width: `${playerHpPercent}%`,
                  backgroundColor: playerHpPercent > 50 ? '#4caf50' : playerHpPercent > 25 ? '#ff9800' : '#f44336',
                }} />
              </div>
            </div>

            {/* Wave / Combo + Poison HUD */}
            <div className="text-center" style={{ minWidth: isMobile ? '80px' : '100px' }}>
              {!isBoss && (
                <div className="text-[11px] text-sub">
                  {t('adventure.wave')} {state.currentWave + 1}/{stageConfig.waves.length}
                </div>
              )}
              {isBoss && stageConfig.bossConfig && (
                <div className="text-[11px] text-error font-bold">
                  Phase {state.bossPhase + 1}/{stageConfig.bossConfig.phases.length}
                </div>
              )}
              <div className="text-sm font-bold" style={{
                color: state.combo >= 10 ? 'var(--main-color)' : 'var(--text-color)',
                visibility: state.combo > 0 ? 'visible' : 'hidden',
              }}>
                x{state.combo || 1} {state.combo >= 5 ? '🔥' : ''}
              </div>
              <div className="text-[10px] font-bold mt-0.5" style={{ color: DIFFICULTY_CONFIGS[effectiveDifficulty].color }}>
                {'★'.repeat(DIFFICULTY_CONFIGS[effectiveDifficulty].maxStars)} {DIFFICULTY_CONFIGS[effectiveDifficulty].label}
              </div>
              {debuffAura && (
                <div className="text-[10px] font-bold mt-0.5" style={{ color: debuffAura.color }}>
                  {debuffAura.label}{isPoisoned ? ' -0.3/s' : ''}
                </div>
              )}
            </div>

            {/* Boss HP or enemy info */}
            {isBoss ? (
              <div className="flex-1">
                <div className="flex justify-between text-sub" style={{ fontSize: isMobile && keyboardOpen ? '10px' : '12px', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                  <span>{Math.max(0, Math.round(state.bossHp))}/{state.bossMaxHp}</span>
                  <span className="inline-flex items-center gap-1"><SpriteIcon src={stageConfig.enemyConfig.emoji} size={20} />{stageConfig.enemyConfig.name}</span>
                </div>
                <div className="rounded-[4px] overflow-hidden bg-sub-alt" style={{ height: isMobile && keyboardOpen ? '6px' : '8px' }}>
                  <div className="h-full rounded-[4px] transition-[width] duration-300 ml-auto" style={{
                    width: `${bossHpPercent}%`,
                    backgroundColor: '#f44336',
                  }} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-end gap-1.5">
                <SpriteIcon src={stageConfig.enemyConfig.emoji} size={24} />
                <span className="text-xs text-sub">{stageConfig.enemyConfig.name}</span>
              </div>
            )}
          </div>

          {/* GAME FIELD */}
          <div className="relative rounded-default overflow-hidden mx-auto border border-sub-alt" style={{
            width: containerWidth,
            height: `${gameFieldHeight}px`,
            background: theme.bg,
          }}>
            {/* Decorations */}
            {theme.deco.map((d, i) => (
              <div key={i} className="absolute select-none pointer-events-none" style={{
                left: `${d.x}%`, top: `${d.y}%`,
                fontSize: `${d.s}px`, opacity: d.o,
              }}>{d.e}</div>
            ))}

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-[55px] pointer-events-none" style={{ background: theme.ground }} />

            {/* Debuff overlay */}
            {debuffAura && state.phase === 'fighting' && (
              <div className="absolute inset-0 pointer-events-none z-[25]" style={{ background: debuffAura.overlay }} />
            )}

            {/* BOSS */}
            {isBoss && state.bossHp > 0 && (
              <div className="absolute top-[2%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-[8]">
                <div className="transition-[filter] duration-300" style={{
                  filter: bossShielded ? 'brightness(0.8)' : undefined,
                }}>
                  <SpriteIcon src={stageConfig.enemyConfig.emoji} size={isMobile ? 117 : 155} />
                </div>
                {bossShielded && (
                  <div className="text-[11px] font-bold text-sub bg-sub-alt rounded-[4px] opacity-80" style={{ padding: '2px 10px' }}>
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
                debuffType={debuff}
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
                debuffType={debuff}
              />
            ))}

            {/* Kill effects */}
            {state.killEffects.map(k => {
              const age = now - k.createdAt;
              const progress = Math.min(1, age / KILL_EFFECT_DURATION_MS);
              return (
                <div key={k.id} className="absolute text-[28px] pointer-events-none z-[15]" style={{
                  left: `${k.x}%`, top: `${k.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 + progress * 0.5})`,
                  opacity: 1 - progress,
                }}>💥</div>
              );
            })}

            {/* Damage numbers */}
            {state.damageNumbers.map(dmg => {
              const age = now - dmg.createdAt;
              const progress = Math.min(1, age / DAMAGE_NUMBER_DURATION_MS);
              return (
                <div key={dmg.id} className="absolute font-bold pointer-events-none z-[20]" style={{
                  left: `${dmg.x}%`, top: `${dmg.y - progress * 15}%`,
                  fontSize: dmg.isPlayer ? '16px' : '22px',
                  color: dmg.isPlayer ? '#f44336' : 'var(--main-color)',
                  opacity: 1 - progress, transform: 'translateX(-50%)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>-{dmg.value}</div>
              );
            })}

            {/* Player duck */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[6] transition-[filter] duration-500" style={{
              animation: state.phase === 'wave-clear'
                ? 'player-bounce 0.8s ease-out'
                : debuffAura && state.phase === 'fighting'
                  ? 'player-debuff 2s ease-in-out infinite'
                  : undefined,
              filter: debuffAura && state.phase === 'fighting'
                ? debuffAura.filter
                : undefined,
            }}>
              <SpriteIcon src={PLAYER_IMG} size={isMobile ? 80 : 100} />
            </div>

            {/* Waiting for words */}
            {state.minions.length === 0 && state.phase === 'fighting' && !isBoss && (
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] text-sub opacity-50 pointer-events-none">
                {t('adventure.waitingForWords')}
              </div>
            )}

            {/* Wave clear overlay */}
            {state.phase === 'wave-clear' && (
              <div className="absolute inset-0 flex items-center justify-center z-[30]" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }}>
                <div className="text-[22px] font-bold text-main bg-bg rounded-[12px]" style={{
                  padding: '14px 36px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  animation: 'pulse 0.5s',
                }}>
                  {t('adventure.waveClear')}
                </div>
              </div>
            )}

            {/* Boss dialogue overlay */}
            {state.bossDialogue && state.phase === 'boss-transition' && (
              <div className="absolute inset-0 flex items-center justify-center z-[30]" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                <div className="text-[15px] italic font-semibold text-error bg-bg rounded-[12px] border-2 border-error max-w-[80%] text-center" style={{
                  padding: '16px 28px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  animation: 'fadeIn 0.5s',
                }}>
                  {state.bossDialogue}
                </div>
              </div>
            )}

            {/* Boss death overlay */}
            {state.phase === 'boss-death' && (
              <div className="absolute inset-0 z-[35] pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                {/* Boss sprite shaking and fading */}
                <div className="absolute top-[2%] left-1/2 z-[36]" style={{ animation: 'boss-shake 2.5s ease-out forwards' }}>
                  <SpriteIcon src={stageConfig.enemyConfig.emoji} size={isMobile ? 117 : 155} />
                </div>

                {/* "꾸엑!!" death cry text */}
                <div className="absolute top-[25%] left-1/2 font-black z-[37] whitespace-nowrap" style={{
                  fontSize: isMobile ? '28px' : '36px',
                  color: '#f44336',
                  textShadow: '0 2px 8px rgba(244,67,54,0.5)',
                  animation: 'boss-death-text 2s ease-out forwards',
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
                  <div key={i} className="absolute z-[38]" style={{
                    left: `${exp.x}%`, top: `${exp.y}%`,
                    fontSize: `${exp.size}px`,
                    animation: `boss-death-explosion 0.8s ease-out ${exp.delay}s both`,
                  }}>
                    💥
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input display */}
          {state.phase === 'fighting' && (
            <div ref={inputDisplayRef} className="flex justify-center" style={{ marginTop: isMobile ? '6px' : '12px' }}>
              <div className="bg-sub-alt rounded-default min-w-[200px] text-center text-lg font-semibold font-mono flex items-center justify-center min-h-[40px] transition-[border-color] duration-150" style={{
                padding: '8px 24px',
                border: state.currentInput ? '2px solid var(--main-color)' : '2px solid transparent',
                color: state.currentInput ? 'var(--main-color)' : 'var(--sub-color)',
              }}>
                {state.currentInput || (
                  <span className="opacity-40 text-[13px] font-[inherit]">
                    {t('adventure.typeToAttack')}
                  </span>
                )}
                <span className="caret-blink inline-block w-0.5 h-5 bg-main ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VICTORY */}
      {state.phase === 'victory' && (
        isBoss && !stageConfig.isMidBoss && WORLD_VICTORY_CINEMATICS[worldId] ? (
          /* Cinematic victory for boss stages */
          <div className="flex flex-col items-center justify-center gap-5 text-center bg-bg" style={{
            padding: '40px 20px',
            minHeight: `${GAME_HEIGHT}px`,
          }}>
            {/* World emoji */}
            <div className="text-[64px]" style={{ animation: 'cinematic-fade-in 1s ease-out both' }}>
              {WORLD_PREVIEWS.find(w => w.id === worldId)?.emoji ?? '🎉'}
            </div>

            {/* Cinematic title */}
            <h2 className="font-bold text-text max-w-[500px] leading-[1.4]" style={{
              fontSize: isMobile ? '20px' : '26px',
              animation: 'cinematic-fade-in 1.2s ease-out 0.5s both',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].title}
            </h2>

            {/* Cinematic subtitle */}
            <p className="italic text-sub max-w-[400px]" style={{
              fontSize: isMobile ? '13px' : '15px',
              animation: 'cinematic-fade-in 1.2s ease-out 1.2s both',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].subtitle}
            </p>

            {/* Victory badge (delayed) */}
            <div className="flex flex-col items-center gap-2" style={{ animation: 'cinematic-fade-in 0.8s ease-out 2s both' }}>
              <div className="text-[40px]">🎉</div>
              <h3 className="text-xl font-bold text-main">
                {t('adventure.victory')}
              </h3>
              <p className="text-[13px] text-sub">
                {stageConfig.name} {t('adventure.cleared')}
              </p>
            </div>
          </div>
        ) : (
          /* Normal victory for regular stages */
          <div className="slide-up flex flex-col items-center gap-4 text-center" style={{ padding: '40px 20px' }}>
            <div className="text-[56px]">🎉</div>
            <h2 className="text-2xl font-bold text-main">
              {t('adventure.victory')}
            </h2>
            <p className="text-sm text-sub">
              {stageConfig.name} {t('adventure.cleared')}
            </p>
          </div>
        )
      )}

      {/* DEFEAT */}
      {state.phase === 'defeat' && (
        <div className="slide-up flex flex-col items-center gap-4 text-center" style={{ padding: '40px 20px' }}>
          <div className="text-[56px]">💀</div>
          <h2 className="text-2xl font-bold text-error">
            {t('adventure.defeat')}
          </h2>
          <p className="text-sm text-sub">
            {t('adventure.defeatMsg')}
          </p>
        </div>
      )}
    </div>
  );
}
