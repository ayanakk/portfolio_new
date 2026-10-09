import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal hook. Returns a ref and the class string to spread on the
 * element: hidden until it enters the viewport, then transitions in once.
 *
 * Hidden/background documents (embedded previews, background tabs) freeze
 * CSS transitions, IntersectionObserver callbacks and scroll events — an
 * element could be left permanently invisible. Three layers of defence:
 *   1. hidden at mount            -> reveal instantly, no animation
 *   2. document becomes hidden    -> visibilitychange reveals instantly
 *   3. neither event fires        -> 1s interval poll (timers still run
 *      in hidden documents) reveals via rect check or hidden check
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  delay = 0,
  variant: 'rise' | 'fade' = 'rise',
) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.visibilityState === 'hidden'
    ) {
      setInstant(true);
      setRevealed(true);
      return;
    }

    let done = false;
    let observer: IntersectionObserver | null = null;
    let poll = 0;

    const cleanup = () => {
      observer?.disconnect();
      observer = null;
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibility);
    };

    const revealNow = (skipAnimation: boolean) => {
      if (done) return;
      done = true;
      if (skipAnimation) setInstant(true);
      setRevealed(true);
      cleanup();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') revealNow(true);
    };
    document.addEventListener('visibilitychange', onVisibility);

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) revealNow(false);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(el);

    poll = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        revealNow(true);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > -40) revealNow(false);
    }, 1000);

    return cleanup;
  }, []);

  const base = variant === 'fade' ? 'reveal-fade' : 'reveal';
  return {
    ref,
    className: `${base}${revealed ? ' revealed' : ''}${instant ? ' instant' : ''}`,
    style: delay && !instant ? { transitionDelay: `${delay}ms` } : undefined,
  };
}
