import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CombatState,
  CombatPhase,
  FieldMinion,
  StageConfig,
  StageResult,
  DebuffType,
  DifficultyLevel,
} from '../types/adventure';
import {
  PLAYER_MAX_HP,
  COUNTDOWN_SECONDS,
  WAVE_CLEAR_DELAY_MS,
  BOSS_TRANSITION_DELAY_MS,
  BOSS_DEATH_DELAY_MS,
  DAMAGE_NUMBER_DURATION_MS,
  KILL_EFFECT_DURATION_MS,
  WORD_SPAWN_INITIAL_DELAY_MS,
  DIFFICULTY_CONFIGS,
  POISON_DAMAGE_PER_SECOND,
  POISON_TICK_INTERVAL_MS,
  calculateDamage,
  pickWordByLength,
  getMinionPosition,
  getBossWordPositions,
} from '../constants/adventure';
import { getWordListSync } from '../utils/words';

let nextId = 1;

function createInitialState(stageConfig: StageConfig, debuff: DebuffType = 'none'): CombatState {
  const isBoss = stageConfig.isBoss;
  return {
    phase: 'intro',
    stageConfig,
    currentWave: 0,
    playerHp: PLAYER_MAX_HP,
    playerMaxHp: PLAYER_MAX_HP,
    activeDebuff: debuff,
    poisonLastTick: null,
    minions: [],
    bossHp: isBoss ? stageConfig.enemyConfig.hp : 0,
    bossMaxHp: isBoss ? stageConfig.enemyConfig.hp : 0,
    bossPhase: 0,
    bossDialogue: null,
    currentInput: '',
    matchedMinionId: null,
    combo: 0,
    maxCombo: 0,
    totalWordsTyped: 0,
    totalCharsTyped: 0,
    correctChars: 0,
    totalKeystrokes: 0,
    startTime: null,
    endTime: null,
    damageNumbers: [],
    killEffects: [],
  };
}

