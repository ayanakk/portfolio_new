import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { projects, type FlowStep, type Project } from '../data';
import { useReveal } from '../hooks/useReveal';
import Ambient from './Ambient';
import SectionHead from './SectionHead';
import { ArrowRight } from './icons';
import { lockPageScroll, scrollToElement } from '../lib/smoothScroll';

/** How long each pipeline step stays highlighted. */
const STEP_MS = 1500;
/** Exit animation length; keep in sync with `modal-out` in index.css. */
const CLOSE_MS = 220;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Optimized thumbnails (720px WebP). Full-size originals live in reference/project-originals/. */
const thumbSrc = (slug: string) => `/assets/projects/${slug}.webp`;

/* ------------------------------------------------------------------ */
/* Animated pipeline (shown inside the pop-up)                         */
/* ------------------------------------------------------------------ */

/**
 * Cycles the highlighted step. Pauses while the visitor points at a step
 * and stays static (whole pipeline lit) under prefers-reduced-motion.
 */
function usePipelineStep(count: number) {
  const paused = useRef(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reducedMotion()) {
      setActive(count - 1);
      return;
    }
    const timer = window.setInterval(() => {
      if (!paused.current && !document.hidden) setActive((a) => (a + 1) % count);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [count]);

  const focusStep = useCallback((i: number | null) => {
    paused.current = i !== null;
    if (i !== null) setActive(i);
  }, []);

  return { active, focusStep };
}

function Pipeline({
  steps,
  active,
  onFocusStep,
}: {
  steps: FlowStep[];
  active: number;
  onFocusStep: (i: number | null) => void;
}) {
  return (
    <div
      className="flow"
      role="img"
      aria-label={`Workflow: ${steps.map((s) => s.label).join(', then ')}`}
    >
      <div className="flow-chrome" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <ol
        className="flow-track"
        style={{ '--steps': steps.length } as CSSProperties}
        aria-hidden="true"
        onMouseLeave={() => onFocusStep(null)}
      >
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={`flow-node${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
            onMouseEnter={() => onFocusStep(i)}
          >
            <span className="flow-node-label">{s.label}</span>
            {i < steps.length - 1 && (
              <span className={`flow-link${i < active ? ' is-done' : ''}`} />
            )}
          </li>
        ))}
      </ol>
      <p className="flow-caption" aria-hidden="true">
        <span className="flow-caption-no">{String(active + 1).padStart(2, '0')}</span>
        {steps[active].detail}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pop-up                                                              */
/* ------------------------------------------------------------------ */

function ProjectModal({
  project,
  onClose,
  onStep,
}: {
  project: Project;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeTimer = useRef(0);
  const [closing, setClosing] = useState(false);

  // Play the exit animation, then hand over to the parent to unmount.
  const requestClose = useCallback(() => {
    if (closeTimer.current) return;
    if (reducedMotion()) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  // Open as a true modal (focus trap, Esc, inert page) and lock page scroll.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lockPageScroll(true);
    const onCancel = (e: Event) => {
      e.preventDefault();
      requestClose();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      root.style.overflow = prevOverflow;
      lockPageScroll(false);
      if (dialog.open) dialog.close();
    };
  }, [requestClose]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Clicking the dimmed backdrop (the dialog box itself, outside the panel) closes.
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) requestClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') onStep(1);
    if (e.key === 'ArrowLeft') onStep(-1);
  };

  return (
    <dialog
      ref={dialogRef}
      className={`project-modal${closing ? ' is-closing' : ''}`}
      data-lenis-prevent
      aria-labelledby={`project-modal-title-${project.slug}`}
      onClick={onBackdropClick}
      onKeyDown={onKeyDown}
    >
      {/* Keyed so the pipeline restarts and the panel scrolls to top per project. */}
      <ProjectModalContent
        key={project.slug}
        project={project}
        onClose={requestClose}
        onCloseNow={onClose}
        onStep={onStep}
      />
    </dialog>
  );
}

function ProjectModalContent({
  project,
  onClose,
  onCloseNow,
  onStep,
}: {
  project: Project;
  onClose: () => void;
  onCloseNow: () => void;
  onStep: (dir: -1 | 1) => void;
}) {
  const pipeline = usePipelineStep(project.flow.length);

  const goToContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Unmount immediately (no exit animation): page scroll is locked while the
    // pop-up is mounted, so the glide has to start after it is gone.
    onCloseNow();
    requestAnimationFrame(() => {
      const contact = document.getElementById('contact');
      if (contact) scrollToElement(contact);
    });
  };

  const titleId = `project-modal-title-${project.slug}`;

  return (
    <div className="project-modal-panel">
      <button type="button" className="project-modal-close" onClick={onClose} aria-label="Close project">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <header className="project-modal-head">
        <div className="project-meta">
          <span className="project-cat">{project.cat}</span>
          {project.origin && <span className="project-origin">{project.origin}</span>}
        </div>
        <h3 id={titleId} className="project-modal-title">
          <span className="project-idx">{project.idx}</span>
          {project.title}
        </h3>
      </header>

      <Pipeline steps={project.flow} active={pipeline.active} onFocusStep={pipeline.focusStep} />

      <div className="project-modal-grid">
        <dl className="project-summary">
          <div>
            <dt className="project-label">Problem</dt>
            <dd>{project.problem}</dd>
          </div>
          <div>
            <dt className="project-label">Solution</dt>
            <dd>{project.solution}</dd>
          </div>
          {project.result && (
            <div className="project-result">
              <dt className="project-label">Result</dt>
              <dd>{project.result}</dd>
            </div>
          )}
        </dl>

        <section>
          <h4 className="project-label">Key contribution</h4>
          <ul className="project-contrib">
            {project.contribution.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="project-modal-section">
        <h4 className="project-label">How it works</h4>
        <ol className="project-steps" onMouseLeave={() => pipeline.focusStep(null)}>
          {project.flow.map((s, i) => (
            <li
              key={s.label}
              className={i === pipeline.active ? 'is-active' : undefined}
              onMouseEnter={() => pipeline.focusStep(i)}
            >
              <span className="project-step-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="project-step-text">
                <strong>{s.label}</strong>
                <span>{s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="project-modal-section">
        <h4 className="project-label">Stack</h4>
        <div className="project-stack">
          {project.stack.map((g) => (
            <div key={g.label} className="project-stack-row">
              <span className="project-stack-label">{g.label}</span>
              <div className="project-tags">
                {g.items.map((item) => (
                  <span key={item} className="project-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="project-modal-foot">
        <a href="#contact" className="project-cta" onClick={goToContact}>
          Discuss this project
          <ArrowRight size={15} strokeWidth={2.4} />
        </a>
        <div className="project-modal-nav">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous project">
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label="Next project">
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (opener: HTMLButtonElement) => void;
}) {
  const reveal = useReveal<HTMLElement>(0, 'fade');
  return (
    <article ref={reveal.ref} style={reveal.style} className={`project-card ${reveal.className}`}>
      <div className="project-thumb">
        <img
          src={thumbSrc(project.slug)}
          alt=""
          width={720}
          height={403}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="project-body">
        <span className="project-cat">{project.cat}</span>
        <h3 className="project-title">
          <button type="button" className="project-open" onClick={(e) => onOpen(e.currentTarget)}>
            {project.title}
          </button>
        </h3>
        <p className="project-summary-line">{project.summary}</p>
        <span className="project-more" aria-hidden="true">
          View project
          <ArrowRight size={14} strokeWidth={2.4} />
        </span>
      </div>
    </article>
  );
}

export default function Work() {
  const revealIntro = useReveal<HTMLParagraphElement>(80);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const lastOpener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIdx(null);
    // Return focus to the card that opened the pop-up.
    requestAnimationFrame(() => lastOpener.current?.focus({ preventScroll: true }));
  }, []);

  const step = useCallback((dir: -1 | 1) => {
    setOpenIdx((i) => (i === null ? i : (i + dir + projects.length) % projects.length));
  }, []);

  return (
    <section id="work" className="section">
      <Ambient variant="work" />
      <div className="container">
        <SectionHead eyebrow="Selected Work" title="Things I've built" />
        <p {...revealIntro} className={`work-intro ${revealIntro.className}`}>
          Open any project to see how it works, step by step, with the stack
          behind it.
        </p>
        <div className="work-grid">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.idx}
              project={p}
              onOpen={(opener) => {
                lastOpener.current = opener;
                setOpenIdx(i);
              }}
            />
          ))}
        </div>
      </div>

      {openIdx !== null && (
        <ProjectModal
          project={projects[openIdx]}
          onClose={close}
          onStep={step}
        />
      )}
    </section>
  );
}
