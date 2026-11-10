import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allocateMonthlyBudget,
  calculateMonthlyPlan
} from '../../src/lib/financial-tracker-plan.ts';

const plan = {
  monthlyNetSalary: 9_300_000,
  employmentStartDate: '2026-11-16',
  payday: 25,
  firstPayDate: '2026-12-25',
  monthlyRent: 2_750_000,
  rentStartMonth: '2026-11',
  location: 'Kuningan',
  proration: 'calendar-days-estimate',
  monthlyAllocation: 9_000_000
};

test('November includes rent and living costs but no salary before the first payday', () => {
  const november = calculateMonthlyPlan(plan, 'nov-2026', 3_000_000);
  assert.equal(november.expectedIncome, 0);
  assert.equal(november.payDate, null);
  assert.equal(november.rent, 2_750_000);
  assert.equal(november.afterPlannedCosts, -9_000_000);
});

test('December combines 15 of 30 November calendar days with the full December salary', () => {
  const december = calculateMonthlyPlan(plan, 'dec-2026', 3_000_000);
  assert.equal(december.proratedSalary, 4_650_000);
  assert.equal(december.expectedIncome, 13_950_000);
  assert.equal(december.payDate, '2026-12-25');
  assert.equal(december.isFirstPayMonth, true);
  assert.equal(december.plannedCosts, 9_000_000);
  assert.equal(december.afterPlannedCosts, 4_950_000);
});

test('regular months include rent within the monthly allocation', () => {
  const january = calculateMonthlyPlan(plan, 'jan-2027', 3_000_000);
  assert.equal(january.expectedIncome, 9_300_000);
  assert.equal(january.payDate, '2027-01-25');
  assert.equal(january.isFirstPayMonth, false);
  assert.equal(january.regularAfterRent, 6_550_000);
  assert.equal(january.afterPlannedCosts, 300_000);
  const revisedBudget = calculateMonthlyPlan(
    { ...plan, monthlyAllocations: { 'jan-2027': 8_000_000 } },
    'jan-2027',
    3_500_000
  );
  assert.equal(revisedBudget.rent, 2_750_000);
  assert.equal(revisedBudget.afterPlannedCosts, 1_300_000);
});

test('earlier months and users without a plan keep their existing tracker behavior', () => {
  assert.equal(calculateMonthlyPlan(plan, 'jun-2026', 3_000_000), null);
  assert.equal(calculateMonthlyPlan(null, 'nov-2026', 3_000_000), null);
  assert.equal(calculateMonthlyPlan(plan, '', 3_000_000), null);
});

test('proration handles leap years and includes a start date on the final day of a month', () => {
  const february = calculateMonthlyPlan(
    {
      ...plan,
      monthlyNetSalary: 2_900_000,
      employmentStartDate: '2028-02-29',
      firstPayDate: '2028-03-25',
      rentStartMonth: '2028-02'
    },
    'mar-2028',
    0
  );
  assert.equal(february.proratedSalary, 100_000);
  assert.equal(february.expectedIncome, 3_000_000);
  assert.equal(
    calculateMonthlyPlan({ ...plan, employmentStartDate: '2026-02-30' }, 'dec-2026', 0),
    null
  );
});

test('a payday past the end of a short month is clamped to that month', () => {
  const february = calculateMonthlyPlan({ ...plan, payday: 31 }, 'feb-2027', 0);
  assert.equal(february.payDate, '2027-02-28');
});

test('November allocation includes rent and leaves 6.25 million for other categories', () => {
  const monthly = calculateMonthlyPlan(
    {
      ...plan,
      monthlyAllocations: { 'nov-2026': 9_000_000 }
    },
    'nov-2026',
    3_000_000
  );
  assert.equal(monthly.allocation, 9_000_000);
  assert.equal(monthly.flexibleBudget, 6_250_000);
  assert.equal(monthly.rent, 2_750_000);
  assert.equal(monthly.plannedCosts, 9_000_000);
  assert.equal(calculateMonthlyPlan(plan, 'dec-2026', 3_000_000).allocation, 9_000_000);
});

test('shares include rent within the allocation and add to 100% without recording expenses', () => {
  const rows = Object.freeze([
    Object.freeze({ label: 'Rent', planned: 0, actual: 0 }),
    Object.freeze({ label: 'Meals', planned: 0, actual: 50_000 }),
    Object.freeze({ label: 'Transportation', planned: 0, actual: 0 })
  ]);
  const result = allocateMonthlyBudget(
    rows,
    10_000_000,
    [
      { label: 'Meals', allocationShare: 70 },
      { label: 'Transportation', allocationShare: 30 }
    ],
    2_750_000
  );
  assert.equal(result[0].planned, 2_750_000);
  assert.equal(result[0].share, 0.275);
  assert.equal(result[1].planned, 5_100_000);
  assert.equal(result[1].share, 0.51);
  assert.equal(
    result.reduce((sum, row) => sum + Math.round(row.share * 1000), 0),
    1000
  );
  assert.equal(result[1].actual, 50_000);
  assert.equal(
    result.reduce((sum, row) => sum + row.planned, 0),
    10_000_000
  );
});

