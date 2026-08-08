import React from 'react';
import { Lock, ScrollText, Scale, Accessibility } from 'lucide-react';
import { AI_DISCLOSURE, ANALYSIS_ONLY_NOTE } from '@/data/truthbuster';

const PANELS = [
  {
    id: 'privacy',
    icon: Lock,
    title: 'Privacy',
    body: 'Documents are processed to extract vendor, totals and line items, then stored against your account only. Row-level security means no other user — and no other accountant — can read your rows. Extraction runs through a service provider under a data-processing agreement and is never used to train public models.',
  },
  {
    id: 'terms',
    icon: Scale,
    title: 'Terms',
    body: ANALYSIS_ONLY_NOTE,
  },
  {
    id: 'security',
    icon: ScrollText,
    title: 'AI disclosure',
    body: AI_DISCLOSURE,
  },
  {
    id: 'accessibility',
    icon: Accessibility,
    title: 'Accessibility',
    body: 'Built to WCAG 2.1 AA: semantic landmarks, a skip link, visible focus rings, 44px minimum touch targets, ARIA state on every control, live regions for async results, and full respect for prefers-reduced-motion.',
  },
];

const TrustLegal: React.FC = () => (
  <section aria-labelledby="trust-heading" className="border-t border-slate-200 bg-slate-50 py-14">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 id="trust-heading" className="text-2xl font-bold tracking-tight text-slate-900">
        Trust, limits and legal
      </h2>
      <p className="mt-2 max-w-2xl text-slate-600">
        The short version of what Truthbuster does with your data — and what it deliberately will
        not do.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PANELS.map((p) => (
          <article
            key={p.id}
            id={p.id}
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-teal-300"
              aria-hidden="true"
            >
              <p.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default TrustLegal;
