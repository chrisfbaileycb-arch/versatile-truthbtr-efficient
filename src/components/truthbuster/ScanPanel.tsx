import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload, FileText, AlertCircle, CheckCircle2, Camera, Inbox, Lock, Database } from 'lucide-react';
import { AI_DISCLOSURE, ANOMALY_TYPE_MAP, IDS, Severity, PLAN_MAP, SourceKind } from '@/data/truthbuster';
import { canScan, currency, percent, scansRemaining } from '@/lib/anomaly';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyzedDocument, saveScanResult } from '@/lib/documents';


interface LiveAnomaly {
  id: string;
  type: keyof typeof ANOMALY_TYPE_MAP;
  severity: Severity;
  title: string;
  summary: string;
  impact: number;
  confidence: number;
  evidence: { label: string; value: string }[];
  suggestedAction: string;
}

interface Result {
  vendor: string;
  documentType: string;
  total: number;
  currency: string;
  lineItems: { description: string; amount: number }[];
  anomalies: LiveAnomaly[];
  notes: string;
}

const SAMPLE = `ACME FACILITIES GROUP — INVOICE #AF-20418
Billing period: Jul 1 – Jul 31, 2026
Monthly service base rate .......... $1,480.00  (Jun: $1,180.00)
Fuel surcharge 7.9% ................ $116.92
Equipment rental (2 units) ......... $240.00
Equipment rental (2 units) ......... $240.00
Admin fee .......................... $45.00
TOTAL DUE .......................... $2,121.92
Card ending 4417 posted $2,384.10 on Aug 2, 2026.`;

interface ScanPanelProps {
  onRequireSignIn: () => void;
  /** Fired after a result has been persisted so the dashboard can refresh. */
  onSaved?: () => void;
}

