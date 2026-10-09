import { useReveal } from '../hooks/useReveal';

interface SectionHeadProps {
  eyebrow: string;
  title: string;
}

export default function SectionHead({ eyebrow, title }: SectionHeadProps) {
  const reveal = useReveal();
  return (
    <div {...reveal} className={`section-head ${reveal.className}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
    </div>
  );
}
