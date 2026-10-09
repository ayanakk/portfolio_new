import { useEffect, useRef, useState } from 'react';
import { onSmoothScroll } from '../lib/smoothScroll';

/**
 * Scroll-scrubbed background film ("Layer Stack"), drawn on a canvas.
 *
 * Top of the page = first frame (an almost empty canvas with the glass stack
 * peeking in at the bottom, so the hero stays clean); bottom of the page =
 * last frame (deep inside the stack).
 *
 * Why a frame sequence instead of a <video>: seeking a video on every scroll
 * tick is asynchronous and some browsers drop or never paint seeked frames.
 * Pre-rendered WebP frames drawn to a canvas are synchronous, and blending
 * the two nearest frames gives sub-frame smoothness at any scroll speed.
 *
 *   - Frames are graded to grayscale on pure white and the layer uses
 *     `mix-blend-mode: multiply`, so the white melts into the page's #f4f4f4
 *     and only the glass stack shows.
 *   - Landscape and squarish screens use 1280px frames; phones in portrait use
 *     a centre 9:16 crop so they get sharp pixels rather than an upscaled sliver.
 *     Vertical crops are bottom-anchored to keep the rising stack in view.
 *   - Frames load coarse-to-fine (every 32nd, then 16th, 8th ...), so any
 *     scroll position has a nearby frame almost immediately.
 *   - Loading waits for the page `load` event so the frames never compete with the
 *     hero portrait (LCP). Phones and slow (3G) connections fetch every 2nd frame;
 *     the renderer cross-fades between the nearest loaded neighbours, so it still
 *     scrubs smoothly at half the download.
 *   - Dark tones are floored (see FLOOR) so body text keeps WCAG contrast where it
 *     sits directly on the film.
 *   - Under prefers-reduced-motion, Save-Data or a 2G connection only the static
 *     poster shows.
 */

const FRAME_COUNT = 161;
const frameUrl = (set: 'd' | 'm', i: number) =>
  `/assets/scroll/${set}/${String(i).padStart(3, '0')}.webp`;
const POSTER = '/assets/scroll/poster.webp';

/**
 * Native scrolling only (touch, reduced-motion): share of the remaining distance
 * covered per 60 fps frame. With the smooth scroller the film is not eased at all;
 * it is drawn in the same frame the page moves, so the two can never drift apart.
 */
const FOLLOW = 0.5;
/** Canvas pixel cap. The frames are 1280px wide, so more only costs fill rate. */
const MAX_CANVAS_WIDTH = 1600;
const LOAD_CONCURRENCY = 6;
/** Darkest gray allowed in a frame (0-255). Keeps text over the film at >= 4.5:1. */
const FLOOR = 175;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };
const connection = () =>
  (navigator as Navigator & { connection?: NetworkInfo }).connection;

function prefersStatic() {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = connection();
  const saveData = c?.saveData === true;
  const veryslow = c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g';
  return reduced || saveData || veryslow;
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function coarseToFine(n: number) {
  const seen = new Uint8Array(n);
  const order: number[] = [];
  for (let step = 32; step >= 1; step >>= 1) {
    for (let i = 0; i < n; i += step) {
      if (!seen[i]) {
        seen[i] = 1;
        order.push(i);
      }
    }
  }
  if (!seen[n - 1]) order.push(n - 1);
  return order;
}

export default function ScrollFilm() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStatic] = useState(prefersStatic);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isStatic) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    // Phones in portrait get the 9:16 crop; everything wider uses landscape frames.
    const set: 'd' | 'm' = window.innerWidth / window.innerHeight < 0.75 ? 'm' : 'd';
    // Phones and 3G fetch every 2nd frame; the renderer interpolates between loaded ones.
    const stride = set === 'm' || connection()?.effectiveType === '3g' ? 2 : 1;
    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let cancelled = false;
    let firstPainted = false;

    let target = scrollProgress();
    let current = target;
    let raf = 0;
    let lastTime = 0;
    let lastKey = '';

    const loadedAtOrBefore = (i: number) => {
      for (let k = i; k >= 0; k--) if (frames[k]) return k;
      return -1;
    };
    const loadedAtOrAfter = (i: number) => {
      for (let k = i; k < FRAME_COUNT; k++) if (frames[k]) return k;
      return -1;
    };

    const drawCover = (img: HTMLImageElement, alpha: number) => {
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      // Centre horizontally; anchor to the bottom when cropping vertically, so the
      // stack that rises from the bottom edge in the opening frames stays in view.
      ctx.drawImage(img, (canvas.width - w) / 2, canvas.height - h, w, h);
    };

    const render = () => {
      const pos = current * (FRAME_COUNT - 1);
      let lo = loadedAtOrBefore(Math.floor(pos));
      let hi = loadedAtOrAfter(Math.ceil(pos));
      if (lo < 0) lo = hi;
      if (hi < 0) hi = lo;
      if (lo < 0) return;
      let blend = hi === lo ? 0 : (pos - lo) / (hi - lo);
      if (blend < 0.01) blend = 0;
      else if (blend > 0.99) {
        lo = hi;
        blend = 0;
      }
      const key = `${lo}|${hi}|${blend.toFixed(3)}|${canvas.width}x${canvas.height}`;
      if (key === lastKey) return;
      lastKey = key;

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCover(frames[lo]!, 1);
      if (blend) drawCover(frames[hi]!, blend);
      ctx.globalAlpha = 1;
      // Floor the darkest tones ('lighten' keeps the brighter of frame and floor).
      ctx.globalCompositeOperation = 'lighten';
      ctx.fillStyle = `rgb(${FLOOR},${FLOOR},${FLOOR})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      if (!firstPainted) {
        firstPainted = true;
        setReady(true);
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = lastTime ? Math.min(64, now - lastTime) : 16.67;
      lastTime = now;
      const k = 1 - Math.pow(1 - FOLLOW, dt / 16.67);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0002) current = target;
      render();
      if (current !== target) raf = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const requestDraw = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.max(1, MAX_CANVAS_WIDTH / (canvas.clientWidth || 1)),
      );
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      lastKey = '';
      requestDraw();
    };

    const onScroll = () => {
      target = scrollProgress();
      requestDraw();
    };
    // Smooth scroller active: it already eases the page, so snap to its position
    // and draw immediately (same frame) instead of adding a second layer of lag.
    const offSmooth = onSmoothScroll(() => {
      target = current = scrollProgress();
      render();
    });

    // Coarse-to-fine loader with a small concurrency pool.
    const order = coarseToFine(FRAME_COUNT).filter((i) => i % stride === 0 || i === FRAME_COUNT - 1);
    let next = 0;
    const loadNext = () => {
      if (cancelled || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(set, i);
      img
        .decode()
        .then(() => {
          if (cancelled) return;
          frames[i] = img;
          lastKey = '';
          requestDraw();
        })
        .catch(() => {})
        .finally(loadNext);
    };

    // Start fetching after the page has loaded (with a fallback), so the frames never
    // compete with the hero portrait that decides LCP.
    let started = false;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      for (let k = 0; k < LOAD_CONCURRENCY; k++) loadNext();
    };
    const fallbackTimer = window.setTimeout(start, 3000);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    resize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('load', start);
      cancelAnimationFrame(raf);
      offSmooth?.();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, [isStatic]);

  return (
    <div className="scroll-film" aria-hidden="true">
      <img src={POSTER} alt="" decoding="async" />
      {!isStatic && <canvas ref={canvasRef} className={ready ? 'is-ready' : undefined} />}
    </div>
  );
}
