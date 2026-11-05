import assert from 'node:assert/strict';
import test from 'node:test';
import { createInvestmentForecast } from '../../src/routes/(app)/financial-tracker/investment-forecast.ts';
import {
  ledgerAccount,
  nextLedgerSort,
  sortLedgerEntries
} from '../../src/routes/(app)/financial-tracker/ledger-sorting.ts';

function forecast(overrides = {}) {
  return createInvestmentForecast({
    totalInvestments: 100_000_000,
    forecastFinalRelativeYear: 2,
    forecastRetirementAge: 40,
    selectedReturnProfile: 'vti',
    forecastInvestmentContributionOverrides: {},
    forecastSalaryOverrides: {},
    forecastExtraInvestmentOverrides: {},
    currentYearMonthlyExtraInvestmentOverrides: {},
    mutedForecastRows: {},
    ...overrides
  });
}

function futureValue(opening, contribution, annualReturn, months) {
  const growth = (1 + annualReturn) ** (1 / 12);
  return (
    opening * growth ** months + contribution * growth * ((growth ** months - 1) / (growth - 1))
  );
}

test('forecasts preserve beginning-of-month contributions, partial years, and inflation', () => {
  const { investmentForecast: years, currentYearMonthlyForecast: months } = forecast();
  assert.deepEqual(
    months.map((row) => row.month),
    ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  );
  assert.deepEqual(
    years.map((row) => row.year),
    [-1, 0, 1, 2]
  );
  for (const [key, rate] of [
    ['optimistic', 0.09],
    ['pessimist', 0.06]
  ]) {
    const yearEnd = futureValue(100_000_000, 4_000_000, rate, 7);
    assert.equal(years[0][key], Math.round(yearEnd));
    assert.equal(months.at(-1)[key], years[0][key]);
    assert.equal(years[1][key], Math.round(futureValue(yearEnd, 5_400_000, rate, 12)));
  }
  assert.equal(
    years[0].realOptimistic,
    Math.round(futureValue(100_000_000, 4_000_000, 0.09, 7) / 1.03 ** (7 / 12))
  );
  assert.deepEqual(
    years.map((row) => row.salary),
    [8_000_000, 12_000_000, 16_000_000, 20_000_000]
  );
});

test('salary and contribution overrides apply until retirement while the balance keeps growing', () => {
  const { investmentForecast: years } = forecast({
    forecastRetirementAge: 25,
    forecastSalaryOverrides: { 0: 15_500_000 },
    forecastInvestmentContributionOverrides: { 0: 0.2 }
  });
  assert.equal(years[1].salary, 15_500_000);
  assert.equal(years[1].monthlyInvestment, 3_100_000);
  assert.equal(years[2].salary, 21_000_000);
  assert.equal(years[3].salary, 0);
  assert.equal(years[3].monthlyInvestment, 0);
  assert.ok(years[3].optimistic > years[2].optimistic);
});

test('muting one year preserves later salary projections and suppresses its regular contributions', () => {
  const normal = forecast().investmentForecast;
  const muted = forecast({ mutedForecastRows: { 0: true } }).investmentForecast;
  assert.equal(muted[1].salary, 0);
  assert.equal(muted[1].monthlyInvestment, 0);
  assert.equal(muted[1].investmentContributionRate, 0);
  assert.equal(muted[2].salary, normal[2].salary);
  assert.ok(muted[2].optimistic < normal[2].optimistic);
});

