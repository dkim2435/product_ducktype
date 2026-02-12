import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { StageConfig, StageResult, DebuffType, DifficultyLevel } from '../../types/adventure';
import { useCombat } from '../../hooks/useCombat';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSound } from '../../hooks/useSound';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  COUNTDOWN_SECONDS,
  DAMAGE_NUMBER_DURATION_MS,
  KILL_EFFECT_DURATION_MS,
  DIFFICULTY_CONFIGS,
  WORLD_VICTORY_CINEMATICS,
  WORLD_PREVIEWS,
} from '../../constants/adventure';
import { useKeyboardHeight } from '../../hooks/useVisualViewport';
import type { Settings } from '../../types/settings';

interface CombatSceneProps {
  stageConfig: StageConfig;
  settings: Settings;
  onComplete: (result: StageResult) => void;
  onBack: () => void;
  worldId: number;
  debuff: DebuffType;
  difficulty: DifficultyLevel;
  onDifficultyChange: (d: DifficultyLevel) => void;
  stageBestStars: number;     // 0=not cleared, 1=beginner cleared, 2=intermediate cleared, 3=expert cleared
  bossBestStars: number;      // boss stage bestStars — gates difficulty tiers
  prevStageBestStars: number; // previous stage bestStars (-1 = first stage, no prev requirement)
  onTypingStateChange?: (active: boolean) => void;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 420;

// World 1 stage themes
function getW1Theme(stageId: number) {
  switch (stageId) {
    case 1: return {
      bg: 'linear-gradient(180deg, #1a3a1a 0%, #1e4422 30%, #1a3a1a 60%, #162e14 85%, #0f240e 100%)',
      ground: 'linear-gradient(180deg, #1e4422 0%, #152e12 100%)',
      deco: [
        { e: '🌲', x: 1, y: 5, s: 42, o: 0.35 }, { e: '🌲', x: 10, y: 12, s: 34, o: 0.28 },
        { e: '🌳', x: 88, y: 8, s: 38, o: 0.32 }, { e: '🌳', x: 95, y: 18, s: 30, o: 0.25 },
        { e: '🌿', x: 5, y: 68, s: 22, o: 0.2 }, { e: '🌿', x: 92, y: 72, s: 20, o: 0.18 },
        { e: '☁️', x: 25, y: 2, s: 22, o: 0.15 }, { e: '☁️', x: 60, y: 1, s: 18, o: 0.12 },
        { e: '🍃', x: 40, y: 6, s: 14, o: 0.15 },
      ],
    };
    case 2: return {
      bg: 'linear-gradient(180deg, #1a2a3a 0%, #1e3448 25%, #2a4060 50%, #3a3a2e 75%, #2e2a1e 100%)',
      ground: 'linear-gradient(180deg, #3a3020 0%, #2e2818 100%)',
      deco: [
        { e: '🏠', x: 2, y: 6, s: 32, o: 0.3 }, { e: '🏘️', x: 12, y: 14, s: 26, o: 0.25 },
        { e: '🏠', x: 90, y: 10, s: 28, o: 0.28 }, { e: '🌉', x: 50, y: 72, s: 30, o: 0.22 },
        { e: '💧', x: 30, y: 78, s: 14, o: 0.12 }, { e: '💧', x: 65, y: 76, s: 12, o: 0.1 },
        { e: '☁️', x: 35, y: 2, s: 20, o: 0.15 }, { e: '🏮', x: 94, y: 30, s: 16, o: 0.2 },
      ],
    };
    case 3: return {
      bg: 'linear-gradient(180deg, #2a2520 0%, #352e25 25%, #40362a 50%, #3a3025 75%, #302820 100%)',
      ground: 'linear-gradient(180deg, #3a3228 0%, #2e2820 100%)',
      deco: [
        { e: '🏰', x: 1, y: 3, s: 40, o: 0.3 }, { e: '🏛️', x: 90, y: 6, s: 34, o: 0.28 },
        { e: '⛲', x: 50, y: 68, s: 28, o: 0.2 }, { e: '🏠', x: 8, y: 20, s: 22, o: 0.18 },
        { e: '🏠', x: 85, y: 25, s: 20, o: 0.16 }, { e: '🏮', x: 3, y: 40, s: 16, o: 0.18 },
        { e: '🏮', x: 95, y: 45, s: 14, o: 0.16 },
      ],
    };
    case 4: return {
      bg: 'linear-gradient(180deg, #1a2e1a 0%, #1e3820 25%, #224020 50%, #1e3a1e 75%, #182e16 100%)',
      ground: 'linear-gradient(180deg, #1e3a1e 0%, #162e14 100%)',
      deco: [
        { e: '🌸', x: 3, y: 8, s: 30, o: 0.35 }, { e: '🌸', x: 18, y: 4, s: 22, o: 0.28 },
        { e: '🌸', x: 85, y: 6, s: 26, o: 0.3 }, { e: '🌺', x: 92, y: 15, s: 24, o: 0.28 },
        { e: '🌷', x: 5, y: 65, s: 22, o: 0.22 }, { e: '🌷', x: 90, y: 70, s: 20, o: 0.2 },
        { e: '🦋', x: 70, y: 5, s: 18, o: 0.22 }, { e: '🦋', x: 30, y: 10, s: 14, o: 0.18 },
        { e: '🌿', x: 8, y: 50, s: 18, o: 0.15 },
      ],
    };
    case 5: return {
      bg: 'linear-gradient(180deg, #0a0f0a 0%, #0e150e 25%, #0a120a 50%, #080e08 75%, #050a05 100%)',
      ground: 'linear-gradient(180deg, #0e150e 0%, #080e08 100%)',
      deco: [
        { e: '🌲', x: 0, y: 5, s: 44, o: 0.3 }, { e: '🌲', x: 12, y: 10, s: 36, o: 0.25 },
        { e: '🌲', x: 88, y: 8, s: 40, o: 0.28 }, { e: '🌲', x: 96, y: 15, s: 32, o: 0.22 },
        { e: '🌑', x: 50, y: 1, s: 24, o: 0.2 }, { e: '🕷️', x: 78, y: 35, s: 18, o: 0.18 },
        { e: '🕷️', x: 15, y: 42, s: 14, o: 0.14 }, { e: '🍂', x: 40, y: 70, s: 14, o: 0.12 },
        { e: '🍂', x: 60, y: 75, s: 12, o: 0.1 },
      ],
    };
    case 6: return {
      bg: 'linear-gradient(180deg, #1a2030 0%, #1e2838 25%, #252e38 50%, #2a2a28 75%, #222018 100%)',
      ground: 'linear-gradient(180deg, #2a2820 0%, #1e1c16 100%)',
      deco: [
        { e: '⛰️', x: 0, y: 4, s: 48, o: 0.35 }, { e: '🏔️', x: 85, y: 2, s: 44, o: 0.32 },
        { e: '🪨', x: 5, y: 55, s: 24, o: 0.2 }, { e: '🪨', x: 92, y: 60, s: 20, o: 0.18 },
        { e: '🪨', x: 50, y: 72, s: 18, o: 0.15 }, { e: '☁️', x: 30, y: 1, s: 24, o: 0.18 },
        { e: '☁️', x: 65, y: 3, s: 20, o: 0.15 }, { e: '🌬️', x: 45, y: 15, s: 16, o: 0.12 },
      ],
    };
    case 7: return {
      bg: 'linear-gradient(180deg, #18100a 0%, #1e1510 25%, #201812 50%, #1a1210 75%, #120c08 100%)',
      ground: 'linear-gradient(180deg, #1e1510 0%, #120c08 100%)',
      deco: [
        { e: '🕯️', x: 2, y: 10, s: 26, o: 0.35 }, { e: '🕯️', x: 94, y: 15, s: 24, o: 0.32 },
        { e: '🕯️', x: 6, y: 45, s: 20, o: 0.25 }, { e: '🕯️', x: 92, y: 50, s: 18, o: 0.22 },
        { e: '🦴', x: 15, y: 70, s: 20, o: 0.2 }, { e: '🦴', x: 80, y: 72, s: 18, o: 0.18 },
        { e: '🦴', x: 50, y: 75, s: 16, o: 0.15 }, { e: '💀', x: 40, y: 68, s: 16, o: 0.12 },
        { e: '🪨', x: 0, y: 30, s: 30, o: 0.2 }, { e: '🪨', x: 96, y: 35, s: 28, o: 0.18 },
      ],
    };
    case 8: default: return {
      bg: 'linear-gradient(180deg, #10081a 0%, #180e28 20%, #201438 45%, #1a1030 70%, #100820 90%, #080410 100%)',
      ground: 'linear-gradient(180deg, #1a1030 0%, #100820 100%)',
      deco: [
        { e: '🦇', x: 8, y: 5, s: 26, o: 0.3 }, { e: '🦇', x: 82, y: 8, s: 22, o: 0.25 },
        { e: '🦇', x: 35, y: 3, s: 18, o: 0.2 }, { e: '🌙', x: 50, y: 1, s: 28, o: 0.22 },
        { e: '💀', x: 3, y: 60, s: 22, o: 0.2 }, { e: '💀', x: 92, y: 65, s: 20, o: 0.18 },
        { e: '🕸️', x: 0, y: 20, s: 30, o: 0.18 }, { e: '🕸️', x: 92, y: 30, s: 26, o: 0.16 },
        { e: '🔥', x: 5, y: 40, s: 18, o: 0.2 }, { e: '🔥', x: 93, y: 45, s: 16, o: 0.18 },
      ],
    };
  }
}

// World 2 stage themes — Venom Jungle
function getW2Theme(stageId: number) {
  switch (stageId) {
    case 1: return {
      bg: 'linear-gradient(180deg, #0a1f0a 0%, #0e2e0e 30%, #122a12 60%, #0a1e0a 85%, #061206 100%)',
      ground: 'linear-gradient(180deg, #1a3a14 0%, #0e2a0a 100%)',
      deco: [
        { e: '🌴', x: 2, y: 4, s: 44, o: 0.35 }, { e: '🌴', x: 92, y: 8, s: 38, o: 0.3 },
        { e: '🐸', x: 15, y: 65, s: 20, o: 0.22 }, { e: '🐸', x: 80, y: 70, s: 18, o: 0.18 },
        { e: '🌿', x: 5, y: 55, s: 22, o: 0.2 }, { e: '🌿', x: 90, y: 60, s: 20, o: 0.18 },
        { e: '🟢', x: 40, y: 75, s: 12, o: 0.12 }, { e: '☁️', x: 50, y: 1, s: 18, o: 0.1 },
      ],
    };
    case 2: return {
      bg: 'linear-gradient(180deg, #081a08 0%, #0e2a10 25%, #0a2208 50%, #081a06 75%, #041004 100%)',
      ground: 'linear-gradient(180deg, #1a3010 0%, #0e200a 100%)',
      deco: [
        { e: '🌴', x: 0, y: 5, s: 46, o: 0.3 }, { e: '🌴', x: 90, y: 3, s: 42, o: 0.28 },
        { e: '🐍', x: 20, y: 40, s: 20, o: 0.2 }, { e: '🐍', x: 78, y: 45, s: 18, o: 0.18 },
        { e: '🕸️', x: 5, y: 20, s: 24, o: 0.15 }, { e: '🕸️', x: 88, y: 25, s: 22, o: 0.14 },
        { e: '🌿', x: 45, y: 72, s: 18, o: 0.15 },
      ],
    };
    case 3: return {
      bg: 'linear-gradient(180deg, #0e1a0a 0%, #1a2a12 25%, #1e3014 50%, #1a2a10 75%, #0e1a08 100%)',
      ground: 'linear-gradient(180deg, #2a3a18 0%, #1a2a0e 100%)',
      deco: [
        { e: '🟢', x: 10, y: 50, s: 26, o: 0.25 }, { e: '🟢', x: 85, y: 55, s: 22, o: 0.22 },
        { e: '🟢', x: 50, y: 70, s: 20, o: 0.18 }, { e: '🌴', x: 0, y: 6, s: 40, o: 0.28 },
        { e: '🌴', x: 94, y: 4, s: 36, o: 0.25 }, { e: '💧', x: 30, y: 78, s: 14, o: 0.1 },
        { e: '💧', x: 65, y: 76, s: 12, o: 0.08 },
      ],
    };
    case 4: return {
      bg: 'linear-gradient(180deg, #0e180a 0%, #142210 25%, #1a2a14 50%, #142210 75%, #0a1408 100%)',
      ground: 'linear-gradient(180deg, #2a3418 0%, #1a2410 100%)',
      deco: [
        { e: '🦎', x: 12, y: 60, s: 22, o: 0.22 }, { e: '🦎', x: 82, y: 65, s: 20, o: 0.2 },
        { e: '🌴', x: 2, y: 8, s: 42, o: 0.3 }, { e: '🌴', x: 92, y: 6, s: 38, o: 0.28 },
        { e: '🌿', x: 8, y: 45, s: 22, o: 0.18 }, { e: '🌿', x: 88, y: 50, s: 20, o: 0.16 },
        { e: '🟢', x: 45, y: 74, s: 14, o: 0.1 },
      ],
    };
    case 5: return {
      bg: 'linear-gradient(180deg, #0a140a 0%, #0e1e0e 25%, #0a180a 50%, #081408 75%, #040e04 100%)',
      ground: 'linear-gradient(180deg, #1a2a12 0%, #0e1a0a 100%)',
      deco: [
        { e: '🐆', x: 75, y: 30, s: 24, o: 0.2 }, { e: '🌴', x: 0, y: 3, s: 48, o: 0.32 },
        { e: '🌴', x: 88, y: 5, s: 44, o: 0.3 }, { e: '🌴', x: 14, y: 12, s: 36, o: 0.25 },
        { e: '🕸️', x: 5, y: 35, s: 26, o: 0.16 }, { e: '🕸️', x: 92, y: 40, s: 22, o: 0.14 },
        { e: '☠️', x: 50, y: 72, s: 14, o: 0.1 },
      ],
    };
    case 6: return {
      bg: 'linear-gradient(180deg, #1a0e1a 0%, #2a142a 25%, #221022 50%, #1a0e1a 75%, #10061a 100%)',
      ground: 'linear-gradient(180deg, #2a1a2a 0%, #1a0e1a 100%)',
      deco: [
        { e: '🌺', x: 8, y: 15, s: 28, o: 0.3 }, { e: '🌺', x: 85, y: 10, s: 26, o: 0.28 },
        { e: '🌺', x: 50, y: 65, s: 22, o: 0.22 }, { e: '🌴', x: 0, y: 4, s: 42, o: 0.25 },
        { e: '🌴', x: 94, y: 3, s: 38, o: 0.22 }, { e: '🟢', x: 20, y: 70, s: 16, o: 0.12 },
        { e: '🟢', x: 75, y: 72, s: 14, o: 0.1 },
      ],
    };
    case 7: return {
      bg: 'linear-gradient(180deg, #0a120a 0%, #0e1a0e 25%, #0a160a 50%, #08120a 75%, #040a04 100%)',
      ground: 'linear-gradient(180deg, #1a2812 0%, #0e1a0a 100%)',
      deco: [
        { e: '🦍', x: 80, y: 25, s: 26, o: 0.2 }, { e: '🌴', x: 0, y: 5, s: 46, o: 0.3 },
        { e: '🌴', x: 90, y: 3, s: 42, o: 0.28 }, { e: '☠️', x: 12, y: 60, s: 20, o: 0.18 },
        { e: '☠️', x: 84, y: 65, s: 18, o: 0.16 }, { e: '🟢', x: 40, y: 74, s: 16, o: 0.12 },
        { e: '🕸️', x: 5, y: 30, s: 28, o: 0.16 },
      ],
    };
    case 8: return {
      bg: 'linear-gradient(180deg, #081008 0%, #0e1a0e 20%, #0a160a 45%, #081208 70%, #040c04 90%, #020602 100%)',
      ground: 'linear-gradient(180deg, #1a2a14 0%, #0e1a0a 100%)',
      deco: [
        { e: '🌿', x: 5, y: 10, s: 32, o: 0.3 }, { e: '🌿', x: 90, y: 8, s: 30, o: 0.28 },
        { e: '🌴', x: 0, y: 20, s: 40, o: 0.22 }, { e: '🌴', x: 95, y: 18, s: 36, o: 0.2 },
        { e: '☠️', x: 15, y: 55, s: 22, o: 0.18 }, { e: '☠️', x: 80, y: 60, s: 20, o: 0.16 },
        { e: '🕸️', x: 8, y: 40, s: 24, o: 0.14 }, { e: '🟢', x: 50, y: 70, s: 18, o: 0.1 },
      ],
    };
    case 9: default: return {
      bg: 'linear-gradient(180deg, #060a04 0%, #0a1208 15%, #0e1a0a 35%, #0a1408 55%, #081008 75%, #040804 90%, #020402 100%)',
      ground: 'linear-gradient(180deg, #141e0e 0%, #0a1206 100%)',
      deco: [
        { e: '☠️', x: 3, y: 8, s: 28, o: 0.3 }, { e: '☠️', x: 90, y: 6, s: 26, o: 0.28 },
        { e: '☠️', x: 50, y: 70, s: 22, o: 0.2 }, { e: '🐍', x: 10, y: 40, s: 22, o: 0.18 },
        { e: '🐍', x: 85, y: 45, s: 20, o: 0.16 }, { e: '🌴', x: 0, y: 15, s: 44, o: 0.22 },
        { e: '🌴', x: 94, y: 12, s: 40, o: 0.2 }, { e: '🟢', x: 25, y: 65, s: 18, o: 0.14 },
        { e: '🟢', x: 70, y: 68, s: 16, o: 0.12 }, { e: '🕸️', x: 5, y: 55, s: 26, o: 0.14 },
      ],
    };
  }
}

function getStageTheme(worldId: number, stageId: number) {
  if (worldId === 2) return getW2Theme(stageId);
  return getW1Theme(stageId);
}

export function CombatScene({ stageConfig, settings, onComplete, onBack, worldId, debuff, difficulty, onDifficultyChange, stageBestStars, bossBestStars, prevStageBestStars, onTypingStateChange }: CombatSceneProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { playClick, playError } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
    theme: settings.soundTheme,
  });

  // Sequential difficulty unlock:
  // Intermediate: boss cleared on Beginner + previous stage cleared on Intermediate (or first stage)
  // Expert: boss cleared on Intermediate + previous stage cleared on Expert (or first stage)
  const isDiffUnlocked = useCallback((d: DifficultyLevel) => {
    if (d === 'beginner') return true;
    if (d === 'intermediate') {
      if (bossBestStars < 1) return false; // boss not cleared on beginner
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 2; // prev stage cleared on intermediate
    }
    if (d === 'expert') {
      if (bossBestStars < 2) return false; // boss not cleared on intermediate
      if (prevStageBestStars === -1) return true; // first stage
      return prevStageBestStars >= 3; // prev stage cleared on expert
    }
    return false;
  }, [bossBestStars, prevStageBestStars]);

  // Auto-select highest unlocked difficulty
  useEffect(() => {
    const best: DifficultyLevel = isDiffUnlocked('expert') ? 'expert'
      : isDiffUnlocked('intermediate') ? 'intermediate'
      : 'beginner';
    if (difficulty !== best) {
      onDifficultyChange(best);
    }
  }, [isDiffUnlocked, onDifficultyChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveDifficulty = isDiffUnlocked(difficulty) ? difficulty : 'beginner';

  const { state, startCountdown, handleChar, handleBackspace } = useCombat(stageConfig, onComplete, debuff, effectiveDifficulty, stageBestStars);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [, setTick] = useState(0);

  // Re-render every 100ms during combat for smooth timer countdown
  useEffect(() => {
    if (state.phase !== 'fighting' && state.phase !== 'wave-clear' && state.phase !== 'boss-transition' && state.phase !== 'boss-death') return;
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, [state.phase]);

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
    if (state.phase === 'fighting') {
      focusInput();
      // Scroll game area into view on mobile when keyboard opens
      if (isMobile) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [state.phase, focusInput, isMobile]);

  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;
  const inputDisplayRef = useRef<HTMLDivElement>(null);

  // Notify parent of typing state (fighting phase) to hide header/footer
  useEffect(() => {
    const active = state.phase === 'fighting';
    onTypingStateChange?.(active);
    return () => onTypingStateChange?.(false);
  }, [state.phase, onTypingStateChange]);

  // Scroll input into view when virtual keyboard opens on mobile
  useEffect(() => {
    if (isMobile && keyboardOpen && inputDisplayRef.current) {
      inputDisplayRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isMobile, keyboardOpen]);

  const playerHpPercent = (state.playerHp / state.playerMaxHp) * 100;
  const bossHpPercent = state.bossMaxHp > 0 ? (state.bossHp / state.bossMaxHp) * 100 : 0;
  const now = Date.now();
  const theme = getStageTheme(worldId, stageConfig.id);

  // Mobile: scale by width, and also shrink when keyboard is open
  const widthScale = isMobile ? Math.min(window.innerWidth - 32, GAME_WIDTH) / GAME_WIDTH : 1;
  const mobileGameHeight = keyboardOpen && isMobile
    ? Math.min(GAME_HEIGHT, window.innerHeight - keyboardHeight - 100) // 100 = HUD + input + gaps
    : GAME_HEIGHT;
  const heightScale = isMobile && keyboardOpen ? mobileGameHeight / GAME_HEIGHT : 1;
  const gameScale = isMobile ? Math.min(widthScale, heightScale) : 1;
  const containerWidth = isMobile ? '100%' : `${GAME_WIDTH}px`;
  const isBoss = stageConfig.isBoss;
  const bossWordMinions = state.minions.filter(m => m.isBossWord);
  const shieldMinions = state.minions.filter(m => !m.isBossWord);
  const bossShielded = isBoss && shieldMinions.length > 0;
  const isPoisoned = debuff === 'poison';

  return (
    <div className="fade-in" style={{
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      padding: isMobile && state.phase === 'fighting' ? '0' : 'var(--page-vertical-padding) 0',
    }}>
      <textarea
        ref={inputRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          opacity: 0, width: '1px', height: '1px',
          padding: 0, border: 'none', outline: 'none', resize: 'none',
          fontSize: '16px', overflow: 'hidden', pointerEvents: 'none',
        }}
        autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
        tabIndex={-1}
      />

      {/* INTRO */}
      {state.phase === 'intro' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '20px', padding: '40px 20px',
        }}>
          <div style={{ fontSize: '56px' }}>{stageConfig.enemyConfig.emoji}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-color)' }}>
            {stageConfig.name}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--sub-color)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
            {stageConfig.subtitle}
          </p>
          <div style={{
            display: 'flex', gap: '16px', alignItems: 'center',
            padding: '12px 20px', backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)', fontSize: '13px', color: 'var(--sub-color)',
          }}>
            <span>{stageConfig.enemyConfig.name}</span>
            {isBoss && <span>HP: {stageConfig.enemyConfig.hp}</span>}
            {isBoss && <span style={{ color: 'var(--error-color)', fontWeight: 700 }}>BOSS</span>}
          </div>

          {/* Difficulty selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '400px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sub-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Difficulty
            </span>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {(['beginner', 'intermediate', 'expert'] as DifficultyLevel[]).map(d => {
                const cfg = DIFFICULTY_CONFIGS[d];
                const unlocked = isDiffUnlocked(d);
                const isSelected = d === effectiveDifficulty && unlocked;
                return (
                  <button
                    key={d}
                    onClick={() => unlocked && onDifficultyChange(d)}
                    disabled={!unlocked}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: '8px',
                      backgroundColor: isSelected ? `${cfg.color}18` : 'var(--sub-alt-color)',
                      border: isSelected ? `2px solid ${cfg.color}` : '2px solid transparent',
                      cursor: unlocked ? 'pointer' : 'default',
                      opacity: unlocked ? 1 : 0.4,
                      transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <div style={{ fontSize: '14px', letterSpacing: '2px' }}>
                      {unlocked
                        ? <>{'★'.repeat(cfg.maxStars)}{'☆'.repeat(3 - cfg.maxStars)}</>
                        : '🔒'}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: 700,
                      color: isSelected ? cfg.color : 'var(--sub-color)',
                    }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--sub-color)', lineHeight: 1.3 }}>
                      {unlocked
                        ? <>{cfg.mistypeDamage === 0 ? 'No penalty' : `Mistype: -${cfg.mistypeDamage} HP`}{' · '}{cfg.xpMultiplier}x XP</>
                        : `Clear on ${d === 'intermediate' ? 'Beginner' : 'Intermediate'} first`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Debuff warning */}
          {isPoisoned && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '8px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              fontSize: '13px', fontWeight: 700, color: '#4caf50',
            }}>
              <span style={{ fontSize: '18px' }}>☠️</span>
              POISON: -0.5 HP per second during combat
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={onBack} style={{
              padding: '10px 24px', fontSize: '13px', fontWeight: 600,
              color: 'var(--sub-color)', backgroundColor: 'var(--sub-alt-color)',
              borderRadius: 'var(--border-radius)', cursor: 'pointer',
            }}>{t('adventure.back')}</button>
            <button onClick={startCountdown} style={{
              padding: '12px 36px', fontSize: '15px', fontWeight: 700,
              color: 'var(--bg-color)', backgroundColor: 'var(--main-color)',
              borderRadius: 'var(--border-radius)', cursor: 'pointer',
            }}>{t('adventure.fight')}</button>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {state.phase === 'countdown' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${GAME_HEIGHT}px` }}>
          <span style={{ fontSize: '96px', fontWeight: 700, color: 'var(--main-color)', animation: 'pulse 0.5s ease-in-out' }}>
            {countdown}
          </span>
        </div>
      )}

      {/* FIGHTING / WAVE-CLEAR / BOSS-TRANSITION / BOSS-DEATH */}
      {(state.phase === 'fighting' || state.phase === 'wave-clear' || state.phase === 'boss-transition' || state.phase === 'boss-death') && (
        <div onClick={focusInput} style={{ cursor: 'text' }}>
          {/* HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile && keyboardOpen ? '4px' : '8px', gap: '12px' }}>
            {/* Player HP */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile && keyboardOpen ? '10px' : '12px', color: 'var(--sub-color)', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                <span>🐤 {t('adventure.player')}</span>
                <span>{Math.max(0, state.playerHp)}/{state.playerMaxHp}</span>
              </div>
              <div style={{ height: isMobile && keyboardOpen ? '6px' : '8px', backgroundColor: 'var(--sub-alt-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${playerHpPercent}%`,
                  backgroundColor: playerHpPercent > 50 ? '#4caf50' : playerHpPercent > 25 ? '#ff9800' : '#f44336',
                  borderRadius: '4px', transition: 'width 0.3s, background-color 0.3s',
                }} />
              </div>
            </div>

            {/* Wave / Combo + Poison HUD */}
            <div style={{ textAlign: 'center', minWidth: isMobile ? '80px' : '100px' }}>
              {!isBoss && (
                <div style={{ fontSize: '11px', color: 'var(--sub-color)' }}>
                  {t('adventure.wave')} {state.currentWave + 1}/{stageConfig.waves.length}
                </div>
              )}
              {isBoss && stageConfig.bossConfig && (
                <div style={{ fontSize: '11px', color: 'var(--error-color)', fontWeight: 700 }}>
                  Phase {state.bossPhase + 1}/{stageConfig.bossConfig.phases.length}
                </div>
              )}
              <div style={{
                fontSize: '14px', fontWeight: 700,
                color: state.combo >= 10 ? 'var(--main-color)' : 'var(--text-color)',
                visibility: state.combo > 0 ? 'visible' : 'hidden',
              }}>
                x{state.combo || 1} {state.combo >= 5 ? '🔥' : ''}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 700, marginTop: '2px',
                color: DIFFICULTY_CONFIGS[effectiveDifficulty].color,
              }}>
                {'★'.repeat(DIFFICULTY_CONFIGS[effectiveDifficulty].maxStars)} {DIFFICULTY_CONFIGS[effectiveDifficulty].label}
              </div>
              {isPoisoned && (
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#4caf50', marginTop: '2px' }}>
                  ☠️ POISON -0.5/s
                </div>
              )}
            </div>

            {/* Boss HP or enemy info */}
            {isBoss ? (
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile && keyboardOpen ? '10px' : '12px', color: 'var(--sub-color)', marginBottom: isMobile && keyboardOpen ? '2px' : '4px' }}>
                  <span>{Math.max(0, state.bossHp)}/{state.bossMaxHp}</span>
                  <span>{stageConfig.enemyConfig.emoji} {stageConfig.enemyConfig.name}</span>
                </div>
                <div style={{ height: isMobile && keyboardOpen ? '6px' : '8px', backgroundColor: 'var(--sub-alt-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${bossHpPercent}%`,
                    backgroundColor: '#f44336', borderRadius: '4px',
                    transition: 'width 0.3s', marginLeft: 'auto',
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--sub-color)' }}>
                  {stageConfig.enemyConfig.emoji} {stageConfig.enemyConfig.name}
                </span>
              </div>
            )}
          </div>

          {/* GAME FIELD */}
          <div style={{
            position: 'relative',
            width: containerWidth,
            height: `${GAME_HEIGHT * gameScale}px`,
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            margin: '0 auto',
            background: theme.bg,
            border: '1px solid var(--sub-alt-color)',
            transform: isMobile ? `scale(${gameScale})` : undefined,
            transformOrigin: 'top center',
          }}>
            {/* Decorations */}
            {theme.deco.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                fontSize: `${d.s}px`, opacity: d.o,
                userSelect: 'none', pointerEvents: 'none',
              }}>{d.e}</div>
            ))}

            {/* Ground */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px',
              background: theme.ground, pointerEvents: 'none',
            }} />

            {/* Poison overlay */}
            {isPoisoned && state.phase === 'fighting' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 180, 0, 0.06) 100%)',
                pointerEvents: 'none', zIndex: 25,
              }} />
            )}

            {/* BOSS */}
            {isBoss && state.bossHp > 0 && (
              <div style={{
                position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                zIndex: 8,
              }}>
                <div style={{
                  fontSize: isMobile ? '52px' : '72px',
                  filter: bossShielded ? 'brightness(0.8)' : undefined,
                  transition: 'filter 0.3s',
                }}>
                  {stageConfig.enemyConfig.emoji}
                </div>
                {bossShielded && (
                  <div style={{
                    fontSize: '11px', fontWeight: 700, color: 'var(--sub-color)',
                    backgroundColor: 'var(--sub-alt-color)', padding: '2px 10px',
                    borderRadius: '4px', opacity: 0.8,
                  }}>
                    🛡️ SHIELDED
                  </div>
                )}
              </div>
            )}

            {/* BOSS WORD MINIONS */}
            {bossWordMinions.map(minion => {
              const isMatched = minion.id === state.matchedMinionId;
              const typedLen = isMatched ? state.currentInput.length : 0;
              const elapsed = now - minion.spawnedAt;
              const timeProgress = Math.min(1, elapsed / minion.timeoutMs);
              const remainSec = Math.max(0, (minion.timeoutMs - elapsed) / 1000);
              const isUrgent = timeProgress > 0.7;

              return (
                <div key={minion.id} style={{
                  position: 'absolute', left: `${minion.x}%`, top: `${minion.y}%`,
                  transform: 'translate(-50%, -50%)', zIndex: isMatched ? 12 : 9,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  animation: 'fadeIn 0.3s ease-out',
                  opacity: bossShielded ? 0.4 : 1, transition: 'opacity 0.3s',
                }}>
                  <div style={{
                    padding: '5px 14px', borderRadius: '8px',
                    backgroundColor: isMatched ? 'rgba(var(--main-color-rgb, 0,0,0), 0.12)' : isUrgent ? 'rgba(var(--error-color-rgb, 200,50,50), 0.08)' : 'var(--bg-color)',
                    border: isMatched ? '2px solid var(--main-color)' : '2px solid var(--error-color)',
                    fontSize: isMobile ? '15px' : '18px', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap',
                    boxShadow: isMatched ? '0 0 14px rgba(var(--main-color-rgb, 0,0,0), 0.25)' : '0 0 10px rgba(var(--error-color-rgb, 200,50,50), 0.15)',
                  }}>
                    {minion.word.split('').map((ch, i) => (
                      <span key={i} style={{
                        color: i < typedLen ? 'var(--main-color)' : 'var(--error-color)',
                        fontWeight: i < typedLen ? 700 : 600,
                      }}>{ch}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: 'rgba(128,128,128,0.15)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(1 - timeProgress) * 100}%`,
                        backgroundColor: isUrgent ? '#f44336' : '#ff6b6b', borderRadius: '2px', transition: 'width 0.2s linear',
                      }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: isUrgent ? '#f44336' : 'rgba(255,255,255,0.5)', minWidth: '28px', textAlign: 'right' }}>
                      {remainSec.toFixed(1)}s
                    </span>
                  </div>
                </div>
              );
            })}

            {/* SHIELD MINIONS */}
            {shieldMinions.map(minion => {
              const isMatched = minion.id === state.matchedMinionId;
              const typedLen = isMatched ? state.currentInput.length : 0;
              const elapsed = now - minion.spawnedAt;
              const timeProgress = Math.min(1, elapsed / minion.timeoutMs);
              const remainSec = Math.max(0, (minion.timeoutMs - elapsed) / 1000);
              const isUrgent = timeProgress > 0.7;
              const minionEmoji = isBoss && stageConfig.bossConfig ? stageConfig.bossConfig.minionEmoji : stageConfig.enemyConfig.emoji;

              return (
                <div key={minion.id} style={{
                  position: 'absolute', left: `${minion.x}%`, top: `${minion.y}%`,
                  transform: 'translate(-50%, -50%)', zIndex: isMatched ? 10 : 3,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  animation: 'fadeIn 0.3s ease-out',
                }}>
                  <div style={{
                    fontSize: isMobile ? '24px' : '30px',
                    filter: isMatched ? 'drop-shadow(0 0 6px var(--main-color))' : undefined,
                    transition: 'filter 0.15s',
                  }}>
                    {minionEmoji}
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: '6px',
                    backgroundColor: isMatched ? 'rgba(var(--main-color-rgb, 0,0,0), 0.1)' : isUrgent ? 'rgba(var(--error-color-rgb, 200,50,50), 0.06)' : 'var(--bg-color)',
                    border: isMatched ? '2px solid var(--main-color)' : isUrgent ? '2px solid var(--error-color)' : '1px solid var(--sub-alt-color)',
                    fontSize: isMobile ? '13px' : '16px', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap',
                    boxShadow: isMatched ? '0 0 10px rgba(var(--main-color-rgb, 0,0,0), 0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
                  }}>
                    {minion.word.split('').map((ch, i) => (
                      <span key={i} style={{
                        color: i < typedLen ? 'var(--main-color)' : isUrgent ? 'var(--error-color)' : 'var(--text-color)',
                        fontWeight: i < typedLen ? 700 : 600,
                      }}>{ch}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: 'rgba(128,128,128,0.15)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(1 - timeProgress) * 100}%`,
                        backgroundColor: isUrgent ? '#f44336' : 'var(--main-color)', borderRadius: '2px', transition: 'width 0.2s linear',
                      }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: isUrgent ? '#f44336' : 'rgba(255,255,255,0.5)', minWidth: '28px', textAlign: 'right' }}>
                      {remainSec.toFixed(1)}s
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Kill effects */}
            {state.killEffects.map(k => {
              const age = now - k.createdAt;
              const progress = Math.min(1, age / KILL_EFFECT_DURATION_MS);
              return (
                <div key={k.id} style={{
                  position: 'absolute', left: `${k.x}%`, top: `${k.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 + progress * 0.5})`,
                  fontSize: '28px', opacity: 1 - progress, pointerEvents: 'none', zIndex: 15,
                }}>💥</div>
              );
            })}

            {/* Damage numbers */}
            {state.damageNumbers.map(dmg => {
              const age = now - dmg.createdAt;
              const progress = Math.min(1, age / DAMAGE_NUMBER_DURATION_MS);
              return (
                <div key={dmg.id} style={{
                  position: 'absolute', left: `${dmg.x}%`, top: `${dmg.y - progress * 15}%`,
                  fontSize: dmg.isPlayer ? '16px' : '22px', fontWeight: 700,
                  color: dmg.isPlayer ? '#f44336' : 'var(--main-color)',
                  opacity: 1 - progress, pointerEvents: 'none', transform: 'translateX(-50%)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)', zIndex: 20,
                }}>-{dmg.value}</div>
              );
            })}

            {/* Player duck */}
            <div style={{
              position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
              fontSize: isMobile ? '42px' : '56px', zIndex: 6,
            }}>🐤</div>

            {/* Waiting for words */}
            {state.minions.length === 0 && state.phase === 'fighting' && !isBoss && (
              <div style={{
                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '13px', color: 'var(--sub-color)', opacity: 0.5, pointerEvents: 'none',
              }}>
                {t('adventure.waitingForWords')}
              </div>
            )}

            {/* Wave clear overlay */}
            {state.phase === 'wave-clear' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.12)', zIndex: 30,
              }}>
                <div style={{
                  fontSize: '22px', fontWeight: 700, color: 'var(--main-color)',
                  backgroundColor: 'var(--bg-color)', padding: '14px 36px',
                  borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                  animation: 'pulse 0.5s',
                }}>
                  {t('adventure.waveClear')}
                </div>
              </div>
            )}

            {/* Boss dialogue overlay */}
            {state.bossDialogue && state.phase === 'boss-transition' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 30,
              }}>
                <div style={{
                  fontSize: '15px', fontStyle: 'italic', fontWeight: 600,
                  color: 'var(--error-color)', backgroundColor: 'var(--bg-color)',
                  padding: '16px 28px', borderRadius: '12px',
                  border: '2px solid var(--error-color)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  maxWidth: '80%', textAlign: 'center', animation: 'fadeIn 0.5s',
                }}>
                  {state.bossDialogue}
                </div>
              </div>
            )}

            {/* Boss death overlay */}
            {state.phase === 'boss-death' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 35,
                pointerEvents: 'none',
              }}>
                {/* Boss emoji shaking and fading */}
                <div style={{
                  position: 'absolute', top: '2%', left: '50%',
                  fontSize: isMobile ? '52px' : '72px',
                  animation: 'boss-shake 2.5s ease-out forwards',
                  zIndex: 36,
                }}>
                  {stageConfig.enemyConfig.emoji}
                </div>

                {/* "꾸엑!!" death cry text */}
                <div style={{
                  position: 'absolute', top: '25%', left: '50%',
                  fontSize: isMobile ? '28px' : '36px', fontWeight: 900,
                  color: '#f44336',
                  textShadow: '0 2px 8px rgba(244,67,54,0.5)',
                  animation: 'boss-death-text 2s ease-out forwards',
                  zIndex: 37, whiteSpace: 'nowrap',
                }}>
                  QUACK!!
                </div>

                {/* Explosion effects */}
                {[
                  { x: 45, y: 8, delay: 0, size: 36 },
                  { x: 55, y: 12, delay: 0.2, size: 32 },
                  { x: 40, y: 18, delay: 0.4, size: 28 },
                  { x: 60, y: 15, delay: 0.6, size: 34 },
                  { x: 50, y: 5, delay: 0.8, size: 30 },
                ].map((exp, i) => (
                  <div key={i} style={{
                    position: 'absolute', left: `${exp.x}%`, top: `${exp.y}%`,
                    fontSize: `${exp.size}px`,
                    animation: `boss-death-explosion 0.8s ease-out ${exp.delay}s both`,
                    zIndex: 38,
                  }}>
                    💥
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input display */}
          {state.phase === 'fighting' && (
            <div ref={inputDisplayRef} style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '6px' : '12px' }}>
              <div style={{
                padding: '8px 24px', minWidth: '200px', textAlign: 'center',
                backgroundColor: 'var(--sub-alt-color)', borderRadius: 'var(--border-radius)',
                border: state.currentInput ? '2px solid var(--main-color)' : '2px solid transparent',
                fontSize: '18px', fontWeight: 600, fontFamily: 'monospace',
                color: state.currentInput ? 'var(--main-color)' : 'var(--sub-color)',
                transition: 'border-color 0.15s', minHeight: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {state.currentInput || (
                  <span style={{ opacity: 0.4, fontSize: '13px', fontFamily: 'inherit' }}>
                    {t('adventure.typeToAttack')}
                  </span>
                )}
                <span className="caret-blink" style={{
                  display: 'inline-block', width: '2px', height: '20px',
                  backgroundColor: 'var(--main-color)', marginLeft: '2px',
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VICTORY */}
      {state.phase === 'victory' && (
        isBoss && WORLD_VICTORY_CINEMATICS[worldId] ? (
          /* Cinematic victory for boss stages */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '20px', padding: '40px 20px',
            textAlign: 'center', minHeight: `${GAME_HEIGHT}px`,
            backgroundColor: 'var(--bg-color)',
          }}>
            {/* World emoji */}
            <div style={{
              fontSize: '64px',
              animation: 'cinematic-fade-in 1s ease-out both',
            }}>
              {WORLD_PREVIEWS.find(w => w.id === worldId)?.emoji ?? '🎉'}
            </div>

            {/* Cinematic title */}
            <h2 style={{
              fontSize: isMobile ? '20px' : '26px', fontWeight: 700,
              color: 'var(--text-color)',
              animation: 'cinematic-fade-in 1.2s ease-out 0.5s both',
              lineHeight: 1.4, maxWidth: '500px',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].title}
            </h2>

            {/* Cinematic subtitle */}
            <p style={{
              fontSize: isMobile ? '13px' : '15px', fontStyle: 'italic',
              color: 'var(--sub-color)',
              animation: 'cinematic-fade-in 1.2s ease-out 1.2s both',
              maxWidth: '400px',
            }}>
              {WORLD_VICTORY_CINEMATICS[worldId].subtitle}
            </p>

            {/* Victory badge (delayed) */}
            <div style={{
              animation: 'cinematic-fade-in 0.8s ease-out 2s both',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            }}>
              <div style={{ fontSize: '40px' }}>🎉</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--main-color)' }}>
                {t('adventure.victory')}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--sub-color)' }}>
                {stageConfig.name} {t('adventure.cleared')}
              </p>
            </div>
          </div>
        ) : (
          /* Normal victory for regular stages */
          <div className="slide-up" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '16px', padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '56px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--main-color)' }}>
              {t('adventure.victory')}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--sub-color)' }}>
              {stageConfig.name} {t('adventure.cleared')}
            </p>
          </div>
        )
      )}

      {/* DEFEAT */}
      {state.phase === 'defeat' && (
        <div className="slide-up" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '16px', padding: '40px 20px', textAlign: 'center',
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
