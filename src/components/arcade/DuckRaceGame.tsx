import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDuckRace } from '../../hooks/useDuckRace';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useCaret } from '../../hooks/useCaret';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RaceTrack } from './RaceTrack';
import { WordDisplay } from '../test/WordDisplay';
import { Caret } from '../test/Caret';
import { HiddenInput } from '../test/HiddenInput';
import type { DuckRaceResult, DuckRaceHighScore, RaceMode } from '../../types/duckRace';
import type { Settings } from '../../types/settings';

interface DuckRaceGameProps {
  settings: Settings;
  onBack: () => void;
  onGameOver: (result: DuckRaceResult) => void;
  highScore: DuckRaceHighScore | null;
  isLoggedIn: boolean;
  isSupabaseConfigured: boolean;
  onLoginClick: () => void;
}

export function DuckRaceGame({
  settings,
  onBack,
  onGameOver,
  highScore,
  isLoggedIn,
  isSupabaseConfigured,
  onLoginClick,
}: DuckRaceGameProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [countdown, setCountdown] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPage, setTutorialPage] = useState(0);
  const [shareText, setShareText] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const isTypingRef = useRef(false);
  const gameOverCalledRef = useRef(false);

  const effectiveFontSize = isMobile ? Math.min(settings.fontSize, 18) : settings.fontSize;
  const lineHeight = Math.round(effectiveFontSize * 1.65);
  const lineStride = lineHeight + 4;
  const visibleLines = isMobile ? 2 : 3;

  const {
    raceState,
    raceSettings,
    setRaceSettings,
    typingState,
    typingWords,
    startRace,
    restart,
    handleChar,
    handleSpace,
    handleBackspace,
    handleCjkInput,
    getCurrentWpm,
  } = useDuckRace(settings);

  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  const TUTORIAL_PAGES = [
    {
      icon: '\uD83C\uDFCE\uFE0F',
      title: t('duckRace.tutorialRace'),
      desc: t('duckRace.tutorialRaceDesc'),
    },
    {
      icon: '\uD83D\uDC23',
      title: t('duckRace.tutorialGhosts'),
      desc: t('duckRace.tutorialGhostsDesc'),
    },
    {
      icon: '\u2728',
      title: t('duckRace.tutorialXp'),
      desc: t('duckRace.tutorialXpDesc'),
    },
  ];

  // Countdown
  useEffect(() => {
    if (raceState.phase !== 'countdown') return;
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
  }, [raceState.phase]);

  // Game over callback
  useEffect(() => {
    if (raceState.phase === 'finished' && !gameOverCalledRef.current) {
      gameOverCalledRef.current = true;
      const playerRank = raceState.rankings.find(r => r.isPlayer);
      const accuracy = typingState.totalKeystrokes > 0
        ? Math.round((typingState.correctKeystrokes / typingState.totalKeystrokes) * 100)
        : 0;
      onGameOver({
        placement: playerRank?.place ?? raceSettings.opponentCount + 1,
        playerWpm: raceState.playerWpm,
        playerAccuracy: accuracy,
        opponentCount: raceSettings.opponentCount,
        mode: raceSettings.mode,
        modeValue: raceSettings.mode === 'time' ? raceSettings.timeLimit : raceSettings.wordCount,
        raceTime: raceState.elapsedSeconds,
        rankings: raceState.rankings,
        timestamp: Date.now(),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceState.phase]);

  // Reset on new race
  useEffect(() => {
    if (raceState.phase === 'racing') {
      setShareText('');
      gameOverCalledRef.current = false;
      setScrollOffset(0);
    }
  }, [raceState.phase]);

  // Caret
  const { position, isBlinking, wordsContainerRef, updatePosition } = useCaret(
    typingState.currentWordIndex,
    typingState.currentLetterIndex,
    isTypingRef.current,
  );

  // Line scroll
  useEffect(() => {
    const container = wordsContainerRef.current;
    if (!container || raceState.phase !== 'racing') return;
    requestAnimationFrame(() => {
      const el = container.querySelector(`[data-word="${typingState.currentWordIndex}"]`) as HTMLElement;
      if (!el) return;
      const wordTop = el.offsetTop;
      const scrollThreshold = lineStride * (isMobile ? 1 : 1);
      if (wordTop >= scrollThreshold + scrollOffset) {
        setScrollOffset(wordTop - scrollThreshold);
      }
    });
  }, [typingState.currentWordIndex, wordsContainerRef, scrollOffset, lineStride, isMobile, raceState.phase]);

  // Update caret after scroll
  useEffect(() => {
    requestAnimationFrame(() => { requestAnimationFrame(updatePosition); });
  }, [scrollOffset, typingState.currentWordIndex, typingState.currentLetterIndex, typingState.words, updatePosition]);

  // Sound-wrapped handlers
  const handleCharWithSound = useCallback((char: string) => {
    if (raceState.phase !== 'racing') return;
    isTypingRef.current = true;
    const word = typingState.words[typingState.currentWordIndex];
    const idx = typingState.currentLetterIndex;
    if (word && idx < word.letters.length) {
      if (char === word.letters[idx].char) playClick();
      else playError();
    } else {
      playError();
    }
    handleChar(char);
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleChar, playClick, playError, typingState, raceState.phase]);

  const handleSpaceWithSound = useCallback(() => {
    if (raceState.phase !== 'racing') return;
    isTypingRef.current = true;
    playClick();
    handleSpace();
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleSpace, playClick, raceState.phase]);

  const handleBackspaceWrapped = useCallback((ctrlKey: boolean) => {
    if (raceState.phase !== 'racing') return;
    isTypingRef.current = true;
    handleBackspace(ctrlKey);
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleBackspace, raceState.phase]);

  const keyboard = useKeyboard({
    onChar: handleCharWithSound,
    onSpace: handleSpaceWithSound,
    onBackspace: handleBackspaceWrapped,
    onCjkInput: handleCjkInput,
    onTab: () => {},
    onEscape: () => {},
    enabled: raceState.phase === 'racing',
  });

  // Auto-focus
  useEffect(() => {
    if (raceState.phase === 'racing') keyboard.focusInput();
  }, [raceState.phase, keyboard.focusInput]);

  const handleStartClick = () => startRace();
  const handlePlayAgain = () => { restart(); };

  const handleShare = () => {
    const playerRank = raceState.rankings.find(r => r.isPlayer);
    const place = playerRank?.place ?? '?';
    const placeEmoji = place === 1 ? '\uD83E\uDD47' : place === 2 ? '\uD83E\uDD48' : place === 3 ? '\uD83E\uDD49' : '\uD83C\uDFC1';
    const text = `${placeEmoji} Duck Race @ ducktype.xyz\n\n${t('duckRace.position')}: ${place}/${raceSettings.opponentCount + 1}\nWPM: ${raceState.playerWpm}\n${t('mode.' + raceSettings.mode)}: ${raceSettings.mode === 'time' ? raceSettings.timeLimit + 's' : raceSettings.wordCount + ' words'}\n\nCan you beat me?`;
    navigator.clipboard.writeText(text).then(() => {
      setShareText(t('results.copied'));
      setTimeout(() => setShareText(''), 2000);
    }).catch(() => {
      setShareText('Failed');
      setTimeout(() => setShareText(''), 2000);
    });
  };

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleContainerClick = useCallback(() => {
    keyboard.focusInput();
    setIsFocused(true);
  }, [keyboard]);

  // Settings helpers
  const updateMode = (mode: RaceMode) => setRaceSettings(p => ({ ...p, mode }));
  const updateTimeLimit = (t: number) => setRaceSettings(p => ({ ...p, timeLimit: t }));
  const updateWordCount = (w: number) => setRaceSettings(p => ({ ...p, wordCount: w }));
  const updateOpponents = (n: number) => setRaceSettings(p => ({ ...p, opponentCount: n }));

  const placeSuffix = (n: number) => {
    if (n === 1) return t('duckRace.1st');
    if (n === 2) return t('duckRace.2nd');
    if (n === 3) return t('duckRace.3rd');
    return `${n}th`;
  };

  const timeRemaining = raceSettings.mode === 'time'
    ? Math.max(0, raceSettings.timeLimit - raceState.elapsedSeconds)
    : raceState.elapsedSeconds;

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
        disabled={raceState.phase === 'racing'}
        style={{
          color: 'var(--sub-color)',
          fontSize: '13px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: raceState.phase === 'racing' ? 0.3 : 1,
          cursor: raceState.phase === 'racing' ? 'default' : 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('duckRace.title')}
      </button>

      {/* Hidden input */}
      <HiddenInput ref={keyboard.inputRef} onFocus={handleFocus} onBlur={handleBlur} />

      {/* INTRO PHASE */}
      {raceState.phase === 'intro' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: '64px' }}>{'\uD83C\uDFC1'}</div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-color)' }}>
            {t('duckRace.title')}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--sub-color)',
            textAlign: 'center',
            maxWidth: '400px',
            lineHeight: 1.6,
          }}>
            {t('duckRace.description')}
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
              <span>{'\uD83C\uDFC6'}</span>
              <span>{t('arcade.highScore')}: <span style={{ color: 'var(--main-color)', fontWeight: 700 }}>{highScore.bestWpm} WPM</span></span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>{highScore.winsCount}W / {highScore.racesCompleted}R</span>
            </div>
          )}

          {/* Settings */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '360px',
            padding: '20px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', marginBottom: '4px' }}>
              {t('duckRace.settings')}
            </div>

            {/* Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--sub-color)' }}>{t('duckRace.mode')}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['time', 'words'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => updateMode(m)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: raceSettings.mode === m ? 700 : 400,
                      color: raceSettings.mode === m ? 'var(--bg-color)' : 'var(--sub-color)',
                      backgroundColor: raceSettings.mode === m ? 'var(--main-color)' : 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {t('mode.' + m)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time/Word count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--sub-color)' }}>
                {raceSettings.mode === 'time' ? t('mode.time') : t('mode.words')}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {raceSettings.mode === 'time'
                  ? [30, 60].map(v => (
                      <button
                        key={v}
                        onClick={() => updateTimeLimit(v)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: raceSettings.timeLimit === v ? 700 : 400,
                          color: raceSettings.timeLimit === v ? 'var(--bg-color)' : 'var(--sub-color)',
                          backgroundColor: raceSettings.timeLimit === v ? 'var(--main-color)' : 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {v}s
                      </button>
                    ))
                  : [25, 50].map(v => (
                      <button
                        key={v}
                        onClick={() => updateWordCount(v)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: raceSettings.wordCount === v ? 700 : 400,
                          color: raceSettings.wordCount === v ? 'var(--bg-color)' : 'var(--sub-color)',
                          backgroundColor: raceSettings.wordCount === v ? 'var(--main-color)' : 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {v}
                      </button>
                    ))
                }
              </div>
            </div>

            {/* Opponents */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--sub-color)' }}>{t('duckRace.opponents')}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => updateOpponents(n)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: raceSettings.opponentCount === n ? 700 : 400,
                      color: raceSettings.opponentCount === n ? 'var(--bg-color)' : 'var(--sub-color)',
                      backgroundColor: raceSettings.opponentCount === n ? 'var(--main-color)' : 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              {t('duckRace.howToRace')}
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
              {t('duckRace.start')}
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {raceState.phase === 'countdown' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          gap: '16px',
        }}>
          <span style={{
            fontSize: '96px',
            fontWeight: 700,
            color: 'var(--main-color)',
            animation: 'pulse 0.5s ease-in-out',
          }}>
            {countdown > 0 ? countdown : 'QUACK!'}
          </span>
        </div>
      )}

      {/* RACING PHASE */}
      {raceState.phase === 'racing' && (
        <div onClick={handleContainerClick}>
          {/* Timer / WPM HUD */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            padding: '0 4px',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 300,
              color: raceSettings.mode === 'time' && timeRemaining <= 5
                ? 'var(--error-color)'
                : raceSettings.mode === 'time' && timeRemaining <= 10
                  ? '#ff8c00'
                  : 'var(--main-color)',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s',
            }}>
              {raceSettings.mode === 'time'
                ? `${Math.ceil(timeRemaining)}s`
                : `${Math.round(raceState.elapsedSeconds)}s`
              }
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-color)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {raceState.playerWpm} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--sub-color)' }}>WPM</span>
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--sub-color)',
            }}>
              {Math.round(raceState.playerProgress * 100)}%
            </div>
          </div>

          {/* Race Track */}
          <RaceTrack
            ghosts={raceState.ghosts}
            playerProgress={raceState.playerProgress}
            playerWpm={raceState.playerWpm}
            playerFinished={raceState.playerFinished}
          />

          {/* Typing area */}
          <div style={{
            marginTop: '16px',
            position: 'relative',
            fontSize: `${effectiveFontSize}px`,
            lineHeight: '1.65',
            cursor: 'text',
            overflow: 'hidden',
            height: `${lineStride * visibleLines}px`,
          }}>
            {/* Blur if unfocused */}
            {!isFocused && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                  {t('duckRace.typeToSwim')}
                </span>
              </div>
            )}

            {/* Top fade */}
            {scrollOffset > 0 && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: `${lineStride}px`,
                background: 'linear-gradient(to bottom, var(--bg-color) 0%, transparent 100%)',
                zIndex: 2,
                pointerEvents: 'none',
              }} />
            )}

            {/* Words container */}
            <div
              ref={wordsContainerRef}
              style={{
                position: 'relative',
                marginTop: `-${scrollOffset}px`,
                transition: 'margin-top 0.2s ease-out',
                filter: !isFocused ? 'blur(4px)' : 'none',
              }}
            >
              <Caret
                left={position.left}
                top={position.top}
                height={position.height}
                style={settings.caretStyle}
                smooth={settings.smoothCaret}
                isBlinking={isBlinking && !isTypingRef.current}
                visible={isFocused}
              />
              <WordDisplay
                words={typingState.words}
                currentWordIndex={typingState.currentWordIndex}
              />
            </div>
          </div>
        </div>
      )}

      {/* FINISHED PHASE */}
      {raceState.phase === 'finished' && (
        <div className="slide-up" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '40px 20px',
        }}>
          <div style={{ fontSize: '48px' }}>{'\uD83C\uDFC1'}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)' }}>
            {t('duckRace.raceOver')}
          </h2>

          {/* Rankings table */}
          <div style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            border: '1px solid var(--sub-alt-color)',
          }}>
            {raceState.rankings.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  backgroundColor: r.isPlayer ? 'rgba(var(--main-color-rgb, 100,149,237), 0.08)' : 'var(--sub-alt-color)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Place */}
                <span style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: r.place === 1 ? '#FFD700' : r.place === 2 ? '#C0C0C0' : r.place === 3 ? '#CD7F32' : 'var(--sub-color)',
                  width: '30px',
                  textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {placeSuffix(r.place)}
                </span>

                {/* Emoji */}
                <span style={{ fontSize: '20px' }}>{r.emoji}</span>

                {/* Name */}
                <span style={{
                  flex: 1,
                  fontSize: '14px',
                  fontWeight: r.isPlayer ? 700 : 500,
                  color: r.isPlayer ? 'var(--main-color)' : 'var(--text-color)',
                }}>
                  {r.isPlayer ? t('duckRace.yourDuck') : r.name}
                </span>

                {/* WPM */}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-color)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {r.wpm} <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--sub-color)' }}>WPM</span>
                </span>

                {/* Finish time / DNF */}
                <span style={{
                  fontSize: '11px',
                  color: 'var(--sub-color)',
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '40px',
                  textAlign: 'right',
                }}>
                  {r.finishTime != null ? `${r.finishTime.toFixed(1)}s` : t('duckRace.dnf')}
                </span>
              </div>
            ))}
          </div>

          {/* New best */}
          {highScore && raceState.playerWpm > highScore.bestWpm && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: 'var(--main-color)',
              color: 'var(--bg-color)',
              borderRadius: 'var(--border-radius)',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              {'\uD83C\uDFC6'} {t('duckRace.newBest')}
            </div>
          )}

          {/* Action buttons */}
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
              {t('duckRace.backToArcade')}
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
              {t('duckRace.playAgain')}
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
            top: 0, left: 0, right: 0, bottom: 0,
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
            {/* Dots */}
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

            <div style={{ fontSize: '56px', lineHeight: 1 }}>
              {TUTORIAL_PAGES[tutorialPage].icon}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-color)', textAlign: 'center' }}>
              {TUTORIAL_PAGES[tutorialPage].title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--sub-color)', textAlign: 'center', lineHeight: 1.6 }}>
              {TUTORIAL_PAGES[tutorialPage].desc}
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', marginTop: '8px' }}>
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
                  {'\u2190'}
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
                  {t('duckHunt.tutorialNext')} {'\u2192'}
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
