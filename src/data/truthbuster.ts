/**
 * TRUTHBUSTER — SINGLE SOURCE OF TRUTH
 * ------------------------------------
 * Every constant, label, plan limit, anomaly definition and sample record used
 * anywhere in the app lives here. Components import from this module only —
 * never re-declare a list, price, label or colour token in a component.
 */

export type AnomalyType =
  | 'price_drift'
  | 'cross_source_mismatch'
  | 'duplicate_charge'
  | 'dormant_subscription'
  | 'billing_frequency_shift'
  | 'unknown_vendor';

export type Severity = 'high' | 'medium' | 'low';
export type Plan = 'free' | 'pro' | 'team';
export type AnomalyStatus = 'open' | 'resolved' | 'dismissed';
export type SourceKind = 'camera' | 'pdf' | 'inbox' | 'bank';
export type Mode = 'individual' | 'practice';

/* ------------------------------------------------------------------ brand */

export const BRAND = {
  name: 'Truthbuster',
  tagline: 'Catch the charge you’d have missed.',
  /** Ink / mint colourway from the logo handoff. */
  ink: '#0B1220',
  mint: '#5EEAD4',
  brand: '#0F766E',
  brandDark: '#0D5D56',
} as const;

export const ANALYSIS_ONLY_NOTE =
  'Analysis only. Truthbuster never moves money, cancels subscriptions, or contacts vendors on your behalf. It surfaces findings — you decide what to do.';

export const AI_DISCLOSURE =
  'Findings are produced by an AI extraction + rules engine and may be incomplete or wrong. Always verify against the original document before acting.';

/* ------------------------------------------------------- anomaly metadata */

export interface AnomalyTypeMeta {
  id: AnomalyType;
  label: string;
  short: string;
  description: string;
  /** Tailwind-safe token used for the icon tile. */
  icon: 'trending-up' | 'git-compare' | 'copy' | 'moon' | 'calendar-clock' | 'help-circle';
  freeTier: boolean;
}

export const ANOMALY_TYPES: AnomalyTypeMeta[] = [
  {
    id: 'price_drift',
    label: 'Price drift',
    short: 'Drift',
    description:
      'A recurring line item is creeping upward faster than the vendor’s stated terms or inflation.',
    icon: 'trending-up',
    freeTier: true,
  },
  {
    id: 'cross_source_mismatch',
    label: 'Cross-source mismatch',
    short: 'Mismatch',
    description:
      'The invoice total does not match what actually cleared your bank or card statement.',
    icon: 'git-compare',
    freeTier: true,
  },
  {
    id: 'duplicate_charge',
    label: 'Duplicate charge',
    short: 'Duplicate',
    description:
      'The same vendor, amount and reference appear twice inside a short window.',
    icon: 'copy',
    freeTier: false,
  },
  {
    id: 'dormant_subscription',
    label: 'Dormant subscription',
    short: 'Dormant',
    description:
      'You are still paying for a service with no recorded usage or activity for months.',
    icon: 'moon',
    freeTier: true,
  },
  {
    id: 'billing_frequency_shift',
    label: 'Billing frequency shift',
    short: 'Frequency',
    description:
      'A vendor quietly moved you from annual to monthly billing — or started billing twice a cycle.',
    icon: 'calendar-clock',
    freeTier: false,
  },
  {
    id: 'unknown_vendor',
    label: 'Unknown vendor',
    short: 'Unknown',
    description:
      'A merchant descriptor that has never appeared in your history before.',
    icon: 'help-circle',
    freeTier: false,
  },
];

export const ANOMALY_TYPE_MAP: Record<AnomalyType, AnomalyTypeMeta> =
  ANOMALY_TYPES.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {} as Record<AnomalyType, AnomalyTypeMeta>);

/**
 * Severity tokens. Colours are WCAG-AA checked against their own surface:
 * `text` on `surface` is >= 4.5:1, and `text` on white is >= 4.5:1.
 */
