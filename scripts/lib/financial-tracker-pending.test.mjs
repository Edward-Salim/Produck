import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ledgerAccount,
  partitionLedgerEntries,
  sortLedgerEntries
} from '../../src/routes/(app)/financial-tracker/ledger-sorting.ts';

const expectedFunding = Object.freeze({
  id: 'parents-bca-nov-2026',
  monthKey: 'nov-2026',
  date: '',
  description: 'Funds from parents',
  kind: 'income',
  category: 'Gift',
  amount: 9_000_000,
  fromAccount: 'Parents',
  toAccount: 'BCA',
  paymentType: 'transfer',
  status: 'pending'
});

test('expected parent funding has a bank destination without increasing actual income or cash', () => {
  const { recorded, pending } = partitionLedgerEntries([expectedFunding]);
  assert.equal(pending[0].amount, 9_000_000);
  assert.equal(ledgerAccount(pending[0]), 'BCA');
  assert.equal(pending[0].date, '');
  assert.equal(
    recorded.reduce((sum, entry) => sum + entry.amount, 0),
    0
  );
  assert.equal(recorded.filter((entry) => entry.toAccount === 'BCA').length, 0);
});

test('receiving a pending payment makes it count once, with its actual date', () => {
  const received = { ...expectedFunding, date: '2026-11-16', status: 'recorded' };
  const { recorded, pending } = partitionLedgerEntries([received]);
  assert.equal(pending.length, 0);
  assert.equal(
    recorded.reduce((sum, entry) => sum + entry.amount, 0),
    9_000_000
  );
  assert.equal(recorded[0].date, '2026-11-16');
  assert.equal(ledgerAccount(recorded[0]), 'BCA');
});

test('legacy entries stay recorded, and unknown pending dates sort consistently', () => {
  const legacy = {
    ...expectedFunding,
    id: 'legacy',
    status: undefined,
    date: '2026-06-01',
    amount: 50_000
  };
  const entries = Object.freeze([legacy, expectedFunding]);
  const { recorded } = partitionLedgerEntries(entries);
  assert.deepEqual(recorded, [legacy]);
  assert.deepEqual(
    sortLedgerEntries([...entries], 'date', 'desc').map((row) => row.id),
    [expectedFunding.id, 'legacy']
  );
  assert.deepEqual(
    sortLedgerEntries([...entries], 'date', 'asc').map((row) => row.id),
    ['legacy', expectedFunding.id]
  );
  assert.equal(entries[0].id, 'legacy');
});
