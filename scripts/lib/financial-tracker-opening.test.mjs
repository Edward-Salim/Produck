import test from 'node:test';
import assert from 'node:assert/strict';
import { monthOpeningBalances } from '../../src/routes/(app)/financial-tracker/opening-balances.ts';
import { ledgerAccount } from '../../src/routes/(app)/financial-tracker/ledger-sorting.ts';

const balances = [
  ['Cash', 103_000, 0],
  ['BCA', 6_440, 0],
  ['BNI', 70_000, 150_000],
  ['Bank Jago', 0, 0],
  ['OCTO Pay', 0, 0],
  ['CIMB Tabunganku', 20_000, 20_000],
  ['GoPay', 8_602, 0],
  ['DANA', 5_855, 0],
  ['ShopeePay', 14_273, 0],
  ['OVO', 438, 0],
  ['Flip', 1_000, 0],
  ['e-Money Mandiri', 34_299, 0],
  ['TapCash', 23_800, 0]
];
const wallets = balances.map(([label, , minimumHold]) => ({ label, minimumHold }));
const entries = balances
  .filter(([, balance]) => balance > 0)
  .map(([toAccount, amount], index) =>
    Object.freeze({
      id: `opening-${index}`,
      monthKey: 'nov-2026',
      date: '2026-11-01',
      description: 'Opening balance',
      kind: 'opening-balance',
      category: 'Opening Balance',
      amount,
      toAccount,
      paymentType: 'other',
      status: 'recorded'
    })
  );

test('reported opening wallets retain their full balances while minimum holds reduce liquid funds', () => {
  const opening = monthOpeningBalances(Object.freeze(entries), 'nov-2026', Object.freeze(wallets));
  assert.equal(opening.total, 197_707);
  assert.equal(
    opening.rows.reduce((sum, row) => sum + row.balance, 0),
    287_707
  );
  assert.equal(opening.rows.find((row) => row.label === 'BNI').liquid, 0);
  assert.equal(opening.rows.find((row) => row.label === 'CIMB Tabunganku').liquid, 0);
  assert.equal(opening.rows.find((row) => row.label === 'Cash').liquid, 103_000);
  assert.equal(ledgerAccount(entries.find((entry) => entry.toAccount === 'BCA')), 'BCA');
});

test('new income and rent are separate from opening funds and reconcile with reported ending wallets', () => {
  const transactions = [
    { ...entries[0], id: 'parents', kind: 'income', amount: 9_000_000, toAccount: 'BCA' },
    {
      ...entries[0],
      id: 'rent',
      kind: 'expense',
      amount: 2_750_000,
      fromAccount: 'BCA',
      toAccount: 'Landlord'
    }
  ];
  const opening = monthOpeningBalances([...entries, ...transactions], 'nov-2026', wallets);
  const expectedEnding = opening.total + 9_000_000 - 2_750_000;
  const recordedEnding = balances.reduce(
    (sum, [label, balance, hold]) =>
      sum + Math.max(balance + (label === 'BCA' ? 6_250_000 : 0) - hold, 0),
    0
  );
  assert.equal(expectedEnding, 6_447_707);
  assert.equal(recordedEnding - expectedEnding, 0);
});

test('opening balances are scoped to their month and pending or external balances cannot count', () => {
  const ignored = [
    { ...entries[0], status: 'pending' },
    { ...entries[0], toAccount: 'Landlord' },
    { ...entries[0], kind: 'income' }
  ];
  assert.equal(monthOpeningBalances(ignored, 'nov-2026', wallets), undefined);
  assert.equal(monthOpeningBalances(entries, 'dec-2026', wallets), undefined);
  assert.equal(monthOpeningBalances([], 'nov-2026', wallets), undefined);
  const zero = monthOpeningBalances([{ ...entries[0], amount: 0 }], 'nov-2026', wallets);
  assert.equal(zero.total, 0);
});
