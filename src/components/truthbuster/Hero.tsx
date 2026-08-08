import React from 'react';
import { ScanLine, Sparkles, Flag, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';
import { ANALYSIS_ONLY_NOTE, BRAND, HOW_IT_WORKS, IDS } from '@/data/truthbuster';
import { currency } from '@/lib/anomaly';

const HERO_IMAGE =
  'https://d64gsuwffb70l.cloudfront.net/6a77637da2adc8595c95bcbf_1786209302428_a7bfb5d2.jpg';

const STEP_ICONS = {
  scan: ScanLine,
  sparkles: Sparkles,
  flag: Flag,
} as const;

interface Props {
  onNavigate: (href: string) => void;
  exposure: number;
  openCount: number;
}

const Hero: React.FC<Props> = ({ onNavigate, exposure, openCount }) => (
  <section id="top" className="relative overflow-hidden bg-slate-950 text-white">
    <img
      src={HERO_IMAGE}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover opacity-30"
      loading="eager"
      decoding="async"
    />
    <div
      className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-teal-950/70"
      aria-hidden="true"
    />

    <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-200">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Analysis only · never moves money
        </p>

        <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {BRAND.tagline}
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
          Truthbuster reads your invoices and bank statements and flags price drift, duplicate
          charges, dormant subscriptions and silent billing changes — each with a confidence score
          and the evidence behind it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onNavigate(`#${IDS.scan}`)}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 text-base font-semibold text-slate-950 transition-transform duration-200 hover:bg-teal-400 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <ScanLine className="h-5 w-5" aria-hidden="true" />
            Audit a bill now
          </button>
          <button
            type="button"
            onClick={() => onNavigate(`#${IDS.dashboard}`)}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            See a live dashboard
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Open flags</dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
              {openCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Monthly exposure</dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-teal-300">
              {currency(exposure)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Detectors</dt>
            <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">6</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        {HOW_IT_WORKS.map((step, i) => {
          const Icon = STEP_ICONS[step.icon];
          return (
            <div
              key={step.title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-teal-400/40 hover:bg-white/10 motion-reduce:transition-none"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-500/15 text-teal-300"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">
                  <span className="font-mono text-teal-300">{`0${i + 1}`}</span> {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{step.body}</p>
              </div>
            </div>
          );
        })}

        <p className="flex items-start gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4 text-sm leading-relaxed text-teal-100">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {ANALYSIS_ONLY_NOTE}
        </p>
      </div>
    </div>
  </section>
);

export default Hero;