export const SEVERITY_META: Record<
  Severity,
  { label: string; text: string; surface: string; border: string; dot: string; rank: number }
> = {
  high: {
    label: 'High severity',
    text: 'text-rose-800',
    surface: 'bg-rose-50',
    border: 'border-rose-300',
    dot: 'bg-rose-600',
    rank: 3,
  },
  medium: {
    label: 'Medium severity',
    text: 'text-amber-800',
    surface: 'bg-amber-50',
    border: 'border-amber-300',
    dot: 'bg-amber-600',
    rank: 2,
  },
  low: {
    label: 'Low severity',
    text: 'text-sky-800',
    surface: 'bg-sky-50',
    border: 'border-sky-300',
    dot: 'bg-sky-600',
    rank: 1,
  },
};

export const SOURCE_LABELS: Record<SourceKind, string> = {
  camera: 'Phone scan',
  pdf: 'PDF upload',
  inbox: 'Forwarded to inbox',
  bank: 'Bank statement',
};

/* ------------------------------------------------------------------ plans */

export interface PlanDef {
  id: Plan;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  scansPerMonth: number;
  anomalyTypes: AnomalyType[] | 'all';
  alertsEnabled: boolean;
  exportEnabled: boolean;
  multiUser: boolean;
  whiteLabel: boolean;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'See whether your bills are lying to you.',
    scansPerMonth: 3,
    anomalyTypes: ['price_drift', 'dormant_subscription', 'cross_source_mismatch'],
    alertsEnabled: false,
    exportEnabled: false,
    multiUser: false,
    whiteLabel: false,
    features: [
      '3 scans per month',
      'Price drift, dormant subs & mismatches',
      'Confidence score on every flag',
      '90 days of history',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    cadence: 'per month',
    blurb: 'Unlimited auditing with a savings guarantee.',
    scansPerMonth: Number.POSITIVE_INFINITY,
    anomalyTypes: 'all',
    alertsEnabled: true,
    exportEnabled: true,
    multiUser: false,
    whiteLabel: false,
    features: [
      'Unlimited scans',
      'All six anomaly detectors',
      'Forward-to-audit private inbox',
      'Push + email alerts',
      'CSV / PDF export',
      'Savings guarantee — find $20+/mo or it’s free',
    ],
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '$49',
    cadence: 'per month',
    blurb: 'For accountants running books for many clients.',
    scansPerMonth: Number.POSITIVE_INFINITY,
    anomalyTypes: 'all',
    alertsEnabled: true,
    exportEnabled: true,
    multiUser: true,
    whiteLabel: true,
    features: [
      'Everything in Pro',
      'Practice Manager multi-client roster',
      'Risk-sorted client dashboard',
      'White-label client reports',
      'Seat management & audit log',
    ],
  },
];

export const PLAN_MAP: Record<Plan, PlanDef> = PLANS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<Plan, PlanDef>);

/* ------------------------------------------------------------- navigation */

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard' },
  { id: 'scan', label: 'Scan', href: '#scan' },
  { id: 'detectors', label: 'Detectors', href: '#detectors' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

/* ------------------------------------------------------------- how it works */

export const HOW_IT_WORKS: { title: string; body: string; icon: 'scan' | 'sparkles' | 'flag' }[] = [
  {
    title: 'Scan or forward',
    body: 'Snap a photo, upload a PDF, or forward a bill to your private audit inbox.',
    icon: 'scan',
  },
  {
    title: 'Vision reads it',
    body: 'Vendor, totals, dates and line items are extracted automatically on the server.',
    icon: 'sparkles',
  },
  {
    title: 'Anomalies surfaced',
    body: 'Six detectors run over your history. Every flag carries a confidence score.',
    icon: 'flag',
  },
];

/* ------------------------------------------------------------- sample data */

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: Severity;
  vendor: string;
  title: string;
  summary: string;
  amount: number;
  /** Monthly impact if left unresolved. */
  impact: number;
  confidence: number; // 0..1
  detectedAt: string; // ISO date
  source: SourceKind;
  status: AnomalyStatus;
  clientId?: string;
  evidence: { label: string; value: string }[];
  suggestedAction: string;
}

