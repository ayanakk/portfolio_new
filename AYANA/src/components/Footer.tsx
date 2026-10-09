import { ChevronUp } from './icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">AK</span>
          <span className="footer-copy">© 2026 Ayana K K</span>
        </div>
        <a href="#home" className="footer-top">
          Back to top
          <ChevronUp />
        </a>
      </div>
    </footer>
  );
}
