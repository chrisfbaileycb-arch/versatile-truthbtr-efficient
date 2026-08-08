import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ, IDS } from '@/data/truthbuster';

const FaqSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id={IDS.faq}
      aria-labelledby="faq-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Questions people actually ask
        </h2>

        <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const btnId = `faq-button-${i}`;
            return (
              <li key={item.q}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full min-h-[56px] items-center justify-between gap-4 py-4 text-left text-base font-semibold text-slate-900 transition-colors hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 motion-reduce:transition-none"
                  >
                    {item.q}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default FaqSection;
