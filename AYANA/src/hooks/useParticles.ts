import { useEffect, type RefObject } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

/**
 * Constellation particle field on a canvas, with a mouse-driven parallax
 * offset shared via the returned mutable mouse vector.
 */
export function useParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  mouse: RefObject<{ x: number; y: number }>,
  density = 1,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    if (!host || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let pts: Particle[] = [];
    let raf = 0;
    let inView = true;

    const build = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(90, Math.round(((w * h) / 22000) * density));
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.7 + 0.7,
        a: Math.random() * 0.45 + 0.18,
      }));
    };
    build();
    window.addEventListener('resize', build);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current?.x ?? 0;
      const my = mouse.current?.y ?? 0;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const ax = a.x + mx * 7 * a.r;
        const ay = a.y + my * 7 * a.r;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const bx = b.x + mx * 7 * b.r;
          const by = b.y + my * 7 * b.r;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = dx * dx + dy * dy;
          if (dist < 11000) {
            ctx.strokeStyle = `rgba(40,40,45,${0.12 * (1 - dist / 11000)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const px = p.x + mx * 7 * p.r;
        const py = p.y + my * 7 * p.r;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, 6.2832);
        ctx.fillStyle = `rgba(40,40,45,${p.a * 0.55})`;
        ctx.fill();
      }
      if (!reduced && inView) raf = requestAnimationFrame(draw);
    };
    draw();

    // Stop burning CPU on the n² line pass once the hero scrolls out of view.
    const io = new IntersectionObserver((entries) => {
      const wasInView = inView;
      inView = entries[0]?.isIntersecting ?? true;
      if (inView && !wasInView && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', build);
    };
  }, [canvasRef, mouse, density]);
}
