import React from 'react';
import { BRAND } from '@/data/truthbuster';

/**
 * The Truthbuster "Magnifier" mark: lens + handle + anomaly spike.
 * Framework-agnostic SVG — lens uses currentColor, spike uses the accent.
 */
export const TruthbusterMark: React.FC<{
  size?: number;
  className?: string;
  accent?: string;
  title?: string;
}> = ({ size = 32, className = '', accent = BRAND.mint, title }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    <circle cx="20" cy="20" r="12.5" stroke="currentColor" strokeWidth="3.5" />
    <path
      d="M29.5 29.5 41 41"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M13.5 21.5l3.6-6.2 3.2 9 3.4-5.6h3.3"
      stroke={accent}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Wordmark: React.FC<{
  stacked?: boolean;
  tileSize?: number;
  tagline?: string;
  className?: string;
  tone?: 'light' | 'dark';
}> = ({ stacked = false, tileSize = 36, tagline, className = '', tone = 'dark' }) => {
  const textColor = tone === 'light' ? 'text-white' : 'text-slate-900';
  return (
    <span
      className={`inline-flex items-center gap-3 ${stacked ? 'flex-col gap-2 text-center' : ''} ${className}`}
    >
      <span
        className="grid place-items-center rounded-xl text-white shadow-sm"
        style={{ width: tileSize, height: tileSize, background: BRAND.ink }}
      >
        <TruthbusterMark size={Math.round(tileSize * 0.68)} />
      </span>
      <span className={stacked ? 'flex flex-col items-center' : 'flex flex-col'}>
        <span
          className={`font-bold tracking-[-0.025em] ${textColor}`}
          style={{ fontSize: Math.max(16, Math.round(tileSize * 0.55)) }}
        >
          {BRAND.name}
        </span>
        {tagline ? (
          <span className={`text-xs ${tone === 'light' ? 'text-white/70' : 'text-slate-500'}`}>
            {tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
};

export default Wordmark;
