import { useState, useCallback, useRef, useEffect } from 'react';
import type { TestState, WordData, WpmSample } from '../types/test';
import type { Settings } from '../types/settings';
import { generateWords, loadWordList } from '../utils/words';
import { calculateWpm, calculateRawWpm } from '../utils/wpm';
import { WPM_SAMPLE_INTERVAL } from '../constants/defaults';

function createWordData(word: string): WordData {
  return {
    letters: word.split('').map(char => ({
      char,
      state: 'pending' as const,
    })),
    isActive: false,
    isCompleted: false,
  };
}

function createInitialState(words: string[]): TestState {
  const wordData = words.map(createWordData);
  if (wordData.length > 0) wordData[0].isActive = true;
  return {
    phase: 'waiting',
    words: wordData,
    currentWordIndex: 0,
    currentLetterIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    startTime: null,
    endTime: null,
    wpmHistory: [],
    rawWpmHistory: [],
    errorHistory: [],
  };
}

interface UseTypingTestOptions {
  settings: Settings;
  onFinish?: (state: TestState) => void;
  customWords?: string[];
}

export function useTypingTest({ settings, onFinish, customWords }: UseTypingTestOptions) {
  const isTimeMode = settings.mode === 'time';
  const wordCount = isTimeMode ? 100 : settings.wordCount;
  const [words, setWords] = useState<string[]>(() =>
    customWords || generateWords(settings.language, wordCount, {
      punctuation: settings.punctuation,
      numbers: settings.numbers,
    })
  );
  const [state, setState] = useState<TestState>(() => createInitialState(words));

  const stateRef = useRef(state);
  stateRef.current = state;
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const lastSampleTimeRef = useRef(0);
  const sampleIntervalRef = useRef<number | null>(null);

  // Load word list on language change
  useEffect(() => {
    loadWordList(settings.language).then(() => {
      const newWords = generateWords(settings.language, wordCount, {
        punctuation: settings.punctuation,
        numbers: settings.numbers,
      });
      setWords(newWords);
      setState(createInitialState(newWords));
      lastSampleTimeRef.current = 0;
    });
  }, [settings.language, wordCount, settings.punctuation, settings.numbers]);

  const startTest = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'running',
      startTime: Date.now(),
    }));
  }, []);

  const finishTest = useCallback(() => {
    const now = Date.now();
    setState(prev => {
      if (prev.phase !== 'running') return prev;
      let missed = prev.missedChars;
      const currentWord = prev.words[prev.currentWordIndex];
      if (currentWord) {
        for (let i = prev.currentLetterIndex; i < currentWord.letters.length; i++) {
          if (currentWord.letters[i].state === 'pending') {
            missed++;
          }
        }
      }
      const finished: TestState = {
        ...prev,
        phase: 'finished',
        endTime: now,
        missedChars: missed,
      };
      setTimeout(() => onFinishRef.current?.(finished), 0);
      return finished;
    });

    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }
  }, []);

  // Dynamically add more words in time mode when running low
  const appendMoreWords = useCallback(() => {
    const moreWordStrings = generateWords(settings.language, 60, {
      punctuation: settings.punctuation,
      numbers: settings.numbers,
    });
    const moreWordData = moreWordStrings.map(createWordData);

    setWords(prev => [...prev, ...moreWordStrings]);
    setState(prev => ({
      ...prev,
      words: [...prev.words, ...moreWordData],
    }));
  }, [settings.language, settings.punctuation, settings.numbers]);

  // Check if we need more words (time mode)
  useEffect(() => {
    if (!isTimeMode || state.phase !== 'running') return;
    const remaining = state.words.length - state.currentWordIndex;
    if (remaining < 30) {
      appendMoreWords();
    }
  }, [isTimeMode, state.phase, state.currentWordIndex, state.words.length, appendMoreWords]);

  // WPM sampling
  useEffect(() => {
    if (state.phase === 'running' && state.startTime && !sampleIntervalRef.current) {
      sampleIntervalRef.current = window.setInterval(() => {
        const s = stateRef.current;
        if (s.phase !== 'running' || !s.startTime) return;

        const elapsed = (Date.now() - s.startTime) / 1000;
        const roundedTime = Math.floor(elapsed);

        if (roundedTime > lastSampleTimeRef.current) {
          lastSampleTimeRef.current = roundedTime;
          const wpm = calculateWpm(s.correctChars, elapsed);
          const rawWpm = calculateRawWpm(s.correctChars + s.incorrectChars + s.extraChars, elapsed);
          const errorsInPeriod = s.incorrectChars + s.extraChars;

          setState(prev => ({
            ...prev,
            wpmHistory: [...prev.wpmHistory, { time: roundedTime, value: wpm }],
            rawWpmHistory: [...prev.rawWpmHistory, { time: roundedTime, value: rawWpm }],
            errorHistory: [...prev.errorHistory, { time: roundedTime, value: errorsInPeriod }],
          }));
        }
      }, WPM_SAMPLE_INTERVAL * 500);
    }

    return () => {
      if (sampleIntervalRef.current && state.phase !== 'running') {
        clearInterval(sampleIntervalRef.current);
        sampleIntervalRef.current = null;
      }
    };
  }, [state.phase, state.startTime]);

  const handleChar = useCallback((char: string) => {
    setState(prev => {
      if (prev.phase === 'finished') return prev;

      const newState = { ...prev };

      // Start test on first character
      if (prev.phase === 'waiting') {
        newState.phase = 'running';
        newState.startTime = Date.now();
      }

      const currentWord = { ...prev.words[prev.currentWordIndex] };
      const letters = [...currentWord.letters];
      const letterIdx = prev.currentLetterIndex;

      if (letterIdx < letters.length) {
        const expected = letters[letterIdx].char;
        if (char === expected) {
          letters[letterIdx] = { ...letters[letterIdx], state: 'correct', typed: char };
          newState.correctChars = prev.correctChars + 1;
          newState.correctKeystrokes = prev.correctKeystrokes + 1;
        } else {
          letters[letterIdx] = { ...letters[letterIdx], state: 'incorrect', typed: char };
          newState.incorrectChars = prev.incorrectChars + 1;
        }
        newState.currentLetterIndex = letterIdx + 1;
      } else {
        // Extra character beyond word length
        letters.push({ char: char, state: 'extra', typed: char });
        newState.extraChars = prev.extraChars + 1;
        newState.currentLetterIndex = letterIdx + 1;
      }

      newState.totalKeystrokes = prev.totalKeystrokes + 1;

      currentWord.letters = letters;
      const newWords = [...prev.words];
      newWords[prev.currentWordIndex] = currentWord;
      newState.words = newWords;

      // Auto-finish in words mode: last char of last word typed correctly
      if (
        !isTimeMode &&
        prev.currentWordIndex === prev.words.length - 1 &&
        newState.currentLetterIndex === letters.length &&
        letters.every(l => l.state === 'correct')
      ) {
        currentWord.isActive = false;
        currentWord.isCompleted = true;
        const finished: TestState = {
          ...newState,
          phase: 'finished',
          endTime: Date.now(),
        };
        setTimeout(() => onFinishRef.current?.(finished), 0);
        return finished;
      }

      return newState;
    });
  }, [isTimeMode]);

  const handleSpace = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'running') return prev;

      const currentWordIdx = prev.currentWordIndex;
      const currentWord = prev.words[currentWordIdx];
      if (!currentWord) return prev;

      // Don't allow space at beginning of word
      if (prev.currentLetterIndex === 0) return prev;

      // Mark remaining letters as missed
      const letters = [...currentWord.letters];
      let missed = prev.missedChars;
      for (let i = prev.currentLetterIndex; i < letters.length; i++) {
        if (letters[i].state === 'pending') {
          letters[i] = { ...letters[i], state: 'incorrect' };
          missed++;
        }
      }

      const updatedWord: WordData = {
        ...currentWord,
        letters,
        isActive: false,
        isCompleted: true,
      };

      const newWords = [...prev.words];
      newWords[currentWordIdx] = updatedWord;

      const nextWordIdx = currentWordIdx + 1;

      // In words mode, finish if all words done
      if (!isTimeMode && nextWordIdx >= newWords.length) {
        const finished: TestState = {
          ...prev,
          words: newWords,
          currentWordIndex: nextWordIdx,
          currentLetterIndex: 0,
          missedChars: missed,
          totalKeystrokes: prev.totalKeystrokes + 1,
          phase: 'finished',
          endTime: Date.now(),
        };
        setTimeout(() => onFinishRef.current?.(finished), 0);
        return finished;
      }

      // Activate next word
      if (nextWordIdx < newWords.length) {
        newWords[nextWordIdx] = { ...newWords[nextWordIdx], isActive: true };
      }

      return {
        ...prev,
        words: newWords,
        currentWordIndex: nextWordIdx,
        currentLetterIndex: 0,
        missedChars: missed,
        totalKeystrokes: prev.totalKeystrokes + 1,
      };
    });
  }, [isTimeMode]);

  const handleBackspace = useCallback((ctrlKey: boolean = false) => {
    setState(prev => {
      if (prev.phase !== 'running') return prev;

      const currentWordIdx = prev.currentWordIndex;
      const letterIdx = prev.currentLetterIndex;

      if (ctrlKey) {
        // Ctrl+Backspace: clear current word
        const currentWord = { ...prev.words[currentWordIdx] };
        const origLetters = prev.words[currentWordIdx].letters;

        let removedCorrect = 0;
        let removedIncorrect = 0;
        let removedExtra = 0;
        for (const l of origLetters) {
          if (l.state === 'correct') removedCorrect++;
          else if (l.state === 'incorrect') removedIncorrect++;
          else if (l.state === 'extra') removedExtra++;
        }

        const letters = origLetters
          .filter(l => l.state !== 'extra')
          .map(l => ({
            ...l,
            state: 'pending' as const,
            typed: undefined,
          }));

        currentWord.letters = letters;
        const newWords = [...prev.words];
        newWords[currentWordIdx] = currentWord;

        return {
          ...prev,
          words: newWords,
          currentLetterIndex: 0,
          correctChars: prev.correctChars - removedCorrect,
          incorrectChars: prev.incorrectChars - removedIncorrect,
          extraChars: prev.extraChars - removedExtra,
        };
      }

      // Regular backspace
      if (letterIdx === 0) return prev;

      const currentWord = { ...prev.words[currentWordIdx] };
      const letters = [...currentWord.letters];
      const prevIdx = letterIdx - 1;
      const prevLetter = letters[prevIdx];

      const wasCorrect = prevLetter.state === 'correct';
      const wasIncorrect = prevLetter.state === 'incorrect';
      const wasExtra = prevLetter.state === 'extra';

      if (wasExtra) {
        letters.splice(prevIdx, 1);
      } else {
        letters[prevIdx] = { ...prevLetter, state: 'pending', typed: undefined };
      }

      currentWord.letters = letters;
      const newWords = [...prev.words];
      newWords[currentWordIdx] = currentWord;

      return {
        ...prev,
        words: newWords,
        currentLetterIndex: prevIdx,
        correctChars: prev.correctChars - (wasCorrect ? 1 : 0),
        incorrectChars: prev.incorrectChars - (wasIncorrect ? 1 : 0),
        extraChars: prev.extraChars - (wasExtra ? 1 : 0),
        totalKeystrokes: prev.totalKeystrokes + 1,
      };
    });
  }, []);

  const handleCjkInput = useCallback((text: string) => {
    for (const char of text) {
      handleChar(char);
    }
  }, [handleChar]);

  const restart = useCallback(() => {
    const newWords = generateWords(settings.language, wordCount, {
      punctuation: settings.punctuation,
      numbers: settings.numbers,
    });
    setWords(newWords);
    setState(createInitialState(newWords));
    lastSampleTimeRef.current = 0;
    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }
  }, [settings.language, wordCount, settings.punctuation, settings.numbers]);

  const getElapsedSeconds = useCallback((): number => {
    if (!state.startTime) return 0;
    const end = state.endTime || Date.now();
    return (end - state.startTime) / 1000;
  }, [state.startTime, state.endTime]);

  const getCurrentWpm = useCallback((): number => {
    const elapsed = getElapsedSeconds();
    return calculateWpm(state.correctChars, elapsed);
  }, [state.correctChars, getElapsedSeconds]);

  const getCurrentRawWpm = useCallback((): number => {
    const elapsed = getElapsedSeconds();
    return calculateRawWpm(
      state.correctChars + state.incorrectChars + state.extraChars,
      elapsed
    );
  }, [state.correctChars, state.incorrectChars, state.extraChars, getElapsedSeconds]);

  return {
    state,
    words,
    handleChar,
    handleSpace,
    handleBackspace,
    handleCjkInput,
    startTest,
    finishTest,
    restart,
    getElapsedSeconds,
    getCurrentWpm,
    getCurrentRawWpm,
  };
}
