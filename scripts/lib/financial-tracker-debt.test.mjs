import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeDebtProviders } from '../../src/routes/(app)/financial-tracker/debt-summary.ts';

const payment = (overrides = {}) => ({
  provider: 'GoPayLater',
  due: '1 Nov 2026',
  amount: 100_000,
  status: 'upcoming',
  ...overrides
});

test('resuming after skipped months keeps paid installments in history for both providers', () => {
  const schedule = ['GoPayLater', 'SPayLater'].flatMap((provider) =>
    ['1 Jun 2026', '1 Jul 2026', '1 Aug 2026'].map((due) =>
      payment({ provider, due, status: 'paid' })
    )
  );

  for (const month of ['nov-2026', 'dec-2026']) {
    const providers = summarizeDebtProviders(schedule, month);
    assert.equal(providers.length, 2);
    for (const provider of providers) {
      assert.equal(provider.allPaid, true);
      assert.equal(provider.monthDue, 0);
      assert.equal(provider.dueThisMonth.length, 0);
      assert.equal(provider.history.length, 3);
      assert.equal(provider.overdue.length, 0);
      assert.equal(provider.upcoming.length, 0);
    }
  }
});

test('changing the selected month moves unpaid installments from future to due to overdue', () => {
  const schedule = [payment({ due: '2026-12-01' })];
  const [november] = summarizeDebtProviders(schedule, 'nov-2026');
  const [december] = summarizeDebtProviders(schedule, 'dec-2026');
  const [january] = summarizeDebtProviders(schedule, 'jan-2027');

  assert.equal(november.monthDue, 0);
  assert.equal(november.upcomingAmount, 100_000);
  assert.equal(december.monthDue, 100_000);
  assert.equal(december.upcoming.length, 0);
  assert.equal(january.monthDue, 0);
  assert.equal(january.overdueAmount, 100_000);
  assert.equal(january.history.length, 0);
});

test('monthly totals exclude paid installments and retain overdue debt separately', () => {
  const schedule = [
    payment({ due: '1 Oct 2026', amount: 25_000 }),
    payment({ amount: 50_000, status: 'due-now' }),
    payment({ amount: 75_000, status: 'paid', paid: '31 Oct 2026' }),
    payment({ due: '1 Dec 2026', amount: 125_000 })
  ];
  const [summary] = summarizeDebtProviders(schedule, 'nov-2026');

  assert.equal(summary.monthDue, 50_000);
  assert.equal(summary.dueThisMonth.length, 2);
  assert.equal(summary.overdueAmount, 25_000);
  assert.equal(summary.upcomingAmount, 125_000);
  assert.equal(summary.allPaid, false);
  assert.equal(summary.history.length, 0);
});

test('paying a future installment removes it from upcoming and preserves its history', () => {
  const [summary] = summarizeDebtProviders(
    [payment({ due: '1 December 2026', status: 'paid' })],
    'nov-2026'
  );

  assert.equal(summary.allPaid, true);
  assert.equal(summary.upcomingAmount, 0);
  assert.equal(summary.history.length, 1);
  assert.equal(summary.history[0].paid, undefined);
});

test('unrecognized due dates stay visible for review instead of disappearing', () => {
  const [summary] = summarizeDebtProviders([payment({ due: 'TBD' })], 'nov-2026');
  assert.equal(summary.undated.length, 1);
  assert.equal(summary.allPaid, false);
  assert.equal(summary.history.length, 0);
  assert.deepEqual(summarizeDebtProviders([], 'nov-2026'), []);
});
