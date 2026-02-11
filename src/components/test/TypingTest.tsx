import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Settings } from '../../types/settings';
import type { TestState } from '../../types/test';
import { useTypingTest } from '../../hooks/useTypingTest';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTimer } from '../../hooks/useTimer';
import { useCaret } from '../../hooks/useCaret';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import { HiddenInput } from './HiddenInput';
import { WordDisplay } from './WordDisplay';
import { Caret } from './Caret';
import { ModeSelector } from './ModeSelector';
import { LanguageSelector } from './LanguageSelector';
import { FocusWarning } from './FocusWarning';
import { TypingParticles } from './TypingParticles';

interface TypingTestProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onFinish: (state: TestState) => void;
  customWords?: string[];
  hideModeSwitcher?: boolean;
  onTypingStateChange?: (isTyping: boolean) => void;
  leaderboardRank?: number | null;
}

export function TypingTest({ settings, onSettingChange, onFinish, customWords, hideModeSwitcher, onTypingStateChange, leaderboardRank }: TypingTestProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(true);
  const [liveWpm, setLiveWpm] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const isTypingRef = useRef(false);

  // Change 1: Mobile font size cap (max 20px on mobile)
  const effectiveFontSize = isMobile ? Math.min(settings.fontSize, 20) : settings.fontSize;

  const lineHeight = Math.round(effectiveFontSize * 1.65);
  const lineStride = lineHeight + 4; // includes word margin-bottom (4px)
  const visibleLines = isMobile ? 3 : 4;

  const {
    state,
    handleChar,
    handleSpace,
    handleBackspace,
    handleCjkInput,
    finishTest,
    restart,
    getCurrentWpm,
  } = useTypingTest({
    settings,
    onFinish,
    customWords,
  });

  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  const handleTimerFinish = useCallback(() => {
    finishTest();
  }, [finishTest]);

  const timer = useTimer({
    mode: settings.mode === 'time' ? 'countdown' : 'stopwatch',
    initialTime: settings.timeLimit,
    onTick: () => {
      if (state.phase === 'running') {
        setLiveWpm(getCurrentWpm());
      }
    },
    onFinish: handleTimerFinish,
  });

  // Start timer when test starts
  useEffect(() => {
    if (state.phase === 'running' && !timer.isRunning) {
      timer.start();
    }
    if (state.phase === 'finished') {
      timer.stop();
    }
  }, [state.phase, timer]);

  // Change 5: Notify parent of typing state changes
  useEffect(() => {
    onTypingStateChange?.(state.phase === 'running');
  }, [state.phase, onTypingStateChange]);

  // Update live WPM periodically
  useEffect(() => {
    if (state.phase !== 'running') return;
    const interval = setInterval(() => {
      setLiveWpm(getCurrentWpm());
    }, 500);
    return () => clearInterval(interval);
  }, [state.phase, getCurrentWpm]);

  // ===== LINE SCROLL LOGIC (Monkeytype-style) =====
  // wordsContainerRef is the inner scrolling div (position: relative)
  // offsetTop of word elements relative to this div is stable regardless of margin-top
  const { position, isBlinking, wordsContainerRef, updatePosition } = useCaret(
    state.currentWordIndex,
    state.currentLetterIndex,
    isTypingRef.current
  );

  useEffect(() => {
    const container = wordsContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const currentWordEl = container.querySelector(
        `[data-word="${state.currentWordIndex}"]`
      ) as HTMLElement;
      if (!currentWordEl) return;

      const wordTop = currentWordEl.offsetTop;

      // Start scrolling only after the current word passes a threshold
      // (keep completed lines visible, scroll when entering next line)
      const scrollThreshold = lineStride * (isMobile ? 1 : 2);
      if (wordTop >= scrollThreshold + scrollOffset) {
        setScrollOffset(wordTop - scrollThreshold);
      }
    });
  }, [state.currentWordIndex, wordsContainerRef, scrollOffset, lineStride]);

  // Reset scroll on restart
  useEffect(() => {
    if (state.phase === 'waiting') {
      setScrollOffset(0);
    }
  }, [state.phase]);

  // Update caret after scroll changes
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });
  }, [scrollOffset, updatePosition]);

  const triggerParticle = useCallback(() => {
    if (!leaderboardRank || leaderboardRank > 20) return;
    const container = wordsContainerRef.current?.parentElement;
    if (!container) return;
    const canvas = container.querySelector('[data-particles="true"]') as HTMLCanvasElement | null;
    if (!canvas) return;
    // Use caret position for particle spawn
    canvas.dispatchEvent(new CustomEvent('spawn-particle', {
      detail: { x: position.left, y: position.top + (position.height / 2) },
    }));
  }, [leaderboardRank, wordsContainerRef, position]);

  const handleCharWithSound = useCallback((char: string) => {
    isTypingRef.current = true;
    const word = state.words[state.currentWordIndex];
    const letterIdx = state.currentLetterIndex;
    if (word && letterIdx < word.letters.length) {
      if (char === word.letters[letterIdx].char) {
        playClick();
        requestAnimationFrame(triggerParticle);
      } else {
        playError();
      }
    } else {
      playError();
    }
    handleChar(char);
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleChar, playClick, playError, triggerParticle, state.words, state.currentWordIndex, state.currentLetterIndex]);

  const handleSpaceWithSound = useCallback(() => {
    isTypingRef.current = true;
    playClick();
    handleSpace();
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleSpace, playClick]);

  const handleBackspaceWithSound = useCallback((ctrlKey: boolean) => {
    isTypingRef.current = true;
    handleBackspace(ctrlKey);
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleBackspace]);

  const handleRestart = useCallback(() => {
    restart();
    timer.reset();
    setLiveWpm(0);
    setScrollOffset(0);
    setTimeout(() => inputKeyboard.focusInput(), 50);
  }, [restart, timer]);

  const inputKeyboard = useKeyboard({
    onChar: handleCharWithSound,
    onSpace: handleSpaceWithSound,
    onBackspace: handleBackspaceWithSound,
    onCjkInput: handleCjkInput,
    onTab: handleRestart,
    onEscape: handleRestart,
    enabled: state.phase !== 'finished',
  });

  // Auto-focus
  useEffect(() => {
    inputKeyboard.focusInput();
  }, [inputKeyboard.focusInput]);

  const handleContainerClick = useCallback(() => {
    inputKeyboard.focusInput();
    setIsFocused(true);
  }, [inputKeyboard]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const isRunning = state.phase === 'running';
  const showControls = !isRunning;

  // Change 3: Show tap-to-start overlay on mobile when waiting & unfocused
  const showStartOverlay = isMobile && state.phase === 'waiting' && !isFocused;
  const showRefocusOverlay = !isFocused && isRunning;

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Mode selector - fades out while typing (Monkeytype) */}
      {!hideModeSwitcher && (
        <div style={{
          marginBottom: '24px',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}>
          <ModeSelector
            settings={settings}
            onModeChange={(mode) => { onSettingChange('mode', mode); handleRestart(); }}
            onTimeLimitChange={(time) => { onSettingChange('timeLimit', time); handleRestart(); }}
            onWordCountChange={(count) => { onSettingChange('wordCount', count); handleRestart(); }}
            onPunctuationToggle={() => { onSettingChange('punctuation', !settings.punctuation); handleRestart(); }}
            onNumbersToggle={() => { onSettingChange('numbers', !settings.numbers); handleRestart(); }}
            disabled={false}
          />
        </div>
      )}

      {/* Language selector - fades out */}
      {!hideModeSwitcher && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          minHeight: '32px',
        }}>
          <LanguageSelector
            currentLanguage={settings.language}
            onChange={(lang) => { onSettingChange('language', lang); }}
            disabled={false}
          />
        </div>
      )}

      {/* Live counter - Monkeytype style: single number above words */}
      <div style={{
        height: '40px',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
      }}>
        {isRunning && (
          <>
            <span style={{
              fontSize: '28px',
              fontWeight: 300,
              color: settings.mode === 'time' && timer.time <= 5
                ? 'var(--error-color)'
                : settings.mode === 'time' && timer.time <= 10
                  ? '#ff8c00'
                  : 'var(--main-color)',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s',
            }}>
              {timer.time}
            </span>
            {settings.showLiveWpm && (
              <span style={{
                fontSize: '20px',
                fontWeight: 300,
                color: 'var(--sub-color)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {liveWpm}
              </span>
            )}
          </>
        )}
      </div>

      {/* ===== WORDS AREA ===== */}
      {/* Outer clip container: fixed line height, overflow hidden */}
      <div
        onClick={handleContainerClick}
        style={{
          position: 'relative',
          fontSize: `${effectiveFontSize}px`,
          lineHeight: '1.65',
          cursor: 'text',
          overflow: 'hidden',
          height: `${lineStride * visibleLines}px`,
        }}
      >
        {/* Typing particles for top 20 leaderboard users */}
        <TypingParticles
          visible={!!leaderboardRank && leaderboardRank <= 20 && state.phase === 'running'}
          rank={leaderboardRank ?? 999}
        />

        {/* Change 3: Tap-to-start overlay (mobile waiting state) */}
        <FocusWarning
          visible={showStartOverlay}
          onClick={handleContainerClick}
          mode="start"
          isMobile={isMobile}
        />

        {/* Refocus overlay (running + lost focus) */}
        <FocusWarning
          visible={showRefocusOverlay}
          onClick={handleContainerClick}
          mode="refocus"
          isMobile={isMobile}
        />

        {/* Top fade gradient for completed lines */}
        {scrollOffset > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${lineStride * (isMobile ? 1 : 2)}px`,
              background: 'linear-gradient(to bottom, var(--bg-color) 0%, transparent 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Inner scrolling div: margin-top scrolls, caret is inside here */}
        <div
          ref={wordsContainerRef}
          style={{
            position: 'relative',
            marginTop: `-${scrollOffset}px`,
            transition: 'margin-top 0.2s ease-out',
            filter: (showRefocusOverlay) ? 'blur(4px)' : 'none',
          }}
        >
          <Caret
            left={position.left}
            top={position.top}
            height={position.height}
            style={settings.caretStyle}
            smooth={settings.smoothCaret}
            isBlinking={isBlinking && !isTypingRef.current}
            visible={isFocused && state.phase !== 'finished'}
          />
          <WordDisplay
            words={state.words}
            currentWordIndex={state.currentWordIndex}
          />
        </div>

        <HiddenInput
          ref={inputKeyboard.inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Change 2: Mobile floating restart button */}
        {isMobile && state.phase !== 'waiting' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRestart();
            }}
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              color: 'var(--sub-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            tabIndex={-1}
            title={t('test.restart')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        )}
      </div>

      {/* Restart button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '32px',
      }}>
        <button
          onClick={handleRestart}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            color: 'var(--sub-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          tabIndex={-1}
          title={t('test.restartHint')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