export const SAMPLE_ANOMALIES: Anomaly[] = [
  {
    id: 'anm_001',
    type: 'price_drift',
    severity: 'high',
    vendor: 'Meridian Waste Services',
    title: 'Monthly haul rate up 34% in 5 months',
    summary:
      'Base haul fee moved from $268.00 to $359.12 across five invoices with no contract amendment on file.',
    amount: 359.12,
    impact: 91.12,
    confidence: 0.94,
    detectedAt: '2026-08-04',
    source: 'inbox',
    status: 'open',
    evidence: [
      { label: 'Baseline (Mar 2026)', value: '$268.00' },
      { label: 'Current (Aug 2026)', value: '$359.12' },
      { label: 'Contract escalator', value: '3% annually' },
      { label: 'Observed escalator', value: '34% in 5 months' },
    ],
    suggestedAction:
      'Request the rate schedule and ask for a credit back to the contracted escalator.',
  },
  {
    id: 'anm_002',
    type: 'duplicate_charge',
    severity: 'high',
    vendor: 'Northline Dental Supply',
    title: 'Same invoice paid twice within 9 days',
    summary:
      'Invoice #INV-44821 for $1,248.90 cleared on Jul 22 and again on Jul 31 with an identical reference.',
    amount: 1248.9,
    impact: 1248.9,
    confidence: 0.97,
    detectedAt: '2026-08-02',
    source: 'bank',
    status: 'open',
    evidence: [
      { label: 'First clearing', value: 'Jul 22 · $1,248.90' },
      { label: 'Second clearing', value: 'Jul 31 · $1,248.90' },
      { label: 'Invoice reference', value: 'INV-44821 (identical)' },
      { label: 'Vendor credit issued', value: 'None found' },
    ],
    suggestedAction: 'Contact accounts receivable and request a refund or credit memo.',
  },
  {
    id: 'anm_003',
    type: 'dormant_subscription',
    severity: 'medium',
    vendor: 'Loom Analytics Pro',
    title: 'No recorded usage for 7 months',
    summary:
      'A $89/mo seat has billed continuously since January with zero logins recorded on the vendor statement.',
    amount: 89,
    impact: 89,
    confidence: 0.81,
    detectedAt: '2026-08-01',
    source: 'inbox',
    status: 'open',
    evidence: [
      { label: 'First charge', value: 'Jan 12, 2026' },
      { label: 'Charges since', value: '7 × $89.00' },
      { label: 'Last usage line', value: '0 sessions reported' },
      { label: 'Total spent idle', value: '$623.00' },
    ],
    suggestedAction: 'Confirm the seat is unused, then decide whether to downgrade or cancel.',
  },
  {
    id: 'anm_004',
    type: 'cross_source_mismatch',
    severity: 'high',
    vendor: 'Harborlight Utilities',
    title: 'Bank cleared $412.60 more than the invoice',
    summary:
      'The July invoice totals $1,104.40 but the card statement shows $1,517.00 posted to the same descriptor.',
    amount: 1517,
    impact: 412.6,
    confidence: 0.9,
    detectedAt: '2026-07-29',
    source: 'bank',
    status: 'open',
    evidence: [
      { label: 'Invoice total', value: '$1,104.40' },
      { label: 'Statement posting', value: '$1,517.00' },
      { label: 'Difference', value: '$412.60' },
      { label: 'Matching window', value: '±3 days' },
    ],
    suggestedAction: 'Ask the vendor to itemise the difference before the next cycle posts.',
  },
  {
    id: 'anm_005',
    type: 'billing_frequency_shift',
    severity: 'medium',
    vendor: 'Cascade Practice Software',
    title: 'Annual plan silently moved to monthly',
    summary:
      'Previously billed once a year at $1,290. Now billing $139/mo — a 29% effective increase.',
    amount: 139,
    impact: 31.5,
    confidence: 0.86,
    detectedAt: '2026-07-27',
    source: 'pdf',
    status: 'open',
    evidence: [
      { label: 'Prior cadence', value: 'Annual · $1,290.00' },
      { label: 'New cadence', value: 'Monthly · $139.00' },
      { label: 'Annualised', value: '$1,668.00' },
      { label: 'Effective increase', value: '+29.3%' },
    ],
    suggestedAction: 'Ask to be returned to annual billing at the prior rate.',
  },
  {
    id: 'anm_006',
    type: 'unknown_vendor',
    severity: 'medium',
    vendor: 'GLBL*SRVC 8829',
    title: 'Merchant descriptor never seen before',
    summary:
      'A $246.00 charge from an unrecognised descriptor with no matching invoice in your history.',
    amount: 246,
    impact: 246,
    confidence: 0.72,
    detectedAt: '2026-07-25',
    source: 'bank',
    status: 'open',
    evidence: [
      { label: 'Descriptor', value: 'GLBL*SRVC 8829' },
      { label: 'Amount', value: '$246.00' },
      { label: 'Prior occurrences', value: '0 in 24 months' },
      { label: 'Matched invoice', value: 'None' },
    ],
    suggestedAction: 'Verify with your card issuer before the dispute window closes.',
  },
  {
    id: 'anm_007',
    type: 'price_drift',
    severity: 'medium',
    vendor: 'Atlas Courier',
    title: 'Fuel surcharge up 18% since April',
    summary:
      'Surcharge line moved from 6.5% to 7.7% of subtotal while published index fell.',
    amount: 84.3,
    impact: 13.1,
    confidence: 0.78,
    detectedAt: '2026-07-21',
    source: 'pdf',
    status: 'open',
    evidence: [
      { label: 'April surcharge', value: '6.5%' },
      { label: 'July surcharge', value: '7.7%' },
      { label: 'Published index', value: 'Down 2.1%' },
      { label: 'Monthly delta', value: '$13.10' },
    ],
    suggestedAction: 'Request the surcharge index the vendor is pricing against.',
  },
  {
    id: 'anm_008',
    type: 'dormant_subscription',
    severity: 'low',
    vendor: 'Stockyard Image Library',
    title: 'Seat unused since March',
    summary: 'A $29/mo plan with no downloads recorded in five billing cycles.',
    amount: 29,
    impact: 29,
    confidence: 0.69,
    detectedAt: '2026-07-18',
    source: 'inbox',
    status: 'open',
    evidence: [
      { label: 'Plan', value: 'Creator · $29.00/mo' },
      { label: 'Downloads (5 cycles)', value: '0' },
      { label: 'Renewal date', value: 'Aug 18, 2026' },
      { label: 'Spent idle', value: '$145.00' },
    ],
    suggestedAction: 'Cancel before the next renewal if the library is no longer needed.',
  },
  {
    id: 'anm_009',
    type: 'duplicate_charge',
    severity: 'medium',
    vendor: 'Riverbend Linen Co.',
    title: 'Two identical $318.00 postings, same day',
    summary:
      'Both postings share the delivery reference RB-9921 with no second delivery note.',
    amount: 318,
    impact: 318,
    confidence: 0.88,
    detectedAt: '2026-07-15',
    source: 'bank',
    status: 'resolved',
    evidence: [
      { label: 'Posting A', value: 'Jul 14 · $318.00' },
      { label: 'Posting B', value: 'Jul 14 · $318.00' },
      { label: 'Delivery note', value: 'One only (RB-9921)' },
      { label: 'Outcome', value: 'Credit received Jul 30' },
    ],
    suggestedAction: 'Credit confirmed — no further action needed.',
  },
  {
    id: 'anm_010',
    type: 'cross_source_mismatch',
    severity: 'low',
    vendor: 'Peak Telecom',
    title: 'Invoice $12.40 under the cleared amount',
    summary: 'Small recurring gap consistent with an untaxed regulatory fee.',
    amount: 214.4,
    impact: 12.4,
    confidence: 0.64,
    detectedAt: '2026-07-11',
    source: 'inbox',
    status: 'open',
    evidence: [
      { label: 'Invoice total', value: '$202.00' },
      { label: 'Cleared', value: '$214.40' },
      { label: 'Gap', value: '$12.40 (recurring)' },
      { label: 'Likely cause', value: 'Regulatory recovery fee' },
    ],
    suggestedAction: 'Low impact — monitor for three cycles before escalating.',
  },
  {
    id: 'anm_011',
    type: 'price_drift',
    severity: 'low',
    vendor: 'Verdant Landscaping',
    title: 'Visit rate up 6% mid-contract',
    summary: 'Per-visit rate moved from $95.00 to $100.70 without notice.',
    amount: 100.7,
    impact: 5.7,
    confidence: 0.6,
    detectedAt: '2026-07-08',
    source: 'camera',
    status: 'dismissed',
    evidence: [
      { label: 'Prior rate', value: '$95.00 / visit' },
      { label: 'Current rate', value: '$100.70 / visit' },
      { label: 'Notice on file', value: 'None' },
      { label: 'Your note', value: 'Agreed verbally in June' },
    ],
    suggestedAction: 'Dismissed — you confirmed this was agreed verbally.',
  },
  {
    id: 'anm_012',
    type: 'billing_frequency_shift',
    severity: 'high',
    vendor: 'Sentinel Alarm Monitoring',
    title: 'Billed twice in a single cycle',
    summary:
      'Two full monthly charges of $174.00 posted 11 days apart with the same coverage window.',
    amount: 174,
    impact: 174,
    confidence: 0.92,
    detectedAt: '2026-07-05',
    source: 'bank',
    status: 'open',
    evidence: [
      { label: 'Charge 1', value: 'Jul 1 · $174.00' },
      { label: 'Charge 2', value: 'Jul 12 · $174.00' },
      { label: 'Coverage window', value: 'Identical (Jul)' },
      { label: 'Contract cadence', value: 'Monthly' },
    ],
    suggestedAction: 'Request reversal of the second charge citing the duplicate coverage window.',
  },
];

