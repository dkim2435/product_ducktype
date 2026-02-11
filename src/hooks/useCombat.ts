import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CombatState,
  CombatPhase,
  ActiveWord,
  DamageNumber,
  StageConfig,
  StageResult,
} from '../types/adventure';
import {
  PLAYER_MAX_HP,
  COUNTDOWN_SECONDS,
  WAVE_CLEAR_DELAY_MS,
  BOSS_TRANSITION_DELAY_MS,
  DAMAGE_NUMBER_DURATION_MS,
  WORD_SPAWN_INITIAL_DELAY_MS,
  calculateDamage,
  calculateStars,
  pickWordByLength,
} from '../constants/adventure';
import { getWordListSync } from '../utils/words';

function createInitialState(stageConfig: StageConfig): CombatState {
  return {
    phase: 'intro',
    stageConfig,
    currentWave: 0,
    bossPhase: 0,
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    enemyHp: stageConfig.enemyConfig.hp,
    enemyMaxHp: stageConfig.enemyConfig.hp,
    activeWords: [],
    currentInput: '',
    matchedWordId: null,
    combo: 0,
    maxCombo: 0,
    totalWordsTyped: 0,
    totalCharsTyped: 0,
    correctChars: 0,
    totalKeystrokes: 0,
    startTime: null,
    endTime: null,
    waveStartTime: null,
    damageNumbers: [],
    bossDialogue: null,
  };
}

let nextWordId = 1;
let nextDamageId = 1;