test('monthly extras and annual one-time extras retain their investment timing', () => {
  const base = forecast();
  const extra = forecast({
    currentYearMonthlyExtraInvestmentOverrides: { 4: 999_999, 5: 1_000_000 },
    forecastExtraInvestmentOverrides: { 0: 2_000_000 }
  });
  assert.equal(extra.currentYearMonthlyForecast[0].monthlyInvestment, 5_000_000);
  assert.equal(extra.investmentForecast[0].extraMonthlyInvestment, 1_000_000);
  const partialExtraValue = 1_000_000 * 1.09 ** (7 / 12);
  assert.ok(
    Math.abs(
      extra.investmentForecast[0].optimistic -
        base.investmentForecast[0].optimistic -
        partialExtraValue
    ) < 1
  );
  const annualExtraValue = (partialExtraValue + 2_000_000) * 1.09;
  assert.ok(
    Math.abs(
      extra.investmentForecast[1].optimistic -
        base.investmentForecast[1].optimistic -
        annualExtraValue
    ) < 1
  );
});

test('forecast calculations accept frozen overrides and return repeatable results', () => {
  const options = Object.freeze({
    forecastSalaryOverrides: Object.freeze({ 0: 9_000_000 }),
    mutedForecastRows: Object.freeze({ 1: true })
  });
  assert.deepEqual(forecast(options).investmentForecast, forecast(options).investmentForecast);
});

function entry(id, values = {}) {
  return {
    id,
    monthKey: 'jun-2026',
    date: '2026-06-01',
    description: id,
    kind: 'expense',
    category: 'Meals',
    amount: 0,
    paymentType: 'cash',
    ...values
  };
}

test('ledger sort cycles through its default, reverse, and original order', () => {
  for (const key of [
    'date',
    'amount',
    'category',
    'description',
    'account',
    'paymentType',
    'kind'
  ]) {
    let state = nextLedgerSort('date', 'desc', key === 'date' ? 'category' : 'date');
    const expected = key === 'date' || key === 'amount' ? 'desc' : 'asc';
    state = nextLedgerSort(state.key, state.direction, key);
    assert.deepEqual(state, { key, direction: expected });
    state = nextLedgerSort(state.key, state.direction, key);
    assert.deepEqual(state, { key, direction: expected === 'asc' ? 'desc' : 'asc' });
    state = nextLedgerSort(state.key, state.direction, key);
    assert.deepEqual(state, { key, direction: null });
    assert.deepEqual(nextLedgerSort(state.key, state.direction, key), { key, direction: expected });
  }
});

test('ledger sorting handles dates and numeric labels without mutating the source', () => {
  const rows = [
    entry('late', { date: '2026-06-20', amount: 20, description: 'Item 10' }),
    entry('early', { amount: 100, description: 'Item 2' })
  ];
  assert.deepEqual(
    sortLedgerEntries(rows, 'date', 'asc').map((row) => row.id),
    ['early', 'late']
  );
  assert.deepEqual(
    sortLedgerEntries(rows, 'amount', 'desc').map((row) => row.id),
    ['early', 'late']
  );
  assert.deepEqual(
    sortLedgerEntries(rows, 'description', 'asc').map((row) => row.id),
    ['early', 'late']
  );
  assert.equal(sortLedgerEntries(rows, 'date', null), rows);
  assert.deepEqual(
    rows.map((row) => row.id),
    ['late', 'early']
  );
});

test('ledger account labels retain incoming, outgoing, and transfer semantics', () => {
  const incoming = entry('income', { kind: 'income', toAccount: 'BCA' });
  const outgoing = entry('expense', { fromAccount: 'Cash' });
  const transfer = entry('transfer', { kind: 'transfer', fromAccount: 'Cash', toAccount: 'BCA' });
  const repayment = entry('debt', { kind: 'debt-payment', fromAccount: 'BCA', toAccount: 'Loan' });
  assert.equal(ledgerAccount(incoming), 'BCA');
  assert.equal(ledgerAccount(outgoing), 'Cash');
  assert.equal(ledgerAccount(transfer), 'Cash -> BCA');
  assert.equal(ledgerAccount(repayment), 'BCA -> Loan');
  assert.equal(ledgerAccount(entry('missing')), '-');
  assert.deepEqual(
    sortLedgerEntries([outgoing, incoming], 'account', 'asc').map((row) => row.id),
    ['income', 'expense']
  );
});
