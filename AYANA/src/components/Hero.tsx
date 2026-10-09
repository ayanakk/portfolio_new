import { Fragment, useEffect, useRef } from 'react';
import { cvHref, socials } from '../data';
import { useParallax } from '../hooks/useParallax';
import { useParticles } from '../hooks/useParticles';
import { useReveal } from '../hooks/useReveal';
import { ArrowRight, ChevronDown, DownloadIcon, SocialIcon } from './icons';

const infoBlocks = [
  {
    title: 'About Me',
    text: 'MSc in Computer Science (Intelligent Systems) from Central University of Kerala, with a focus on latency, accuracy and reliability in production.',
    link: { href: '#about', label: 'Learn More' },
  },
  {
    title: 'My Work',
    text: 'Voice agents, dubbing pipelines, RAG systems and clinical ML, each one designed, built and deployed end to end.',
    link: { href: '#work', label: 'Browse Portfolio' },
  },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const figureRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useParticles(canvasRef, mouse);

  // Scroll-driven parallax: the background glow drifts furthest (deepest
  // layer), the figure drifts a little (mid layer), the headline stays put
  // (front layer). The figure wrapper is separate from the mouse-driven
  // .hero-figure, so scroll and pointer transforms compose cleanly.
  const glowBgRef = useParallax<HTMLDivElement>(0.18);
  // Figure is intentionally static — no scroll parallax, no mouse tilt.
  const figParallaxRef = useParallax<HTMLDivElement>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouse.current.x = (e.clientX - cx) / cx;
      mouse.current.y = (e.clientY - cy) / cy;
      // Only the ambient glow follows the pointer; the portrait stays still.
      const { x, y } = mouse.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translateX(-50%) translate(${x * 22}px, ${y * 16}px)`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const revealEyebrow = useReveal();
  const revealTitle = useReveal<HTMLHeadingElement>(80);
  const revealDesc = useReveal<HTMLParagraphElement>(160);
  const revealCta = useReveal(220);
  const revealScroll = useReveal<HTMLAnchorElement>(280);
  const revealSocial = useReveal(320);
  const revealFig = useReveal(160);
  const revealInfo = useReveal(240);

  return (
    <section id="home" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div ref={glowBgRef} className="hero-glow-bg" />
      <div className="hero-grid">
        <div>
          <div {...revealEyebrow} className={`hero-eyebrow ${revealEyebrow.className}`}>
            <span className="hero-eyebrow-line" />
            <span className="hero-eyebrow-text">Research Associate · ReyraAI</span>
          </div>
          <h1 {...revealTitle} className={`hero-title ${revealTitle.className}`}>
            <span className="hero-title-sub">I'm Ayana, an</span>
            <span className="hero-title-main">AI/ML Engineer</span>
          </h1>
          <p {...revealDesc} className={`hero-desc ${revealDesc.className}`}>
            Experienced in designing, optimizing and deploying intelligent AI systems, including agentic workflows and retrieval-augmented generation at scale.
          </p>
          <div {...revealCta} className={`hero-cta ${revealCta.className}`}>
            <a href="#work" className="btn-primary">
              View My Work
              <ArrowRight />
            </a>
            <a href={cvHref} download="Ayana_KK_CV.pdf" className="btn-ghost">
              Download résumé
              <DownloadIcon />
            </a>
          </div>
          <div className="hero-bottom">
            <a
              {...revealScroll}
              href="#about"
              aria-label="Scroll down"
              className={`hero-scroll ${revealScroll.className}`}
            >
              <ChevronDown />
            </a>
            <div {...revealSocial} className={`hero-social ${revealSocial.className}`}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="social-btn"
                  aria-label={s.label}
                  title={s.label}
                  {...(s.icon !== 'gmail' ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div {...revealFig} className={`hero-fig ${revealFig.className}`}>
          <div ref={glowRef} className="hero-glow">
            <div className="hero-glow-inner" />
          </div>
          <div className="hero-ring" />
          <div ref={figParallaxRef} className="hero-figure-wrap">
            <div ref={figureRef} className="hero-figure">
              <picture>
                <source srcSet="/assets/ayana.webp" type="image/webp" />
                <img
                  src="/assets/ayana.png"
                  alt="Portrait of Ayana K K"
                  width={663}
                  height={742}
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>

        <div {...revealInfo} className={`hero-info ${revealInfo.className}`}>
          {infoBlocks.map((block, i) => (
            <Fragment key={block.title}>
              {i > 0 && <div className="hero-info-divider" />}
              <div className="hero-info-block">
                <h3 className="hero-info-title">{block.title}</h3>
                <p className="hero-info-text">{block.text}</p>
                <a href={block.link.href} className="hero-info-link">
                  {block.link.label}
                  <ArrowRight size={15} strokeWidth={2.4} />
                </a>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
