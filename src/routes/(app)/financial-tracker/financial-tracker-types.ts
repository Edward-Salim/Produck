import type { TrackerData } from './financial-tracker-data.js';

export type LedgerSortKey =
  | 'date'
  | 'description'
  | 'kind'
  | 'category'
  | 'account'
  | 'paymentType'
  | 'amount';

export type SortDirection = 'asc' | 'desc';

export type LedgerSortDirection = SortDirection | null;

export type InvestmentHistoryChartDatum = TrackerData['monthlyInvestmentHistory'][number] & {
  date: Date;
  label: string;
  valueLabel: string;
  growthLabel: string;
};
