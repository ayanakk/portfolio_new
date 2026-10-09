import { useEffect, useState } from 'react';
import { cvHref } from '../data';
import { DownloadIcon } from './icons';
import { lockPageScroll } from '../lib/smoothScroll';

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#work', label: 'Work' },
  { href: '#experience', label: 'Experience' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const sectionIds = ['about', 'skills', 'work', 'experience'];
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 30);
      const probe = window.scrollY + window.innerHeight * 0.35;
      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) current = id;
      }
      const contact = document.getElementById('contact');
      if (contact && contact.offsetTop <= probe) current = '';
      setActive(current);
    };
    // At most one measure per frame, however many scroll events fire.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    // Scroll events freeze in hidden documents (embedded previews,
    // background tabs) — a coarse timer poll keeps nav state in sync.
    const poll = window.setInterval(() => {
      if (!document.hidden) update();
    }, 1000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearInterval(poll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    lockPageScroll(menuOpen);
    return () => {
      document.body.style.overflow = '';
      lockPageScroll(false);
    };
  }, [menuOpen]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#home" className="nav-brand">
            <span className="nav-brand-mark" aria-hidden="true">AK</span>
            <span className="nav-brand-name">Ayana K K</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`nav-link${active === l.href.slice(1) ? ' active' : ''}`}
                aria-current={active === l.href.slice(1) ? 'true' : undefined}
              >
                {l.label}
              </a>
            ))}
            <a href={cvHref} download="Ayana_KK_CV.pdf" className="nav-resume">
              Résumé
              <DownloadIcon size={15} strokeWidth={2.4} />
            </a>
            <a href="#contact" className="nav-cta">
              Let's talk
            </a>
          </nav>
          <button
            className="nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" id="mobile-menu">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href={cvHref}
            download="Ayana_KK_CV.pdf"
            className="resume"
            onClick={() => setMenuOpen(false)}
          >
            Download résumé
            <DownloadIcon size={20} strokeWidth={2.4} />
          </a>
          <a href="#contact" className="accent" onClick={() => setMenuOpen(false)}>
            Let's talk
          </a>
        </div>
      )}
    </>
  );
}
