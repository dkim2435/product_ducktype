import { useState, useCallback, useRef, useEffect } from 'react';
import type { Settings } from '../types/settings';
import type {
  DuckRaceState,
  DuckRaceSettings,
  GhostRacer,
  RaceRanking,
} from '../types/duckRace';
import { useTypingTest } from './useTypingTest';
import { generateWords } from '../utils/words';
import { calculateWpm } from '../utils/wpm';
import {
  generateGhostSamples,
  selectGhosts,
  interpolateGhostProgress,
} from '../utils/ghostGenerator';

const RACE_MAX_DURATION = 120; // absolute max seconds

function computeRankings(
  ghosts: GhostRacer[],
  playerProgress: number,
  playerWpm: number,
  playerFinished: boolean,
  playerFinishTime: number | null,
): RaceRanking[] {
  const entries: RaceRanking[] = [
    {
      id: 'player',
      name: 'You',
      emoji: '\uD83D\uDC23',
      place: 0,
      wpm: playerWpm,
      finishTime: playerFinishTime,
      isPlayer: true,
    },
    ...ghosts.map(g => ({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      place: 0,
      wpm: g.currentWpm,
      finishTime: g.finishTime,
      isPlayer: false,
    })),
  ];

  // Sort: finished first (by finishTime), then by progress descending
  const progressMap: Record<string, number> = { player: playerProgress };
  for (const g of ghosts) progressMap[g.id] = g.currentProgress;

  entries.sort((a, b) => {
    const aFinished = a.id === 'player' ? playerFinished : ghosts.find(g => g.id === a.id)!.finished;
    const bFinished = b.id === 'player' ? playerFinished : ghosts.find(g => g.id === b.id)!.finished;

    if (aFinished && !bFinished) return -1;
    if (!aFinished && bFinished) return 1;
    if (aFinished && bFinished) return (a.finishTime ?? Infinity) - (b.finishTime ?? Infinity);
    return (progressMap[b.id] ?? 0) - (progressMap[a.id] ?? 0);
  });

  entries.forEach((e, i) => { e.place = i + 1; });
  return entries;
}

