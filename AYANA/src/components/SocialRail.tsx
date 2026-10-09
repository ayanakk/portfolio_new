import { socials } from '../data';
import { SocialIcon } from './icons';

/**
 * Fixed vertical social rail. Lives in the left viewport gutter — outside
 * the content container — so it stays reachable on every section without
 * crowding the layout. Hidden on narrower screens (see .social-rail media
 * query); the in-hero social row takes over there.
 */
export default function SocialRail() {
  return (
    <aside className="social-rail" aria-label="Social media">
      <ul className="social-rail-list">
        {socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              className="social-rail-btn"
              aria-label={s.label}
              title={s.label}
              {...(s.icon !== 'gmail' ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              <SocialIcon icon={s.icon} size={19} />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
