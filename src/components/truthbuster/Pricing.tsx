import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { IDS, PLANS, Plan } from '@/data/truthbuster';
import { toast } from '@/components/ui/use-toast';

const Pricing: React.FC<{ onNavigate: (href: string) => void }> = ({ onNavigate }) => {
  const [selected, setSelected] = useState<Plan>('pro');

  const choose = (plan: Plan) => {
    setSelected(plan);
    if (plan === 'free') {
      onNavigate(`#${IDS.scan}`);
      toast({
        title: 'Free plan selected',
        description: 'Run your first audit — you get 3 scans a month with the core detectors.',
      });
      return;
    }
    toast({
      title: `${plan === 'pro' ? 'Pro' : 'Team'} plan selected`,
      description: 'Add your email below and we’ll send the upgrade link when billing goes live.',
    });
    onNavigate('#signup');
  };

  return (
    <section
      id={IDS.pricing}
      aria-labelledby="pricing-heading"
      className="scroll-mt-20 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Plans that pay for themselves
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            Start free. Pro carries a savings guarantee: if Truthbuster doesn’t surface $20+ a month
            of recoverable spend in your first 60 days, it’s free until it does.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => {
            const isSelected = selected === p.id;
            return (
              <li key={p.id}>
                <div
                  className={`flex h-full flex-col rounded-2xl border-2 bg-white p-6 transition-shadow duration-200 motion-reduce:transition-none ${
                    p.highlight ? 'border-teal-700 shadow-lg' : 'border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    {p.highlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-bold tabular-nums text-slate-900">
                      {p.price}
                    </span>
                    <span className="text-sm text-slate-500">{p.cadence}</span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => choose(p.id)}
                    aria-pressed={isSelected}
                    className={`mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      p.highlight
                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                        : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {p.id === 'free' ? 'Start free' : `Choose ${p.name}`}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Pricing;
