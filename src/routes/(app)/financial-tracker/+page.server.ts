import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import {
  financialTrackerBudgetCategory,
  financialTrackerCategoryRow,
  financialTrackerDebtSchedule,
  financialTrackerExpenseDetail,
  financialTrackerForecastOverride,
  financialTrackerForecastPreference,
  financialTrackerInvestment,
  financialTrackerInvestmentForecast,
  financialTrackerInvestmentSnapshot,
  financialTrackerLedgerEntry,
  financialTrackerLedgerMonth,
  financialTrackerMonthlySummary,
  financialTrackerSetting,
  financialTrackerWallet
} from '$lib/server/db/schema';
import { and, asc, eq, isNull } from 'drizzle-orm';
import type {
  CategoryRow,
  DebtScheduleRow,
  DetailRow,
  InvestmentRow,
  LedgerEntry,
  MonthlyInvestmentHistoryRow,
  MonthlySummary,
  TrackerData,
  WalletRow
} from './financial-tracker-data';
import type { Actions, PageServerLoad } from './$types';

const priceScale = 1_000_000;
const sharesScale = 1_000_000;
const investmentQuoteRefreshMs = 12 * 60 * 60 * 1000;
const investmentBaselineMonthKey = '2026-05';
const investmentBaselineSnapshotKey = '2026-05-31';
const defaultRetirementAge = 40;
const minRetirementAge = 25;
const maxRetirementAge = 71;
type InvestmentSnapshot = typeof financialTrackerInvestmentSnapshot.$inferSelect;
type InvestmentRecord = typeof financialTrackerInvestment.$inferSelect;
type DailyInvestmentSnapshotTotal = {
  snapshotKey: string;
  monthKey: string;
  portfolioValue: number;
  costBasis: number;
};