/* ------------------------------------------------- practice manager roster */

export interface ClientRow {
  id: string;
  name: string;
  entity: string;
  openAnomalies: number;
  criticalAnomalies: number;
  exposure: number;
  lastScan: string;
  plan: Plan;
}

export const SAMPLE_CLIENTS: ClientRow[] = [
  { id: 'cl_01', name: 'Northgate Family Dental', entity: 'S-Corp', openAnomalies: 7, criticalAnomalies: 3, exposure: 4218.4, lastScan: '2026-08-06', plan: 'pro' },
  { id: 'cl_02', name: 'Harbor Physio Group', entity: 'LLC', openAnomalies: 5, criticalAnomalies: 2, exposure: 2890.15, lastScan: '2026-08-05', plan: 'pro' },
  { id: 'cl_03', name: 'Cedar & Vine Bistro', entity: 'LLC', openAnomalies: 6, criticalAnomalies: 2, exposure: 2140.0, lastScan: '2026-08-05', plan: 'free' },
  { id: 'cl_04', name: 'Latitude Veterinary', entity: 'PC', openAnomalies: 4, criticalAnomalies: 1, exposure: 1786.5, lastScan: '2026-08-03', plan: 'pro' },
  { id: 'cl_05', name: 'Ironworks Fitness', entity: 'LLC', openAnomalies: 3, criticalAnomalies: 1, exposure: 1204.75, lastScan: '2026-08-02', plan: 'free' },
  { id: 'cl_06', name: 'Bright Path Counseling', entity: 'Sole prop', openAnomalies: 2, criticalAnomalies: 0, exposure: 640.2, lastScan: '2026-07-30', plan: 'pro' },
  { id: 'cl_07', name: 'Quarry Road Auto', entity: 'LLC', openAnomalies: 2, criticalAnomalies: 0, exposure: 512.9, lastScan: '2026-07-29', plan: 'free' },
  { id: 'cl_08', name: 'Wilder Architecture', entity: 'PLLC', openAnomalies: 1, criticalAnomalies: 0, exposure: 289.0, lastScan: '2026-07-27', plan: 'pro' },
];

