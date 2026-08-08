/**
 * Persistence layer for real scan results.
 * -----------------------------------------------------------------------
 * Everything that touches the `documents` / `anomalies` tables lives here so
 * components never hand-roll Supabase queries. Row shapes are mapped to the
 * canonical `Anomaly` type from `@/data/truthbuster` (single source of truth).
 */
import { supabase } from '@/lib/supabase';
import {
  Anomaly,
  AnomalyStatus,
  AnomalyType,
  ANOMALY_TYPE_MAP,
  ScanRecord,
  Severity,
  SourceKind,
} from '@/data/truthbuster';

/* ------------------------------------------------------------------ types */

export interface AnalyzedAnomaly {
  id?: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  amount?: number;
  impact?: number;
  confidence?: number;
  evidence?: { label: string; value: string }[];
  suggestedAction?: string;
}

export interface AnalyzedDocument {
  vendor: string;
  documentType: string;
  total: number;
  currency?: string;
  lineItems: { description: string; amount: number }[];
  anomalies: AnalyzedAnomaly[];
  notes?: string;
}

interface DocumentRow {
  id: string;
  vendor: string;
  document_type: string;
  total: number | string;
  currency: string;
  source: SourceKind;
  file_name: string | null;
  line_items: { description: string; amount: number }[] | null;
  notes: string | null;
  flags: number;
  created_at: string;
}

interface AnomalyRow {
  id: string;
  document_id: string | null;
  type: string;
  severity: string;
  vendor: string;
  title: string;
  summary: string;
  amount: number | string;
  impact: number | string;
  confidence: number | string;
  source: string;
  status: string;
  evidence: { label: string; value: string }[] | null;
  suggested_action: string | null;
  detected_at: string;
}

/* -------------------------------------------------------------- coercion */

const num = (v: unknown, fallback = 0) => {
  const n = typeof v === 'string' ? Number.parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const asType = (v: string): AnomalyType =>
  (v in ANOMALY_TYPE_MAP ? v : 'unknown_vendor') as AnomalyType;

const asSeverity = (v: string): Severity =>
  v === 'high' || v === 'medium' || v === 'low' ? v : 'medium';

const asStatus = (v: string): AnomalyStatus =>
  v === 'resolved' || v === 'dismissed' ? v : 'open';

const asSource = (v: string): SourceKind =>
  v === 'camera' || v === 'pdf' || v === 'inbox' || v === 'bank' ? v : 'pdf';

const isoDate = (d: Date = new Date()) => d.toISOString().slice(0, 10);

export const rowToAnomaly = (row: AnomalyRow): Anomaly => ({
  id: row.id,
  type: asType(row.type),
  severity: asSeverity(row.severity),
  vendor: row.vendor,
  title: row.title,
  summary: row.summary ?? '',
  amount: num(row.amount),
  impact: num(row.impact),
  confidence: Math.min(1, Math.max(0, num(row.confidence, 0.5))),
  detectedAt: (row.detected_at ?? isoDate()).slice(0, 10),
  source: asSource(row.source),
  status: asStatus(row.status),
  evidence: Array.isArray(row.evidence) ? row.evidence : [],
  suggestedAction: row.suggested_action ?? '',
});

export const rowToScan = (row: DocumentRow): ScanRecord => ({
  id: row.id,
  vendor: row.vendor,
  source: asSource(row.source),
  total: num(row.total),
  scannedAt: (row.created_at ?? new Date().toISOString()).slice(0, 10),
  flags: row.flags ?? 0,
});

/* ---------------------------------------------------------------- writes */

export interface SaveScanArgs {
  userId: string;
  source: SourceKind;
  fileName?: string;
  result: AnalyzedDocument;
}

export interface SaveScanOutcome {
  documentId: string;
  anomalies: Anomaly[];
}

/** Writes one analyze-document result (plus every flag) to the database. */
export async function saveScanResult({
  userId,
  source,
  fileName,
  result,
}: SaveScanArgs): Promise<SaveScanOutcome> {
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      vendor: result.vendor || 'Unknown vendor',
      document_type: result.documentType || 'document',
      total: num(result.total),
      currency: result.currency || 'USD',
      source,
      file_name: fileName ?? null,
      line_items: Array.isArray(result.lineItems) ? result.lineItems : [],
      notes: result.notes ?? null,
      flags: result.anomalies?.length ?? 0,
    })
    .select()
    .single();

  if (docError || !doc) throw new Error(docError?.message || 'Could not save this scan.');

  const flags = Array.isArray(result.anomalies) ? result.anomalies : [];
  if (flags.length === 0) return { documentId: (doc as DocumentRow).id, anomalies: [] };

  const payload = flags.map((a) => ({
    user_id: userId,
    document_id: (doc as DocumentRow).id,
    type: asType(a.type),
    severity: asSeverity(a.severity),
    vendor: result.vendor || 'Unknown vendor',
    title: a.title || 'Finding',
    summary: a.summary || '',
    amount: num(a.amount, num(result.total)),
    impact: num(a.impact),
    confidence: Math.min(1, Math.max(0, num(a.confidence, 0.5))),
    source,
    status: 'open',
    evidence: Array.isArray(a.evidence) ? a.evidence : [],
    suggested_action: a.suggestedAction || '',
    detected_at: isoDate(),
  }));

  const { data: saved, error: anomalyError } = await supabase
    .from('anomalies')
    .insert(payload)
    .select();

  if (anomalyError) throw new Error(anomalyError.message);

  return {
    documentId: (doc as DocumentRow).id,
    anomalies: ((saved ?? []) as AnomalyRow[]).map(rowToAnomaly),
  };
}

/* ----------------------------------------------------------------- reads */

export async function fetchUserAnomalies(userId: string): Promise<Anomaly[]> {
  const { data, error } = await supabase
    .from('anomalies')
    .select('*')
    .eq('user_id', userId)
    .order('detected_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return ((data ?? []) as AnomalyRow[]).map(rowToAnomaly);
}

export async function fetchUserScans(userId: string): Promise<ScanRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return ((data ?? []) as DocumentRow[]).map(rowToScan);
}

/* ---------------------------------------------------------------- status */

export async function updateAnomalyStatus(
  userId: string,
  anomalyId: string,
  status: AnomalyStatus,
): Promise<void> {
  const { error } = await supabase
    .from('anomalies')
    .update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', anomalyId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}
