import { useState, useCallback, useRef, useEffect } from 'react';
import type { Duck, DuckHuntState } from '../types/arcade';
import { getWordListSync } from '../utils/words';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const DUCK_WIDTH = 120;
const INITIAL_LIVES = 3;
const MAX_DIFFICULTY = 10;
const DUCKS_PER_DIFFICULTY = 5; // faster difficulty ramp

interface DifficultyConfig {
  spawnInterval: number;
  speed: number;
  maxDucks: number;
  minWordLen: number;
  maxWordLen: number;
}

function getDifficultyConfig(difficulty: number): DifficultyConfig {
  const t = (difficulty - 1) / (MAX_DIFFICULTY - 1); // 0..1
  return {
    spawnInterval: Math.round(2800 - t * 1800),       // 2800 → 1000
    speed: 1.0 + t * 2.0,                              // 1.0 → 3.0
    maxDucks: Math.round(2 + t * 3),                    // 2 → 5
    minWordLen: difficulty <= 3 ? 2 : difficulty <= 6 ? 4 : 5,
    maxWordLen: difficulty <= 3 ? 5 : difficulty <= 6 ? 7 : 12,
  };
}

function pickWord(words: string[], minLen: number, maxLen: number): string {
  const filtered = words.filter(w => w.length >= minLen && w.length <= maxLen);
  const pool = filtered.length > 0 ? filtered : words;
  return pool[Math.floor(Math.random() * pool.length)];
}

const initialState: DuckHuntState = {
  phase: 'intro',
  ducks: [],
  currentInput: '',
  matchedDuckId: null,
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: INITIAL_LIVES,
  ducksShot: 0,
  ducksEscaped: 0,
  difficulty: 1,
  startTime: null,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
};