/* --------------------------------------------------------------- scan feed */

export interface ScanRecord {
  id: string;
  vendor: string;
  source: SourceKind;
  total: number;
  scannedAt: string;
  flags: number;
}

export const SAMPLE_SCANS: ScanRecord[] = [
  { id: 'scn_01', vendor: 'Meridian Waste Services', source: 'inbox', total: 359.12, scannedAt: '2026-08-04', flags: 1 },
  { id: 'scn_02', vendor: 'Northline Dental Supply', source: 'pdf', total: 1248.9, scannedAt: '2026-08-02', flags: 1 },
  { id: 'scn_03', vendor: 'Loom Analytics Pro', source: 'inbox', total: 89.0, scannedAt: '2026-08-01', flags: 1 },
  { id: 'scn_04', vendor: 'Harborlight Utilities', source: 'bank', total: 1517.0, scannedAt: '2026-07-29', flags: 1 },
  { id: 'scn_05', vendor: 'Cascade Practice Software', source: 'pdf', total: 139.0, scannedAt: '2026-07-27', flags: 1 },
  { id: 'scn_06', vendor: 'Atlas Courier', source: 'camera', total: 84.3, scannedAt: '2026-07-21', flags: 1 },
  { id: 'scn_07', vendor: 'Peak Telecom', source: 'inbox', total: 214.4, scannedAt: '2026-07-11', flags: 1 },
  { id: 'scn_08', vendor: 'Verdant Landscaping', source: 'camera', total: 100.7, scannedAt: '2026-07-08', flags: 0 },
];

