import { useEffect, useRef, useState, type FormEvent } from 'react';
import { socials } from '../data';
import { useReveal } from '../hooks/useReveal';
import SectionHead from './SectionHead';
import Ambient from './Ambient';
import { ArrowRight, ClockIcon, MailIcon, PinIcon, SocialIcon } from './icons';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
const EMAIL = 'ayanakkpattari@gmail.com';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const buttonLabel: Record<Status, string> = {
  idle: 'Send Message',
  sending: 'Sending…',
  sent: 'Message sent — thank you!',
  error: 'Send Message',
};

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<number | undefined>(undefined);
  const revealInfo = useReveal();
  const revealForm = useReveal<HTMLFormElement>(120);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!WEB3FORMS_KEY) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          access_key: WEB3FORMS_KEY,
          subject: data.subject || 'New message from your portfolio',
          from_name: 'Portfolio contact form',
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!json.success) throw new Error('Web3Forms rejected the submission');
      form.reset();
      setStatus('sent');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section section--contact">
      <Ambient variant="contact" />
      <div className="container">
        <SectionHead eyebrow="Contact" title="Let's build something" />
        <div className="contact-grid">
          <div {...revealInfo} className={revealInfo.className}>
            <p className="contact-intro">
              Have a role, a research problem or a project in mind? I'm open
              to AI/ML engineering and research opportunities and happy to talk.
            </p>
            <div className="contact-items">
              <a href="mailto:ayanakkpattari@gmail.com" className="contact-item">
                <span className="contact-item-icon">
                  <MailIcon />
                </span>
                <span>
                  <span className="contact-item-label">Email</span>
                  <span className="contact-item-value">ayanakkpattari@gmail.com</span>
                </span>
              </a>
              <div className="contact-item">
                <span className="contact-item-icon">
                  <PinIcon />
                </span>
                <span>
                  <span className="contact-item-label">Location</span>
                  <span className="contact-item-value">Kozhikode, Kerala · India</span>
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-item-icon">
                  <ClockIcon />
                </span>
                <span>
                  <span className="contact-item-label">Availability</span>
                  <span className="contact-item-value">Open to AI/ML roles</span>
                </span>
              </div>
            </div>
            <div className="contact-social">
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

          <form
            {...revealForm}
            className={`contact-form ${revealForm.className}`}
            onSubmit={onSubmit}
          >
            <input type="checkbox" name="botcheck" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-row">
              <label className="form-field">
                Name
                <input required name="name" type="text" autoComplete="name" placeholder="Your Name" />
              </label>
              <label className="form-field">
                Email
                <input required name="email" type="email" autoComplete="email" placeholder="yourmail@email.com" />
              </label>
            </div>
            <label className="form-field form-field--mb">
              Subject
              <input name="subject" type="text" placeholder="Role, collaboration or question" />
            </label>
            <label className="form-field form-field--mb-lg">
              Message
              <textarea required name="message" rows={5} placeholder="Tell me about the role or project..." />
            </label>
            <button type="submit" className="form-submit" disabled={status === 'sending'}>
              {buttonLabel[status]}
              <ArrowRight />
            </button>
            <p className="form-status" role="status">
              {status === 'error' && (
                <>
                  Couldn't send your message. Please email me directly at{' '}
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
