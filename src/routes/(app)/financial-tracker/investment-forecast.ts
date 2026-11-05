import type { TrackerData } from './financial-tracker-data.js';

export type ForecastMode = 'optimistic' | 'pessimistic';

export type ReturnProfileKey = 'vti' | 'sp500' | 'gold' | 'conservative';

export type InvestmentForecastRow = TrackerData['investmentForecast'][number] & {
  monthlyInvestment: number;
  investmentContributionRate: number;
  extraMonthlyInvestment: number;
  realOptimistic: number;
  realPessimist: number;
  optimisticMonthlyGain: number;
  pessimisticMonthlyGain: number;
  optimisticYearlyGain: number;
  pessimisticYearlyGain: number;
  optimisticReturn: number;
  pessimisticReturn: number;
  salaryGrowth: number;
};

export type MonthlyInvestmentForecastRow = InvestmentForecastRow & {
  month: string;
  monthIndex: number;
  calendarYear: number;
  age: number;
};

const forecastBaseYear = 2026;

export const forecastCurrentAge = 22;

const forecastCurrentMonthIndex = 5;

const forecastCurrentMonthlySalary = 8_000_000;

const defaultSalaryGrowthRate = 0.07;

const defaultInvestmentContributionRate = 0.3;

export const defaultInflationRate = 0.03;

export const returnProfiles: Record<
  ReturnProfileKey,
  { label: string; optimistic: number; pessimistic: number }
> = {
  vti: { label: 'VTI', optimistic: 0.09, pessimistic: 0.06 },
  sp500: { label: 'S&P 500', optimistic: 0.1, pessimistic: 0.06 },
  gold: { label: 'Gold', optimistic: 0.076, pessimistic: 0.03 },
  conservative: { label: 'Conservative', optimistic: 0.05, pessimistic: 0.03 }
};

const salaryGrowthByYear = new Map([
  [-1, 0],
  [0, 0.5],
  [1, 0.35],
  [2, 0.25],
  [3, 0.18],
  [4, 0.14],
  [5, 0.1],
  [6, 0.08]
]);

const investmentContributionRateByYear = new Map([
  [-1, 0.5],
  [0, 0.45],
  [1, 0.4],
  [2, 0.35],
  [3, 0.32],
  [4, 0.3]
]);

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export type ForecastOptions = {
  totalInvestments: number;
  forecastFinalRelativeYear: number;
  forecastRetirementAge: number;
  selectedReturnProfile: ReturnProfileKey;
  forecastInvestmentContributionOverrides: Record<number, number | undefined>;
  forecastSalaryOverrides: Record<number, number | undefined>;
  forecastExtraInvestmentOverrides: Record<number, number | undefined>;
  currentYearMonthlyExtraInvestmentOverrides: Record<number, number | undefined>;
  mutedForecastRows: Record<number, boolean>;
};

