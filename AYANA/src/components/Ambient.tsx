import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useParallax } from '../hooks/useParallax';

type Variant = 'about' | 'skills' | 'work' | 'experience' | 'contact';

interface Orb {
  className: string;
  style: CSSProperties;
  speed: number;
}

const orb = (
  className: string,
  style: CSSProperties,
  speed: number,
): Orb => ({ className, style, speed });

/**
 * A single scroll-parallax layer. Kept as its own component so the parallax
 * hook is called once per layer (never inside a loop) and so the drifting orb
 * inside can keep its own transform animation — the two transforms compose
 * through the DOM: this wrapper moves on scroll, the child drifts on its own.
 */
function ParallaxLayer({
  speed,
  children,
}: {
  speed: number;
  children: ReactNode;
}) {
  const ref = useParallax<HTMLDivElement>(speed);
  return (
    <div ref={ref} className="ambient-layer">
      {children}
    </div>
  );
}

/**
 * Slow-drifting blurred glow orbs + a faint dot grid behind a section.
 * Purely decorative: pointer-events none, GPU-only transforms, the drift
 * animations are disabled under prefers-reduced-motion, and each layer is
 * parallaxed at its own scroll speed for depth. Orb speeds are deliberately
 * split (one trails, one leads) so the two glows separate as you scroll.
 */
const GRID_SPEED = 0.05;

const presets: Record<Variant, { grid: boolean; orbs: Orb[] }> = {
  about: {
    grid: true,
    orbs: [
      orb('ambient-orb orb-a', { top: '-8%', left: '-6%', width: 480, height: 480, background: 'rgba(24,24,27,.05)' }, 0.15),
      orb('ambient-orb orb-b', { bottom: '-14%', right: '-4%', width: 420, height: 420, background: 'rgba(24,24,27,.05)' }, -0.09),
    ],
  },
  skills: {
    grid: false,
    orbs: [
      orb('ambient-orb orb-b', { top: '4%', right: '-8%', width: 520, height: 520, background: 'rgba(24,24,27,.045)' }, 0.13),
      orb('ambient-orb orb-c', { bottom: '-10%', left: '-8%', width: 460, height: 460, background: 'rgba(24,24,27,.04)' }, -0.1),
    ],
  },
  work: {
    grid: true,
    orbs: [
      orb('ambient-orb orb-a', { top: '-6%', right: '18%', width: 440, height: 440, background: 'rgba(24,24,27,.05)' }, -0.08),
      orb('ambient-orb orb-c', { bottom: '-8%', left: '10%', width: 500, height: 500, background: 'rgba(24,24,27,.045)' }, 0.16),
    ],
  },
  experience: {
    grid: false,
    orbs: [
      orb('ambient-orb orb-b', { top: '10%', left: '-10%', width: 460, height: 460, background: 'rgba(24,24,27,.045)' }, 0.14),
      orb('ambient-orb orb-a', { bottom: '0%', right: '-10%', width: 420, height: 420, background: 'rgba(24,24,27,.04)' }, -0.09),
    ],
  },
  contact: {
    grid: true,
    orbs: [
      orb('ambient-orb orb-c', { top: '-10%', left: '24%', width: 520, height: 520, background: 'rgba(24,24,27,.05)' }, 0.12),
      orb('ambient-orb orb-b', { bottom: '-16%', right: '14%', width: 440, height: 440, background: 'rgba(24,24,27,.05)' }, -0.1),
    ],
  },
};

export default function Ambient({ variant }: { variant: Variant }) {
  const preset = presets[variant];
  const ref = useRef<HTMLDivElement | null>(null);

  // Only animate the orbs of sections that are on (or about to enter) screen,
  // so scrolling never pays for ten drifting layers at once.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.paused = entry.isIntersecting ? 'false' : 'true';
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="ambient" aria-hidden="true">
      {preset.orbs.map((o, i) => (
        <ParallaxLayer key={i} speed={o.speed}>
          <div className={o.className} style={o.style} />
        </ParallaxLayer>
      ))}
      {preset.grid && (
        <ParallaxLayer speed={GRID_SPEED}>
          <div className="ambient-grid" />
        </ParallaxLayer>
      )}
    </div>
  );
}
