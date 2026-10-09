import { useEffect, useRef } from 'react';

/**
 * Scroll-driven parallax.
 *
 * Returns a ref to attach to an element. As the element travels through the
 * viewport it is translated vertically by `speed × (its distance from the
 * viewport centre)`. Positive speeds trail the scroll (the element reads as
 * further away); negative speeds lead it (closer). Values are small — think
 * 0.04–0.2 — because the multiplier is applied to a distance that can be half
 * the viewport tall.
 *
 * Design notes, matching the rest of this codebase:
 *   - One shared scroll/resize listener and one rAF for every parallax element
 *     on the page — registering ten elements does not mean ten listeners.
 *   - The transform is written straight to `style.transform`, so attach this
 *     only to dedicated layers with no other inline transform. Elements that
 *     animate their own transform (drift orbs, the floaty figure) should sit
 *     *inside* a parallax layer so the two transforms compose via the DOM.
 *   - Fully disabled under prefers-reduced-motion; the element is left at its
 *     natural position with no transform.
 *   - Scroll events freeze in hidden documents (background tabs, embedded
 *     previews). That is harmless here: the layer simply holds its last
 *     offset, and an initial measure runs on mount regardless.
 */

interface Item {
  el: HTMLElement;
  speed: number;
}

const items = new Set<Item>();
let listening = false;
let frame = 0;
let queued = false;

function measure() {
  queued = false;
  const mid = window.innerHeight / 2;
  for (const it of items) {
    const rect = it.el.getBoundingClientRect();
    const centre = rect.top + rect.height / 2;
    const offset = (centre - mid) * it.speed;
    it.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  }
}

function onScroll() {
  if (queued) return;
  queued = true;
  frame = requestAnimationFrame(measure);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  cancelAnimationFrame(frame);
  queued = false;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.1) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const item: Item = { el, speed };
    items.add(item);
    el.style.willChange = 'transform';
    startListening();
    // Position the layer immediately so there is no first-scroll jump.
    measure();

    return () => {
      items.delete(item);
      el.style.transform = '';
      el.style.willChange = '';
      if (items.size === 0) stopListening();
    };
  }, [speed]);

  return ref;
}