function allowedEmails() {
  return (env.FINANCIAL_TRACKER_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function assertFinancialTrackerAccess(user: NonNullable<App.Locals['session']>['user']) {
  const emails = allowedEmails();

  if (emails.length > 0 && !emails.includes(user.email.toLowerCase())) {
    throw error(403, 'Forbidden');
  }

  if (emails.length === 0 && env.NODE_ENV === 'production') {
    throw error(403, 'FINANCIAL_TRACKER_ALLOWED_EMAILS is not configured.');
  }
}

function parsePercent(value: string) {
  const parsed = Number(value.replace('%', '').replace('+', '').trim());
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

function parseOptionalMoney(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value).replace(/\D/g, '');
  if (text === '') return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseOptionalSignedMoney(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value).replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
  if (text === '' || text === '-') return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function parseOptionalPercentBps(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value).trim();
  if (text === '') return 0;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return undefined;
  return Math.round(parsed * 100);
}

function normalizeForecastSalary(value: number | null | undefined) {
  if (value == null) return value;
  return value > 0 && value < 1_000 ? value * 1_000_000 : value;
}

function validForecastMode(value: string) {
  return value === 'optimistic' || value === 'pessimistic' ? value : 'optimistic';
}

function validReturnProfile(value: string) {
  return ['vti', 'sp500', 'gold', 'conservative'].includes(value) ? value : 'vti';
}

function validInvestmentCurrency(value: string) {
  return value === 'usd' || value === 'idr' ? value : 'idr';
}

function validRetirementAge(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return defaultRetirementAge;
  return Math.min(maxRetirementAge, Math.max(minRetirementAge, parsed));
}

function formatInvestmentChange(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

async function fetchFinnhubQuote(ticker: string) {
  const token = env.FINNHUB_API_KEY;
  if (!token) throw new Error('FINNHUB_API_KEY is not configured.');

  const url = new URL('https://finnhub.io/api/v1/quote');
  url.searchParams.set('symbol', ticker);
  url.searchParams.set('token', token);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Finnhub quote failed for ${ticker}.`);

  const quote = (await response.json()) as { c?: number };
  if (!quote.c || quote.c <= 0) throw new Error(`Finnhub returned no price for ${ticker}.`);

  return quote.c;
}

async function fetchUsdIdrRate() {
  const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR');
  if (!response.ok) throw new Error('USD/IDR rate fetch failed.');

  const body = (await response.json()) as { rates?: { IDR?: number } };
  if (!body.rates?.IDR) throw new Error('USD/IDR rate is unavailable.');

  return body.rates.IDR;
}

function investmentNeedsRefresh(row: { latestPriceAt: Date | null }) {
  if (!row.latestPriceAt) return true;
  return Date.now() - row.latestPriceAt.getTime() > investmentQuoteRefreshMs;
}

function investmentSnapshotKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

async function saveInvestmentSnapshot(ownerEmail: string) {
  const snapshotKey = investmentSnapshotKey();
  const rows = await db
    .select()
    .from(financialTrackerInvestment)
    .where(eq(financialTrackerInvestment.ownerEmail, ownerEmail))
    .orderBy(asc(financialTrackerInvestment.sortOrder));

  await db
    .delete(financialTrackerInvestmentSnapshot)
    .where(
      and(
        eq(financialTrackerInvestmentSnapshot.ownerEmail, ownerEmail),
        eq(financialTrackerInvestmentSnapshot.snapshotKey, snapshotKey)
      )
    );

  if (rows.length === 0) return;

  await db.insert(financialTrackerInvestmentSnapshot).values(
    rows.map((row) => ({
      ownerEmail,
      snapshotKey,
      label: row.label,
      ticker: row.ticker,
      balance: row.balance,
      costBasis: row.costBasis ?? row.balance,
      change: row.change,
      direction: row.direction,
      latestPriceScaled: row.latestPriceScaled,
      latestPriceAt: row.latestPriceAt,
      sortOrder: row.sortOrder
    }))
  );
}

async function refreshInvestmentQuotes(
  ownerEmail: string,
  force = false,
  usdIdrRateOverride?: number
) {
  const rows = await db
    .select()
    .from(financialTrackerInvestment)
    .where(eq(financialTrackerInvestment.ownerEmail, ownerEmail))
    .orderBy(asc(financialTrackerInvestment.sortOrder));

  const quoteRows = rows.filter((row) => row.ticker && (force || investmentNeedsRefresh(row)));
  if (quoteRows.length === 0) {
    await saveInvestmentSnapshot(ownerEmail);
    return;
  }

  const usdIdrRate = usdIdrRateOverride ?? (await fetchUsdIdrRate());

  for (const row of quoteRows) {
    if (!row.ticker) continue;

    const latestPrice = await fetchFinnhubQuote(row.ticker);
    const latestPriceScaled = Math.round(latestPrice * priceScale);
    const existingShares = row.sharesScaled ? row.sharesScaled / sharesScale : null;
    const shares =
      existingShares && existingShares > 0
        ? existingShares
        : row.balance / (latestPrice * usdIdrRate);
    const sharesScaled = Math.round(shares * sharesScale);
    const costBasis =
      row.costBasis ??
      Math.round(row.balance / Math.max(1 + parsePercent(row.change), Number.EPSILON));
    const balance = Math.round(shares * latestPrice * usdIdrRate);
    const changePercent = costBasis > 0 ? ((balance - costBasis) / costBasis) * 100 : 0;

    await db
      .update(financialTrackerInvestment)
      .set({
        sharesScaled,
        costBasis,
        latestPriceScaled,
        latestPriceAt: new Date(),
        balance,
        change: formatInvestmentChange(changePercent),
        direction: changePercent >= 0 ? 'up' : 'down',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerInvestment.ownerEmail, ownerEmail),
          eq(financialTrackerInvestment.id, row.id)
        )
      );
  }

  await saveInvestmentSnapshot(ownerEmail);
}

function buildMonthlyInvestmentHistory(
  snapshots: InvestmentSnapshot[],
  investments: InvestmentRecord[]
): MonthlyInvestmentHistoryRow[] {
  const dailyTotals = new Map<string, DailyInvestmentSnapshotTotal>();

  for (const snapshot of snapshots) {
    const monthKey = snapshot.snapshotKey.slice(0, 7);
    const dailyTotal = dailyTotals.get(snapshot.snapshotKey) ?? {
      snapshotKey: snapshot.snapshotKey,
      monthKey,
      portfolioValue: 0,
      costBasis: 0
    };

    dailyTotal.portfolioValue += snapshot.balance;
    dailyTotal.costBasis += snapshot.costBasis;
    dailyTotals.set(snapshot.snapshotKey, dailyTotal);
  }

  const monthlyClosings = new Map<string, DailyInvestmentSnapshotTotal>();

  for (const dailyTotal of dailyTotals.values()) {
    const existing = monthlyClosings.get(dailyTotal.monthKey);
    if (!existing || dailyTotal.snapshotKey > existing.snapshotKey) {
      monthlyClosings.set(dailyTotal.monthKey, dailyTotal);
    }
  }

  if (investments.length > 0 && !monthlyClosings.has(investmentBaselineMonthKey)) {
    const baselineValue = investments.reduce(
      (sum, investment) => sum + (investment.costBasis ?? investment.balance),
      0
    );

    monthlyClosings.set(investmentBaselineMonthKey, {
      snapshotKey: investmentBaselineSnapshotKey,
      monthKey: investmentBaselineMonthKey,
      portfolioValue: baselineValue,
      costBasis: baselineValue
    });
  }

  const sortedClosings = [...monthlyClosings.values()].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );

  return sortedClosings.map((closing, index) => {
    const previous = sortedClosings[index - 1];
    const gain = closing.portfolioValue - closing.costBasis;
    const growthBaseline = previous?.portfolioValue ?? closing.costBasis;
    const monthlyGrowth = closing.portfolioValue - growthBaseline;

    return {
      monthKey: closing.monthKey,
      snapshotKey: closing.snapshotKey,
      portfolioValue: closing.portfolioValue,
      costBasis: closing.costBasis,
      gain,
      gainPercent: closing.costBasis > 0 ? (gain / closing.costBasis) * 100 : 0,
      hasPreviousMonth: previous !== undefined,
      growthBaselineLabel: previous ? 'previous month' : 'initial value',
      monthlyGrowth,
      monthlyGrowthPercent: growthBaseline > 0 ? (monthlyGrowth / growthBaseline) * 100 : 0
    };
  });
}

function forecastOverrideWhere(ownerEmail: string, relativeYear: number, monthIndex?: number) {
  return and(
    eq(financialTrackerForecastOverride.ownerEmail, ownerEmail),
    eq(financialTrackerForecastOverride.relativeYear, relativeYear),
    monthIndex === undefined
      ? isNull(financialTrackerForecastOverride.monthIndex)
      : eq(financialTrackerForecastOverride.monthIndex, monthIndex)
  );
}

async function saveForecastPreference(
  ownerEmail: string,
  values: {
    forecastMode?: string;
    returnProfile?: string;
    investmentCurrency?: string;
    retirementAge?: string;
  }
) {
  const existingRows = await db
    .select()
    .from(financialTrackerForecastPreference)
    .where(eq(financialTrackerForecastPreference.ownerEmail, ownerEmail));
  const existing = existingRows[0];
  const nextValues = {
    forecastMode: validForecastMode(values.forecastMode ?? existing?.forecastMode ?? 'optimistic'),
    returnProfile: validReturnProfile(values.returnProfile ?? existing?.returnProfile ?? 'vti'),
    investmentCurrency: validInvestmentCurrency(
      values.investmentCurrency ?? existing?.investmentCurrency ?? 'idr'
    ),
    retirementAge: validRetirementAge(values.retirementAge ?? existing?.retirementAge),
    updatedAt: new Date()
  };

  if (existing) {
    await db
      .update(financialTrackerForecastPreference)
      .set(nextValues)
      .where(eq(financialTrackerForecastPreference.id, existing.id));
    return;
  }

  await db.insert(financialTrackerForecastPreference).values({
    ownerEmail,
    ...nextValues
  });
}

async function saveForecastOverride(
  ownerEmail: string,
  relativeYear: number,
  monthIndex: number | undefined,
  patch: {
    salary?: number | null;
    investmentContributionRateBps?: number | null;
    extraMonthlyInvestment?: number | null;
  }
) {
  const existingRows = await db
    .select()
    .from(financialTrackerForecastOverride)
    .where(forecastOverrideWhere(ownerEmail, relativeYear, monthIndex));
  const existing = existingRows[0];
  const merged = {
    salary: patch.salary !== undefined ? patch.salary : existing?.salary,
    investmentContributionRateBps:
      patch.investmentContributionRateBps !== undefined
        ? patch.investmentContributionRateBps
        : existing?.investmentContributionRateBps,
    extraMonthlyInvestment:
      patch.extraMonthlyInvestment !== undefined
        ? patch.extraMonthlyInvestment
        : existing?.extraMonthlyInvestment
  };

  await db
    .delete(financialTrackerForecastOverride)
    .where(forecastOverrideWhere(ownerEmail, relativeYear, monthIndex));

  if (
    merged.salary == null &&
    merged.investmentContributionRateBps == null &&
    merged.extraMonthlyInvestment == null
  ) {
    return;
  }

  await db.insert(financialTrackerForecastOverride).values({
    ownerEmail,
    relativeYear,
    monthIndex,
    salary: merged.salary,
    investmentContributionRateBps: merged.investmentContributionRateBps,
    extraMonthlyInvestment: merged.extraMonthlyInvestment,
    updatedAt: new Date()
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.session?.user;
  if (!user) throw error(401, 'Unauthorized');

  assertFinancialTrackerAccess(user);

  const ownerEmail = user.email.toLowerCase();
  let usdIdrRate: number | undefined;

  try {
    usdIdrRate = await fetchUsdIdrRate();
    await refreshInvestmentQuotes(ownerEmail, false, usdIdrRate);
  } catch (quoteError) {
    console.error('Financial tracker investment quote refresh failed.', quoteError);
    try {
      await saveInvestmentSnapshot(ownerEmail);
    } catch (snapshotError) {
      console.error('Financial tracker investment snapshot save failed.', snapshotError);
    }
  }

  const [
    budgetCategories,
    summaries,
    categoryRows,
    wallets,
    investments,
    debtSchedule,
    ledgerMonths,
    ledgerEntries,
    expenseDetails,
    investmentForecast,
    investmentSnapshots,
    forecastPreferences,
    forecastOverrides,
    settings
  ] = await Promise.all([
    db
      .select()
      .from(financialTrackerBudgetCategory)
      .where(eq(financialTrackerBudgetCategory.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerBudgetCategory.sortOrder)),
    db
      .select()
      .from(financialTrackerMonthlySummary)
      .where(eq(financialTrackerMonthlySummary.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerMonthlySummary.sortOrder)),
    db
      .select()
      .from(financialTrackerCategoryRow)
      .where(eq(financialTrackerCategoryRow.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerCategoryRow.sortOrder)),
    db
      .select()
      .from(financialTrackerWallet)
      .where(eq(financialTrackerWallet.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerWallet.sortOrder)),
    db
      .select()
      .from(financialTrackerInvestment)
      .where(eq(financialTrackerInvestment.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerInvestment.sortOrder)),
    db
      .select()
      .from(financialTrackerDebtSchedule)
      .where(eq(financialTrackerDebtSchedule.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerDebtSchedule.sortOrder)),
    db
      .select()
      .from(financialTrackerLedgerMonth)
      .where(eq(financialTrackerLedgerMonth.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerLedgerMonth.sortOrder)),
    db
      .select()
      .from(financialTrackerLedgerEntry)
      .where(eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerLedgerEntry.sortOrder)),
    db
      .select()
      .from(financialTrackerExpenseDetail)
      .where(eq(financialTrackerExpenseDetail.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerExpenseDetail.sortOrder)),
    db
      .select()
      .from(financialTrackerInvestmentForecast)
      .where(eq(financialTrackerInvestmentForecast.ownerEmail, ownerEmail))
      .orderBy(asc(financialTrackerInvestmentForecast.sortOrder)),
    db
      .select()
      .from(financialTrackerInvestmentSnapshot)
      .where(eq(financialTrackerInvestmentSnapshot.ownerEmail, ownerEmail))
      .orderBy(
        asc(financialTrackerInvestmentSnapshot.snapshotKey),
        asc(financialTrackerInvestmentSnapshot.sortOrder)
      ),
    db
      .select()
      .from(financialTrackerForecastPreference)
      .where(eq(financialTrackerForecastPreference.ownerEmail, ownerEmail)),
    db
      .select()
      .from(financialTrackerForecastOverride)
      .where(eq(financialTrackerForecastOverride.ownerEmail, ownerEmail))
      .orderBy(
        asc(financialTrackerForecastOverride.relativeYear),
        asc(financialTrackerForecastOverride.monthIndex)
      ),
    db
      .select()
      .from(financialTrackerSetting)
      .where(eq(financialTrackerSetting.ownerEmail, ownerEmail))
  ]);

  if (summaries.length === 0 && ledgerEntries.length === 0) {
    return { trackerData: null };
  }

  const rowsFor = (monthKey: string, section: string): CategoryRow[] =>
    categoryRows
      .filter((row) => row.monthKey === monthKey && row.section === section)
      .map((row) => ({ label: row.label, planned: row.planned, actual: row.actual }));

  const billsFor = (monthKey: string) =>
    categoryRows
      .filter((row) => row.monthKey === monthKey && row.section === 'bill')
      .map((row) => ({
        label: row.label,
        planned: row.planned,
        actual: row.actual,
        due: row.due ?? ''
      }));

  const detailsFor = (monthKey: string): Record<string, DetailRow[]> => {
    const details: Record<string, DetailRow[]> = {};
    for (const row of expenseDetails.filter((detail) => detail.monthKey === monthKey)) {
      details[row.category] ??= [];
      details[row.category].push({
        item: row.item,
        price: row.price,
        plannedQty: row.plannedQty,
        actualQty: row.actualQty,
        plannedAmount: row.plannedAmount,
        actualAmount: row.actualAmount,
        paymentMethod: row.paymentMethod ?? undefined,
        paymentType: (row.paymentType ?? undefined) as DetailRow['paymentType']
      });
    }
    return details;
  };

  const trackerData: TrackerData = {
    usdIdrRate,
    monthlyAllocation: settings[0]?.monthlyAllocation ?? 3000000,
    budgetCategoryOptions: budgetCategories.map((row) => ({
      label: row.label,
      allocationShare: row.allocationShare
    })),
    categories: rowsFor('jun-2026', 'expense'),
    mayCategories: rowsFor('may-2026', 'expense'),
    juneCategories: rowsFor('jun-2026', 'expense'),
    incomeRows: rowsFor('jun-2026', 'income'),
    mayIncomeRows: rowsFor('may-2026', 'income'),
    juneIncomeRows: rowsFor('jun-2026', 'income'),
    billRows: billsFor('jun-2026'),
    mayBillRows: billsFor('may-2026'),
    juneBillRows: billsFor('jun-2026'),
    wallets: wallets.map(
      (row): WalletRow => ({
        label: row.label,
        balance: row.balance,
        minimumHold: row.minimumHold ?? undefined,
        accountNumber: row.accountNumber ?? undefined,
        balanceProvided: row.balanceProvided ?? undefined,
        transactionsProvided: row.transactionsProvided ?? undefined,
        note: row.note ?? undefined
      })
    ),
    investments: investments.map(
      (row): InvestmentRow => ({
        label: row.label,
        ticker: row.ticker ?? undefined,
        balance: row.balance,
        costBasis: row.costBasis ?? undefined,
        change: row.change,
        direction: row.direction as InvestmentRow['direction'],
        shares: row.sharesScaled ? row.sharesScaled / sharesScale : undefined,
        latestPrice: row.latestPriceScaled ? row.latestPriceScaled / priceScale : undefined,
        latestPriceAt: row.latestPriceAt?.toISOString()
      })
    ),
    monthlyInvestmentHistory: buildMonthlyInvestmentHistory(investmentSnapshots, investments),
    mayDebtSchedule: debtSchedule.map(
      (row): DebtScheduleRow => ({
        provider: row.provider,
        due: row.due,
        amount: row.amount,
        status: row.status as DebtScheduleRow['status']
      })
    ),
    ledgerEntries: ledgerEntries.map(
      (row): LedgerEntry => ({
        id: row.entryId,
        monthKey: row.monthKey,
        date: row.date,
        description: row.description,
        kind: row.kind as LedgerEntry['kind'],
        category: row.category,
        amount: row.amount,
        fromAccount: row.fromAccount ?? undefined,
        toAccount: row.toAccount ?? undefined,
        paymentType: row.paymentType as LedgerEntry['paymentType']
      })
    ),
    ledgerMonthKeys: ledgerMonths.map((row) => row.monthKey),
    expenseDetails: detailsFor('jun-2026'),
    mayExpenseDetails: detailsFor('may-2026'),
    juneExpenseDetails: detailsFor('jun-2026'),
    investmentForecast: investmentForecast.map((row) => ({
      year: row.year,
      optimistic: row.optimistic,
      pessimist: row.pessimist,
      salary: row.salary
    })),
    forecastPreferences: {
      forecastMode: validForecastMode(forecastPreferences[0]?.forecastMode ?? 'optimistic'),
      returnProfile: validReturnProfile(forecastPreferences[0]?.returnProfile ?? 'vti') as
        | 'vti'
        | 'sp500'
        | 'gold'
        | 'conservative',
      investmentCurrency: validInvestmentCurrency(
        forecastPreferences[0]?.investmentCurrency ?? 'idr'
      ) as 'idr' | 'usd',
      retirementAge: validRetirementAge(forecastPreferences[0]?.retirementAge)
    },
    forecastOverrides: forecastOverrides.map((row) => ({
      relativeYear: row.relativeYear,
      monthIndex: row.monthIndex ?? undefined,
    salary: normalizeForecastSalary(row.salary) ?? undefined,
      investmentContributionRate:
        row.investmentContributionRateBps === null
          ? undefined
          : row.investmentContributionRateBps / 10_000,
      extraMonthlyInvestment: row.extraMonthlyInvestment ?? undefined
    })),
    monthlySummaries: summaries.map(
      (row): MonthlySummary => ({
        key: row.monthKey,
        label: row.label,
        period: row.period,
        updated: row.updated,
        rollover: {
          label: 'Rollover',
          planned: row.rolloverPlanned,
          actual: row.rolloverActual,
          variant: 'income'
        },
        income: {
          label: 'Income',
          planned: row.incomePlanned,
          actual: row.incomeActual,
          variant: 'income'
        },
        expenses: {
          label: 'Expenses',
          planned: row.expensesPlanned,
          actual: row.expensesActual,
          variant: 'expense'
        },
        bills: {
          label: 'Bills',
          planned: row.billsPlanned,
          actual: row.billsActual,
          variant: 'expense'
        },
        savings: {
          label: 'Savings',
          planned: row.savingsPlanned,
          actual: row.savingsActual,
          variant: 'expense'
        },
        debt: {
          label: 'Debt',
          planned: row.debtPlanned,
          actual: row.debtActual,
          variant: 'expense'
        },
        leftover: {
          label: 'Leftover',
          planned: row.leftoverPlanned,
          actual: row.leftoverActual,
          variant: 'neutral'
        }
      })
    )
  };

  return { trackerData };
};

export const actions: Actions = {
  forecastPreferences: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    await saveForecastPreference(user.email.toLowerCase(), {
      forecastMode: formData.has('forecastMode')
        ? String(formData.get('forecastMode') ?? '')
        : undefined,
      returnProfile: formData.has('returnProfile')
        ? String(formData.get('returnProfile') ?? '')
        : undefined,
      investmentCurrency: formData.has('investmentCurrency')
        ? String(formData.get('investmentCurrency') ?? '')
        : undefined,
      retirementAge: formData.has('retirementAge')
        ? String(formData.get('retirementAge') ?? '')
        : undefined
    });

    return { ok: true };
  },
  forecastOverride: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const relativeYear = Number(formData.get('relativeYear'));
    const monthIndexValue = formData.get('monthIndex');
    const monthIndex =
      monthIndexValue === null || String(monthIndexValue).trim() === ''
        ? undefined
        : Number(monthIndexValue);
    const salary = formData.has('salary')
      ? normalizeForecastSalary(parseOptionalMoney(formData.get('salary')))
      : undefined;
    const extraMonthlyInvestment = formData.has('extraMonthlyInvestment')
      ? parseOptionalSignedMoney(formData.get('extraMonthlyInvestment'))
      : undefined;
    const investmentContributionRateBps = formData.has('investmentContributionPercent')
      ? parseOptionalPercentBps(formData.get('investmentContributionPercent'))
      : undefined;

    if (!Number.isInteger(relativeYear)) throw error(400, 'Forecast year is required.');
    if (
      monthIndex !== undefined &&
      (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11)
    ) {
      throw error(400, 'Forecast month must be between 0 and 11.');
    }
    if (formData.has('salary') && salary === undefined)
      throw error(400, 'Forecast salary is invalid.');
    if (formData.has('extraMonthlyInvestment') && extraMonthlyInvestment === undefined) {
      throw error(400, 'Forecast extra monthly investment is invalid.');
    }
    if (
      formData.has('investmentContributionPercent') &&
      investmentContributionRateBps === undefined
    ) {
      throw error(400, 'Forecast investment percentage is invalid.');
    }

    await saveForecastOverride(user.email.toLowerCase(), relativeYear, monthIndex, {
      salary,
      investmentContributionRateBps,
      extraMonthlyInvestment
    });

    return { ok: true };
  },
  refreshInvestments: async ({ locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    try {
      await refreshInvestmentQuotes(user.email.toLowerCase(), true);
    } catch (quoteError) {
      console.error('Financial tracker manual investment quote refresh failed.', quoteError);
      throw error(502, 'Investment prices could not be refreshed right now.');
    }

    return { ok: true };
  },
  walletStatus: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const label = String(formData.get('label') ?? '').trim();
    const checked = String(formData.get('checked') ?? '') === 'true';

    if (!label) throw error(400, 'Wallet label is required.');

    const updatedRows = await db
      .update(financialTrackerWallet)
      .set({
        balanceProvided: checked,
        transactionsProvided: checked,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerWallet.ownerEmail, user.email.toLowerCase()),
          eq(financialTrackerWallet.label, label)
        )
      )
      .returning({ id: financialTrackerWallet.id });

    if (updatedRows.length === 0) throw error(404, 'Wallet not found.');

    return { ok: true };
  },
  ledgerCategory: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const entryId = String(formData.get('entryId') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim();

    if (!entryId) throw error(400, 'Ledger entry id is required.');
    if (!category) throw error(400, 'Category is required.');

    const updatedRows = await db
      .update(financialTrackerLedgerEntry)
      .set({
        category,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerLedgerEntry.ownerEmail, user.email.toLowerCase()),
          eq(financialTrackerLedgerEntry.entryId, entryId)
        )
      )
      .returning({ id: financialTrackerLedgerEntry.id });

    if (updatedRows.length === 0) throw error(404, 'Ledger entry not found.');

    return { ok: true };
  },
  budgetShare: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const label = String(formData.get('label') ?? '').trim();
    const share = Number(formData.get('share'));

    if (!label) throw error(400, 'Budget category is required.');
    if (!Number.isInteger(share) || share < 0 || share > 100) {
      throw error(400, 'Share must be a whole number from 0 to 100.');
    }

    const updatedRows = await db
      .update(financialTrackerBudgetCategory)
      .set({
        allocationShare: share,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerBudgetCategory.ownerEmail, user.email.toLowerCase()),
          eq(financialTrackerBudgetCategory.label, label)
        )
      )
      .returning({ id: financialTrackerBudgetCategory.id });

    if (updatedRows.length === 0) throw error(404, 'Budget category not found.');

    return { ok: true };
  },
  monthlyAllocation: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const monthlyAllocation = Number(formData.get('monthlyAllocation'));
    const ownerEmail = user.email.toLowerCase();

    if (!Number.isInteger(monthlyAllocation) || monthlyAllocation < 0) {
      throw error(400, 'Monthly allocation must be a positive whole rupiah amount.');
    }

    const updatedRows = await db
      .update(financialTrackerSetting)
      .set({
        monthlyAllocation,
        updatedAt: new Date()
      })
      .where(eq(financialTrackerSetting.ownerEmail, ownerEmail))
      .returning({ id: financialTrackerSetting.id });

    if (updatedRows.length === 0) {
      await db.insert(financialTrackerSetting).values({
        ownerEmail,
        monthlyAllocation
      });
    }

    return { ok: true };
  }
};
