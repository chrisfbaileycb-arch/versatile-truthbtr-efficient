import React from 'react';
import { Lock, Check } from 'lucide-react';
import { ANOMALY_TYPES, IDS, Anomaly } from '@/data/truthbuster';
import { countsByType } from '@/lib/anomaly';
import { TypeIcon } from './AnomalyCard';

const Detectors: React.FC<{ anomalies: Anomaly[]; onNavigate: (href: string) => void }> = ({
  anomalies,
  onNavigate,
}) => {
  const counts = countsByType(anomalies.filter((a) => a.status === 'open'));

  return (
    <section
      id={IDS.detectors}
      aria-labelledby="detectors-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="detectors-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Six detectors, one engine
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            Each detector is a pure, unit-tested function that runs server-side over your document
            history. Three ship on the free plan; Pro unlocks all six.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ANOMALY_TYPES.map((t) => (
            <li
              key={t.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-200 hover:border-teal-600/40 hover:bg-white motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 text-teal-300"
                  aria-hidden="true"
                >
                  <TypeIcon icon={t.icon} />
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    t.freeTier
                      ? 'border-teal-300 bg-teal-50 text-teal-800'
                      : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {t.freeTier ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Lock className="h-3 w-3" aria-hidden="true" />
                  )}
                  {t.freeTier ? 'Free plan' : 'Pro & Team'}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{t.label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t.description}</p>
              <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                <span className="font-mono font-bold text-slate-900">{counts[t.id] ?? 0}</span> open
                in the sample account
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => onNavigate(`#${IDS.pricing}`)}
            className="inline-flex min-h-[48px] items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Compare plans
          </button>
        </div>
      </div>
    </section>
  );
};

export default Detectors;
