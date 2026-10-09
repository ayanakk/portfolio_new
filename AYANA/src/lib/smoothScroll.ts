import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Page-wide inertial scrolling (Lenis).
 *
 * - Wheel input is eased on the main thread; touch keeps the browser's native
 *   momentum scrolling (syncTouch is off), which is already the smoothest
 *   option on phones and avoids fighting iOS rubber-banding.
 * - window.scrollY stays the single source of truth, so the scroll-scrubbed
 *   video, parallax layers and nav highlighting keep working unchanged.
 * - prefers-reduced-motion: Lenis is never created; the browser scrolls natively
 *   and anchor jumps are instant.
 */

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({
    autoRaf: true,
    // Higher = snappier. AYANA's film scrubs with the scroll, so it is kept tighter
    // than a text-only page to avoid a trailing, delayed feel.
    lerp: 0.12,
    wheelMultiplier: 1,
    smoothWheel: true,
    anchors: false,
  });
  return lenis;
}

/**
 * Run `cb` synchronously each time the smooth scroller moves the page, in the
 * same frame (right after the new scroll position is applied). Returns an
 * unsubscribe function, or null when native scrolling is in use.
 */
export function onSmoothScroll(cb: () => void): (() => void) | null {
  return lenis ? lenis.on('scroll', cb) : null;
}

/** Freeze / release page scroll while a modal owns the screen. */
export function lockPageScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Scroll to a section, honouring its scroll-margin-top (fixed navbar). */
export function scrollToElement(el: HTMLElement) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  if (lenis) {
    lenis.scrollTo(el, { offset: -margin, duration: 1.35, easing: easeInOutExpo });
  } else {
    el.scrollIntoView();
  }
}

/** Jump without animation (deep links on load). */
export function jumpToElement(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { immediate: true });
  else el.scrollIntoView();
}

// Gentle start, long soft landing: reads as a glide rather than a snap.
function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) return t;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}
