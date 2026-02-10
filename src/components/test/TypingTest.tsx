import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Settings } from '../../types/settings';
import type { TestState } from '../../types/test';
import { useTypingTest } from '../../hooks/useTypingTest';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTimer } from '../../hooks/useTimer';
import { useCaret } from '../../hooks/useCaret';
import { useSound } from '../../hooks/useSound';
import { HiddenInput } from './HiddenInput';
import { WordDisplay } from './WordDisplay';
import { Caret } from './Caret';
import { ModeSelector } from './ModeSelector';
import { LanguageSelector } from './LanguageSelector';
import { FocusWarning } from './FocusWarning';

interface TypingTestProps {
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onFinish: (state: TestState) => void;
  customWords?: string[];
  hideModeSwitcher?: boolean;
}

export function TypingTest({ settings, onSettingChange, onFinish, customWords, hideModeSwitcher }: TypingTestProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(true);
  const [liveWpm, setLiveWpm] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const isTypingRef = useRef(false);
  const lineHeight = Math.round(settings.fontSize * 1.65);

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

      // Start scrolling only after the current word passes line 2
      // (i.e. keep 2 completed lines visible, scroll when entering line 3+)
      const scrollThreshold = lineHeight * 2;
      if (wordTop >= scrollThreshold + scrollOffset) {
        setScrollOffset(wordTop - scrollThreshold);
      }
    });
  }, [state.currentWordIndex, wordsContainerRef, scrollOffset, lineHeight]);

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
  }, [scrollOffset, state.currentWordIndex, state.currentLetterIndex, state.words, updatePosition]);

  const handleCharWithSound = useCallback((char: string) => {
    isTypingRef.current = true;
    const word = state.words[state.currentWordIndex];
    const letterIdx = state.currentLetterIndex;
    if (word && letterIdx < word.letters.length) {
      if (char === word.letters[letterIdx].char) {
        playClick();
      } else {
        playError();
      }
    } else {
      playError();
    }
    handleChar(char);
    setTimeout(() => { isTypingRef.current = false; }, 100);
  }, [handleChar, playClick, playError, state.words, state.currentWordIndex, state.currentLetterIndex]);

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
              color: 'var(--main-color)',
              fontVariantNumeric: 'tabular-nums',
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
      {/* Outer clip container: fixed 4-line height, overflow hidden */}
      <div
        onClick={handleContainerClick}
        style={{
          position: 'relative',
          fontSize: `${settings.fontSize}px`,
          lineHeight: '1.65',
          cursor: 'text',
          overflow: 'hidden',
          height: `${lineHeight * 4}px`,
        }}
      >
        <FocusWarning
          visible={!isFocused && isRunning}
          onClick={handleContainerClick}
        />

        {/* Top fade gradient for completed lines */}
        {scrollOffset > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `${lineHeight * 2}px`,
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
            filter: !isFocused && isRunning ? 'blur(4px)' : 'none',
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
