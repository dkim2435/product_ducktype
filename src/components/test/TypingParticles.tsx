import { useRef, useEffect, useCallback } from 'react';
import type { ParticleTier } from '../../types/settings';
import { PARTICLE_TIERS } from '../../constants/particles';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface TypingParticlesProps {
  visible: boolean;
  rank: number; // 1-20 (leaderboard rank, 999 = no rank)
  particleTier?: ParticleTier;
  themeMainColor?: string;
}

// Leaderboard rank-based colors (existing behavior)
function getRankColors(rank: number): string[] {
  if (rank <= 3) return ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5']; // Gold
  if (rank <= 10) return ['#00BFFF', '#7B68EE', '#00CED1', '#87CEEB']; // Color
  return ['#C0C0C0', '#D3D3D3', '#A9A9A9']; // Silver sparkle
}

function getRankParticleCount(rank: number): number {
  if (rank <= 3) return 6;
  if (rank <= 10) return 4;
  return 2;
}

function getRankGlow(rank: number): boolean {
  return rank <= 3;
}

export function TypingParticles({ visible, rank, particleTier = 'none', themeMainColor }: TypingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  // Determine particle settings: leaderboard rank takes priority, then settings tier
  const hasLeaderboardParticles = rank <= 20;
  const tierConfig = PARTICLE_TIERS.find(t => t.id === particleTier);
  const hasTierParticles = tierConfig && tierConfig.count > 0;
  const hasAnyParticles = hasLeaderboardParticles || hasTierParticles;

  // Resolve final particle params
  let count: number;
  let colors: string[];
  let glow: boolean;
  let particleSize: number;

  if (hasLeaderboardParticles) {
    // Leaderboard rank particles (original behavior, takes priority)
    count = getRankParticleCount(rank);
    colors = getRankColors(rank);
    glow = getRankGlow(rank);
    particleSize = rank <= 3 ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5;
  } else if (hasTierParticles && tierConfig) {
    count = tierConfig.count;
    colors = tierConfig.colors === 'theme'
      ? (themeMainColor ? [themeMainColor, themeMainColor + 'cc', themeMainColor + '99'] : ['#888', '#aaa', '#ccc'])
      : tierConfig.colors as string[];
    glow = tierConfig.glow;
    particleSize = 2 + Math.random() * 1.5;
  } else {
    count = 0;
    colors = [];
    glow = false;
    particleSize = 2;
  }

  const spawnParticles = useCallback((x: number, y: number) => {
    if (!hasAnyParticles) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 1 + Math.random() * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.3,
        size: glow ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, [count, colors, glow, hasAnyParticles]);

  useEffect(() => {
    if (!visible || !hasAnyParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5 * dt; // gravity

        const alpha = Math.max(0, p.life);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [visible, hasAnyParticles, glow]);

  // Expose spawn function via a custom event listener on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible || !hasAnyParticles) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        spawnParticles(detail.x, detail.y);
      }
    };
    canvas.addEventListener('spawn-particle', handler);
    return () => canvas.removeEventListener('spawn-particle', handler);
  }, [visible, spawnParticles, hasAnyParticles]);

  if (!visible || !hasAnyParticles) return null;

  return (
    <canvas
      ref={canvasRef}
      data-particles="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}
