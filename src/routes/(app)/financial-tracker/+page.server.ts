import { error } from '@sveltejs/kit';
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
  financialTrackerWallet,
  financialTrackerWalletMonthStatus
} from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import {
  assertFinancialTrackerAccess,
  fetchUsdIdrRate,
  normalizeForecastSalary,
  parseOptionalMoney,
  parseOptionalPercentBps,
  parseOptionalSignedMoney,
  priceScale,
  saveForecastOverride,
  saveForecastPreference,
  sharesScale,
  validForecastMode,
  validInvestmentCurrency,
  validRetirementAge,
  validReturnProfile
} from '$lib/server/financial-tracker';
import { maskSensitiveValue } from '$lib/server/sensitive-data';
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

const investmentBaselineMonthKey = '2026-05';
const investmentBaselineSnapshotKey = '2026-05-31';
type InvestmentSnapshot = typeof financialTrackerInvestmentSnapshot.$inferSelect;
type InvestmentRecord = typeof financialTrackerInvestment.$inferSelect;
type DailyInvestmentSnapshotTotal = {
  snapshotKey: string;
  monthKey: string;
  portfolioValue: number;
  costBasis: number;
};

const accountingMonthIndexes: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
};

function accountingMonthEditDeadline(monthKey: string) {
  const [monthName, yearText] = monthKey.toLowerCase().split('-');
  const monthIndex = accountingMonthIndexes[monthName];
  const year = Number(yearText);
  if (monthIndex === undefined || !Number.isInteger(year)) return undefined;

  return new Date(year, monthIndex + 1, 7, 23, 59, 59, 999);
}

function assertWalletMonthEditable(monthKey: string) {
  const deadline = accountingMonthEditDeadline(monthKey);
  if (!deadline) throw error(400, 'Wallet month is invalid.');
  if (Date.now() > deadline.getTime()) {
    throw error(423, 'This month is locked one week after month end.');
  }
}

function latestDate(...dates: Array<Date | null | undefined>) {
  return dates.reduce<Date | undefined>((latest, date) => {
    if (!date) return latest;
    if (!latest || date.getTime() > latest.getTime()) return date;
    return latest;
  }, undefined);
}

