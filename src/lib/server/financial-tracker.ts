import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
  financialTrackerForecastOverride,
  financialTrackerForecastPreference,
  financialTrackerInvestment,
  financialTrackerInvestmentSnapshot
} from '$lib/server/db/schema';

export const priceScale = 1_000_000;
export const sharesScale = 1_000_000;

const investmentQuoteRefreshMs = 12 * 60 * 60 * 1000;
const defaultRetirementAge = 40;
const minRetirementAge = 25;
const maxRetirementAge = 71;

function allowedEmails() {
  return (env.FINANCIAL_TRACKER_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function assertFinancialTrackerAccess(user: NonNullable<App.Locals['session']>['user']) {
  const emails = allowedEmails();

  if (emails.length > 0 && !emails.includes(user.email.toLowerCase())) {
    throw error(403, 'Forbidden');
  }

  if (emails.length === 0 && env.NODE_ENV === 'production') {
    throw error(403, 'FINANCIAL_TRACKER_ALLOWED_EMAILS is not configured.');
  }
}

export function parsePercent(value: string) {
  const parsed = Number(value.replace('%', '').replace('+', '').trim());
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

export function parseOptionalMoney(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value).replace(/\D/g, '');
  if (text === '') return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseOptionalSignedMoney(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value)
    .replace(/[^\d-]/g, '')
    .replace(/(?!^)-/g, '');
  if (text === '' || text === '-') return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parseOptionalPercentBps(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = String(value).trim();
  if (text === '') return 0;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return undefined;
  return Math.round(parsed * 100);
}

export function normalizeForecastSalary(value: number | null | undefined) {
  if (value == null) return value;
  return value > 0 && value < 1_000 ? value * 1_000_000 : value;
}

export function validForecastMode(value: string) {
  return value === 'optimistic' || value === 'pessimistic' ? value : 'optimistic';
}

export function validReturnProfile(value: string) {
  return ['vti', 'sp500', 'gold', 'conservative'].includes(value) ? value : 'vti';
}

export function validInvestmentCurrency(value: string) {
  return value === 'usd' || value === 'idr' ? value : 'idr';
}

export function validRetirementAge(value: unknown) {
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

async function fetchDividendYield(ticker: string, currentPrice: number): Promise<number | null> {
  try {
    const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
    url.searchParams.set('interval', '1d');
    url.searchParams.set('range', '3mo');

    const response = await fetch(url);
    if (!response.ok) return null;

    const body = (await response.json()) as {
      chart?: { result?: Array<{ meta?: { trailingAnnualDividendRate?: number } }> };
    };
    const rate = body.chart?.result?.[0]?.meta?.trailingAnnualDividendRate;
    if (!rate || rate <= 0 || currentPrice <= 0) return null;

    return Math.round((rate / currentPrice) * 10000);
  } catch {
    return null;
  }
}

export async function fetchUsdIdrRate() {
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

export async function saveInvestmentSnapshot(ownerEmail: string) {
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

export async function refreshInvestmentQuotes(
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

  const results = await Promise.allSettled(
    quoteRows
      .filter((row) => row.ticker)
      .map(async (row) => {
        const latestPrice = await fetchFinnhubQuote(row.ticker!);
        const dividendYieldBps = force
          ? await fetchDividendYield(row.ticker!, latestPrice).catch(() => null)
          : null;
        return { row, latestPrice, dividendYieldBps };
      })
  );

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Finnhub quote fetch failed:', result.reason);
      continue;
    }

    const { row, latestPrice, dividendYieldBps } = result.value;
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

    const updateData: Record<string, unknown> = {
      sharesScaled,
      costBasis,
      latestPriceScaled,
      latestPriceAt: new Date(),
      balance,
      change: formatInvestmentChange(changePercent),
      direction: changePercent >= 0 ? 'up' : 'down',
      updatedAt: new Date()
    };
    if (dividendYieldBps !== null && dividendYieldBps !== undefined) {
      updateData.dividendYieldBps = dividendYieldBps;
    }

    await db
      .update(financialTrackerInvestment)
      .set(updateData as any)
      .where(
        and(
          eq(financialTrackerInvestment.ownerEmail, ownerEmail),
          eq(financialTrackerInvestment.id, row.id)
        )
      );
  }

  await saveInvestmentSnapshot(ownerEmail);
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

export async function saveForecastPreference(
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

export async function saveForecastOverride(
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