/* --------------------------------------------------------------------- faq */

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Does Truthbuster ever touch my money?',
    a: 'No. Truthbuster is analysis only. It never moves money, cancels a subscription, or contacts a vendor for you. Every flag ends with a suggested action that you carry out yourself.',
  },
  {
    q: 'Why does extraction run on the server?',
    a: 'The vision extraction and the anomaly engine both run server-side. Your phone stays a fast viewer — no battery drain, and the detection logic stays private. The service worker caches your last audit so the app still opens on a weak signal.',
  },
  {
    q: 'What is the confidence score?',
    a: 'Each detector emits a 0–100% confidence based on how much corroborating history it had. Anything under 65% is shown as “needs review” rather than a hard flag, and you can mark any flag as wrong to retrain your own baseline.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes — it is a installable PWA. Add it to your home screen from your browser menu and it runs full-screen with offline access to your last-loaded audit.',
  },
  {
    q: 'How does the savings guarantee work?',
    a: 'On Pro, if Truthbuster does not surface at least $20/month of recoverable spend in your first 60 days, the plan is free until it does.',
  },
  {
    q: 'What about my accountant?',
    a: 'The Team plan turns the dashboard into a Practice Manager: a roster of every client sorted by risk, so you can see who has critical anomalies before the monthly close.',
  },
];

/* ---------------------------------------------------------------- a11y ids */

export const IDS = {
  main: 'main-content',
  dashboard: 'dashboard',
  scan: 'scan',
  detectors: 'detectors',
  pricing: 'pricing',
  faq: 'faq',
} as const;