function displayBudgetUpdatedDate(date: Date | null | undefined, fallback: string) {
  if (!date) return fallback;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
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
    monthlyClosings.set(investmentBaselineMonthKey, {
      snapshotKey: investmentBaselineSnapshotKey,
      monthKey: investmentBaselineMonthKey,
      portfolioValue: 0,
      costBasis: 0
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

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.session?.user;
  if (!user) throw error(401, 'Unauthorized');

  assertFinancialTrackerAccess(user);

  const ownerEmail = user.email.toLowerCase();
  let usdIdrRate: number | undefined;

  try {
    usdIdrRate = await fetchUsdIdrRate();
  } catch (fxError) {
    console.error('Financial tracker USD/IDR rate fetch failed.', fxError);
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
    settings,
    walletMonthStates
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
      .where(eq(financialTrackerSetting.ownerEmail, ownerEmail)),
    db
      .select()
      .from(financialTrackerWalletMonthStatus)
      .where(eq(financialTrackerWalletMonthStatus.ownerEmail, ownerEmail))
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

  const budgetUpdatedAt = latestDate(
    settings[0]?.updatedAt,
    ...budgetCategories.map((row) => row.updatedAt)
  );

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
    walletMonthStates: walletMonthStates.reduce<TrackerData['walletMonthStates']>((states, row) => {
      states[row.monthKey] ??= {};
      states[row.monthKey][row.walletLabel] = {
        balance: row.balance ?? undefined,
        minimumHold: row.minimumHold ?? undefined,
        updated: Boolean(row.balanceProvided && row.transactionsProvided)
      };
      return states;
    }, {}),
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
        accountNumberMasked: maskSensitiveValue(row.accountNumber) ?? undefined,
        hasAccountNumber: Boolean(row.accountNumber),
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
        latestPriceAt: row.latestPriceAt?.toISOString(),
        dividendYieldBps: row.dividendYieldBps ?? undefined
      })
    ),
    monthlyInvestmentHistory: buildMonthlyInvestmentHistory(investmentSnapshots, investments),
    mayDebtSchedule: debtSchedule.map(
      (row): DebtScheduleRow => ({
        provider: row.provider,
        due: row.dueDate ?? row.due,
        paid: row.paidDate ?? undefined,
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
        reimbursesEntryId: row.reimbursesEntryId ?? undefined,
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
        updated: displayBudgetUpdatedDate(latestDate(row.updatedAt, budgetUpdatedAt), row.updated),
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
  walletStatus: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const label = String(formData.get('label') ?? '').trim();
    const monthKey = String(formData.get('monthKey') ?? '').trim();
    const checked = String(formData.get('checked') ?? '') === 'true';

    if (!label) throw error(400, 'Wallet label is required.');
    if (!monthKey || monthKey === 'all') throw error(400, 'Wallet month is required.');
    assertWalletMonthEditable(monthKey);

    const walletRows = await db
      .select({ id: financialTrackerWallet.id })
      .from(financialTrackerWallet)
      .where(
        and(
          eq(financialTrackerWallet.ownerEmail, user.email.toLowerCase()),
          eq(financialTrackerWallet.label, label)
        )
      );

    if (walletRows.length === 0) throw error(404, 'Wallet not found.');

    await db
      .insert(financialTrackerWalletMonthStatus)
      .values({
        ownerEmail: user.email.toLowerCase(),
        monthKey,
        walletLabel: label,
        balanceProvided: checked,
        transactionsProvided: checked,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [
          financialTrackerWalletMonthStatus.ownerEmail,
          financialTrackerWalletMonthStatus.monthKey,
          financialTrackerWalletMonthStatus.walletLabel
        ],
        set: {
          balanceProvided: checked,
          transactionsProvided: checked,
          updatedAt: new Date()
        }
      });

    return { ok: true };
  },
  walletMonthBalance: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const label = String(formData.get('label') ?? '').trim();
    const monthKey = String(formData.get('monthKey') ?? '').trim();
    const balance = parseOptionalMoney(formData.get('balance'));
    const minimumHold = parseOptionalMoney(formData.get('minimumHold'));
    const ownerEmail = user.email.toLowerCase();

    if (!label) throw error(400, 'Wallet label is required.');
    if (!monthKey || monthKey === 'all') throw error(400, 'Wallet month is required.');
    assertWalletMonthEditable(monthKey);
    if (balance === undefined || balance === null) {
      throw error(400, 'Wallet balance must be a positive whole rupiah amount.');
    }
    if (minimumHold === undefined) {
      throw error(400, 'Wallet minimum hold must be a positive whole rupiah amount.');
    }

    const walletRows = await db
      .select({ id: financialTrackerWallet.id })
      .from(financialTrackerWallet)
      .where(
        and(
          eq(financialTrackerWallet.ownerEmail, ownerEmail),
          eq(financialTrackerWallet.label, label)
        )
      );

    if (walletRows.length === 0) throw error(404, 'Wallet not found.');

    await db
      .insert(financialTrackerWalletMonthStatus)
      .values({
        ownerEmail,
        monthKey,
        walletLabel: label,
        balance,
        minimumHold: minimumHold ?? 0,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [
          financialTrackerWalletMonthStatus.ownerEmail,
          financialTrackerWalletMonthStatus.monthKey,
          financialTrackerWalletMonthStatus.walletLabel
        ],
        set: {
          balance,
          minimumHold: minimumHold ?? 0,
          updatedAt: new Date()
        }
      });

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

    const ownerEmail = user.email.toLowerCase();
    const entries = await db
      .select({
        id: financialTrackerLedgerEntry.id,
        monthKey: financialTrackerLedgerEntry.monthKey
      })
      .from(financialTrackerLedgerEntry)
      .where(
        and(
          eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail),
          eq(financialTrackerLedgerEntry.entryId, entryId)
        )
      );

    const entry = entries[0];
    if (!entry) throw error(404, 'Ledger entry not found.');
    assertWalletMonthEditable(entry.monthKey);

    const updatedRows = await db
      .update(financialTrackerLedgerEntry)
      .set({
        category,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail),
          eq(financialTrackerLedgerEntry.entryId, entryId)
        )
      )
      .returning({ id: financialTrackerLedgerEntry.id });

    if (updatedRows.length === 0) throw error(404, 'Ledger entry not found.');

    return { ok: true };
  },
  reimbursementLink: async ({ request, locals }) => {
    const user = locals.session?.user;
    if (!user) throw error(401, 'Unauthorized');
    assertFinancialTrackerAccess(user);

    const formData = await request.formData();
    const entryId = String(formData.get('entryId') ?? '').trim();
    const reimbursesEntryId = String(formData.get('reimbursesEntryId') ?? '').trim();

    if (!entryId) throw error(400, 'Ledger entry id is required.');

    const ownerEmail = user.email.toLowerCase();
    const entries = await db
      .select()
      .from(financialTrackerLedgerEntry)
      .where(
        and(
          eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail),
          eq(financialTrackerLedgerEntry.entryId, entryId)
        )
      );

    const entry = entries[0];
    if (!entry) throw error(404, 'Ledger entry not found.');
    assertWalletMonthEditable(entry.monthKey);

    if (entry.kind !== 'income' || entry.category !== 'Reimbursements') {
      throw error(400, 'Only reimbursement income can be linked.');
    }

    if (reimbursesEntryId) {
      const targetEntries = await db
        .select({
          id: financialTrackerLedgerEntry.id,
          kind: financialTrackerLedgerEntry.kind,
          monthKey: financialTrackerLedgerEntry.monthKey
        })
        .from(financialTrackerLedgerEntry)
        .where(
          and(
            eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail),
            eq(financialTrackerLedgerEntry.entryId, reimbursesEntryId)
          )
        );

      const targetEntry = targetEntries[0];
      if (!targetEntry) throw error(404, 'Reimbursed transaction not found.');
      if (targetEntry.monthKey !== entry.monthKey) {
        throw error(400, 'Reimbursement must link to the same month.');
      }
      if (targetEntry.kind !== 'expense' && targetEntry.kind !== 'bill') {
        throw error(400, 'Reimbursement must link to an expense or bill.');
      }
    }

    await db
      .update(financialTrackerLedgerEntry)
      .set({
        reimbursesEntryId: reimbursesEntryId || null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(financialTrackerLedgerEntry.ownerEmail, ownerEmail),
          eq(financialTrackerLedgerEntry.entryId, entryId)
        )
      );

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
