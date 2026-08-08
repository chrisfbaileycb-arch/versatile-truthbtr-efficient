import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Wordmark } from './Brand';
import { ANALYSIS_ONLY_NOTE, BRAND, NAV_ITEMS } from '@/data/truthbuster';

const CRM_ENDPOINT = 'https://famous.ai/api/crm/6a77637da2adc8595c95bcbf/subscribe';

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Security', href: '#security' },
  { label: 'Contact', href: '#signup' },
];

const RESOURCE_LINKS = [
  { label: 'How detection works', href: '#detectors' },
  { label: 'Savings guarantee', href: '#pricing' },
  { label: 'Practice Manager', href: '#dashboard' },
  { label: 'Forward-to-audit inbox', href: '#scan' },
];

interface Props {
  onNavigate: (href: string) => void;
}

const Footer: React.FC<Props> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus('error');
      setMessage('Enter a valid email address so we can send your audit link.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'footer-signup',
          tags: ['newsletter', 'truthbuster-waitlist'],
        }),
      });
      setStatus('done');
      setMessage('You’re on the list. Watch your inbox for your private audit address.');
      setEmail('');
      setName('');
      setPhone('');
    } catch {
      setStatus('error');
      setMessage('We couldn’t reach the server. Please try again in a moment.');
    }
  };

  const inputClass =
    'min-h-[48px] w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400';

  return (
    <footer id="signup" className="scroll-mt-20 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Get your private audit inbox
            </h2>
            <p className="mt-2 max-w-md leading-relaxed text-slate-400">
              Join the list and we’ll send your forward-to-audit address plus a note the moment Pro
              billing opens.
            </p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-slate-200">
                    Name <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Alex Rivera"
                  />
                </div>
                <div>
                  <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-slate-200">
                    Email address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={status === 'error' || undefined}
                    aria-describedby="signup-status"
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-phone" className="mb-1 block text-sm font-medium text-slate-200">
                  Phone number <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+1 555 010 4477"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="signup-sms"
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-white/30 bg-white/10 text-teal-500 focus:ring-2 focus:ring-teal-400"
                />
                <label htmlFor="signup-sms" className="text-xs leading-relaxed text-slate-400">
                  Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
                </label>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 sm:w-auto"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Signing you up…
                  </>
                ) : (
                  'Reserve my audit inbox'
                )}
              </button>

              <p
                id="signup-status"
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2 text-sm ${
                  status === 'error' ? 'text-rose-300' : 'text-teal-300'
                }`}
              >
                {status === 'done' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                {status === 'error' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                {message}
              </p>
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <nav aria-labelledby="footer-product">
              <h3 id="footer-product" className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-3 space-y-2">
                {NAV_ITEMS.map((n) => (
                  <li key={n.id}>
                    <a
                      href={n.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(n.href);
                      }}
                      className="inline-block rounded py-1 text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-resources">
              <h3 id="footer-resources" className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-3 space-y-2">
                {RESOURCE_LINKS.map((n) => (
                  <li key={n.label}>
                    <a
                      href={n.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(n.href);
                      }}
                      className="inline-block rounded py-1 text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-legal">
              <h3 id="footer-legal" className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-3 space-y-2">
                {LEGAL_LINKS.map((n) => (
                  <li key={n.label}>
                    <a
                      href={n.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(n.href);
                      }}
                      className="inline-block rounded py-1 text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">{ANALYSIS_ONLY_NOTE}</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Wordmark tone="light" tileSize={30} />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {BRAND.name}. Legal pages are templates pending review.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