const ScanPanel: React.FC<ScanPanelProps> = ({ onRequireSignIn, onSaved }) => {
  const { user, profile, recordScan } = useAuth();
  const plan = profile?.plan ?? 'free';
  const used = profile?.scans_used ?? 0;
  const quotaReached = Boolean(user && !canScan(plan, used));

  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (
    payload: Record<string, unknown>,
    source: SourceKind,
    originalName?: string,
  ) => {
    if (quotaReached) {
      setError(
        `You've used all ${PLAN_MAP[plan].scansPerMonth} scans on the ${PLAN_MAP[plan].name} plan this month. Upgrade to Pro for unlimited audits.`,
      );
      return;
    }
    setLoading(true);
    setError('');
    setSaveNote('');
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-document', {
        body: payload,
      });
      if (fnError) throw new Error(fnError.message);
      if (!data || (data as { error?: string }).error) {
        throw new Error((data as { error?: string })?.error || 'Analysis failed.');
      }
      const analyzed = data as Result;
      setResult(analyzed);

      if (user) {
        await recordScan();
        try {
          const saved = await saveScanResult({
            userId: user.id,
            source,
            fileName: originalName,
            result: analyzed as unknown as AnalyzedDocument,
          });
          setSaveNote(
            saved.anomalies.length > 0
              ? `Saved to your account — ${saved.anomalies.length} finding${
                  saved.anomalies.length === 1 ? '' : 's'
                } added to your dashboard.`
              : 'Saved to your account. No findings to add to the dashboard.',
          );
          onSaved?.();
        } catch (saveErr) {
          setSaveNote(
            saveErr instanceof Error
              ? `Analyzed, but saving failed: ${saveErr.message}`
              : 'Analyzed, but this scan could not be saved.',
          );
        }
      } else {
        setSaveNote('Sign in to save this audit to your dashboard.');
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Something went wrong reading that document. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Paste the text from a bill, or upload an image of one, to run an audit.');
      return;
    }
    run({ text }, 'pdf');
  };

  const onFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Upload an image of the bill (JPG, PNG or HEIC). PDF text can be pasted instead.');
      return;
    }
    if (file.size > 6_000_000) {
      setError('That image is larger than 6 MB. Try a smaller photo.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(',')[1];
      run({ imageBase64: base64, mimeType: file.type, fileName: file.name }, 'camera', file.name);
    };
    reader.onerror = () => setError('Could not read that file. Please try another image.');
    reader.readAsDataURL(file);
  };


  return (
    <section
      id={IDS.scan}
      aria-labelledby="scan-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="scan-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Audit a real bill
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Photograph an invoice, or paste the text from a PDF or statement. Extraction and
              detection both run server-side — your phone stays a fast viewer.
            </p>
          </div>

          {user ? (
            <p className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{PLAN_MAP[plan].name} plan</span> ·{' '}
              {Number.isFinite(PLAN_MAP[plan].scansPerMonth)
                ? `${scansRemaining(plan, used)} of ${PLAN_MAP[plan].scansPerMonth} scans left this month`
                : 'Unlimited scans'}
            </p>
          ) : (
            <button
              type="button"
              onClick={onRequireSignIn}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Sign in to save your audits
            </button>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <label htmlFor="doc-text" className="block text-sm font-semibold text-slate-900">
              Document text
            </label>
            <p id="doc-text-help" className="mt-1 text-sm text-slate-600">
              Line items, totals and dates give the detectors the most to work with.
            </p>
            <textarea
              id="doc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-describedby="doc-text-help"
              aria-invalid={Boolean(error) || undefined}
              rows={9}
              placeholder="Paste your invoice or statement text here…"
              className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Run the detectors
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setText(SAMPLE)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                Use a sample bill
              </button>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <input
                ref={fileRef}
                id="doc-file"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Scan with camera
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload an image
                </button>
              </div>
              {fileName && (
                <p className="mt-2 truncate text-xs text-slate-500">Selected: {fileName}</p>
              )}
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <Inbox className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                On Pro, bills forwarded to your private audit inbox land here automatically.
              </p>
            </div>
          </form>

          <div aria-live="polite" aria-atomic="false" className="min-h-[16rem]">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Analysis failed</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-3" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none"
                  />
                ))}
                <p className="text-sm text-slate-500">
                  Extracting vendor, totals and line items, then running six detectors…
                </p>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-700">No document analyzed yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Results — vendor, totals and every flag with its confidence — appear here.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {result.documentType}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">{result.vendor}</h3>
                  </div>
                  <p className="font-mono text-xl font-bold tabular-nums text-slate-900">
                    {currency(result.total)}
                  </p>
                </div>

                {saveNote && (
                  <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                    <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {saveNote}
                  </p>
                )}

                {result.lineItems.length > 0 && (
                  <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {result.lineItems.slice(0, 6).map((li, i) => (
                      <div key={`${li.description}-${i}`} className="flex justify-between gap-4 px-3 py-2">
                        <dt className="truncate text-sm text-slate-600">{li.description}</dt>
                        <dd className="font-mono text-sm tabular-nums text-slate-900">
                          {currency(li.amount)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                <h4 className="text-sm font-semibold text-slate-900">
                  {result.anomalies.length} flag{result.anomalies.length === 1 ? '' : 's'} found
                </h4>

                {result.anomalies.length === 0 ? (
                  <p className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {result.notes || 'Nothing anomalous surfaced in this document.'}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {result.anomalies.map((a) => {
                      const meta = ANOMALY_TYPE_MAP[a.type];
                      return (
                        <li
                          key={a.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                            <span className="font-mono text-sm tabular-nums text-teal-800">
                              {currency(a.impact)}/mo
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.summary}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {meta?.label ?? a.type} · {percent(a.confidence)} confidence
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-slate-700">
                            <span className="font-semibold">Next step: </span>
                            {a.suggestedAction}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <p className="text-xs leading-relaxed text-slate-500">{AI_DISCLOSURE}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScanPanel;
