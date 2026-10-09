import { education, timeline, type Education, type TimelineEntry } from '../data';
import { useReveal } from '../hooks/useReveal';
import Ambient from './Ambient';
import SectionHead from './SectionHead';
import { CapIcon } from './icons';

function ExperienceItem({ job }: { job: TimelineEntry }) {
  const reveal = useReveal<HTMLElement>();
  return (
    <article {...reveal} className={`xp-item ${reveal.className}`}>
      <div className="xp-side">
        <span className="xp-period">{job.period}</span>
        {job.current && <span className="xp-now">Current role</span>}
      </div>
      <div className="xp-rail" aria-hidden="true">
        <span className="xp-dot" />
      </div>
      <div className="xp-card">
        <header className="xp-card-head">
          <h4 className="xp-role">{job.role}</h4>
          <div className="xp-company">
            <span className="xp-company-name">{job.company}</span>
            <span className="xp-sep">·</span>
            <span>{job.location}</span>
          </div>
        </header>
        <p className="xp-summary">{job.summary}</p>
        <ul className="xp-points">
          {job.highlights.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="xp-tags">
          {job.tags.map((tag) => (
            <span key={tag} className="xp-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function EducationCard({ item, delay }: { item: Education; delay: number }) {
  const reveal = useReveal(delay);
  return (
    <div {...reveal} className={`edu-card ${reveal.className}`}>
      <span className="edu-icon">
        <CapIcon />
      </span>
      <div>
        <div className="edu-degree">{item.degree}</div>
        <div className="edu-field">{item.field}</div>
        <div className="edu-school">{item.school}</div>
        <div className="edu-period">{item.period}</div>
      </div>
    </div>
  );
}

export default function Experience() {
  const revealEduHead = useReveal();
  return (
    <section id="experience" className="section section--tint">
      <Ambient variant="experience" />
      <div className="container">
        <SectionHead eyebrow="Experience" title="The path so far" />
        <div className="xp-list">
          {timeline.map((job) => (
            <ExperienceItem key={`${job.company}-${job.period}`} job={job} />
          ))}
        </div>

        <div {...revealEduHead} className={`edu-head ${revealEduHead.className}`}>
          <span className="section-eyebrow">Education</span>
        </div>
        <div className="edu-grid">
          {education.map((item, i) => (
            <EducationCard key={item.degree} item={item} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