export function createInvestmentForecast({
  totalInvestments,
  forecastFinalRelativeYear,
  forecastRetirementAge,
  selectedReturnProfile,
  forecastInvestmentContributionOverrides,
  forecastSalaryOverrides,
  forecastExtraInvestmentOverrides,
  currentYearMonthlyExtraInvestmentOverrides,
  mutedForecastRows
}: ForecastOptions) {
  function forecastCalendarYear(relativeYear: number) {
    return forecastBaseYear + relativeYear + 1;
  }

  function forecastAge(relativeYear: number) {
    return forecastCurrentAge + relativeYear + 1;
  }

  function isRetiredForecastYear(relativeYear: number) {
    return forecastAge(relativeYear) >= forecastRetirementAge;
  }

  function investmentGrowthForYear() {
    return returnProfiles[selectedReturnProfile];
  }

  function defaultSalaryGrowthForYear(relativeYear: number) {
    return salaryGrowthByYear.get(relativeYear) ?? defaultSalaryGrowthRate;
  }

  function investmentContributionRateForYear(relativeYear: number) {
    if (isRetiredForecastYear(relativeYear) || forecastRowMuted(relativeYear)) return 0;

    const override = forecastInvestmentContributionOverrides[relativeYear];
    return (
      override ??
      investmentContributionRateByYear.get(relativeYear) ??
      defaultInvestmentContributionRate
    );
  }

  function roundProjectedMonthlySalary(value: number) {
    return Math.round(value / 1_000_000) * 1_000_000;
  }

  function extraMonthlyInvestmentForYear(relativeYear: number) {
    return forecastExtraInvestmentOverrides[relativeYear] ?? 0;
  }

  function projectedForecastMonthlySalary(relativeYear: number): number {
    if (isRetiredForecastYear(relativeYear)) return 0;

    const override = forecastSalaryOverrides[relativeYear];
    if (override !== undefined) return Math.round(override);

    if (relativeYear < 0) return forecastCurrentMonthlySalary;

    return roundProjectedMonthlySalary(
      projectedForecastMonthlySalary(relativeYear - 1) *
        (1 + defaultSalaryGrowthForYear(relativeYear))
    );
  }

  function forecastMonthlySalary(relativeYear: number): number {
    if (forecastRowMuted(relativeYear)) return 0;
    return projectedForecastMonthlySalary(relativeYear);
  }

  function salaryGrowthForForecastYear(relativeYear: number) {
    if (relativeYear < 0 || isRetiredForecastYear(relativeYear)) return 0;

    if (forecastRowMuted(relativeYear)) return 0;

    const previousSalary = projectedForecastMonthlySalary(relativeYear - 1);
    return previousSalary > 0
      ? projectedForecastMonthlySalary(relativeYear) / previousSalary - 1
      : 0;
  }

  function forecastMonthlyContribution(relativeYear: number) {
    return Math.round(
      forecastMonthlySalary(relativeYear) * investmentContributionRateForYear(relativeYear)
    );
  }

  function currentYearMonthlyExtraInvestment(monthIndex: number) {
    return currentYearMonthlyExtraInvestmentOverrides[monthIndex] ?? 0;
  }

  function currentYearTotalExtraInvestment() {
    return monthLabels
      .slice(forecastCurrentMonthIndex)
      .reduce(
        (sum, _month, offset) =>
          sum + currentYearMonthlyExtraInvestment(forecastCurrentMonthIndex + offset),
        0
      );
  }

  function currentYearMonthlyContribution(monthIndex: number) {
    return Math.round(
      forecastMonthlySalary(-1) * investmentContributionRateForYear(-1) +
        currentYearMonthlyExtraInvestment(monthIndex)
    );
  }

  function currentYearForecastMonthContribution(monthIndex: number) {
    return currentYearMonthlyContribution(monthIndex);
  }

  function compoundMonth(balance: number, annualReturn: number, monthlyContribution: number) {
    return (balance + monthlyContribution) * (1 + annualReturn) ** (1 / 12);
  }

  function monthlyInvestmentGain(balance: number, annualReturn: number, monthlyContribution = 0) {
    return Math.round((balance + monthlyContribution) * ((1 + annualReturn) ** (1 / 12) - 1));
  }

  function yearlyInvestmentGain(balance: number, annualReturn: number, months = 12) {
    return Math.round(balance * ((1 + annualReturn) ** (months / 12) - 1));
  }

  function forecastRowMuted(relativeYear: number) {
    return Boolean(mutedForecastRows[relativeYear]);
  }

  const investmentForecast = (() => {
    const rows: InvestmentForecastRow[] = [];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;
    const currentYearInvestmentGrowth = investmentGrowthForYear();
    let currentYearTotalContribution = 0;

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      const monthlyContribution = currentYearForecastMonthContribution(monthIndex);
      currentYearTotalContribution += monthlyContribution;
      optimisticBalance = compoundMonth(
        optimisticBalance,
        currentYearInvestmentGrowth.optimistic,
        monthlyContribution
      );
      pessimisticBalance = compoundMonth(
        pessimisticBalance,
        currentYearInvestmentGrowth.pessimistic,
        monthlyContribution
      );
    }

    rows.push({
      year: -1,
      optimistic: Math.round(optimisticBalance),
      pessimist: Math.round(pessimisticBalance),
      realOptimistic: Math.round(
        optimisticBalance / (1 + defaultInflationRate) ** ((12 - forecastCurrentMonthIndex) / 12)
      ),
      realPessimist: Math.round(
        pessimisticBalance / (1 + defaultInflationRate) ** ((12 - forecastCurrentMonthIndex) / 12)
      ),
      salary: forecastMonthlySalary(-1),
      monthlyInvestment: forecastMonthlyContribution(-1),
      investmentContributionRate: investmentContributionRateForYear(-1),
      extraMonthlyInvestment: currentYearTotalExtraInvestment(),
      optimisticMonthlyGain: monthlyInvestmentGain(
        optimisticBalance,
        currentYearInvestmentGrowth.optimistic
      ),
      pessimisticMonthlyGain: monthlyInvestmentGain(
        pessimisticBalance,
        currentYearInvestmentGrowth.pessimistic
      ),
      optimisticYearlyGain: Math.round(
        optimisticBalance - totalInvestments - currentYearTotalContribution
      ),
      pessimisticYearlyGain: Math.round(
        pessimisticBalance - totalInvestments - currentYearTotalContribution
      ),
      optimisticReturn: currentYearInvestmentGrowth.optimistic,
      pessimisticReturn: currentYearInvestmentGrowth.pessimistic,
      salaryGrowth: salaryGrowthForForecastYear(-1)
    });

    for (let relativeYear = 0; relativeYear <= forecastFinalRelativeYear; relativeYear += 1) {
      const monthlySalary = forecastMonthlySalary(relativeYear);
      const monthlyContribution = forecastMonthlyContribution(relativeYear);
      const oneTimeExtraInvestment = extraMonthlyInvestmentForYear(relativeYear);
      const investmentGrowth = investmentGrowthForYear();
      const optimisticYearStartBalance = optimisticBalance;
      const pessimisticYearStartBalance = pessimisticBalance;

      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        const forecastMonthContribution =
          monthlyContribution + (monthIndex === 0 ? oneTimeExtraInvestment : 0);
        optimisticBalance = compoundMonth(
          optimisticBalance,
          investmentGrowth.optimistic,
          forecastMonthContribution
        );
        pessimisticBalance = compoundMonth(
          pessimisticBalance,
          investmentGrowth.pessimistic,
          forecastMonthContribution
        );
      }

      rows.push({
        year: relativeYear,
        optimistic: Math.round(optimisticBalance),
        pessimist: Math.round(pessimisticBalance),
        realOptimistic: Math.round(
          optimisticBalance / (1 + defaultInflationRate) ** (relativeYear + 1)
        ),
        realPessimist: Math.round(
          pessimisticBalance / (1 + defaultInflationRate) ** (relativeYear + 1)
        ),
        salary: monthlySalary,
        monthlyInvestment: monthlyContribution,
        investmentContributionRate: investmentContributionRateForYear(relativeYear),
        extraMonthlyInvestment: extraMonthlyInvestmentForYear(relativeYear),
        optimisticMonthlyGain: monthlyInvestmentGain(
          optimisticBalance,
          investmentGrowth.optimistic
        ),
        pessimisticMonthlyGain: monthlyInvestmentGain(
          pessimisticBalance,
          investmentGrowth.pessimistic
        ),
        optimisticYearlyGain: yearlyInvestmentGain(
          optimisticYearStartBalance,
          investmentGrowth.optimistic
        ),
        pessimisticYearlyGain: yearlyInvestmentGain(
          pessimisticYearStartBalance,
          investmentGrowth.pessimistic
        ),
        optimisticReturn: investmentGrowth.optimistic,
        pessimisticReturn: investmentGrowth.pessimistic,
        salaryGrowth: salaryGrowthForForecastYear(relativeYear)
      });
    }

    return rows;
  })();

  const currentYearMonthlyForecast = (() => {
    const rows: MonthlyInvestmentForecastRow[] = [];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;
    const monthlySalary = forecastMonthlySalary(-1);
    const investmentGrowth = investmentGrowthForYear();

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      const monthlyContribution = currentYearForecastMonthContribution(monthIndex);
      const optimisticMonthlyGain = monthlyInvestmentGain(
        optimisticBalance,
        investmentGrowth.optimistic,
        monthlyContribution
      );
      const pessimisticMonthlyGain = monthlyInvestmentGain(
        pessimisticBalance,
        investmentGrowth.pessimistic,
        monthlyContribution
      );
      optimisticBalance = compoundMonth(
        optimisticBalance,
        investmentGrowth.optimistic,
        monthlyContribution
      );
      pessimisticBalance = compoundMonth(
        pessimisticBalance,
        investmentGrowth.pessimistic,
        monthlyContribution
      );
      rows.push({
        year: -1,
        month: monthLabels[monthIndex],
        monthIndex,
        calendarYear: forecastBaseYear,
        age: forecastCurrentAge,
        optimistic: Math.round(optimisticBalance),
        pessimist: Math.round(pessimisticBalance),
        realOptimistic: Math.round(
          optimisticBalance /
            (1 + defaultInflationRate) ** ((monthIndex - forecastCurrentMonthIndex + 1) / 12)
        ),
        realPessimist: Math.round(
          pessimisticBalance /
            (1 + defaultInflationRate) ** ((monthIndex - forecastCurrentMonthIndex + 1) / 12)
        ),
        salary: monthlySalary,
        monthlyInvestment: monthlyContribution,
        investmentContributionRate: investmentContributionRateForYear(-1),
        extraMonthlyInvestment: currentYearMonthlyExtraInvestment(monthIndex),
        optimisticMonthlyGain,
        pessimisticMonthlyGain,
        optimisticYearlyGain: yearlyInvestmentGain(optimisticBalance, investmentGrowth.optimistic),
        pessimisticYearlyGain: yearlyInvestmentGain(
          pessimisticBalance,
          investmentGrowth.pessimistic
        ),
        optimisticReturn: investmentGrowth.optimistic,
        pessimisticReturn: investmentGrowth.pessimistic,
        salaryGrowth: salaryGrowthForForecastYear(-1)
      });
    }

    return rows;
  })();
  return {
    investmentForecast,
    currentYearMonthlyForecast,
    forecastAge,
    forecastCalendarYear,
    forecastRowMuted,
    isRetiredForecastYear
  };
}