export function useDuckRace(appSettings: Settings) {
  const [raceSettings, setRaceSettings] = useState<DuckRaceSettings>({
    mode: 'time',
    timeLimit: 30,
    wordCount: 25,
    opponentCount: 3,
  });

  const [raceState, setRaceState] = useState<DuckRaceState>({
    phase: 'intro',
    ghosts: [],
    playerProgress: 0,
    playerWpm: 0,
    playerFinished: false,
    playerFinishTime: null,
    startTime: null,
    elapsedSeconds: 0,
    totalCharsInText: 0,
    rankings: [],
  });

  const rafRef = useRef<number>(0);
  const stateRef = useRef(raceState);
  stateRef.current = raceState;
  const raceSettingsRef = useRef(raceSettings);
  raceSettingsRef.current = raceSettings;

  // Generate words for the race
  const raceDuration = raceSettings.mode === 'time' ? raceSettings.timeLimit : RACE_MAX_DURATION;
  const wordCount = raceSettings.mode === 'words' ? raceSettings.wordCount : 80;

  const [raceWords, setRaceWords] = useState<string[]>(() =>
    generateWords(appSettings.language, wordCount)
  );

  const totalCharsRef = useRef(0);

  // Use the standard typing test hook
  const typingTest = useTypingTest({
    settings: { ...appSettings, mode: 'words', wordCount },
    customWords: raceWords,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'racing' || !s.startTime) return;

    const now = Date.now();
    const elapsed = (now - s.startTime) / 1000;
    const rs = raceSettingsRef.current;

    // Time mode: check time expiry
    const timeUp = rs.mode === 'time' && elapsed >= rs.timeLimit;

    // Update ghosts
    const updatedGhosts = s.ghosts.map(ghost => {
      if (ghost.finished) return ghost;
      const interp = interpolateGhostProgress(ghost.samples, elapsed);
      const finished = interp.progress >= 1.0;
      return {
        ...ghost,
        currentProgress: interp.progress,
        currentWpm: interp.wpm,
        finished,
        finishTime: finished ? elapsed : null,
      };
    });

    // Player progress from typing test
    const totalChars = totalCharsRef.current;
    const correctChars = typingTest.state.correctChars;
    const playerProgress = totalChars > 0 ? Math.min(1.0, correctChars / totalChars) : 0;
    const playerWpm = calculateWpm(correctChars, elapsed);
    const playerFinished = playerProgress >= 1.0;
    const playerFinishTime = playerFinished && !s.playerFinished ? elapsed : s.playerFinishTime;

    // Check race end conditions
    const allFinished = playerFinished && updatedGhosts.every(g => g.finished);
    const raceOver = timeUp || allFinished;

    const rankings = computeRankings(updatedGhosts, playerProgress, playerWpm, playerFinished, playerFinishTime);

    setRaceState(prev => ({
      ...prev,
      ghosts: updatedGhosts,
      playerProgress,
      playerWpm,
      playerFinished: playerFinished || prev.playerFinished,
      playerFinishTime: playerFinishTime ?? prev.playerFinishTime,
      elapsedSeconds: elapsed,
      rankings,
      phase: raceOver ? 'finished' : 'racing',
    }));

    if (raceOver) {
      // Finish the typing test if time mode ended
      if (timeUp) typingTest.finishTest();
      return;
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRace = useCallback(() => {
    const rs = raceSettingsRef.current;
    // Generate fresh words
    const wc = rs.mode === 'words' ? rs.wordCount : 80;
    const newWords = generateWords(appSettings.language, wc);
    setRaceWords(newWords);

    // Calculate total chars (words joined by spaces)
    const totalChars = newWords.reduce((sum, w) => sum + w.length, 0) + (newWords.length - 1);
    totalCharsRef.current = totalChars;

    // Set countdown phase
    setRaceState(prev => ({ ...prev, phase: 'countdown', totalCharsInText: totalChars }));

    // Countdown 3-2-1-QUACK
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);

        const dur = rs.mode === 'time' ? rs.timeLimit : RACE_MAX_DURATION;
        // Select and generate ghosts
        const ghostDefs = selectGhosts(null, rs.opponentCount);
        const ghosts: GhostRacer[] = ghostDefs.map(def => ({
          ...def,
          samples: generateGhostSamples(def, totalChars, dur),
          currentProgress: 0,
          currentWpm: 0,
          finished: false,
          finishTime: null,
        }));

        const startTime = Date.now();
        setRaceState({
          phase: 'racing',
          ghosts,
          playerProgress: 0,
          playerWpm: 0,
          playerFinished: false,
          playerFinishTime: null,
          startTime,
          elapsedSeconds: 0,
          totalCharsInText: totalChars,
          rankings: [],
        });

        // Start the typing test
        typingTest.restart();

        // Start game loop
        rafRef.current = requestAnimationFrame(gameLoop);
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appSettings.language, gameLoop]);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRaceState({
      phase: 'intro',
      ghosts: [],
      playerProgress: 0,
      playerWpm: 0,
      playerFinished: false,
      playerFinishTime: null,
      startTime: null,
      elapsedSeconds: 0,
      totalCharsInText: 0,
      rankings: [],
    });
  }, []);

  return {
    raceState,
    raceSettings,
    setRaceSettings,
    typingState: typingTest.state,
    typingWords: typingTest.words,
    startRace,
    restart,
    handleChar: typingTest.handleChar,
    handleSpace: typingTest.handleSpace,
    handleBackspace: typingTest.handleBackspace,
    handleCjkInput: typingTest.handleCjkInput,
    getCurrentWpm: typingTest.getCurrentWpm,
    finishTest: typingTest.finishTest,
  };
}
