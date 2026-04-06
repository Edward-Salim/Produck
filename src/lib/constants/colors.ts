// ── Centralized color constants for Produck ──
// All semantic colors in one place. Cork palette (cork-50 to cork-900) lives in CSS.

// ── Kano Model ──

export const KANO = {
  'must-have': {
    label: 'Must-have',
    color: '#e74c3c',
    textClass: 'text-[#922b21]',
    lineClass: 'bg-[#e74c3c]'
  },
  performance: {
    label: 'Performance',
    color: '#27ae60',
    textClass: 'text-[#1e8449]',
    lineClass: 'bg-[#27ae60]'
  },
  delighter: {
    label: 'Delighter',
    color: '#d4a017',
    textClass: 'text-[#b7950b]',
    lineClass: 'bg-[#f1c40f]'
  }
} as const;

export const KANO_ORDER: Record<string, number> = { 'must-have': 0, performance: 1, delighter: 2 };

// ── PIC (Person-In-Charge) Colors ──

export const PIC_COLORS: Record<string, { hex: string; textClass: string }> = {
  c1: { hex: '#1a5276', textClass: 'text-[#2471a3]' },
  c2: { hex: '#145a32', textClass: 'text-[#1e8449]' },
  c3: { hex: '#7b241c', textClass: 'text-[#c0392b]' },
  c4: { hex: '#5b2c6f', textClass: 'text-[#7d3c98]' },
  c5: { hex: '#935116', textClass: 'text-[#ca6f1e]' },
  c6: { hex: '#0e6655', textClass: 'text-[#148f77]' }
};

export const PIC_DEFAULT_HEX = '#3d3529';

// ── Assumption Testing Status ──

export const ASSUMPTION_STATUS = {
  untested: { bg: '#e5e7eb', text: '#6b7280', dot: '#9ca3af', label: 'Untested' },
  validated: { bg: '#d1fae5', text: '#059669', dot: '#34d399', label: 'Validated' },
  revalidate: { bg: '#fef3c7', text: '#d97706', dot: '#fbbf24', label: 'Revalidate' },
  invalidated: { bg: '#fee2e2', text: '#dc2626', dot: '#f87171', label: 'Invalidated' }
} as const;

export const RISK_META: Record<string, { label: string; prefix: string }> = {
  desirability: { label: 'Desirability', prefix: 'D' },
  feasibility: { label: 'Feasibility', prefix: 'F' },
  usability: { label: 'Usability', prefix: 'U' },
  viability: { label: 'Viability', prefix: 'V' }
};

// ── Idea Sections ──

export const IDEA_SECTIONS = [
  { key: 'triage', label: 'Triage', bg: '#ece5d8', desc: 'New ideas to evaluate', dark: false },
  { key: 'candidate', label: 'Candidate', bg: '#ddd4c2', desc: 'Under consideration', dark: false },
  {
    key: 'working-set',
    label: 'Working Set',
    bg: '#cdc3ae',
    desc: 'Actively being built',
    dark: false
  },
  { key: 'released', label: 'Released', bg: '#b0a48e', desc: 'Shipped to users', dark: true },
  { key: 'parked', label: 'Parked', bg: '#9ca3af', desc: 'On hold', dark: true }
] as const;

// ── Experience Map Phase Colors ──

export const PHASE_COLORS = [
  { bg: 'rgba(221,212,194,0.4)', text: '#5c4b3a' },
  { bg: 'rgba(176,164,142,0.35)', text: '#5c4b3a' },
  { bg: 'rgba(138,126,107,0.3)', text: '#f5f0e8' },
  { bg: 'rgba(107,94,74,0.4)', text: '#f5f0e8' },
  { bg: 'rgba(92,75,58,0.45)', text: '#f5f0e8' },
  { bg: 'rgba(61,53,41,0.45)', text: '#f5f0e8' }
] as const;

// ── Artifact Category Colors ──

export const ARTIFACT_CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Strategy: { color: '#2e6b9c', bg: '#d6e8f5' },
  Discovery: { color: '#2e7d4f', bg: '#d4edda' },
  Validation: { color: '#b8730e', bg: '#fdeacc' },
  Delivery: { color: '#7b3fa0', bg: '#ebddf5' },
  Measurement: { color: '#b04040', bg: '#f5d5d5' },
  Process: { color: '#1a7a6d', bg: '#ccf0ea' },
  Analysis: { color: '#4a4e9c', bg: '#dbddf5' }
};

// ── Markdown Alert Colors ──

export const MD_ALERT_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  NOTE: { label: 'Note', color: '#4a6e8a', bg: '#eef3f7' },
  TIP: { label: 'Tip', color: '#5a7a4a', bg: '#eff5ec' },
  IMPORTANT: { label: 'Important', color: '#7a5a8a', bg: '#f3eff6' },
  WARNING: { label: 'Warning', color: '#8a7a3a', bg: '#f6f3ea' },
  CAUTION: { label: 'Caution', color: '#8a4a4a', bg: '#f6efef' }
};

// ── Sticky Note Gradients ──

export const STICKY_GRADIENTS = [
  { from: '#fdf6dc', to: '#f5e9a0' },
  { from: '#fef8e0', to: '#f7ecaa' },
  { from: '#fcf4d6', to: '#f3e69e' }
] as const;

// ── Semantic Colors ──

export const GAIN_COLOR = '#1e8449';
export const PAIN_COLOR = '#c0392b';
export const STAR_COLOR = '#d4a017';

// ── Progress/OKR Color Function ──

export function progressColor(pct: number): string {
  if (pct >= 80) return '#1e8449';
  if (pct >= 40) return '#d4a017';
  return '#c0392b';
}
