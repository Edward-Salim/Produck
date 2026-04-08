// ── Artifacts Data (constants only — data now lives in DB) ──

export type Category =
  | 'Strategy'
  | 'Discovery'
  | 'Validation'
  | 'Delivery'
  | 'Measurement'
  | 'Process'
  | 'Analysis';

export const ALL_CATEGORIES: Category[] = [
  'Strategy',
  'Discovery',
  'Validation',
  'Delivery',
  'Measurement',
  'Process',
  'Analysis'
];

export const PHASES = ['Learn', 'Plan', 'Build', 'Evaluate', 'Align'] as const;

import { ARTIFACT_CATEGORY_COLORS } from '$lib/constants/colors.js';

export const CATEGORY_META = ARTIFACT_CATEGORY_COLORS as Record<
  Category,
  { color: string; bg: string }
>;
