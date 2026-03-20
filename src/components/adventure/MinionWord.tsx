import { memo } from 'react';
import type { FieldMinion, DebuffType } from '../../types/adventure';

interface MinionWordProps {
  minion: FieldMinion;
  isMatched: boolean;
  typedLen: number;
  now: number;
  isMobile: boolean;
  emoji: string;
  isBossWord: boolean;
  dimmed?: boolean;
  debuffType?: DebuffType;
}

function isImagePath(s: string) { return s.startsWith('/'); }

function SpriteIcon({ src, size, style }: { src: string; size: number; style?: React.CSSProperties }) {
  return isImagePath(src)
    ? <img src={src} alt="" width={size} height={size} className="object-contain bg-transparent block" style={style} />
    : <span style={{ fontSize: `${size}px`, ...style }}>{src}</span>;
}

export { SpriteIcon };

export const MinionWord = memo(function MinionWord({ minion, isMatched, typedLen, now, isMobile, emoji, isBossWord, dimmed, debuffType }: MinionWordProps) {
  const elapsed = now - minion.spawnedAt;
  const timeProgress = Math.min(1, elapsed / minion.timeoutMs);
  const remainSec = Math.max(0, (minion.timeoutMs - elapsed) / 1000);
  const isUrgent = timeProgress > 0.7;

  // Fog debuff: words start clear, gradually fade into fog over 2.5s. Matched = clear.
  const isFogActive = debuffType === 'fog' && !isBossWord && !isMatched;
  const fogProgress = isFogActive ? Math.min(1, elapsed / 2500) : 0; // 0→1 over 2.5s
  const fogOpacity = isFogActive ? 1 - fogProgress * 0.82 : 1;      // 1.0 → 0.18
  const fogBlur = isFogActive ? fogProgress * 4 : 0;                 // 0px → 4px

  // Freeze debuff: word is frozen (can't be typed) — show ice effect
  const isFrozen = !!minion.frozenUntil && now < minion.frozenUntil;

  // Darkness debuff: unmatched words blink (2s cycle, hidden for 1s)
  const isDarknessHidden = debuffType === 'darkness' && !isBossWord && !isMatched
    && (now % 2000) > 1000;

  if (isBossWord) {
    return (
      <div className="absolute flex flex-col items-center gap-[3px]" style={{
        left: `${minion.x}%`, top: `${minion.y}%`,
        transform: 'translate(-50%, -50%)', zIndex: isMatched ? 12 : 9,
        animation: 'fadeIn 0.3s ease-out',
        opacity: dimmed ? 0.4 : 1, transition: 'opacity 0.3s',
      }}>
        <div className="rounded-[8px] whitespace-nowrap font-semibold font-mono" style={{
          padding: '5px 14px',
          fontSize: isMobile ? '15px' : '18px',
          backgroundColor: isMatched ? 'rgba(var(--main-color-rgb, 0,0,0), 0.12)' : isUrgent ? 'rgba(var(--error-color-rgb, 200,50,50), 0.08)' : 'var(--bg-color)',
          border: isMatched ? '2px solid var(--main-color)' : '2px solid var(--error-color)',
          boxShadow: isMatched ? '0 0 14px rgba(var(--main-color-rgb, 0,0,0), 0.25)' : '0 0 10px rgba(var(--error-color-rgb, 200,50,50), 0.15)',
        }}>
          {minion.word.split('').map((ch, i) => (
            <span key={i} style={{
              color: i < typedLen ? 'var(--main-color)' : 'var(--error-color)',
              fontWeight: i < typedLen ? 700 : 600,
            }}>{ch}</span>
          ))}
        </div>
        <TimerBar timeProgress={timeProgress} remainSec={remainSec} isUrgent={isUrgent} barColor={isUrgent ? '#f44336' : '#ff6b6b'} />
      </div>
    );
  }

  return (
    <div className="absolute flex flex-col items-center gap-0.5" style={{
      left: `${minion.x}%`, top: `${minion.y}%`,
      transform: 'translate(-50%, -50%)', zIndex: isMatched ? 10 : 3,
      animation: 'fadeIn 0.3s ease-out',
      opacity: isDarknessHidden ? 0 : fogOpacity,
      filter: fogBlur > 0 ? `blur(${fogBlur}px)` : undefined,
      transition: isMatched ? 'opacity 0.2s, filter 0.2s' : isDarknessHidden !== undefined ? 'opacity 0.15s' : undefined,
    }}>
      <div className="transition-[filter] duration-150" style={{
        filter: isFrozen ? 'drop-shadow(0 0 8px #00c8ff) brightness(1.2)' : isMatched ? 'drop-shadow(0 0 6px var(--main-color))' : undefined,
      }}>
        <SpriteIcon src={emoji} size={isMobile ? 60 : 72} />
      </div>
      <div className="rounded-[6px] whitespace-nowrap font-semibold font-mono" style={{
        padding: '3px 10px',
        fontSize: isMobile ? '12px' : '15px',
        backgroundColor: isFrozen ? 'rgba(0, 200, 255, 0.12)' : isMatched ? 'rgba(var(--main-color-rgb, 0,0,0), 0.1)' : isUrgent ? 'rgba(var(--error-color-rgb, 200,50,50), 0.06)' : 'var(--bg-color)',
        border: isFrozen ? '2px solid #00c8ff' : isMatched ? '2px solid var(--main-color)' : isUrgent ? '2px solid var(--error-color)' : '1px solid var(--sub-alt-color)',
        boxShadow: isFrozen ? '0 0 12px rgba(0, 200, 255, 0.3)' : isMatched ? '0 0 10px rgba(var(--main-color-rgb, 0,0,0), 0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        {minion.word.split('').map((ch, i) => (
          <span key={i} style={{
            color: isFrozen ? '#00c8ff' : i < typedLen ? 'var(--main-color)' : isUrgent ? 'var(--error-color)' : 'var(--text-color)',
            fontWeight: i < typedLen ? 700 : 600,
          }}>{ch}</span>
        ))}
      </div>
      <TimerBar timeProgress={timeProgress} remainSec={remainSec} isUrgent={isUrgent} barColor={isFrozen ? '#00c8ff' : isUrgent ? '#f44336' : 'var(--main-color)'} />
    </div>
  );
});

function TimerBar({ timeProgress, remainSec, isUrgent, barColor }: { timeProgress: number; remainSec: number; isUrgent: boolean; barColor: string }) {
  return (
    <div className="flex items-center gap-1 w-full">
      <div className="flex-1 h-[3px] rounded-sm overflow-hidden" style={{ backgroundColor: 'rgba(128,128,128,0.15)' }}>
        <div className="h-full rounded-sm transition-[width] duration-200" style={{
          width: `${(1 - timeProgress) * 100}%`,
          backgroundColor: barColor,
          transitionTimingFunction: 'linear',
        }} />
      </div>
      <span className="text-[10px] font-bold font-mono min-w-[28px] text-right" style={{ color: isUrgent ? '#f44336' : 'rgba(255,255,255,0.5)' }}>
        {remainSec.toFixed(1)}s
      </span>
    </div>
  );
}
