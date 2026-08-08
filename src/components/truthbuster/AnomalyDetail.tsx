import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ThumbsDown, ThumbsUp, Info } from 'lucide-react';
import {
  AI_DISCLOSURE,
  Anomaly,
  ANOMALY_TYPE_MAP,
  SOURCE_LABELS,
} from '@/data/truthbuster';
import { currency, formatDate } from '@/lib/anomaly';
import { ConfidenceBar, SeverityBadge, TypeIcon } from './AnomalyCard';

interface Props {
  anomaly: Anomaly | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  onFeedback: (id: string, helpful: boolean) => void;
}

const AnomalyDetail: React.FC<Props> = ({
  anomaly,
  open,
  onOpenChange,
  onResolve,
  onDismiss,
  onFeedback,
}) => {
  if (!anomaly) return null;
  const meta = ANOMALY_TYPE_MAP[anomaly.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <TypeIcon icon={meta.icon} className="h-3.5 w-3.5" />
              {meta.label}
            </span>
            <SeverityBadge severity={anomaly.severity} />
          </div>
          <DialogTitle className="text-left text-xl leading-snug">{anomaly.title}</DialogTitle>
          <DialogDescription className="text-left">
            {anomaly.vendor} · {SOURCE_LABELS[anomaly.source]} · detected{' '}
            {formatDate(anomaly.detectedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-700">{anomaly.summary}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Document total</p>
              <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
                {currency(anomaly.amount)}
              </p>
            </div>
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
              <p className="text-xs text-teal-800">Recoverable / month</p>
              <p className="font-mono text-lg font-bold tabular-nums text-teal-900">
                {currency(anomaly.impact)}
              </p>
            </div>
          </div>

          <ConfidenceBar value={anomaly.confidence} idSuffix={`detail-${anomaly.id}`} />

          <section aria-labelledby={`evidence-${anomaly.id}`}>
            <h4 id={`evidence-${anomaly.id}`} className="mb-2 text-sm font-semibold text-slate-900">
              Evidence
            </h4>
            <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
              {anomaly.evidence.map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-4 px-3 py-2.5">
                  <dt className="text-sm text-slate-600">{e.label}</dt>
                  <dd className="text-right font-mono text-sm font-medium tabular-nums text-slate-900">
                    {e.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby={`action-${anomaly.id}`}
            className="rounded-xl border border-slate-900/10 bg-slate-900 p-4 text-white"
          >
            <h4
              id={`action-${anomaly.id}`}
              className="flex items-center gap-2 text-sm font-semibold"
            >
              <ShieldAlert className="h-4 w-4 text-teal-300" aria-hidden="true" />
              Suggested next step
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              {anomaly.suggestedAction}
            </p>
          </section>

          <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {AI_DISCLOSURE}
          </p>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Was this flag useful?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onFeedback(anomaly.id, true)}
                aria-label="Mark this flag as useful"
              >
                <ThumbsUp className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onFeedback(anomaly.id, false)}
                aria-label="Mark this flag as wrong"
              >
                <ThumbsDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onDismiss(anomaly.id)}>
                Dismiss
              </Button>
              <Button
                type="button"
                className="bg-teal-700 hover:bg-teal-800"
                onClick={() => onResolve(anomaly.id)}
              >
                Mark recovered
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnomalyDetail;
