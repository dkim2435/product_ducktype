import { useIsMobile } from '../../hooks/useIsMobile';
import type { GhostRacer } from '../../types/duckRace';

interface RaceTrackProps {
  ghosts: GhostRacer[];
  playerProgress: number;
  playerWpm: number;
  playerFinished: boolean;
}

interface LaneProps {
  emoji: string;
  name: string;
  wpm: number;
  progress: number;
  isPlayer: boolean;
  finished: boolean;
  trackWidth: number;
  laneIndex: number;
}

function Lane({ emoji, name, wpm, progress, isPlayer, finished, trackWidth, laneIndex }: LaneProps) {
  const duckSize = 32;
  const padding = 40;
  const usableWidth = trackWidth - padding * 2 - duckSize;
  const left = padding + progress * usableWidth;

  return (
    <div style={{
      position: 'relative',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      backgroundColor: isPlayer ? 'rgba(var(--main-color-rgb, 100,149,237), 0.06)' : undefined,
    }}>
      {/* Lane line */}
      <div style={{
        position: 'absolute',
        left: `${padding}px`,
        right: `${padding}px`,
        top: '50%',
        height: '1px',
        background: 'rgba(255,255,255,0.06)',
        zIndex: 0,
      }} />

      {/* Progress track (filled portion) */}
      <div style={{
        position: 'absolute',
        left: `${padding}px`,
        top: '50%',
        height: '2px',
        marginTop: '-1px',
        width: `${progress * usableWidth}px`,
        background: isPlayer ? 'var(--main-color)' : 'var(--sub-color)',
        opacity: isPlayer ? 0.4 : 0.15,
        borderRadius: '1px',
        transition: 'width 0.1s linear',
        zIndex: 0,
      }} />

      {/* Duck */}
      <div style={{
        position: 'absolute',
        left: `${left}px`,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 1,
        transition: 'left 0.1s linear',
      }}>
        <span style={{
          fontSize: '22px',
          filter: isPlayer ? 'drop-shadow(0 0 6px var(--main-color))' : undefined,
        }}>
          {finished ? '\uD83C\uDFC1' : emoji}
        </span>
      </div>

      {/* Label (left side) */}
      <div style={{
        position: 'absolute',
        left: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 2,
      }}>
        <span style={{
          fontSize: '9px',
          fontWeight: isPlayer ? 700 : 500,
          color: isPlayer ? 'var(--main-color)' : 'var(--sub-color)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          opacity: 0.8,
        }}>
          {laneIndex + 1}.
        </span>
      </div>

      {/* WPM label (right side) */}
      <div style={{
        position: 'absolute',
        right: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '10px',
        fontWeight: 600,
        color: isPlayer ? 'var(--main-color)' : 'var(--sub-color)',
        fontVariantNumeric: 'tabular-nums',
        opacity: 0.7,
        zIndex: 2,
      }}>
        {wpm > 0 ? `${wpm}` : ''}
      </div>

      {/* Name tooltip on hover */}
      <div style={{
        position: 'absolute',
        left: `${left + duckSize + 4}px`,
        fontSize: '10px',
        fontWeight: isPlayer ? 700 : 500,
        color: isPlayer ? 'var(--main-color)' : 'var(--sub-color)',
        whiteSpace: 'nowrap',
        zIndex: 2,
        opacity: 0.9,
      }}>
        {name}
      </div>
    </div>
  );
}

export function RaceTrack({ ghosts, playerProgress, playerWpm, playerFinished }: RaceTrackProps) {
  const isMobile = useIsMobile();
  const trackWidth = isMobile ? Math.min(window.innerWidth - 32, 800) : 800;
  const totalLanes = ghosts.length + 1; // ghosts + player

  // Build lanes sorted by current position for visual clarity
  // But keep stable lane assignments
  const lanes: LaneProps[] = [];

  // Add ghosts (sorted by baseWpm ascending for stable lane order)
  const sortedGhosts = [...ghosts].sort((a, b) => a.baseWpm - b.baseWpm);

  let playerInserted = false;
  let laneIdx = 0;

  for (const ghost of sortedGhosts) {
    // Insert player lane at appropriate position based on WPM
    if (!playerInserted && playerWpm <= ghost.baseWpm) {
      lanes.push({
        emoji: '\uD83D\uDC23',
        name: 'You',
        wpm: playerWpm,
        progress: playerProgress,
        isPlayer: true,
        finished: playerFinished,
        trackWidth,
        laneIndex: laneIdx++,
      });
      playerInserted = true;
    }
    lanes.push({
      emoji: ghost.emoji,
      name: ghost.name,
      wpm: ghost.currentWpm,
      progress: ghost.currentProgress,
      isPlayer: false,
      finished: ghost.finished,
      trackWidth,
      laneIndex: laneIdx++,
    });
  }

  if (!playerInserted) {
    lanes.push({
      emoji: '\uD83D\uDC23',
      name: 'You',
      wpm: playerWpm,
      progress: playerProgress,
      isPlayer: true,
      finished: playerFinished,
      trackWidth,
      laneIndex: laneIdx,
    });
  }

  return (
    <div style={{
      width: `${trackWidth}px`,
      margin: '0 auto',
      borderRadius: 'var(--border-radius)',
      overflow: 'hidden',
      border: '1px solid var(--sub-alt-color)',
      background: 'linear-gradient(180deg, rgba(70,130,180,0.06) 0%, rgba(70,130,180,0.02) 100%)',
    }}>
      {/* Water ripple decoration */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(70,130,180,0.15) 25%, rgba(70,130,180,0.08) 50%, rgba(70,130,180,0.15) 75%, transparent 100%)',
      }} />

      {/* Lanes */}
      {lanes.map((lane, i) => (
        <Lane key={lane.isPlayer ? 'player' : lane.name} {...lane} />
      ))}

      {/* Finish line indicator */}
      <div style={{
        position: 'relative',
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(70,130,180,0.15) 25%, rgba(70,130,180,0.08) 50%, rgba(70,130,180,0.15) 75%, transparent 100%)',
      }} />
    </div>
  );
}
