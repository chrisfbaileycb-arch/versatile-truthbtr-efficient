/**
 * Pure helpers for the anomaly engine surface. No React, no side effects —
 * cheap to reason about and trivially unit-testable (mirrors the repo's
 * `src/lib/anomaly` philosophy).
 */
import {
  Anomaly,
  AnomalyType,
  Plan,
  PLAN_MAP,
  Severity,
  SEVERITY_META,
  ANOMALY_TYPES,
} from '@/data/truthbuster';

export const currency = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    ...opts,
  }).format(n);

export const percent = (n: number) => `${Math.round(n * 100)}%`;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const relativeDate = (iso: string) => {
  const days = Math.round(
    (Date.now() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000,
  );
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
};

/** Confidence below this is surfaced as "needs review" rather than a hard flag. */
export const REVIEW_THRESHOLD = 0.65;

export const confidenceLabel = (c: number) =>
  c >= 0.85 ? 'High confidence' : c >= REVIEW_THRESHOLD ? 'Moderate confidence' : 'Needs review';

/** Which anomaly types a plan may surface. */
export function allowedAnomalyTypes(plan: Plan): AnomalyType[] {
  const def = PLAN_MAP[plan];
  if (def.anomalyTypes === 'all') return ANOMALY_TYPES.map((t) => t.id);
  return def.anomalyTypes;
}

export const canScan = (plan: Plan, used: number) => used < PLAN_MAP[plan].scansPerMonth;

export const scansRemaining = (plan: Plan, used: number) => {
  const max = PLAN_MAP[plan].scansPerMonth;
  return Number.isFinite(max) ? Math.max(0, max - used) : Number.POSITIVE_INFINITY;
};

/**
 * Subscription Health Score, 0–100.
 * Starts at 100 and deducts weighted severity penalties, floored at 0.
 */
export function healthScore(anomalies: Anomaly[]): number {
  const open = anomalies.filter((a) => a.status === 'open');
  if (open.length === 0) return 100;
  const penalty = open.reduce((sum, a) => {
    const weight = SEVERITY_META[a.severity].rank * 4;
    return sum + weight * Math.max(a.confidence, 0.4);
  }, 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

export function healthBand(score: number): { label: string; tone: Severity | 'good' } {
  if (score >= 80) return { label: 'Healthy', tone: 'good' };
  if (score >= 60) return { label: 'Watch', tone: 'low' };
  if (score >= 40) return { label: 'At risk', tone: 'medium' };
  return { label: 'Critical', tone: 'high' };
}

export const totalExposure = (anomalies: Anomaly[]) =>
  anomalies.filter((a) => a.status === 'open').reduce((s, a) => s + a.impact, 0);

export const realizedSavings = (anomalies: Anomaly[]) =>
  anomalies.filter((a) => a.status === 'resolved').reduce((s, a) => s + a.impact, 0);

export type SortKey = 'severity' | 'impact' | 'recent' | 'confidence';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'severity', label: 'Severity (high first)' },
  { value: 'impact', label: 'Monthly impact' },
  { value: 'recent', label: 'Most recent' },
  { value: 'confidence', label: 'Confidence' },
];

export interface FilterState {
  query: string;
  type: AnomalyType | 'all';
  severity: Severity | 'all';
  status: 'all' | 'open' | 'resolved' | 'dismissed';
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  query: '',
  type: 'all',
  severity: 'all',
  status: 'open',
  sort: 'severity',
};

export function filterAnomalies(list: Anomaly[], f: FilterState): Anomaly[] {
  const q = f.query.trim().toLowerCase();
  const out = list.filter((a) => {
    if (f.type !== 'all' && a.type !== f.type) return false;
    if (f.severity !== 'all' && a.severity !== f.severity) return false;
    if (f.status !== 'all' && a.status !== f.status) return false;
    if (!q) return true;
    return (
      a.vendor.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    );
  });

  const sorters: Record<SortKey, (a: Anomaly, b: Anomaly) => number> = {
    severity: (a, b) =>
      SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank || b.impact - a.impact,
    impact: (a, b) => b.impact - a.impact,
    recent: (a, b) => b.detectedAt.localeCompare(a.detectedAt),
    confidence: (a, b) => b.confidence - a.confidence,
  };
  return out.sort(sorters[f.sort]);
}

export function countsByType(list: Anomaly[]): Record<string, number> {
  return list.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {});
}

export function toCsv(list: Anomaly[]): string {
  const head = ['id', 'type', 'severity', 'vendor', 'title', 'monthly_impact', 'confidence', 'detected_at', 'status'];
  const rows = list.map((a) =>
    [a.id, a.type, a.severity, a.vendor, a.title, a.impact.toFixed(2), a.confidence.toFixed(2), a.detectedAt, a.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [head.join(','), ...rows].join('\n');
}
