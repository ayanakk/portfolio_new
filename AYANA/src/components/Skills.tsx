import { skillGroups, type SkillGroup } from '../data';
import { useReveal } from '../hooks/useReveal';
import Ambient from './Ambient';
import SectionHead from './SectionHead';

function SkillCard({ group, delay }: { group: SkillGroup; delay: number }) {
  const reveal = useReveal(delay);
  return (
    <div {...reveal} className={`skill-card ${reveal.className}`}>
      <h4 className="skill-card-title">{group.title}</h4>
      <div className="stack-tags">
        {group.items.map((t) => (
          <span key={t} className="stack-tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section section--tint">
      <Ambient variant="skills" />
      <div className="container">
        <SectionHead eyebrow="Skills & Stack" title="What I work with" />
        <div className="skills-grid">
          {skillGroups.map((g, i) => (
            <SkillCard key={g.title} group={g} delay={(i % 3) * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
