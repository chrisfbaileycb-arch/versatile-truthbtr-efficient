import React, { useMemo, useState } from 'react';
import {
  Search,
  Download,
  SlidersHorizontal,
  Users,
  User,
  AlertTriangle,
  Database,
  FlaskConical,
  Loader2,
} from 'lucide-react';
import {
  Anomaly,
  ANOMALY_TYPES,
  IDS,
  Mode,
  SAMPLE_CLIENTS,
  SEVERITY_META,
  Severity,
} from '@/data/truthbuster';
import {
  currency,
  DEFAULT_FILTERS,
  FilterState,
  filterAnomalies,
  formatDate,
  healthBand,
  healthScore,
  realizedSavings,
  SORT_OPTIONS,
  toCsv,
  totalExposure,
} from '@/lib/anomaly';
import AnomalyCard from './AnomalyCard';

const HealthRing: React.FC<{ score: number }> = ({ score }) => {
  const band = healthBand(score);
  const r = 46;
  const c = 2 * Math.PI * r;
  const stroke =
    band.tone === 'good' ? '#0f766e' : band.tone === 'low' ? '#0369a1' : band.tone === 'medium' ? '#b45309' : '#be123c';
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" role="img"
        aria-label={`Subscription health score ${score} out of 100 — ${band.label}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={stroke} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        />
      </svg>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Subscription health</p>
        <p className="font-mono text-4xl font-bold tabular-nums text-slate-900">{score}</p>
        <p className="text-sm font-semibold text-slate-700">{band.label}</p>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; hint?: string; tone?: 'default' | 'alert' }> = ({
  label,
  value,
  hint,
  tone = 'default',
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p
      className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
        tone === 'alert' ? 'text-rose-700' : 'text-slate-900'
      }`}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

interface Props {
  anomalies: Anomaly[];
  onOpen: (a: Anomaly) => void;
  /** True while the signed-in user's saved findings are being fetched. */
  loading?: boolean;
  /** True when `anomalies` came from the database rather than sample data. */
  isLiveData?: boolean;
  /** Running total stored on the profile row; falls back to the derived sum. */
  realizedSavings?: number;
  onNavigate?: (href: string) => void;
}

const Dashboard: React.FC<Props> = ({
  anomalies,
  onOpen,
  loading = false,
  isLiveData = false,
  realizedSavings: profileSavings,
  onNavigate,
}) => {
  const [mode, setMode] = useState<Mode>('individual');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const visible = useMemo(() => filterAnomalies(anomalies, filters), [anomalies, filters]);
  const score = useMemo(() => healthScore(anomalies), [anomalies]);
  const exposure = useMemo(() => totalExposure(anomalies), [anomalies]);
  const derivedRecovered = useMemo(() => realizedSavings(anomalies), [anomalies]);
  const recovered =
    isLiveData && typeof profileSavings === 'number' ? profileSavings : derivedRecovered;
  const criticals = anomalies.filter((a) => a.status === 'open' && a.severity === 'high').length;

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));


  const exportCsv = () => {
    const blob = new Blob([toCsv(visible)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthbuster-anomalies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectClass =
    'min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600';

  return (
    <section
      id={IDS.dashboard}
      aria-labelledby="dashboard-heading"
      className="scroll-mt-20 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="dashboard-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Your audit dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-lg text-slate-600">
              One view of everything the detectors flagged — filter it, sort it, export it.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Dashboard mode"
            className="inline-flex self-start rounded-xl border border-slate-300 bg-white p-1"
          >
            {([
              { id: 'individual', label: 'Individual', icon: User },
              { id: 'practice', label: 'Practice Manager', icon: Users },
            ] as const).map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={mode === t.id}
                aria-controls={`panel-${t.id}`}
                id={`tab-${t.id}`}
                onClick={() => setMode(t.id)}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 motion-reduce:transition-none ${
                  mode === t.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'individual' ? (
          <div id="panel-individual" role="tabpanel" aria-labelledby="tab-individual" className="mt-8">
            <p
              role="status"
              className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
                isLiveData
                  ? 'border-teal-300 bg-teal-50 text-teal-900'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {loading ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : isLiveData ? (
                <Database className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {loading
                  ? 'Loading your saved findings…'
                  : isLiveData
                    ? `Live data — ${anomalies.length} finding${
                        anomalies.length === 1 ? '' : 's'
                      } saved to your account. Every scan you run is stored here.`
                    : 'Sample data. Sign in and run a scan to build your own audit history.'}
              </span>
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
                <HealthRing score={score} />
              </div>
              <Stat
                label="Monthly exposure"
                value={currency(exposure)}
                hint="Recoverable if every open flag is resolved"
                tone="alert"
              />
              <Stat
                label="Recovered to date"
                value={currency(recovered)}
                hint={isLiveData ? 'Saved on your profile' : 'Confirmed credits & refunds'}
              />
              <Stat
                label="Critical flags"
                value={String(criticals)}
                hint="High severity, still open"
                tone={criticals > 0 ? 'alert' : 'default'}
              />
            </div>


            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filter findings
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <label htmlFor="anomaly-search" className="sr-only">
                    Search findings by vendor or description
                  </label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="anomaly-search"
                      type="search"
                      value={filters.query}
                      onChange={(e) => set('query', e.target.value)}
                      placeholder="Search vendor or finding…"
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="filter-type" className="sr-only">Anomaly type</label>
                  <select
                    id="filter-type"
                    value={filters.type}
                    onChange={(e) => set('type', e.target.value as FilterState['type'])}
                    className={`${selectClass} w-full`}
                  >
                    <option value="all">All types</option>
                    {ANOMALY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-severity" className="sr-only">Severity</label>
                  <select
                    id="filter-severity"
                    value={filters.severity}
                    onChange={(e) => set('severity', e.target.value as Severity | 'all')}
                    className={`${selectClass} w-full`}
                  >
                    <option value="all">All severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-sort" className="sr-only">Sort by</label>
                  <select
                    id="filter-sort"
                    value={filters.sort}
                    onChange={(e) => set('sort', e.target.value as FilterState['sort'])}
                    className={`${selectClass} w-full`}
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Status:</span>
                {(['open', 'resolved', 'dismissed', 'all'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={filters.status === s}
                    onClick={() => set('status', s)}
                    className={`min-h-[36px] rounded-full border px-3 text-xs font-semibold capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                      filters.status === s
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s === 'resolved' ? 'recovered' : s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="min-h-[36px] rounded-full px-3 text-xs font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={visible.length === 0}
                  className="ml-auto inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export CSV
                </button>
              </div>
            </div>

            <p aria-live="polite" className="mt-6 text-sm text-slate-600">
              Showing <strong className="font-semibold text-slate-900">{visible.length}</strong> of{' '}
              {anomalies.length} findings
            </p>

            {visible.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                <p className="mt-3 font-medium text-slate-900">
                  {isLiveData && anomalies.length === 0
                    ? 'No saved findings yet'
                    : 'No findings match those filters'}
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                  {isLiveData && anomalies.length === 0
                    ? 'Run your first audit — every flag the detectors raise is stored on your account, permanently.'
                    : 'Try widening the status, type or severity filters.'}
                </p>
                <button
                  type="button"
                  onClick={
                    isLiveData && anomalies.length === 0
                      ? () => onNavigate?.('#scan')
                      : () => setFilters(DEFAULT_FILTERS)
                  }
                  className="mt-4 min-h-[44px] rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  {isLiveData && anomalies.length === 0 ? 'Audit a bill' : 'Clear filters'}
                </button>
              </div>

            ) : (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((a) => (
                  <li key={a.id}>
                    <AnomalyCard anomaly={a} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div id="panel-practice" role="tabpanel" aria-labelledby="tab-practice" className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-left">
                  <caption className="sr-only">
                    Client roster sorted by risk, showing open and critical anomalies per client
                  </caption>
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Client</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Open</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Critical</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Exposure</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Last scan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SAMPLE_CLIENTS.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-slate-50 motion-reduce:transition-none">
                        <th scope="row" className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {c.name}
                          <span className="block text-xs font-normal text-slate-500">
                            {c.entity} · {c.plan.toUpperCase()}
                          </span>
                        </th>
                        <td className="px-4 py-3 font-mono text-sm tabular-nums text-slate-700">
                          {c.openAnomalies}
                        </td>
                        <td className="px-4 py-3">
                          {c.criticalAnomalies > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${SEVERITY_META.high.surface} ${SEVERITY_META.high.text} ${SEVERITY_META.high.border}`}
                            >
                              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                              {c.criticalAnomalies} critical
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-slate-900">
                          {currency(c.exposure)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(c.lastScan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Practice Manager is included with the Team plan — roster sorted by risk so you see who
              needs attention before the monthly close.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