export function useCombat(
  stageConfig: StageConfig | null,
  onComplete: (result: StageResult) => void,
  debuff: DebuffType = 'none',
  difficulty: DifficultyLevel = 'intermediate',
  stageBestStars: number = 0,
) {
  const [state, setState] = useState<CombatState>(() =>
    createInitialState(stageConfig ?? {
      id: 0, name: '', subtitle: '', enemyConfig: { name: '', emoji: '', hp: 1, attackDamage: 0 },
      waves: [], xpReward: 0, isBoss: false,
    }, debuff)
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const minionsSpawnedRef = useRef(0);
  const completedRef = useRef(false);
  // Boss: tracks what was last spawned to alternate between boss words and shields
  const bossLastSpawnedRef = useRef<'boss-words' | 'shields'>('shields');
  // Difficulty ref for use in callbacks
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;

  // Reset when stage changes
  useEffect(() => {
    if (!stageConfig) return;
    completedRef.current = false;
    nextId = 1;
    minionsSpawnedRef.current = 0;
    bossLastSpawnedRef.current = 'shields';
    setState(createInitialState(stageConfig, debuff));
  }, [stageConfig, debuff, difficulty]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  // ---- Spawn a minion (normal stages) ----
  const spawnMinion = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'fighting' || s.stageConfig.isBoss) return;

    const wave = s.stageConfig.waves[s.currentWave];
    if (!wave) return;
    if (minionsSpawnedRef.current >= wave.wordCount) return;
    if (s.minions.length >= 5) return; // max on screen

    const words = getWordListSync('en');
    const word = pickWordByLength(words, wave.wordDifficulty.minLen, wave.wordDifficulty.maxLen);

    // Avoid duplicates
    const activeWords = new Set(s.minions.map(m => m.word));
    if (activeWords.has(word)) return;

    const pos = getMinionPosition(nextId, s.minions);
    const minion: FieldMinion = {
      id: nextId++,
      word,
      spawnedAt: Date.now(),
      timeoutMs: wave.timeoutMs,
      x: pos.x,
      y: pos.y,
    };

    minionsSpawnedRef.current++;
    setState(prev => ({ ...prev, minions: [...prev.minions, minion] }));
  }, []);

  const startMinionSpawner = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const s = stateRef.current;
    if (s.stageConfig.isBoss) return;
    const wave = s.stageConfig.waves[s.currentWave];
    if (!wave) return;
    spawnTimerRef.current = setInterval(spawnMinion, wave.spawnInterval);
  }, [spawnMinion]);

  // ---- Boss: spawn boss word minions (near boss, isBossWord=true) ----
  const spawnBossWords = useCallback(() => {
    const s = stateRef.current;
    if (!s.stageConfig.isBoss || !s.stageConfig.bossConfig) return;
    if (s.phase !== 'fighting') return;

    const phase = s.stageConfig.bossConfig.phases[Math.min(s.bossPhase, s.stageConfig.bossConfig.phases.length - 1)];
    const words = getWordListSync('en');
    const positions = getBossWordPositions(phase.bossWordsCount);
    const usedWords = new Set(s.minions.map(m => m.word));

    const newMinions: FieldMinion[] = [];
    for (let i = 0; i < phase.bossWordsCount; i++) {
      let word = pickWordByLength(words, phase.bossWordDifficulty.minLen, phase.bossWordDifficulty.maxLen);
      let attempts = 0;
      while (usedWords.has(word) && attempts < 20) {
        word = pickWordByLength(words, phase.bossWordDifficulty.minLen, phase.bossWordDifficulty.maxLen);
        attempts++;
      }
      usedWords.add(word);

      newMinions.push({
        id: nextId++,
        word,
        spawnedAt: Date.now(),
        timeoutMs: phase.bossWordTimeoutMs,
        x: positions[i].x,
        y: positions[i].y,
        isBossWord: true,
      });
    }

    bossLastSpawnedRef.current = 'boss-words';
    setState(prev => ({
      ...prev,
      minions: [...prev.minions, ...newMinions],
      currentInput: '',
      matchedMinionId: null,
    }));
  }, []);

  // ---- Boss: spawn shield minions (in field) ----
  const spawnBossShields = useCallback(() => {
    const s = stateRef.current;
    if (!s.stageConfig.isBoss || !s.stageConfig.bossConfig) return;
    if (s.phase !== 'fighting') return;

    const phase = s.stageConfig.bossConfig.phases[Math.min(s.bossPhase, s.stageConfig.bossConfig.phases.length - 1)];
    const words = getWordListSync('en');
    const usedWords = new Set(s.minions.map(m => m.word));

    const newMinions: FieldMinion[] = [];
    const existingPos = s.minions.map(m => ({ x: m.x, y: m.y }));

    for (let i = 0; i < phase.minionsPerWave; i++) {
      let word = pickWordByLength(words, phase.minionWordDifficulty.minLen, phase.minionWordDifficulty.maxLen);
      let attempts = 0;
      while (usedWords.has(word) && attempts < 20) {
        word = pickWordByLength(words, phase.minionWordDifficulty.minLen, phase.minionWordDifficulty.maxLen);
        attempts++;
      }
      usedWords.add(word);

      const allPos = [...existingPos, ...newMinions.map(m => ({ x: m.x, y: m.y }))];
      const pos = getMinionPosition(nextId, allPos, 45); // below boss area
      newMinions.push({
        id: nextId++,
        word,
        spawnedAt: Date.now(),
        timeoutMs: phase.minionTimeoutMs,
        x: pos.x,
        y: pos.y,
      });
    }

    bossLastSpawnedRef.current = 'shields';
    setState(prev => ({
      ...prev,
      minions: [...prev.minions, ...newMinions],
      currentInput: '',
      matchedMinionId: null,
    }));
  }, []);

  // ---- Game loop ----
  const gameLoop = useCallback(() => {
    const s = stateRef.current;

    // Stop on terminal states
    if (s.phase === 'victory' || s.phase === 'defeat' || s.phase === 'intro' || s.phase === 'boss-death') return;

    // Always schedule next frame for non-terminal states
    rafRef.current = requestAnimationFrame(gameLoop);

    // Only process timeout logic during fighting
    if (s.phase !== 'fighting') return;

    const now = Date.now();

    setState(prev => {
      if (prev.phase !== 'fighting') return prev;

      let { minions, playerHp, combo, maxCombo, damageNumbers, killEffects,
            matchedMinionId, currentInput, bossHp } = prev;
      let changed = false;

      // Check minion timeouts (both boss words and shield minions)
      const timedOut: FieldMinion[] = [];
      minions.forEach(m => {
        if (now - m.spawnedAt >= m.timeoutMs) timedOut.push(m);
      });

      if (timedOut.length > 0) {
        const timedOutIds = new Set(timedOut.map(m => m.id));
        minions = minions.filter(m => !timedOutIds.has(m.id));

        // Each timed-out minion deals its own damage
        timedOut.forEach(m => {
          const dmg = m.isBossWord
            ? prev.stageConfig.enemyConfig.attackDamage  // boss hits hard
            : (prev.stageConfig.bossConfig?.minionAttackDamage ?? prev.stageConfig.enemyConfig.attackDamage);
          playerHp -= dmg;
          damageNumbers = [...damageNumbers, {
            id: nextId++, value: dmg,
            x: 50, y: 85, createdAt: now, isPlayer: true,
          }];
        });

        combo = 0;

        if (matchedMinionId && timedOutIds.has(matchedMinionId)) {
          matchedMinionId = null;
          currentInput = '';
        }
        changed = true;
      }

      // Poison tick
      let { poisonLastTick } = prev;
      if (prev.activeDebuff === 'poison' && poisonLastTick !== null) {
        if (now - poisonLastTick >= POISON_TICK_INTERVAL_MS) {
          playerHp -= POISON_DAMAGE_PER_SECOND;
          damageNumbers = [...damageNumbers, {
            id: nextId++, value: POISON_DAMAGE_PER_SECOND,
            x: 50, y: 90, createdAt: now, isPlayer: true,
          }];
          poisonLastTick = now;
          changed = true;
        }
      }

      // Clean up expired effects
      const freshDmg = damageNumbers.filter(d => now - d.createdAt < DAMAGE_NUMBER_DURATION_MS);
      const freshKill = killEffects.filter(k => now - k.createdAt < KILL_EFFECT_DURATION_MS);
      if (freshDmg.length !== damageNumbers.length || freshKill.length !== killEffects.length) {
        damageNumbers = freshDmg;
        killEffects = freshKill;
        changed = true;
      }

      // Check defeat
      if (playerHp <= 0) {
        if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
        return {
          ...prev, phase: 'defeat' as CombatPhase,
          playerHp: 0, minions: [], combo: 0,
          damageNumbers, killEffects,
          endTime: now, currentInput: '', matchedMinionId: null,
        };
      }

      // Check wave clear for normal stages (detect atomically inside setState)
      if (!prev.stageConfig.isBoss && minions.length === 0) {
        const wave = prev.stageConfig.waves[prev.currentWave];
        if (wave && minionsSpawnedRef.current >= wave.wordCount) {
          if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
          const nextWaveIdx = prev.currentWave + 1;
          if (nextWaveIdx >= prev.stageConfig.waves.length) {
            cancelAnimationFrame(rafRef.current);
            return {
              ...prev, phase: 'victory' as CombatPhase, endTime: now,
              minions, playerHp, combo, maxCombo: Math.max(maxCombo, combo),
              damageNumbers, killEffects, matchedMinionId, currentInput, bossHp, poisonLastTick,
            };
          }
          return {
            ...prev, phase: 'wave-clear' as CombatPhase,
            minions, playerHp, combo, maxCombo: Math.max(maxCombo, combo),
            damageNumbers, killEffects, matchedMinionId, currentInput, bossHp, poisonLastTick,
          };
        }
      }

      if (!changed) return prev;

      return {
        ...prev, minions, playerHp, combo,
        maxCombo: Math.max(maxCombo, combo),
        damageNumbers, killEffects,
        matchedMinionId, currentInput, bossHp,
        poisonLastTick,
      };
    });
  }, []);

  // Wave-clear transition: advance to next wave after delay
  // Detection is handled inside gameLoop setState and handleChar setState
  useEffect(() => {
    if (state.phase !== 'wave-clear' || state.stageConfig.isBoss) return;

    const nextWaveIdx = state.currentWave + 1;
    if (nextWaveIdx >= state.stageConfig.waves.length) {
      // All waves done → victory (backup path)
      cancelAnimationFrame(rafRef.current);
      setState(prev => ({ ...prev, phase: 'victory' as CombatPhase, endTime: Date.now() }));
      return;
    }

    const t = setTimeout(() => {
      minionsSpawnedRef.current = 0;
      setState(p => ({ ...p, phase: 'fighting', currentWave: nextWaveIdx }));
      startMinionSpawner();
      setTimeout(spawnMinion, WORD_SPAWN_INITIAL_DELAY_MS);
    }, WAVE_CLEAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.currentWave, state.stageConfig, startMinionSpawner, spawnMinion]);

  // Boss: auto-spawn cycle when no minions remain
  useEffect(() => {
    if (state.phase !== 'fighting' || !state.stageConfig.isBoss || state.bossHp <= 0) return;
    if (state.minions.length > 0) return;

    const t = setTimeout(() => {
      if (bossLastSpawnedRef.current === 'shields') {
        // Last spawned was shields (or initial) → spawn boss words next
        spawnBossWords();
      } else {
        // Last spawned was boss words → spawn shield minions next
        spawnBossShields();
      }
    }, 500);
    return () => clearTimeout(t);
  }, [state.phase, state.minions.length, state.bossHp, state.stageConfig.isBoss, spawnBossWords, spawnBossShields]);

  // Boss death → victory transition after delay
  useEffect(() => {
    if (state.phase !== 'boss-death') return;
    const t = setTimeout(() => {
      setState(prev => ({ ...prev, phase: 'victory' as CombatPhase }));
    }, BOSS_DEATH_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.phase]);

  // ---- Start countdown ----
  const startCountdown = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'countdown' }));
    let count = COUNTDOWN_SECONDS;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        const now = Date.now();
        minionsSpawnedRef.current = 0;

        setState(prev => {
          const bossDialogue = prev.stageConfig.isBoss && prev.stageConfig.bossConfig
            ? prev.stageConfig.bossConfig.phases[0].dialogue
            : null;
          return {
            ...prev,
            phase: 'fighting',
            startTime: now,
            bossDialogue,
            poisonLastTick: prev.activeDebuff === 'poison' ? now : null,
          };
        });

        rafRef.current = requestAnimationFrame(gameLoop);

        if (stageConfig && !stageConfig.isBoss) {
          setTimeout(() => {
            spawnMinion();
            startMinionSpawner();
          }, WORD_SPAWN_INITIAL_DELAY_MS);
        }
        // Boss words/shields handled by the useEffect above
      }
    }, 1000);
  }, [gameLoop, spawnMinion, startMinionSpawner, stageConfig]);

  // ---- Handle char ----
  const handleChar = useCallback((char: string) => {
    setState(prev => {
      if (prev.phase !== 'fighting') return prev;

      const newInput = prev.currentInput + char;
      const totalKeystrokes = prev.totalKeystrokes + 1;
      const isBoss = prev.stageConfig.isBoss;

      // Separate boss words from shield minions
      const shieldMinions = prev.minions.filter(m => !m.isBossWord);
      const bossWordMinions = prev.minions.filter(m => m.isBossWord);
      const hasShields = shieldMinions.length > 0;

      // Priority 1: Try matching shield minions (always targetable)
      const shieldMatches = shieldMinions.filter(m => m.word.startsWith(newInput));

      if (shieldMatches.length > 0) {
        const correctChars = prev.correctChars + 1;
        const matched = shieldMatches.find(m => m.id === prev.matchedMinionId) ?? shieldMatches[0];

        // Word complete → kill shield minion
        if (newInput === matched.word) {
          const now = Date.now();
          const newCombo = prev.combo + 1;
          const newMinions = prev.minions.filter(m => m.id !== matched.id);

          const killEffects = [...prev.killEffects, {
            id: nextId++, x: matched.x, y: matched.y, createdAt: now,
          }];

          let newState = {
            ...prev,
            minions: newMinions,
            currentInput: '',
            matchedMinionId: null,
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            totalWordsTyped: prev.totalWordsTyped + 1,
            totalCharsTyped: prev.totalCharsTyped + matched.word.length,
            correctChars,
            totalKeystrokes,
            killEffects,
          };

          // Normal stage: check wave clear
          if (!isBoss) {
            const wave = prev.stageConfig.waves[prev.currentWave];
            const allSpawned = minionsSpawnedRef.current >= wave.wordCount;
            const allDead = newMinions.length === 0;

            if (allSpawned && allDead) {
              if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
              const nextWaveIdx = prev.currentWave + 1;
              if (nextWaveIdx >= prev.stageConfig.waves.length) {
                cancelAnimationFrame(rafRef.current);
                return { ...newState, phase: 'victory' as CombatPhase, endTime: now };
              }
              // Wave clear → useEffect handles transition to next wave
              return { ...newState, phase: 'wave-clear' as CombatPhase };
            }
          }

          // Boss: shield killed — remaining cycle handled by useEffect
          return newState;
        }

        // Partial shield match
        return {
          ...prev,
          currentInput: newInput,
          matchedMinionId: matched.id,
          correctChars: prev.correctChars + 1,
          totalKeystrokes,
        };
      }

      // Priority 2: Try matching boss words (only when NO shields exist)
      if (isBoss && !hasShields && bossWordMinions.length > 0) {
        const bossMatches = bossWordMinions.filter(m => m.word.startsWith(newInput));

        if (bossMatches.length > 0) {
          const correctChars = prev.correctChars + 1;
          const matched = bossMatches.find(m => m.id === prev.matchedMinionId) ?? bossMatches[0];

          // Boss word complete → damage boss
          if (newInput === matched.word) {
            const now = Date.now();
            const wordTimeMs = now - matched.spawnedAt;
            const wordWpm = matched.word.length > 0
              ? (matched.word.length / 5) / (wordTimeMs / 60000) : 0;
            const newCombo = prev.combo + 1;
            const accuracy = correctChars / Math.max(1, totalKeystrokes);
            const damage = calculateDamage(wordWpm, newCombo, accuracy);
            const newBossHp = Math.max(0, prev.bossHp - damage);
            const newMinions = prev.minions.filter(m => m.id !== matched.id);

            const damageNumbers = [...prev.damageNumbers, {
              id: nextId++, value: damage,
              x: 50, y: 10, createdAt: now, isPlayer: false,
            }];

            const killEffects = [...prev.killEffects, {
              id: nextId++, x: matched.x, y: matched.y, createdAt: now,
            }];

            let newState = {
              ...prev,
              bossHp: newBossHp,
              minions: newMinions,
              currentInput: '',
              matchedMinionId: null,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              totalWordsTyped: prev.totalWordsTyped + 1,
              totalCharsTyped: prev.totalCharsTyped + matched.word.length,
              correctChars,
              totalKeystrokes,
              damageNumbers,
              killEffects,
            };

            // Boss defeated → boss-death animation phase
            if (newBossHp <= 0) {
              cancelAnimationFrame(rafRef.current);
              return {
                ...newState,
                phase: 'boss-death' as CombatPhase,
                minions: [],
                endTime: now,
              };
            }

            // Check phase transition
            if (prev.stageConfig.bossConfig) {
              const phases = prev.stageConfig.bossConfig.phases;
              const hpPercent = newBossHp / prev.bossMaxHp;
              let newBossPhase = prev.bossPhase;
              for (let i = phases.length - 1; i > prev.bossPhase; i--) {
                if (hpPercent <= phases[i].hpThreshold) {
                  newBossPhase = i;
                  break;
                }
              }
              if (newBossPhase !== prev.bossPhase) {
                bossLastSpawnedRef.current = 'shields'; // reset cycle for new phase
                newState = {
                  ...newState,
                  bossPhase: newBossPhase,
                  bossDialogue: phases[newBossPhase].dialogue,
                  phase: 'boss-transition' as CombatPhase,
                  minions: [],
                };
                setTimeout(() => {
                  setState(p => ({ ...p, phase: 'fighting', bossDialogue: null }));
                }, BOSS_TRANSITION_DELAY_MS);
                return newState;
              }
            }

            // Boss word killed, remaining cycle handled by useEffect
            return newState;
          }

          // Partial boss word match
          return {
            ...prev,
            currentInput: newInput,
            matchedMinionId: matched.id,
            correctChars: prev.correctChars + 1,
            totalKeystrokes,
          };
        }
      }

      // No match → mistype → HP penalty (difficulty-based)
      const now = Date.now();
      let mistypeDmg = DIFFICULTY_CONFIGS[difficultyRef.current].mistypeDamage;

      // Freeze debuff: multiply mistype damage by intensity
      if (prev.activeDebuff === 'freeze' && mistypeDmg > 0) {
        const freezeIntensity = 1.5; // 50% extra damage
        mistypeDmg = Math.round(mistypeDmg * freezeIntensity);
      }

      if (mistypeDmg === 0) {
        // Beginner: no HP penalty, just reset input + break combo
        return {
          ...prev,
          currentInput: '',
          matchedMinionId: null,
          combo: 0,
          totalKeystrokes,
        };
      }

      const newHp = prev.playerHp - mistypeDmg;
      const mistypeDmgNumbers = [...prev.damageNumbers, {
        id: nextId++, value: mistypeDmg,
        x: 50, y: 85, createdAt: now, isPlayer: true,
      }];

      if (newHp <= 0) {
        if (spawnTimerRef.current) { clearInterval(spawnTimerRef.current); spawnTimerRef.current = null; }
        cancelAnimationFrame(rafRef.current);
        return {
          ...prev, phase: 'defeat' as CombatPhase,
          playerHp: 0, minions: [], combo: 0,
          damageNumbers: mistypeDmgNumbers,
          endTime: now, currentInput: '', matchedMinionId: null,
          totalKeystrokes,
        };
      }

      return {
        ...prev,
        currentInput: '',
        matchedMinionId: null,
        combo: 0,
        playerHp: newHp,
        damageNumbers: mistypeDmgNumbers,
        totalKeystrokes,
      };
    });
  }, [spawnMinion, startMinionSpawner]);

  // ---- Handle backspace ----
  const handleBackspace = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'fighting') return prev;
      if (prev.currentInput.length === 0) return prev;

      const newInput = prev.currentInput.slice(0, -1);
      if (newInput.length === 0) {
        return { ...prev, currentInput: '', matchedMinionId: null };
      }

      // Re-match: try shield minions first, then boss words if no shields
      const shieldMinions = prev.minions.filter(m => !m.isBossWord);
      const shieldMatches = shieldMinions.filter(m => m.word.startsWith(newInput));
      if (shieldMatches.length > 0) {
        const matched = shieldMatches.find(m => m.id === prev.matchedMinionId) ?? shieldMatches[0];
        return { ...prev, currentInput: newInput, matchedMinionId: matched.id };
      }

      if (prev.stageConfig.isBoss && shieldMinions.length === 0) {
        const bossMatches = prev.minions.filter(m => m.isBossWord && m.word.startsWith(newInput));
        if (bossMatches.length > 0) {
          const matched = bossMatches.find(m => m.id === prev.matchedMinionId) ?? bossMatches[0];
          return { ...prev, currentInput: newInput, matchedMinionId: matched.id };
        }
      }

      return { ...prev, currentInput: newInput, matchedMinionId: null };
    });
  }, []);

  // ---- Fire completion callback ----
  useEffect(() => {
    if ((state.phase === 'victory' || state.phase === 'defeat') && !completedRef.current && stageConfig) {
      completedRef.current = true;
      const cleared = state.phase === 'victory';
      const timeMs = (state.endTime ?? Date.now()) - (state.startTime ?? Date.now());
      const accuracy = state.totalKeystrokes > 0 ? state.correctChars / state.totalKeystrokes : 0;
      const wpm = state.totalCharsTyped > 0
        ? (state.totalCharsTyped / 5) / (timeMs / 60000) : 0;
      const diffConfig = DIFFICULTY_CONFIGS[difficultyRef.current];
      const stars = cleared ? diffConfig.maxStars : 0;
      const isReplay = stageBestStars >= diffConfig.maxStars;
      const baseXp = cleared
        ? Math.round(stageConfig.xpReward * diffConfig.xpMultiplier)
        : Math.floor(stageConfig.xpReward * 0.2);
      const xpEarned = isReplay ? Math.floor(baseXp / 3) : baseXp;

      onComplete({
        stageId: stageConfig.id,
        cleared,
        stars,
        difficulty: difficultyRef.current,
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 100),
        maxCombo: state.maxCombo,
        hpRemaining: Math.max(0, state.playerHp),
        hpMax: state.playerMaxHp,
        timeMs,
        xpEarned,
      });
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
