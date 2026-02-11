import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { StageConfig, StageResult } from '../../types/adventure';
import { useCombat } from '../../hooks/useCombat';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import { COUNTDOWN_SECONDS, DAMAGE_NUMBER_DURATION_MS } from '../../constants/adventure';
import type { Settings } from '../../types/settings';

interface CombatSceneProps {
  stageConfig: StageConfig;
  settings: Settings;
  onComplete: (result: StageResult) => void;
  onBack: () => void;
}

export function CombatScene({ stageConfig, settings, onComplete, onBack }: CombatSceneProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  const { state, startCountdown, handleChar, handleBackspace } = useCombat(stageConfig, onComplete);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Countdown display
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
    if (state.phase === 'fighting') focusInput();
  }, [state.phase, focusInput]);

  const playerHpPercent = (state.playerHp / state.playerMaxHp) * 100;
  const enemyHpPercent = (state.enemyHp / state.enemyMaxHp) * 100;

  const now = Date.now();

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '700px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
    }}>
      {/* Hidden textarea */}
      <textarea
        ref={inputRef}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />

      {/* INTRO */}
      {state.phase === 'intro' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: '56px' }}>{stageConfig.enemyConfig.emoji}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)' }}>
            {stageConfig.name}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--sub-color)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
            {stageConfig.subtitle}
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            fontSize: '13px',
            color: 'var(--sub-color)',
          }}>
            <span>{stageConfig.enemyConfig.name}</span>
            <span>HP: {stageConfig.enemyConfig.hp}</span>
            {stageConfig.isBoss && <span style={{ color: 'var(--error-color)', fontWeight: 700 }}>BOSS</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--sub-color)',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              {t('adventure.back')}
            </button>
            <button
              onClick={startCountdown}
              style={{
                padding: '12px 36px',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--bg-color)',
                backgroundColor: 'var(--main-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              {t('adventure.fight')}
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {state.phase === 'countdown' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
        }}>
          <span style={{
            fontSize: '96px',
            fontWeight: 700,
            color: 'var(--main-color)',
            animation: 'pulse 0.5s ease-in-out',
          }}>
            {countdown}
          </span>
        </div>
      )}

      {/* FIGHTING / WAVE-CLEAR / BOSS-TRANSITION */}
      {(state.phase === 'fighting' || state.phase === 'wave-clear' || state.phase === 'boss-transition') && (
        <div onClick={focusInput} style={{ cursor: 'text' }}>
          {/* HUD */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '12px',
          }}>
            {/* Player info */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--sub-color)',
                marginBottom: '4px',
              }}>
                <span>🐤 {t('adventure.player')}</span>
                <span>{Math.max(0, state.playerHp)}/{state.playerMaxHp}</span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${playerHpPercent}%`,
                  backgroundColor: playerHpPercent > 50 ? '#4caf50' : playerHpPercent > 25 ? '#ff9800' : '#f44336',
                  borderRadius: '4px',
                  transition: 'width 0.3s, background-color 0.3s',
                }} />
              </div>
            </div>

            {/* Wave / Combo */}
            <div style={{
              textAlign: 'center',
              minWidth: isMobile ? '80px' : '100px',
            }}>
              {!stageConfig.isBoss && (
                <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
                  {t('adventure.wave')} {state.currentWave + 1}/{stageConfig.waves.length}
                </div>
              )}
              {stageConfig.isBoss && stageConfig.bossConfig && (
                <div style={{ fontSize: '11px', color: 'var(--error-color)', fontWeight: 700 }}>
                  Phase {state.bossPhase + 1}/{stageConfig.bossConfig.phases.length}
                </div>
              )}
              {state.combo > 0 && (
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: state.combo >= 10 ? 'var(--main-color)' : 'var(--text-color)',
                }}>
                  x{state.combo} {state.combo >= 5 ? '🔥' : ''}
                </div>
              )}
            </div>

            {/* Enemy info */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--sub-color)',
                marginBottom: '4px',
              }}>
                <span>{Math.max(0, state.enemyHp)}/{state.enemyMaxHp}</span>
                <span>{stageConfig.enemyConfig.emoji} {stageConfig.enemyConfig.name}</span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${enemyHpPercent}%`,
                  backgroundColor: '#f44336',
                  borderRadius: '4px',
                  transition: 'width 0.3s',
                  marginLeft: 'auto',
                }} />
              </div>
            </div>
          </div>

          {/* Battle area */}
          <div style={{
            position: 'relative',
            minHeight: '200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--sub-alt-color)',
            overflow: 'hidden',
          }}>
            {/* Player character */}
            <div style={{
              fontSize: isMobile ? '48px' : '64px',
              textAlign: 'center',
              animation: state.playerHp < state.playerMaxHp ? undefined : undefined,
              transition: 'transform 0.1s',
            }}>
              🐤
              <div style={{
                fontSize: '11px',
                color: 'var(--sub-color)',
                marginTop: '4px',
              }}>
                {t('adventure.player')}
              </div>
            </div>

            {/* VS divider */}
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--sub-color)',
              opacity: 0.5,
            }}>
              VS
            </div>

            {/* Enemy character */}
            <div style={{
              fontSize: isMobile ? '48px' : '64px',
              textAlign: 'center',
              transition: 'transform 0.1s',
            }}>
              {stageConfig.enemyConfig.emoji}
              <div style={{
                fontSize: '11px',
                color: 'var(--sub-color)',
                marginTop: '4px',
              }}>
                {stageConfig.enemyConfig.name}
              </div>
            </div>

            {/* Floating damage numbers */}
            {state.damageNumbers.map(dmg => {
              const age = now - dmg.createdAt;
              const progress = Math.min(1, age / DAMAGE_NUMBER_DURATION_MS);
              return (
                <div
                  key={dmg.id}
                  style={{
                    position: 'absolute',
                    left: `${dmg.x}%`,
                    top: `${30 - progress * 40}%`,
                    fontSize: dmg.isPlayer ? '16px' : '20px',
                    fontWeight: 700,
                    color: dmg.isPlayer ? '#f44336' : 'var(--main-color)',
                    opacity: 1 - progress,
                    pointerEvents: 'none',
                    transform: 'translateX(-50%)',
                    transition: 'none',
                  }}
                >
                  {dmg.isPlayer ? `-${dmg.value}` : `-${dmg.value}`}
                </div>
              );
            })}
          </div>

          {/* Boss dialogue */}
          {state.bossDialogue && state.phase === 'boss-transition' && (
            <div style={{
              textAlign: 'center',
              margin: '16px 0',
              padding: '12px 20px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--error-color)',
              fontSize: '14px',
              fontStyle: 'italic',
              color: 'var(--error-color)',
              animation: 'fadeIn 0.5s',
            }}>
              {state.bossDialogue}
            </div>
          )}

          {/* Wave clear message */}
          {state.phase === 'wave-clear' && (
            <div style={{
              textAlign: 'center',
              margin: '16px 0',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--main-color)',
              animation: 'pulse 0.5s',
            }}>
              {t('adventure.waveClear')}
            </div>
          )}

          {/* Active words */}
          {state.phase === 'fighting' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: '20px',
            }}>
              {state.activeWords.map(word => {
                const isMatched = word.id === state.matchedWordId;
                const elapsed = now - word.spawnedAt;
                const timeProgress = Math.min(1, elapsed / word.timeoutMs);
                const isUrgent = timeProgress > 0.7;

                return (
                  <div key={word.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    backgroundColor: isMatched
                      ? 'rgba(var(--main-color-rgb, 0,0,0), 0.08)'
                      : 'var(--bg-color)',
                    borderRadius: 'var(--border-radius)',
                    border: isMatched
                      ? '2px solid var(--main-color)'
                      : isUrgent
                        ? '2px solid var(--error-color)'
                        : '1px solid var(--sub-alt-color)',
                    transition: 'border-color 0.2s',
                  }}>
                    {/* Word with highlight */}
                    <div style={{
                      flex: 1,
                      fontSize: '20px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-family)',
                      letterSpacing: '2px',
                    }}>
                      {word.word.split('').map((ch, i) => {
                        const typedLen = isMatched ? state.currentInput.length : 0;
                        return (
                          <span key={i} style={{
                            color: i < typedLen
                              ? 'var(--main-color)'
                              : 'var(--text-color)',
                            fontWeight: i < typedLen ? 700 : 500,
                            opacity: i < typedLen ? 1 : 0.7,
                          }}>
                            {ch}
                          </span>
                        );
                      })}
                    </div>

                    {/* Timeout bar */}
                    <div style={{
                      width: '60px',
                      height: '4px',
                      backgroundColor: 'var(--sub-alt-color)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(1 - timeProgress) * 100}%`,
                        backgroundColor: isUrgent ? '#f44336' : 'var(--main-color)',
                        borderRadius: '2px',
                        transition: 'width 0.2s linear',
                      }} />
                    </div>
                  </div>
                );
              })}

              {state.activeWords.length === 0 && state.phase === 'fighting' && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '13px',
                  color: 'var(--sub-color)',
                  opacity: 0.6,
                }}>
                  {t('adventure.waitingForWords')}
                </div>
              )}
            </div>
          )}

          {/* Input display */}
          {state.phase === 'fighting' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
            }}>
              <div style={{
                padding: '10px 28px',
                minWidth: '200px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-color)',
                borderRadius: 'var(--border-radius)',
                border: state.currentInput ? '2px solid var(--main-color)' : '2px solid var(--sub-alt-color)',
                fontSize: '20px',
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                color: state.currentInput ? 'var(--main-color)' : 'var(--sub-color)',
                transition: 'border-color 0.15s',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '2px',
              }}>
                {state.currentInput || (
                  <span style={{ opacity: 0.4, fontSize: '13px', letterSpacing: 'normal' }}>
                    {t('adventure.typeToAttack')}
                  </span>
                )}
                <span className="caret-blink" style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '22px',
                  backgroundColor: 'var(--main-color)',
                  marginLeft: '2px',
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VICTORY */}
      {state.phase === 'victory' && (
        <div className="slide-up" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '56px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--main-color)' }}>
            {t('adventure.victory')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
            {stageConfig.name} {t('adventure.cleared')}
          </p>
        </div>
      )}

      {/* DEFEAT */}
      {state.phase === 'defeat' && (
        <div className="slide-up" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '40px 20px',
          textAlign: 'center',
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
