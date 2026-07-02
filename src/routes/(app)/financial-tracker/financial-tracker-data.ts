export type MoneyRow = {
  label: string;
  planned: number;
  actual: number;
  variant?: 'income' | 'expense' | 'neutral';
};

export type CategoryRow = {
  label: string;
  planned: number;
  actual: number;
};

export type BudgetCategoryOption = {
  label: string;
  allocationShare: number;
};

export type WalletRow = {
  label: string;
  balance: number;
  minimumHold?: number;
  accountNumberMasked?: string;
  hasAccountNumber?: boolean;
  balanceProvided?: boolean;
  transactionsProvided?: boolean;
  note?: string;
};

export type WalletMonthState = {
  balance?: number;
  minimumHold?: number;
  updated: boolean;
};

export type WalletMonthStates = Record<string, Record<string, WalletMonthState>>;

export type InvestmentRow = {
  label: string;
  ticker?: string;
  balance: number;
  costBasis?: number;
  change: string;
  direction: 'up' | 'down';
  shares?: number;
  latestPrice?: number;
  latestPriceAt?: string;
  dividendYieldBps?: number;
};

export type MonthlyInvestmentHistoryRow = {
  monthKey: string;
  snapshotKey: string;
  portfolioValue: number;
  costBasis: number;
  gain: number;
  gainPercent: number;
  hasPreviousMonth: boolean;
  growthBaselineLabel: string;
  monthlyGrowth: number;
  monthlyGrowthPercent: number;
};

export type ForecastPreferences = {
  forecastMode: 'optimistic' | 'pessimistic';
  returnProfile: 'vti' | 'sp500' | 'gold' | 'conservative';
  investmentCurrency: 'idr' | 'usd';
  retirementAge: number;
};

export type ForecastOverrideRow = {
  relativeYear: number;
  monthIndex?: number;
  salary?: number;
  investmentContributionRate?: number;
  extraMonthlyInvestment?: number;
};

export type DebtScheduleRow = {
  provider: string;
  due: string;
  paid?: string;
  amount: number;
  status: 'paid' | 'due-now' | 'upcoming';
};

export type MonthlySummary = {
  key: string;
  label: string;
  period: string;
  updated: string;
  rollover: MoneyRow;
  income: MoneyRow;
  expenses: MoneyRow;
  bills: MoneyRow;
  savings: MoneyRow;
  debt: MoneyRow;
  leftover: MoneyRow;
};

export type DetailRow = {
  item: string;
  price: number;
  plannedQty: number;
  actualQty: number;
  plannedAmount: number;
  actualAmount: number;
  paymentMethod?: string;
  paymentType?: 'cash' | 'paylater';
};

export type LedgerEntry = {
  id: string;
  monthKey: string;
  date: string;
  description: string;
  kind: 'income' | 'expense' | 'bill' | 'debt-payment' | 'transfer';
  category: string;
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  reimbursesEntryId?: string;
  paymentType: 'cash' | 'paylater' | 'transfer';
};

export type TrackerData = {
  usdIdrRate?: number;
  monthlyAllocation: number;
  budgetCategoryOptions: BudgetCategoryOption[];
  walletMonthStates: WalletMonthStates;
  categories: CategoryRow[];
  mayCategories: CategoryRow[];
  juneCategories: CategoryRow[];
  incomeRows: CategoryRow[];
  mayIncomeRows: CategoryRow[];
  juneIncomeRows: CategoryRow[];
  billRows: { label: string; planned: number; actual: number; due: string }[];
  mayBillRows: { label: string; planned: number; actual: number; due: string }[];
  juneBillRows: { label: string; planned: number; actual: number; due: string }[];
  wallets: WalletRow[];
  investments: InvestmentRow[];
  monthlyInvestmentHistory: MonthlyInvestmentHistoryRow[];
  mayDebtSchedule: DebtScheduleRow[];
  ledgerEntries: LedgerEntry[];
  ledgerMonthKeys: string[];
  expenseDetails: Record<string, DetailRow[]>;
  mayExpenseDetails: Record<string, DetailRow[]>;
  juneExpenseDetails: Record<string, DetailRow[]>;
  investmentForecast: { year: number; optimistic: number; pessimist: number; salary: number }[];
  forecastPreferences: ForecastPreferences;
  forecastOverrides: ForecastOverrideRow[];
  monthlySummaries: MonthlySummary[];
};

export const emptyTrackerData: TrackerData = {
  usdIdrRate: undefined,
  monthlyAllocation: 0,
  budgetCategoryOptions: [],
  walletMonthStates: {},
  categories: [],
  mayCategories: [],
  juneCategories: [],
  incomeRows: [],
  mayIncomeRows: [],
  juneIncomeRows: [],
  billRows: [],
  mayBillRows: [],
  juneBillRows: [],
  wallets: [],
  investments: [],
  monthlyInvestmentHistory: [],
  mayDebtSchedule: [],
  ledgerEntries: [],
  ledgerMonthKeys: [],
  expenseDetails: {},
  mayExpenseDetails: {},
  juneExpenseDetails: {},
  investmentForecast: [],
  forecastPreferences: {
    forecastMode: 'optimistic',
    returnProfile: 'vti',
    investmentCurrency: 'idr',
    retirementAge: 40
  },
  forecastOverrides: [],
  monthlySummaries: []
};
