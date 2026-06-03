import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import {
  financialTrackerBudgetCategory,
  financialTrackerCategoryRow,
  financialTrackerDebtSchedule,
  financialTrackerExpenseDetail,
  financialTrackerInvestment,
  financialTrackerInvestmentForecast,
  financialTrackerLedgerEntry,
  financialTrackerLedgerMonth,
  financialTrackerMonthlySummary,
  financialTrackerSetting,
  financialTrackerWallet
} from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import type {
  CategoryRow,
  DebtScheduleRow,
  DetailRow,
  InvestmentRow,
  LedgerEntry,
  MonthlySummary,
  TrackerData,
  WalletRow
} from './financial-tracker-data';
import type { Actions, PageServerLoad } from './$types';

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

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.session?.user;
  if (!user) throw error(401, 'Unauthorized');

  assertFinancialTrackerAccess(user);

  const ownerEmail = user.email.toLowerCase();

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
        balance: row.balance,
        change: row.change,
        direction: row.direction as InvestmentRow['direction']
      })
    ),
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
