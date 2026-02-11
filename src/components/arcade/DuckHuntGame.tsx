import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDuckHunt } from '../../hooks/useDuckHunt';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { DuckHuntResult, DuckHuntHighScore } from '../../types/arcade';
import type { Settings } from '../../types/settings';

interface DuckHuntGameProps {
  settings: Settings;
  onBack: () => void;
  onGameOver: (result: DuckHuntResult) => void;
  highScore: DuckHuntHighScore | null;
  isLoggedIn: boolean;
  isSupabaseConfigured: boolean;
  onLoginClick: () => void;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const INITIAL_LIVES = 3;
const MAX_DIFFICULTY = 10;

// Difficulty-based duck emoji progression
function getDuckEmoji(difficulty: number): string {
  if (difficulty <= 2) return '🐥';   // chick — easy
  if (difficulty <= 4) return '🐤';   // baby chick — medium easy
  if (difficulty <= 6) return '🦆';   // duck — medium
  if (difficulty <= 8) return '🦅';   // eagle — hard
  return '🦇';                         // bat — very hard
}

export function DuckHuntGame({ settings, onBack, onGameOver, highScore, isLoggedIn, isSupabaseConfigured, onLoginClick }: DuckHuntGameProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { state, startGame, restart, handleChar, handleBackspace } = useDuckHunt(settings.language);
  const { playClick } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });
  const [countdown, setCountdown] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);
  const [shareText, setShareText] = useState('');
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const TUTORIAL_PAGES = [
    {
      icon: '🎯',
      title: t('duckHunt.tutorialAim'),
      desc: t('duckHunt.tutorialAimDesc'),
    },
    {
      icon: '⌨️',
      title: t('duckHunt.tutorialType'),
      desc: t('duckHunt.tutorialTypeDesc'),
    },
    {
      icon: '💥',
      title: t('duckHunt.tutorialCombo'),
      desc: t('duckHunt.tutorialComboDesc'),
    },
    {
      icon: '❤️',
      title: t('duckHunt.tutorialLives'),
      desc: t('duckHunt.tutorialLivesDesc'),
    },
  ];

  // Countdown timer
  useEffect(() => {
    if (state.phase !== 'countdown') return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.phase]);

  // Game over callback
  useEffect(() => {
    if (state.phase === 'gameover' && state.startTime) {
      const duration = (Date.now() - state.startTime) / 1000;
      const accuracy = state.totalKeystrokes > 0
        ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
        : 0;
      onGameOver({
        score: state.score,
        ducksShot: state.ducksShot,
        ducksEscaped: state.ducksEscaped,
        accuracy,
        maxCombo: state.maxCombo,
        duration,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // Reset share text when starting new game
  useEffect(() => {
    if (state.phase === 'playing') setShareText('');
  }, [state.phase]);

  const onCharWrapped = useCallback((char: string) => {
    handleChar(char);
    playClick();
  }, [handleChar, playClick]);

  const onBackspaceWrapped = useCallback(() => {
    handleBackspace();
  }, [handleBackspace]);

  const { inputRef, focusInput } = useKeyboard({
    onChar: onCharWrapped,
    onSpace: () => {},
    onBackspace: onBackspaceWrapped,
    onCjkInput: () => {},
    onTab: () => {},
    onEscape: () => {},
    enabled: state.phase === 'playing',
  });

  // Auto-focus on playing
  useEffect(() => {
    if (state.phase === 'playing') {
      focusInput();
    }
  }, [state.phase, focusInput]);

  const handleStartClick = () => {
    startGame();
  };

  const handlePlayAgain = () => {
    restart();
    setTimeout(() => startGame(), 50);
  };

  const handleShare = () => {
    const accuracy = state.totalKeystrokes > 0
      ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
      : 0;
    const text = `🦆 Duck Hunt @ ducktype.xyz\n\nScore: ${state.score}\nDucks: ${state.ducksShot} shot\nCombo: ${state.maxCombo}x\nAccuracy: ${accuracy}%\n\nCan you beat my score?`;

    navigator.clipboard.writeText(text).then(() => {
      setShareText(t('results.copied'));
      setTimeout(() => setShareText(''), 2000);
    }).catch(() => {
      setShareText('Failed');
      setTimeout(() => setShareText(''), 2000);
    });
  };

  const containerWidth = isMobile ? '100%' : `${GAME_WIDTH}px`;

  // Responsive scaling for mobile
  const gameScale = isMobile ? Math.min(window.innerWidth - 32, GAME_WIDTH) / GAME_WIDTH : 1;

  const duckEmoji = getDuckEmoji(state.difficulty);

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      padding: 'var(--page-vertical-padding) 0',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        disabled={state.phase === 'playing'}
        style={{
          color: 'var(--sub-color)',
          fontSize: '13px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: state.phase === 'playing' ? 0.3 : 1,
          cursor: state.phase === 'playing' ? 'default' : 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('duckHunt.title')}
      </button>

      {/* Hidden textarea for keyboard input */}
      <textarea
        ref={inputRef}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
        }}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />

      {/* INTRO PHASE */}
      {state.phase === 'intro' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: '64px' }}>🦆</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-color)',
          }}>
            {t('duckHunt.title')}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--sub-color)',
            textAlign: 'center',
            maxWidth: '400px',
            lineHeight: 1.6,
          }}>
            {t('duckHunt.description')}
          </p>

          {highScore && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 20px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              fontSize: '13px',
              color: 'var(--sub-color)',
            }}>
              <span>🏆</span>
              <span>{t('arcade.highScore')}: <span style={{ color: 'var(--main-color)', fontWeight: 700 }}>{highScore.score}</span></span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { setShowTutorial(true); setTutorialPage(0); }}
              style={{
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-color)',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                border: '1px solid var(--sub-color)',
              }}
            >
              {t('duckHunt.howToPlay')}
            </button>
            <button
              onClick={handleStartClick}
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
              {t('duckHunt.start')}
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN PHASE */}
      {state.phase === 'countdown' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: `${GAME_HEIGHT}px`,
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

      {/* PLAYING PHASE */}
      {state.phase === 'playing' && (
        <div onClick={focusInput}>
          {/* HUD */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '0 4px',
          }}>
            {/* Lives */}
            <div style={{ display: 'flex', gap: '4px', fontSize: '20px' }}>
              {Array.from({ length: INITIAL_LIVES }, (_, i) => (
                <span key={i} style={{
                  opacity: i < state.lives ? 1 : 0.2,
                  transition: 'opacity 0.3s',
                }}>
                  ❤️
                </span>
              ))}
            </div>

            {/* Score */}
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-color)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {state.score}
            </div>

            {/* Combo */}
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              color: state.combo >= 5 ? 'var(--main-color)' : 'var(--sub-color)',
              transition: 'color 0.2s',
              minWidth: '80px',
              textAlign: 'right',
            }}>
              {state.combo > 0 && (
                <span>
                  {state.combo}x COMBO
                  {state.combo >= 5 && ' 🔥'}
                </span>
              )}
            </div>
          </div>

          {/* Difficulty indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '8px',
            gap: '4px',
          }}>
            <span style={{ fontSize: '14px', marginRight: '4px' }}>{duckEmoji}</span>
            {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
              <div key={i} style={{
                width: '16px',
                height: '3px',
                borderRadius: '2px',
                backgroundColor: i < state.difficulty ? 'var(--main-color)' : 'var(--sub-alt-color)',
                transition: 'background-color 0.3s',
              }} />
            ))}
          </div>

          {/* Game area */}
          <div
            ref={gameAreaRef}
            style={{
              position: 'relative',
              width: containerWidth,
              height: `${GAME_HEIGHT * gameScale}px`,
              borderRadius: 'var(--border-radius)',
              overflow: 'hidden',
              margin: '0 auto',
              cursor: 'text',
              transform: isMobile ? `scale(${gameScale})` : undefined,
              transformOrigin: 'top center',
              // Sky gradient background
              background: 'linear-gradient(180deg, rgba(135,206,235,0.08) 0%, rgba(135,206,235,0.04) 60%, rgba(34,139,34,0.06) 85%, rgba(34,139,34,0.1) 100%)',
              border: '1px solid var(--sub-alt-color)',
            }}
          >
            {/* Clouds (decorative) */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '10%',
              fontSize: '24px',
              opacity: 0.12,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>☁️</div>
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '15%',
              fontSize: '20px',
              opacity: 0.1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>☁️</div>
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '55%',
              fontSize: '18px',
              opacity: 0.08,
              userSelect: 'none',
              pointerEvents: 'none',
            }}>☁️</div>

            {/* Ground line */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(180deg, rgba(34,139,34,0.06) 0%, rgba(34,139,34,0.12) 100%)',
              borderTop: '1px solid rgba(34,139,34,0.08)',
              pointerEvents: 'none',
            }} />

            {/* Ducks */}
            {state.ducks.map(duck => {
              const isMatched = duck.id === state.matchedDuckId;
              const typedLen = isMatched ? state.currentInput.length : 0;
              const emoji = duck.isSpecial ? '🐓' : duckEmoji;

              return (
                <div
                  key={duck.id}
                  style={{
                    position: 'absolute',
                    left: `${duck.x}px`,
                    top: `${duck.y}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'transform 0.1s ease-out',
                    transform: duck.direction === 'left' ? 'scaleX(-1)' : undefined,
                    zIndex: isMatched ? 10 : duck.isSpecial ? 5 : 1,
                  }}
                >
                  {/* Duck emoji */}
                  <span style={{
                    fontSize: '36px',
                    filter: isMatched
                      ? 'drop-shadow(0 0 8px var(--main-color))'
                      : duck.isSpecial
                        ? 'drop-shadow(0 0 6px var(--error-color))'
                        : undefined,
                  }}>
                    {emoji}
                  </span>

                  {/* Word label */}
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: isMatched
                      ? 'rgba(var(--main-color-rgb, 0,0,0), 0.1)'
                      : duck.isSpecial
                        ? 'rgba(var(--error-color-rgb, 200,50,50), 0.08)'
                        : 'var(--bg-color)',
                    border: isMatched
                      ? '2px solid var(--main-color)'
                      : duck.isSpecial
                        ? '2px solid var(--error-color)'
                        : '1px solid var(--sub-alt-color)',
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    transform: duck.direction === 'left' ? 'scaleX(-1)' : undefined,
                    boxShadow: isMatched
                      ? '0 0 12px rgba(var(--main-color-rgb, 0,0,0), 0.2)'
                      : duck.isSpecial
                        ? '0 0 10px rgba(var(--error-color-rgb, 200,50,50), 0.15)'
                        : undefined,
                  }}>
                    {duck.word.split('').map((ch, i) => (
                      <span key={i} style={{
                        color: i < typedLen
                          ? 'var(--main-color)'
                          : duck.isSpecial
                            ? 'var(--error-color)'
                            : 'var(--text-color)',
                        fontWeight: i < typedLen ? 700 : 600,
                      }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input display */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '16px',
          }}>
            <div style={{
              padding: '8px 24px',
              minWidth: '200px',
              textAlign: 'center',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              border: state.currentInput ? '2px solid var(--main-color)' : '2px solid transparent',
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'monospace',
              color: state.currentInput ? 'var(--main-color)' : 'var(--sub-color)',
              transition: 'border-color 0.15s',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {state.currentInput || (
                <span style={{ opacity: 0.4, fontSize: '13px', fontFamily: 'inherit' }}>
                  {t('duckHunt.typeHere')}
                </span>
              )}
              <span className="caret-blink" style={{
                display: 'inline-block',
                width: '2px',
                height: '20px',
                backgroundColor: 'var(--main-color)',
                marginLeft: '2px',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER PHASE */}
      {state.phase === 'gameover' && (
        <div className="slide-up" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: '48px' }}>🎯</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-color)',
          }}>
            {t('duckHunt.gameOver')}
          </h2>

          {/* Score */}
          <div style={{
            fontSize: '48px',
            fontWeight: 700,
            color: 'var(--main-color)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {state.score}
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            width: '100%',
            maxWidth: '320px',
          }}>
            {[
              { label: t('duckHunt.ducksShot'), value: state.ducksShot, icon: '🦆' },
              { label: t('duckHunt.maxCombo'), value: `${state.maxCombo}x`, icon: '🔥' },
              {
                label: t('duckHunt.accuracy'),
                value: `${state.totalKeystrokes > 0 ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100) : 0}%`,
                icon: '🎯',
              },
              {
                label: t('duckHunt.duration'),
                value: `${state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0}s`,
                icon: '⏱️',
              },
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
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text-color)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {value}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* New high score */}
          {highScore && state.score > highScore.score && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'var(--main-color)',
              color: 'var(--bg-color)',
              borderRadius: 'var(--border-radius)',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              🏆 {t('duckHunt.newHighScore')}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
              {t('duckHunt.backToArcade')}
            </button>
            <button
              onClick={handleShare}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-color)',
                backgroundColor: 'var(--sub-alt-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                border: '1px solid var(--sub-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {shareText || t('results.share')}
            </button>
            <button
              onClick={handlePlayAgain}
              style={{
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--bg-color)',
                backgroundColor: 'var(--main-color)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}
            >
              {t('duckHunt.playAgain')}
            </button>
          </div>

          {/* Login prompt */}
          {isSupabaseConfigured && !isLoggedIn && (
            <div style={{
              marginTop: '16px',
              padding: '14px 20px',
              backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '400px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '4px' }}>
                  {t('auth.savePromptTitle')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--sub-color)', lineHeight: 1.5 }}>
                  {t('duckHunt.loginDesc')}
                </div>
              </div>
              <button
                onClick={onLoginClick}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--main-color)',
                  color: 'var(--bg-color)',
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                {t('auth.login')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TUTORIAL MODAL */}
      {showTutorial && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowTutorial(false)}
        >
          <div
            className="slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-color)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              border: '1px solid var(--sub-alt-color)',
            }}
          >
            {/* Page indicator dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {TUTORIAL_PAGES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setTutorialPage(i)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i === tutorialPage ? 'var(--main-color)' : 'var(--sub-alt-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Slide content */}
            <div style={{
              fontSize: '56px',
              lineHeight: 1,
            }}>
              {TUTORIAL_PAGES[tutorialPage].icon}
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-color)',
              textAlign: 'center',
            }}>
              {TUTORIAL_PAGES[tutorialPage].title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--sub-color)',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              {TUTORIAL_PAGES[tutorialPage].desc}
            </p>

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              justifyContent: 'center',
              marginTop: '8px',
            }}>
              {tutorialPage > 0 && (
                <button
                  onClick={() => setTutorialPage(p => p - 1)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    color: 'var(--sub-color)',
                    backgroundColor: 'var(--sub-alt-color)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                  }}
                >
                  ←
                </button>
              )}
              {tutorialPage < TUTORIAL_PAGES.length - 1 ? (
                <button
                  onClick={() => setTutorialPage(p => p + 1)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--bg-color)',
                    backgroundColor: 'var(--main-color)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                  }}
                >
                  {t('duckHunt.tutorialNext')} →
                </button>
              ) : (
                <button
                  onClick={() => setShowTutorial(false)}
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--bg-color)',
                    backgroundColor: 'var(--main-color)',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                  }}
                >
                  {t('duckHunt.tutorialGotIt')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
