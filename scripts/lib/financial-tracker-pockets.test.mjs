import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pocketWalletLabels,
  getPocketWalletBank,
  getPocketBank,
  isPocketBank,
  summarizePocketBalances
} from '../../src/lib/financial-tracker-pockets.ts';

test('spending pockets belong to Jago while main and savings belong to BCA', () => {
  assert.equal(getPocketBank('Main'), 'BCA');
  assert.equal(getPocketBank('Savings'), 'BCA');
  assert.equal(getPocketBank('Meals'), 'Bank Jago');
  assert.equal(getPocketBank('Wants'), 'Bank Jago');
  assert.equal(getPocketBank('Unknown'), undefined);
});

test('an incomplete bank breakdown keeps the recorded balance instead of supplying a partial total', () => {
  assert.deepEqual(summarizePocketBalances('BCA', {}), { entered: 0, total: undefined });
  assert.deepEqual(
    summarizePocketBalances('BCA', {
      'BCA / Main': { balance: 1_000_000 },
      'Bank Jago / Meals': { balance: 250_000 },
      'BCA / Meals': { balance: 1 },
      BCA: { balance: 2_256_440 }
    }),
    { entered: 1, total: undefined }
  );
  assert.deepEqual(summarizePocketBalances('Bank Jago', { 'BCA / Meals': { balance: 1 } }), {
    entered: 0,
    total: undefined
  });
});

test('each bank totals only its own actual pockets and excludes parent balances and legacy assignments', () => {
  const states = Object.freeze({
    'BCA / Main': Object.freeze({ balance: 1_500_000 }),
    'BCA / Savings': Object.freeze({ balance: 200_000 }),
    'Bank Jago / Meals': Object.freeze({ balance: 500_000 }),
    'Bank Jago / Wants': Object.freeze({ balance: 56_440 }),
    'BCA / Meals': Object.freeze({ balance: 1 }),
    BCA: Object.freeze({ balance: 2_256_440 }),
    'Bank Jago': Object.freeze({ balance: 0 }),
    BNI: Object.freeze({ balance: 50_000 })
  });
  assert.deepEqual(summarizePocketBalances('BCA', states), { entered: 2, total: 1_700_000 });
  assert.deepEqual(summarizePocketBalances('Bank Jago', states), { entered: 2, total: 556_440 });
});

test('explicit zero balances complete the breakdown for each bank', () => {
  for (const bank of Object.keys(pocketWalletLabels)) {
    const states = Object.fromEntries(
      Object.values(pocketWalletLabels[bank]).map((label) => [label, { balance: 0 }])
    );
    assert.deepEqual(summarizePocketBalances(bank, states), { entered: 2, total: 0 });
  }
});

test('invalid or unsafe actual balances never become an authoritative bank total', () => {
  for (const balance of [-1, 0.5, NaN, Infinity]) {
    assert.deepEqual(
      summarizePocketBalances('BCA', {
        'BCA / Main': { balance },
        'BCA / Savings': { balance: 0 }
      }),
      { entered: 1, total: undefined }
    );
  }
  assert.equal(
    summarizePocketBalances('BCA', {
      'BCA / Main': { balance: Number.MAX_SAFE_INTEGER },
      'BCA / Savings': { balance: 1 }
    }).total,
    undefined
  );
});

test('pocket writes resolve to the right parent and reject obsolete or unknown labels', () => {
  for (const bank of Object.keys(pocketWalletLabels)) {
    assert.equal(isPocketBank(bank), true);
    for (const label of Object.values(pocketWalletLabels[bank]))
      assert.equal(getPocketWalletBank(label), bank);
  }
  for (const label of [
    'BCA',
    'BCA / Meals',
    'BCA / Wants',
    'BNI / Meals',
    'Bank Jago / Main',
    'Bank Jago / Meals / Other'
  ])
    assert.equal(getPocketWalletBank(label), undefined);
  assert.equal(isPocketBank('BNI'), false);
});