test('budget weights and rupiah rounding cannot inflate the amount allocated to categories', () => {
  const rows = ['A', 'B', 'C'].map((label) => ({ label, planned: 0, actual: 0 }));
  const weights = rows.map((row) => ({ label: row.label, allocationShare: 34 }));
  const result = allocateMonthlyBudget(rows, 10_000_000, weights);
  assert.equal(
    result.reduce((sum, row) => sum + row.planned, 0),
    10_000_000
  );
  assert.deepEqual(
    result.map((row) => row.planned),
    [3_350_000, 3_350_000, 3_300_000]
  );
  assert.ok(allocateMonthlyBudget(rows, 0, weights).every((row) => row.share === 0));
});

test('memorable budgets preserve allocation and displayed shares sum exactly to 100%', () => {
  const rows = ['Rent', 'Meals', 'Transport', 'Health'].map((label) => ({
    label,
    planned: 0,
    actual: label === 'Rent' ? 2_750_000 : 0
  }));
  const weights = rows
    .slice(1)
    .map((row, index) => ({ label: row.label, allocationShare: [45, 35, 22][index] }));
  for (const allocation of [9_000_000, 3_000_000, 123_457, 0]) {
    const result = allocateMonthlyBudget(rows, allocation, weights, 2_750_000);
    assert.equal(result[0].planned, Math.min(2_750_000, allocation));
    assert.equal(result[0].actual, 2_750_000);
    assert.equal(
      result.reduce((sum, row) => sum + row.planned, 0),
      allocation
    );
    assert.equal(
      result.reduce((sum, row) => sum + Math.round(row.share * 1000), 0),
      allocation > 0 ? 1000 : 0
    );
    if (allocation >= 1_000_000) assert.ok(result.every((row) => row.planned % 50_000 === 0));
  }
});

test('a two million savings row fits within the nine million budget alongside rent', () => {
  const monthly = calculateMonthlyPlan({ ...plan, monthlySavingsGoal: 2_000_000 }, 'nov-2026', 0);
  assert.equal(monthly.allocation, 9_000_000);
  assert.equal(monthly.savingsGoal, 2_000_000);
  assert.equal(monthly.flexibleBudget, 4_250_000);
  assert.equal(monthly.plannedCosts, 9_000_000);
  const rows = Object.freeze(
    ['Savings', 'Rent', 'Meals', 'Transportation', 'Health'].map((label) =>
      Object.freeze({ label, planned: 0, actual: label === 'Rent' ? 2_750_000 : 0 })
    )
  );
  const weights = rows.map((row) => ({
    label: row.label,
    allocationShare: row.label === 'Meals' ? 60 : 20
  }));
  const budget = allocateMonthlyBudget(
    rows,
    monthly.allocation,
    weights,
    monthly.rent,
    monthly.savingsGoal
  );
  assert.equal(budget.find((row) => row.label === 'Savings').planned, 2_000_000);
  assert.equal(budget.find((row) => row.label === 'Savings').actual, 0);
  assert.equal(budget.find((row) => row.label === 'Rent').planned, 2_750_000);
  assert.equal(
    budget
      .filter((row) => !['Savings', 'Rent'].includes(row.label))
      .reduce((sum, row) => sum + row.planned, 0),
    4_250_000
  );
  assert.equal(
    budget.reduce((sum, row) => sum + row.planned, 0),
    9_000_000
  );
  assert.equal(
    budget.reduce((sum, row) => sum + Math.round(row.share * 1000), 0),
    1000
  );
  assert.ok(budget.every((row) => row.planned % 50_000 === 0));
});

test('specific category plans are preserved while the remaining 940 thousand is distributed', () => {
  const categoryPlans = Object.freeze({
    Utilities: 250_000,
    'Mobile Data': 60_000,
    Transportation: 500_000,
    Meals: 2_500_000
  });
  const labels = [
    'Rent',
    'Savings',
    ...Object.keys(categoryPlans),
    'Household Supplies',
    'Personal Care',
    'Health',
    'Learning',
    'Fun Money',
    'Subscriptions',
    'One-off',
    'Admin'
  ];
  const rows = labels.map((label) => ({ label, planned: 0, actual: 0 }));
  const weights = labels.map((label) => ({ label, allocationShare: 10 }));
  const monthly = calculateMonthlyPlan(
    { ...plan, monthlySavingsGoal: 2_000_000, categoryPlans },
    'nov-2026',
    0
  );
  const budget = allocateMonthlyBudget(
    rows,
    monthly.allocation,
    weights,
    monthly.rent,
    monthly.savingsGoal,
    monthly.categoryPlans
  );
  for (const [label, planned] of Object.entries(categoryPlans))
    assert.equal(budget.find((row) => row.label === label).planned, planned);
  assert.equal(
    budget
      .filter((row) => !['Rent', 'Savings', ...Object.keys(categoryPlans)].includes(row.label))
      .reduce((sum, row) => sum + row.planned, 0),
    940_000
  );
  assert.equal(
    budget.reduce((sum, row) => sum + row.planned, 0),
    9_000_000
  );
  assert.equal(
    budget.reduce((sum, row) => sum + Math.round(row.share * 1000), 0),
    1000
  );
  assert.ok(budget.every((row) => row.planned % 10_000 === 0));
});
