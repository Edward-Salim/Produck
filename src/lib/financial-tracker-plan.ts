export type FinancialTrackerPlan = {
  monthlyNetSalary: number;
  employmentStartDate: string;
  payday: number;
  firstPayDate: string;
  monthlyRent: number;
  rentStartMonth: string;
  location: string;
  proration: 'calendar-days-estimate';
  monthlyAllocation?: number;
  monthlySavingsGoal?: number;
  monthlySavingsGoals?: Record<string, number>;
  categoryPlans?: Record<string, number>;
  monthlyCategoryPlans?: Record<string, Record<string, number>>;
  monthlyAllocations?: Record<string, number>;
};

export const rentBudgetCategory = 'Rent';
export const savingsBudgetCategory = 'Savings';

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function calculateMealGuide({
  monthKey,
  planned,
  actual = 0,
  gallonPrice = 25_000,
  today
}: {
  monthKey: string;
  planned: number;
  actual?: number;
  gallonPrice?: number;
  today: string;
}) {
  const selectedMonth = monthIndex(monthKey);
  if (selectedMonth === undefined) return null;
  const year = Math.floor(selectedMonth / 12);
  const month = selectedMonth % 12;
  const monthDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const isCurrentMonth = monthIndex(today.slice(0, 7)) === selectedMonth;
  const startDay = isCurrentMonth ? Number(today.slice(8, 10)) : 1;
  if (!Number.isInteger(startDay) || startDay < 1 || startDay > monthDays) return null;
  const days = monthDays - startDay + 1;
  const budget = Math.max(0, planned - (isCurrentMonth ? actual : 0));
  const gallons = Math.ceil(days / 7);
  const waterReserve = gallons * Math.max(0, gallonPrice);
  const dailyBudget = Math.max(0, budget - waterReserve) / days;
  const roundingUnit = dailyBudget >= 25_000 ? 5_000 : 1_000;
  const target = (share: number) => Math.floor((dailyBudget * share) / roundingUnit) * roundingUnit;
  const breakfast = target(0.22);
  const lunch = target(0.38);
  const dinner = target(0.4);
  return {
    days,
    isCurrentMonth,
    budget,
    gallons,
    gallonPrice,
    waterReserve,
    breakfast,
    lunch,
    dinner,
    dailyTarget: breakfast + lunch + dinner,
    buffer: Math.max(0, budget - waterReserve - days * (breakfast + lunch + dinner))
  };
}

function monthIndex(value: string) {
  const iso = /^(\d{4})-(\d{2})$/.exec(value);
  if (iso) {
    const month = Number(iso[2]) - 1;
    return month >= 0 && month < 12 ? Number(iso[1]) * 12 + month : undefined;
  }
  const named = /^([a-z]{3})-(\d{4})$/i.exec(value);
  if (!named) return undefined;
  const month = months.indexOf(named[1].toLowerCase());
  return month >= 0 ? Number(named[2]) * 12 + month : undefined;
}

