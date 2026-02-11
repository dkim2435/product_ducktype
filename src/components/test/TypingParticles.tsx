import { useRef, useEffect, useCallback } from 'react';

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
  rank: number; // 1-20
}

function getRankColors(rank: number): string[] {
  if (rank <= 3) return ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5']; // Gold
  if (rank <= 10) return ['#00BFFF', '#7B68EE', '#00CED1', '#87CEEB']; // Color
  return ['#C0C0C0', '#D3D3D3', '#A9A9A9']; // Silver sparkle
}

function getParticleCount(rank: number): number {
  if (rank <= 3) return 6;
  if (rank <= 10) return 4;
  return 2;
}

export function TypingParticles({ visible, rank }: TypingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const colors = getRankColors(rank);
  const count = getParticleCount(rank);

  const spawnParticles = useCallback((x: number, y: number) => {
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
        size: rank <= 3 ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, [count, colors, rank]);

  useEffect(() => {
    if (!visible) return;
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

        if (rank <= 3) {
          // Glow effect for top 3
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
  }, [visible, rank]);

  // Expose spawn function via a custom event listener on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        spawnParticles(detail.x, detail.y);
      }
    };
    canvas.addEventListener('spawn-particle', handler);
    return () => canvas.removeEventListener('spawn-particle', handler);
  }, [visible, spawnParticles]);

  if (!visible) return null;

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
