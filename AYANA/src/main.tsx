import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initSmoothScroll, scrollToElement } from './lib/smoothScroll';

initSmoothScroll();

// Anchor clicks glide to their section through the shared smooth-scroll engine.
// The skip link is left alone so it still moves keyboard focus to <main>.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.classList.contains('skip-link')) return;
  const el = document.getElementById(a.getAttribute('href')!.slice(1));
  if (el) {
    e.preventDefault();
    scrollToElement(el);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