export function calculateMonthlyPlan(
  plan: FinancialTrackerPlan | null | undefined,
  monthKey: string,
  defaultFlexibleBudget: number
) {
  if (!plan) return null;
  const selectedMonth = monthIndex(monthKey);
  const startMonth = monthIndex(plan.employmentStartDate.slice(0, 7));
  const firstPayMonth = monthIndex(plan.firstPayDate.slice(0, 7));
  const rentMonth = monthIndex(plan.rentStartMonth);
  if (
    selectedMonth === undefined ||
    startMonth === undefined ||
    firstPayMonth === undefined ||
    rentMonth === undefined ||
    firstPayMonth < startMonth ||
    selectedMonth < Math.min(startMonth, rentMonth)
  )
    return null;

  const startDate = new Date(`${plan.employmentStartDate}T00:00:00Z`);
  if (
    !Number.isFinite(startDate.getTime()) ||
    startDate.toISOString().slice(0, 10) !== plan.employmentStartDate
  )
    return null;
  const startMonthDays = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const proratedSalary = Math.round(
    (plan.monthlyNetSalary * (startMonthDays - startDate.getUTCDate() + 1)) / startMonthDays
  );
  const delayedMonths = firstPayMonth - startMonth;
  const firstPayAmount = proratedSalary + delayedMonths * plan.monthlyNetSalary;
  const expectedIncome =
    selectedMonth < firstPayMonth
      ? 0
      : selectedMonth === firstPayMonth
        ? firstPayAmount
        : plan.monthlyNetSalary;
  const rent = selectedMonth >= rentMonth ? plan.monthlyRent : 0;
  const allocation =
    plan.monthlyAllocations?.[monthKey] ?? plan.monthlyAllocation ?? defaultFlexibleBudget;
  const savingsGoal = Math.min(
    plan.monthlySavingsGoals?.[monthKey] ?? plan.monthlySavingsGoal ?? 0,
    Math.max(allocation - rent, 0)
  );
  const flexibleBudget = Math.max(allocation - rent - savingsGoal, 0);
  const year = Math.floor(selectedMonth / 12);
  const month = selectedMonth % 12;
  const monthDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const regularPayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(plan.payday, monthDays)).padStart(2, '0')}`;

  return {
    expectedIncome,
    rent,
    allocation,
    savingsGoal,
    categoryPlans: { ...plan.categoryPlans, ...plan.monthlyCategoryPlans?.[monthKey] },
    flexibleBudget,
    plannedCosts: allocation,
    afterPlannedCosts: expectedIncome - allocation,
    payDate:
      expectedIncome === 0
        ? null
        : selectedMonth === firstPayMonth
          ? plan.firstPayDate
          : regularPayDate,
    isFirstPayMonth: selectedMonth === firstPayMonth,
    proratedSalary,
    firstPayAmount,
    regularAfterRent: plan.monthlyNetSalary - plan.monthlyRent
  };
}

export function allocateMonthlyBudget<T extends { label: string; planned: number; actual: number }>(
  rows: readonly T[],
  allocation: number,
  categoryWeights: readonly { label: string; allocationShare: number }[],
  rent?: number,
  savings?: number,
  categoryPlans: Readonly<Record<string, number>> = {}
) {
  const budget = Math.max(0, Math.round(allocation));
  const fixedPlans = { ...categoryPlans };
  if (rent !== undefined) fixedPlans[rentBudgetCategory] = rent;
  if (savings !== undefined) fixedPlans[savingsBudgetCategory] = savings;
  const fixedAmounts = new Map<number, number>();
  let availableBudget = budget;
  for (const label of [rentBudgetCategory, savingsBudgetCategory, ...Object.keys(categoryPlans)]) {
    const index = rows.findIndex((row) => row.label === label);
    if (index < 0 || fixedAmounts.has(index) || fixedPlans[label] === undefined) continue;
    const planned = Math.min(Math.max(Math.round(fixedPlans[label]), 0), availableBudget);
    fixedAmounts.set(index, planned);
    availableBudget -= planned;
  }

  const weighted = rows.map((row, index) => ({
    index,
    weight: fixedAmounts.has(index)
      ? 0
      : Math.max(
          0,
          categoryWeights.find((category) => category.label === row.label)?.allocationShare ?? 0
        )
  }));
  const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
  const weightedCount = weighted.filter((row) => row.weight > 0).length;
  const roundingUnit =
    [50_000, 10_000, 1_000, 100, 1].find(
      (unit) => availableBudget % unit === 0 && availableBudget / unit >= weightedCount
    ) ?? 1;
  const budgetUnits = availableBudget / roundingUnit;
  const amounts = weighted.map((row) => {
    const exact = totalWeight > 0 ? (budgetUnits * row.weight) / totalWeight : 0;
    return { ...row, planned: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  const remainder =
    totalWeight > 0 ? budgetUnits - amounts.reduce((sum, row) => sum + row.planned, 0) : 0;
  const roundingOrder = amounts
    .filter((row) => row.weight > 0)
    .toSorted((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remainder; index += 1) roundingOrder[index].planned += 1;

  const plannedAmounts = amounts.map(
    (row) => fixedAmounts.get(row.index) ?? row.planned * roundingUnit
  );
  const plannedTotal = plannedAmounts.reduce((sum, planned) => sum + planned, 0);
  // Apportion tenths of a percent so the displayed shares add up to exactly 100%.
  const percentages = plannedAmounts.map((planned, index) => {
    const exact = plannedTotal > 0 ? (planned * 1_000) / plannedTotal : 0;
    return { index, units: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  const percentageRemainder =
    plannedTotal > 0 ? 1_000 - percentages.reduce((sum, row) => sum + row.units, 0) : 0;
  const percentageOrder = percentages.toSorted(
    (a, b) => b.fraction - a.fraction || a.index - b.index
  );
  for (let index = 0; index < percentageRemainder; index += 1) {
    percentageOrder[index].units += 1;
  }

  return rows.map((row, index) => {
    const share = percentages[index].units / 1_000;
    return {
      ...row,
      planned: plannedAmounts[index],
      share,
      allocationShare: percentages[index].units / 10
    };
  });
}
