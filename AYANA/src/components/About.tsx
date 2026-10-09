import { useEffect, useRef, useState } from 'react';
import { focusAreas, stats } from '../data';
import { useReveal } from '../hooks/useReveal';
import Ambient from './Ambient';
import SectionHead from './SectionHead';

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.visibilityState === 'hidden'
    ) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      cleanup();
      const dur = 1300;
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        setDisplay(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    // rAF and IntersectionObserver freeze in hidden documents — fall back
    // to showing the final value via visibilitychange or a timer poll.
    const settle = () => {
      if (done) return;
      done = true;
      cleanup();
      setDisplay(value);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') settle();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) start();
      },
      { threshold: 0.4 },
    );
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        settle();
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) start();
    }, 1000);
    const cleanup = () => {
      io.disconnect();
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    document.addEventListener('visibilitychange', onVisibility);
    io.observe(el);
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div ref={ref} className="stat-num">
      {display}
      {suffix}
    </div>
  );
}

export default function About() {
  const revealCard = useReveal();
  const revealText = useReveal(120);

  return (
    <section id="about" className="section">
      <Ambient variant="about" />
      <div className="container">
        <SectionHead eyebrow="About Me" title="From research to production-ready AI" />
        <div className="about-grid">
          <div {...revealCard} className={`code-card ${revealCard.className}`}>
            <div className="code-card-bar">
              <span className="code-card-dot" style={{ background: '#3a3a3f' }} />
              <span className="code-card-dot" style={{ background: '#6e6e74' }} />
              <span className="code-card-dot" style={{ background: '#a2a2a8' }} />
              <span className="code-card-file">engineer.ts</span>
            </div>
            <pre>
              <span className="tok-kw">const</span> <span className="tok-var">engineer</span>
              {' = {\n'}
              {'  name: '}<span className="tok-str">'Ayana K K'</span>{',\n'}
              {'  role: '}<span className="tok-str">'AI/ML Engineer'</span>{',\n'}
              {'  based: '}<span className="tok-str">'Kozhikode, Kerala'</span>{',\n'}
              {'  focus: ['}<span className="tok-str">'LLMs'</span>{', '}<span className="tok-str">'Agentic AI'</span>{', '}<span className="tok-str">'RAG'</span>{', '}<span className="tok-str">'Edge AI'</span>{'],\n'}
              {'  degree: '}<span className="tok-str">'MSc Computer Science'</span>{',\n'}
              {'  available: '}<span className="tok-bool">true</span>{',\n'}
              {'};'}
            </pre>
          </div>
          <div {...revealText} className={revealText.className}>
            <p className="about-lead">
              I specialize in Large Language Models, Agentic AI and Edge AI.
            </p>
            <p className="about-body">
              Turning research into dependable products. My recent work covers fast, accurate retrieval at scale, automated multi-language video workflows, and compressed models that run efficiently on limited hardware.
            </p>
            <div className="about-focus" aria-label="Focus areas">
              {focusAreas.map((area) => (
                <span key={area} className="about-focus-tag">
                  {area}
                </span>
              ))}
            </div>
            <div className="stats-grid">
              {stats.map((st) => (
                <div key={st.label} className="stat-card">
                  <CountUp value={st.num} suffix={st.suffix} />
                  <div className="stat-label">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
