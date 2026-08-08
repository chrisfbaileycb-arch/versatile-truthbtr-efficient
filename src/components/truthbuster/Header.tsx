import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Download, LogIn } from 'lucide-react';
import { Wordmark } from './Brand';
import { NAV_ITEMS, IDS } from '@/data/truthbuster';
import { useAuth } from '@/contexts/AuthContext';
import AccountMenu from './AccountMenu';

interface Props {
  activeSection: string;
  onNavigate: (href: string) => void;
  onInstall: () => void;
  canInstall: boolean;
  onSignIn: () => void;
}

const Header: React.FC<Props> = ({
  activeSection,
  onNavigate,
  onInstall,
  canInstall,
  onSignIn,
}) => {
  const { user, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the drawer on Escape and return focus to the toggle (keyboard a11y).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    onNavigate(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <a
        href={`#${IDS.main}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            go('#top');
          }}
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          aria-label="Truthbuster — back to top"
        >
          <Wordmark tileSize={34} />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item.href);
                    }}
                    className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {canInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="hidden min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:inline-flex"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Install app
            </button>
          )}
          <a
            href={`#${IDS.scan}`}
            onClick={(e) => {
              e.preventDefault();
              go(`#${IDS.scan}`);
            }}
            className="hidden min-h-[44px] items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none sm:inline-flex"
          >
            Audit a bill
          </a>

          {!loading &&
            (user ? (
              <AccountMenu onNavigate={onNavigate} />
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
              </button>
            ))}


          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="border-t border-slate-200 bg-white md:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 py-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  className={`flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    activeSection === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`#${IDS.scan}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(`#${IDS.scan}`);
                }}
                className="flex min-h-[48px] items-center rounded-lg bg-teal-700 px-3 text-base font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                Audit a bill
              </a>
            </li>

            {canInstall && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onInstall();
                  }}
                  className="flex min-h-[48px] w-full items-center gap-2 rounded-lg px-3 text-base font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Install app
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