export function useCombat(
  stageConfig: StageConfig | null,
  onComplete: (result: StageResult) => void,
) {
  const [state, setState] = useState<CombatState>(() =>
    createInitialState(stageConfig ?? {
      id: 0, name: '', subtitle: '', enemyConfig: { name: '', emoji: '', hp: 1, attackDamage: 0 },
      waves: [], xpReward: 0, isBoss: false,
    })
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsSpawnedInWaveRef = useRef(0);
  const completedRef = useRef(false);

  // Reset when stage changes
  useEffect(() => {
    if (!stageConfig) return;
    completedRef.current = false;
    nextWordId = 1;
    nextDamageId = 1;
    wordsSpawnedInWaveRef.current = 0;
    setState(createInitialState(stageConfig));
  }, [stageConfig]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  const getWaveConfig = useCallback(() => {
    const s = stateRef.current;
    if (s.stageConfig.isBoss && s.stageConfig.bossConfig) {
      const phaseIdx = Math.min(s.bossPhase, s.stageConfig.bossConfig.phases.length - 1);
      const phase = s.stageConfig.bossConfig.phases[phaseIdx];
      return {
        wordDifficulty: phase.wordDifficulty,
        wordCount: 99,
        spawnInterval: phase.spawnInterval,
        timeoutMs: s.stageConfig.waves[phaseIdx]?.timeoutMs ?? 6000,
      };
    }
    return s.stageConfig.waves[s.currentWave] ?? s.stageConfig.waves[0];
  }, []);

  const spawnWord = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'fighting') return;

    const waveConfig = getWaveConfig();
    if (!s.stageConfig.isBoss && wordsSpawnedInWaveRef.current >= waveConfig.wordCount) return;
    if (s.activeWords.length >= 3) return; // max 3 words on screen

    const words = getWordListSync('en');
    const word = pickWordByLength(words, waveConfig.wordDifficulty.minLen, waveConfig.wordDifficulty.maxLen);

    // Avoid duplicate words on screen
    const activeWordTexts = new Set(s.activeWords.map(w => w.word));
    if (activeWordTexts.has(word) && s.activeWords.length > 0) return;

    const newWord: ActiveWord = {
      id: nextWordId++,
      word,
      spawnedAt: Date.now(),
      timeoutMs: waveConfig.timeoutMs,
      typed: '',
    };

    wordsSpawnedInWaveRef.current++;
    setState(prev => ({ ...prev, activeWords: [...prev.activeWords, newWord] }));
  }, [getWaveConfig]);

  const startSpawner = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const waveConfig = getWaveConfig();
    spawnTimerRef.current = setInterval(spawnWord, waveConfig.spawnInterval);
  }, [getWaveConfig, spawnWord]);

  // Game loop - check timeouts and cleanup damage numbers
  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'fighting') return;

    const now = Date.now();

    setState(prev => {
      if (prev.phase !== 'fighting') return prev;

      let { activeWords, playerHp, combo, maxCombo, damageNumbers, matchedWordId, currentInput } = prev;
      let changed = false;

      // Check word timeouts
      const timedOut: number[] = [];
      activeWords.forEach(w => {
        if (now - w.spawnedAt >= w.timeoutMs) {
          timedOut.push(w.id);
        }
      });

      if (timedOut.length > 0) {
        activeWords = activeWords.filter(w => !timedOut.includes(w.id));
        playerHp -= prev.stageConfig.enemyConfig.attackDamage * timedOut.length;
        combo = 0;

        // Add damage number for player
        timedOut.forEach(() => {
          damageNumbers = [...damageNumbers, {
            id: nextDamageId++,
            value: prev.stageConfig.enemyConfig.attackDamage,
            x: 25,
            createdAt: now,
            isPlayer: true,
          }];
        });

        // If matched word timed out, clear input
        if (matchedWordId && timedOut.includes(matchedWordId)) {
          matchedWordId = null;
          currentInput = '';
        }
        changed = true;
      }

      // Clean up old damage numbers
      const freshDamageNumbers = damageNumbers.filter(
        d => now - d.createdAt < DAMAGE_NUMBER_DURATION_MS
      );
      if (freshDamageNumbers.length !== damageNumbers.length) {
        damageNumbers = freshDamageNumbers;
        changed = true;
      }

      // Check defeat
      if (playerHp <= 0) {
        cancelAnimationFrame(rafRef.current);
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        return {
          ...prev,
          phase: 'defeat' as CombatPhase,
          playerHp: 0,
          activeWords: [],
          combo: 0,
          damageNumbers,
          endTime: now,
          currentInput: '',
          matchedWordId: null,
        };
      }

      if (!changed) return prev;

      return {
        ...prev,
        activeWords,
        playerHp,
        combo,
        maxCombo: Math.max(maxCombo, combo),
        damageNumbers,
        matchedWordId,
        currentInput,
      };
    });

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startCountdown = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'countdown' }));
    let count = COUNTDOWN_SECONDS;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        const now = Date.now();
        wordsSpawnedInWaveRef.current = 0;

        setState(prev => {
          const bossDialogue = prev.stageConfig.isBoss && prev.stageConfig.bossConfig
            ? prev.stageConfig.bossConfig.phases[0].dialogue
            : null;
          return {
            ...prev,
            phase: 'fighting',
            startTime: now,
            waveStartTime: now,
            bossDialogue,
          };
        });

        rafRef.current = requestAnimationFrame(gameLoop);
        setTimeout(() => {
          spawnWord();
          startSpawner();
        }, WORD_SPAWN_INITIAL_DELAY_MS);
      }
    }, 1000);
  }, [gameLoop, spawnWord, startSpawner]);

  const handleChar = useCallback((char: string) => {
    setState(prev => {
      if (prev.phase !== 'fighting') return prev;

      const newInput = prev.currentInput + char;
      const totalKeystrokes = prev.totalKeystrokes + 1;

      // Find matching word (prefix match)
      const matches = prev.activeWords.filter(w => w.word.startsWith(newInput));

      if (matches.length === 0) {
        // Mistype - reset combo and input
        return {
          ...prev,
          currentInput: '',
          matchedWordId: null,
          combo: 0,
          totalKeystrokes,
        };
      }

      const correctChars = prev.correctChars + 1;

      // Prefer currently matched word, then first match
      let matched = matches.find(w => w.id === prev.matchedWordId) ?? matches[0];

      // Check if word complete
      if (newInput === matched.word) {
        const now = Date.now();
        const wordTimeMs = now - matched.spawnedAt;
        const wordWpm = matched.word.length > 0 ? (matched.word.length / 5) / (wordTimeMs / 60000) : 0;
        const newCombo = prev.combo + 1;
        const overallAccuracy = (correctChars) / Math.max(1, totalKeystrokes);
        const damage = calculateDamage(wordWpm, newCombo, overallAccuracy);

        const newEnemyHp = Math.max(0, prev.enemyHp - damage);

        const damageNumbers = [...prev.damageNumbers, {
          id: nextDamageId++,
          value: damage,
          x: 75,
          createdAt: now,
          isPlayer: false,
        }];

        const newActiveWords = prev.activeWords.filter(w => w.id !== matched.id);
        const totalWordsTyped = prev.totalWordsTyped + 1;
        const totalCharsTyped = prev.totalCharsTyped + matched.word.length;
        const maxCombo = Math.max(prev.maxCombo, newCombo);

        let newState = {
          ...prev,
          activeWords: newActiveWords,
          currentInput: '',
          matchedWordId: null,
          enemyHp: newEnemyHp,
          combo: newCombo,
          maxCombo,
          totalWordsTyped,
          totalCharsTyped,
          correctChars,
          totalKeystrokes,
          damageNumbers,
        };

        // Check boss phase transition
        if (prev.stageConfig.isBoss && prev.stageConfig.bossConfig && newEnemyHp > 0) {
          const hpPercent = newEnemyHp / prev.enemyMaxHp;
          const phases = prev.stageConfig.bossConfig.phases;
          let newBossPhase = prev.bossPhase;

          for (let i = phases.length - 1; i > prev.bossPhase; i--) {
            if (hpPercent <= phases[i].hpThreshold) {
              newBossPhase = i;
              break;
            }
          }

          if (newBossPhase !== prev.bossPhase) {
            // Boss phase transition
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
            newState = {
              ...newState,
              bossPhase: newBossPhase,
              bossDialogue: phases[newBossPhase].dialogue,
              activeWords: [],
              phase: 'boss-transition',
            };

            // Resume after delay
            setTimeout(() => {
              wordsSpawnedInWaveRef.current = 0;
              setState(p => ({ ...p, phase: 'fighting', bossDialogue: null }));
              startSpawner();
              setTimeout(spawnWord, WORD_SPAWN_INITIAL_DELAY_MS);
            }, BOSS_TRANSITION_DELAY_MS);

            return newState;
          }
        }

        // Check enemy defeated
        if (newEnemyHp <= 0) {
          if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
          cancelAnimationFrame(rafRef.current);
          return {
            ...newState,
            phase: 'victory' as CombatPhase,
            activeWords: [],
            endTime: now,
          };
        }

        // Check wave clear (non-boss)
        if (!prev.stageConfig.isBoss) {
          const waveConfig = prev.stageConfig.waves[prev.currentWave];
          const allSpawned = wordsSpawnedInWaveRef.current >= waveConfig.wordCount;
          const allCleared = newActiveWords.length === 0;

          if (allSpawned && allCleared) {
            const nextWaveIdx = prev.currentWave + 1;
            if (nextWaveIdx >= prev.stageConfig.waves.length) {
              // All waves complete - enemy defeated
              if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
              cancelAnimationFrame(rafRef.current);
              return {
                ...newState,
                phase: 'victory' as CombatPhase,
                enemyHp: 0,
                activeWords: [],
                endTime: now,
              };
            }

            // Wave clear - transition to next wave
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);

            setTimeout(() => {
              wordsSpawnedInWaveRef.current = 0;
              setState(p => ({
                ...p,
                phase: 'fighting',
                currentWave: nextWaveIdx,
                waveStartTime: Date.now(),
              }));
              startSpawner();
              setTimeout(spawnWord, WORD_SPAWN_INITIAL_DELAY_MS);
            }, WAVE_CLEAR_DELAY_MS);

            return {
              ...newState,
              phase: 'wave-clear' as CombatPhase,
              activeWords: [],
            };
          }
        }

        return newState;
      }

      // Partial match
      return {
        ...prev,
        currentInput: newInput,
        matchedWordId: matched.id,
        correctChars,
        totalKeystrokes,
      };
    });
  }, [spawnWord, startSpawner]);

  const handleBackspace = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'fighting') return prev;
      if (prev.currentInput.length === 0) return prev;

      const newInput = prev.currentInput.slice(0, -1);
      if (newInput.length === 0) {
        return { ...prev, currentInput: '', matchedWordId: null };
      }

      const matches = prev.activeWords.filter(w => w.word.startsWith(newInput));
      const matched = matches.find(w => w.id === prev.matchedWordId) ?? matches[0] ?? null;

      return {
        ...prev,
        currentInput: newInput,
        matchedWordId: matched?.id ?? null,
      };
    });
  }, []);

  // Fire completion callback
  useEffect(() => {
    if ((state.phase === 'victory' || state.phase === 'defeat') && !completedRef.current && stageConfig) {
      completedRef.current = true;
      const cleared = state.phase === 'victory';
      const timeMs = (state.endTime ?? Date.now()) - (state.startTime ?? Date.now());
      const accuracy = state.totalKeystrokes > 0 ? state.correctChars / state.totalKeystrokes : 0;
      const wpm = state.totalCharsTyped > 0
        ? (state.totalCharsTyped / 5) / (timeMs / 60000)
        : 0;
      const hpPercent = state.playerHp / state.playerMaxHp;
      const stars = cleared ? calculateStars(accuracy, hpPercent, wpm) : 0;

      const result: StageResult = {
        stageId: stageConfig.id,
        cleared,
        stars,
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 100),
        maxCombo: state.maxCombo,
        hpRemaining: Math.max(0, state.playerHp),
        hpMax: state.playerMaxHp,
        timeMs,
        xpEarned: cleared ? stageConfig.xpReward : Math.floor(stageConfig.xpReward * 0.2),
      };

      onComplete(result);
    }
  }, [state.phase, state.endTime, state.startTime, state.totalKeystrokes, state.correctChars,
      state.totalCharsTyped, state.playerHp, state.playerMaxHp, state.maxCombo, stageConfig, onComplete]);

  return {
    state,
    startCountdown,
    handleChar,
    handleBackspace,
  };
}