export function useDuckHunt(language: string) {
  const [state, setState] = useState<DuckHuntState>(initialState);
  const rafRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextIdRef = useRef(1);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, []);

  const spawnDuck = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'playing') return;

    const config = getDifficultyConfig(s.difficulty);
    if (s.ducks.length >= config.maxDucks) return;

    const words = getWordListSync(language);

    // ~15% chance for special (red) duck with harder word, starting from difficulty 2
    const isSpecial = s.difficulty >= 2 && Math.random() < 0.15;
    const minLen = isSpecial ? Math.max(config.minWordLen + 2, 5) : config.minWordLen;
    const maxLen = isSpecial ? Math.max(config.maxWordLen + 3, 10) : config.maxWordLen;
    const word = pickWord(words, minLen, maxLen);

    const direction: 'left' | 'right' = Math.random() > 0.5 ? 'left' : 'right';
    const x = direction === 'left' ? GAME_WIDTH + 10 : -DUCK_WIDTH - 10;
    const speedMult = isSpecial ? 1.3 : 1;
    const vx = (direction === 'left' ? -config.speed : config.speed) * speedMult;
    // Keep Y within visible range (leave room for emoji + word label below)
    const y = 20 + Math.random() * (GAME_HEIGHT - 140);

    const duck: Duck = {
      id: nextIdRef.current++,
      word,
      x,
      y,
      vx,
      direction,
      spawnedAt: Date.now(),
      isSpecial,
    };

    setState(prev => ({ ...prev, ducks: [...prev.ducks, duck] }));
  }, [language]);

  const gameLoop = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;

      let { ducks, lives, ducksEscaped, combo, maxCombo, currentInput, matchedDuckId } = prev;
      const escaped: number[] = [];

      // Move ducks and check escape
      ducks = ducks.map(d => ({ ...d, x: d.x + d.vx }));

      ducks.forEach(d => {
        const gone = d.direction === 'left'
          ? d.x < -DUCK_WIDTH - 20
          : d.x > GAME_WIDTH + 20;
        if (gone) escaped.push(d.id);
      });

      if (escaped.length > 0) {
        ducks = ducks.filter(d => !escaped.includes(d.id));
        lives -= escaped.length;
        ducksEscaped += escaped.length;
        combo = 0;

        // If matched duck escaped, clear input
        if (matchedDuckId && escaped.includes(matchedDuckId)) {
          currentInput = '';
          matchedDuckId = null;
        }
      }

      if (lives <= 0) {
        return { ...prev, ducks: [], lives: 0, ducksEscaped, combo: 0, maxCombo, phase: 'gameover', currentInput: '', matchedDuckId: null };
      }

      return { ...prev, ducks, lives, ducksEscaped, combo, maxCombo, currentInput, matchedDuckId };
    });

    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startSpawner = useCallback((difficulty: number) => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    const config = getDifficultyConfig(difficulty);
    spawnTimerRef.current = setInterval(spawnDuck, config.spawnInterval);
  }, [spawnDuck]);

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'countdown' }));

    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownInterval);
        const now = Date.now();
        setState({
          ...initialState,
          phase: 'playing',
          startTime: now,
        });
        nextIdRef.current = 1;
        rafRef.current = requestAnimationFrame(gameLoop);
        startSpawner(1);
        // Spawn first duck immediately
        setTimeout(spawnDuck, 300);
      }
    }, 1000);
  }, [gameLoop, startSpawner, spawnDuck]);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    setState(initialState);
  }, []);

  const handleChar = useCallback((char: string) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;

      const newInput = prev.currentInput + char;
      let totalKeystrokes = prev.totalKeystrokes + 1;
      let correctKeystrokes = prev.correctKeystrokes;

      // Find matching duck (prefix match)
      const matches = prev.ducks.filter(d => d.word.startsWith(newInput));

      if (matches.length === 0) {
        // No match — mistype, reset combo
        return {
          ...prev,
          currentInput: '',
          matchedDuckId: null,
          combo: 0,
          totalKeystrokes,
        };
      }

      correctKeystrokes++;

      // Prefer currently matched duck, then pick the one closest to escaping
      let matched = matches.find(d => d.id === prev.matchedDuckId);
      if (!matched) {
        matched = matches.sort((a, b) => {
          const aRemaining = a.direction === 'left' ? a.x + DUCK_WIDTH : GAME_WIDTH - a.x;
          const bRemaining = b.direction === 'left' ? b.x + DUCK_WIDTH : GAME_WIDTH - b.x;
          return aRemaining - bRemaining;
        })[0];
      }

      // Check if word is complete
      if (newInput === matched.word) {
        const newCombo = prev.combo + 1;
        const comboMultiplier = Math.min(3, 1 + newCombo * 0.1);
        const specialBonus = matched.isSpecial ? 1.5 : 1;
        const points = Math.round(matched.word.length * 10 * comboMultiplier * specialBonus);
        const newDucksShot = prev.ducksShot + 1;
        const newDifficulty = Math.min(MAX_DIFFICULTY, 1 + Math.floor(newDucksShot / DUCKS_PER_DIFFICULTY));

        // Restart spawner if difficulty changed
        if (newDifficulty !== prev.difficulty) {
          startSpawner(newDifficulty);
        }

        return {
          ...prev,
          ducks: prev.ducks.filter(d => d.id !== matched!.id),
          currentInput: '',
          matchedDuckId: null,
          score: prev.score + points,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          ducksShot: newDucksShot,
          difficulty: newDifficulty,
          totalKeystrokes,
          correctKeystrokes,
        };
      }

      return {
        ...prev,
        currentInput: newInput,
        matchedDuckId: matched.id,
        totalKeystrokes,
        correctKeystrokes,
      };
    });
  }, [startSpawner]);

  const handleBackspace = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      if (prev.currentInput.length === 0) return prev;

      const newInput = prev.currentInput.slice(0, -1);

      if (newInput.length === 0) {
        return { ...prev, currentInput: '', matchedDuckId: null };
      }

      // Re-evaluate match
      const matches = prev.ducks.filter(d => d.word.startsWith(newInput));
      const matched = matches.find(d => d.id === prev.matchedDuckId) || matches[0] || null;

      return {
        ...prev,
        currentInput: newInput,
        matchedDuckId: matched?.id ?? null,
      };
    });
  }, []);

  return { state, startGame, restart, handleChar, handleBackspace };
}
