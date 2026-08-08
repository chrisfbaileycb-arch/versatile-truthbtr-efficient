import React from 'react';
import {
  TrendingUp,
  GitCompare,
  Copy,
  Moon,
  CalendarClock,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Anomaly,
  ANOMALY_TYPE_MAP,
  AnomalyTypeMeta,
  SEVERITY_META,
  Severity,
  SOURCE_LABELS,
} from '@/data/truthbuster';
import { confidenceLabel, currency, percent, relativeDate } from '@/lib/anomaly';

const ICONS: Record<AnomalyTypeMeta['icon'], React.ComponentType<{ className?: string }>> = {
  'trending-up': TrendingUp,
  'git-compare': GitCompare,
  copy: Copy,
  moon: Moon,
  'calendar-clock': CalendarClock,
  'help-circle': HelpCircle,
};

export const TypeIcon: React.FC<{ icon: AnomalyTypeMeta['icon']; className?: string }> = ({
  icon,
  className = 'h-5 w-5',
}) => {
  const Cmp = ICONS[icon] ?? HelpCircle;
  return <Cmp className={className} />;
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const s = SEVERITY_META[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.surface} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
};

export const ConfidenceBar: React.FC<{ value: number; idSuffix: string }> = ({
  value,
  idSuffix,
}) => {
  const pct = Math.round(value * 100);
  const labelId = `conf-${idSuffix}`;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs">
        <span id={labelId} className="font-medium text-slate-600">
          {confidenceLabel(value)}
        </span>
        <span className="font-mono tabular-nums text-slate-700">{percent(value)}</span>
      </div>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${pct} percent confidence`}
        className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-teal-700 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

interface Props {
  anomaly: Anomaly;
  onOpen: (a: Anomaly) => void;
}

const STATUS_CHIP: Record<Anomaly['status'], { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  resolved: { label: 'Recovered', className: 'bg-teal-50 text-teal-800 border-teal-300' },
  dismissed: { label: 'Dismissed', className: 'bg-slate-100 text-slate-500 border-slate-300' },
};

const AnomalyCard: React.FC<Props> = ({ anomaly, onOpen }) => {
  const meta = ANOMALY_TYPE_MAP[anomaly.type];
  const sev = SEVERITY_META[anomaly.severity];
  const status = STATUS_CHIP[anomaly.status];

  return (
    <article
      className={`group relative flex h-full flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 motion-reduce:transition-none ${sev.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${sev.surface} ${sev.text}`}
            aria-hidden="true"
          >
            <TypeIcon icon={meta.icon} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{anomaly.vendor}</p>
            <p className="text-xs text-slate-500">
              {meta.label} · {SOURCE_LABELS[anomaly.source]}
            </p>
          </div>
        </div>
        <SeverityBadge severity={anomaly.severity} />
      </div>

      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug text-slate-900">
          <button
            type="button"
            onClick={() => onOpen(anomaly)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
          >
            {anomaly.title}
            <span className="sr-only"> — open full detail</span>
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {anomaly.summary}
        </p>
      </div>

      <ConfidenceBar value={anomaly.confidence} idSuffix={anomaly.id} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs text-slate-500">Monthly impact</p>
          <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
            {currency(anomaly.impact)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
          >
            {anomaly.status === 'resolved' ? (
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            ) : anomaly.status === 'dismissed' ? (
              <XCircle className="h-3 w-3" aria-hidden="true" />
            ) : null}
            {status.label}
          </span>
          <span className="text-xs text-slate-500">{relativeDate(anomaly.detectedAt)}</span>
          <ChevronRight
            className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
};

export default AnomalyCard;
