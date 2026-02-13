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
    ? <img src={src} alt="" width={size} height={size} style={{ objectFit: 'contain', background: 'transparent', display: 'block', ...style }} />
    : <span style={{ fontSize: `${size}px`, ...style }}>{src}</span>;
}

export { SpriteIcon };

export const MinionWord = memo(function MinionWord({ minion, isMatched, typedLen, now, isMobile, emoji, isBossWord, dimmed, debuffType }: MinionWordProps) {
  const elapsed = now - minion.spawnedAt;
  const timeProgress = Math.min(1, elapsed / minion.timeoutMs);
  const remainSec = Math.max(0, (minion.timeoutMs - elapsed) / 1000);
  const isUrgent = timeProgress > 0.7;

  // Fog debuff: unmatched words are blurry (opacity 0.3), matched words are clear
  const isFoggy = debuffType === 'fog' && !isBossWord && !isMatched;

  // Darkness debuff: unmatched words blink (2s cycle, hidden for 0.5s)
  const isDarknessHidden = debuffType === 'darkness' && !isBossWord && !isMatched
    && (now % 2000) > 1500;

  if (isBossWord) {
    return (
      <div style={{
        position: 'absolute', left: `${minion.x}%`, top: `${minion.y}%`,
        transform: 'translate(-50%, -50%)', zIndex: isMatched ? 12 : 9,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        animation: 'fadeIn 0.3s ease-out',
        opacity: dimmed ? 0.4 : 1, transition: 'opacity 0.3s',
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
        <TimerBar timeProgress={timeProgress} remainSec={remainSec} isUrgent={isUrgent} barColor={isUrgent ? '#f44336' : '#ff6b6b'} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', left: `${minion.x}%`, top: `${minion.y}%`,
      transform: 'translate(-50%, -50%)', zIndex: isMatched ? 10 : 3,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
      animation: 'fadeIn 0.3s ease-out',
      opacity: isDarknessHidden ? 0 : isFoggy ? 0.3 : 1,
      transition: isFoggy ? 'opacity 0.3s' : isDarknessHidden !== undefined ? 'opacity 0.15s' : undefined,
    }}>
      <div style={{
        filter: isMatched ? 'drop-shadow(0 0 6px var(--main-color))' : undefined,
        transition: 'filter 0.15s',
      }}>
        <SpriteIcon src={emoji} size={isMobile ? 60 : 72} />
      </div>
      <div style={{
        padding: '3px 10px', borderRadius: '6px',
        backgroundColor: isMatched ? 'rgba(var(--main-color-rgb, 0,0,0), 0.1)' : isUrgent ? 'rgba(var(--error-color-rgb, 200,50,50), 0.06)' : 'var(--bg-color)',
        border: isMatched ? '2px solid var(--main-color)' : isUrgent ? '2px solid var(--error-color)' : '1px solid var(--sub-alt-color)',
        fontSize: isMobile ? '12px' : '15px', fontWeight: 600, fontFamily: 'monospace', whiteSpace: 'nowrap',
        boxShadow: isMatched ? '0 0 10px rgba(var(--main-color-rgb, 0,0,0), 0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
      }}>
        {minion.word.split('').map((ch, i) => (
          <span key={i} style={{
            color: i < typedLen ? 'var(--main-color)' : isUrgent ? 'var(--error-color)' : 'var(--text-color)',
            fontWeight: i < typedLen ? 700 : 600,
          }}>{ch}</span>
        ))}
      </div>
      <TimerBar timeProgress={timeProgress} remainSec={remainSec} isUrgent={isUrgent} barColor={isUrgent ? '#f44336' : 'var(--main-color)'} />
    </div>
  );
});

function TimerBar({ timeProgress, remainSec, isUrgent, barColor }: { timeProgress: number; remainSec: number; isUrgent: boolean; barColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
      <div style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: 'rgba(128,128,128,0.15)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(1 - timeProgress) * 100}%`,
          backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.2s linear',
        }} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: isUrgent ? '#f44336' : 'rgba(255,255,255,0.5)', minWidth: '28px', textAlign: 'right' }}>
        {remainSec.toFixed(1)}s
      </span>
    </div>
  );
}
