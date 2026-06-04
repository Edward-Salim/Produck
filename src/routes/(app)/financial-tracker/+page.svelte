<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { enhance } from '$app/forms';
  import {
    ArrowDown,
    ArrowDownRight,
    ArrowUp,
    ArrowUpRight,
    ArrowUpDown,
    Banknote,
    CalendarDays,
    ChartColumn,
    Check,
    CircleDollarSign,
    GitCompareArrows,
    PiggyBank,
    RefreshCw,
    ReceiptText,
    Search,
    WalletCards
  } from '@lucide/svelte';
  import { Area, Axis, Chart, Grid, Highlight, Spline, Svg, Tooltip } from 'layerchart';
  import { scaleTime } from 'd3-scale';
  import { curveMonotoneX } from 'd3-shape';
  import bcaLogo from '$lib/assets/fintech_logos/indonesia/bca.svg';
  import bankJagoLogo from '$lib/assets/fintech_logos/indonesia/bank_jago.png';
  import bniLogo from '$lib/assets/fintech_logos/indonesia/bni.svg';
  import cimbLogo from '$lib/assets/fintech_logos/indonesia/cimb_logogram.svg';
  import danaLogo from '$lib/assets/fintech_logos/indonesia/dana_icon.png';
  import flipLogo from '$lib/assets/fintech_logos/indonesia/flip.png';
  import gopayLogo from '$lib/assets/fintech_logos/indonesia/gopay_logogram.svg';
  import mandiriEmoneyLogo from '$lib/assets/fintech_logos/indonesia/mandiri_emoney.svg';
  import octoPayLogo from '$lib/assets/fintech_logos/indonesia/octo_pay.png';
  import ovoLogo from '$lib/assets/fintech_logos/indonesia/ovo_logo.png';
  import shopeepayLogo from '$lib/assets/fintech_logos/indonesia/shopeepay_wallet.png';
  import tapcashLogo from '$lib/assets/fintech_logos/indonesia/tapcash_transparent.png';
  import { emptyTrackerData } from './financial-tracker-data';
  import type {
    CategoryRow,
    InvestmentRow,
    LedgerEntry,
    MoneyRow,
    MonthlySummary,
    TrackerData
  } from './financial-tracker-data';

  let { data } = $props<{ data: { trackerData: TrackerData | null } }>();
  const initialTrackerData = untrack(() => (data.trackerData ?? emptyTrackerData) as TrackerData);

  const currency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  });

  const amount = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  });

  const shortAmount = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1
  });
  const compactCurrency = (value: number) => `Rp ${shortAmount.format(value)}`;
  const forecastAmount = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
  const forecastGainAmount = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
  const compactForecastAmount = (value: number) => {
    if (Math.abs(value) >= 1_000_000_000) return `${forecastAmount.format(value / 1_000_000_000)}M`;
    if (Math.abs(value) >= 1_000_000) return `${forecastAmount.format(value / 1_000_000)}jt`;
    if (Math.abs(value) >= 1_000) return `${forecastAmount.format(value / 1_000)}rb`;
    return amount.format(value);
  };
  const compactForecastCurrency = (value: number) => `Rp ${compactForecastAmount(value)}`;
  const compactForecastGainAmount = (value: number) => {
    if (Math.abs(value) >= 1_000_000_000)
      return `${forecastGainAmount.format(value / 1_000_000_000)}M`;
    if (Math.abs(value) >= 1_000_000) return `${forecastGainAmount.format(value / 1_000_000)}jt`;
    if (Math.abs(value) >= 1_000) return `${forecastGainAmount.format(value / 1_000)}rb`;
    return amount.format(value);
  };
  const compactUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });
  const investmentQuoteRefreshMs = 12 * 60 * 60 * 1000;

  type LedgerSortKey =
    | 'date'
    | 'description'
    | 'kind'
    | 'category'
    | 'account'
    | 'paymentType'
    | 'amount';
  type SortDirection = 'asc' | 'desc';
  type ForecastMode = 'optimistic' | 'pessimistic';
  type InvestmentCurrencyMode = 'idr' | 'usd';
  type ReturnProfileKey = 'vti' | 'sp500' | 'gold' | 'conservative';
  type BudgetPerformanceRow = CategoryRow & {
    share: number;
    allocationShare: number;
  };
  type BudgetPerformanceGroup = {
    label: string;
    categories: string[];
  };
  type WalletGroup = {
    label: string;
    wallets: string[];
  };
  type InvestmentForecastRow = TrackerData['investmentForecast'][number] & {
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
  type MonthlyInvestmentForecastRow = InvestmentForecastRow & {
    month: string;
    monthIndex: number;
    calendarYear: number;
    age: number;
  };
  type InvestmentHistoryChartDatum = TrackerData['monthlyInvestmentHistory'][number] & {
    date: Date;
    label: string;
    valueLabel: string;
    growthLabel: string;
  };
  const selectedMonthStorageKey = 'financial-tracker:selected-month';
  const selectedViewStorageKey = 'financial-tracker:selected-view';
  const emptyMonth: MonthlySummary = {
    key: '',
    label: '',
    period: '',
    updated: '',
    rollover: { label: 'Rollover', planned: 0, actual: 0, variant: 'income' },
    income: { label: 'Income', planned: 0, actual: 0, variant: 'income' },
    expenses: { label: 'Expenses', planned: 0, actual: 0, variant: 'expense' },
    bills: { label: 'Bills', planned: 0, actual: 0, variant: 'expense' },
    savings: { label: 'Savings', planned: 0, actual: 0, variant: 'expense' },
    debt: { label: 'Debt', planned: 0, actual: 0, variant: 'expense' },
    leftover: { label: 'Leftover', planned: 0, actual: 0, variant: 'neutral' }
  };
  const budgetCategoryDescriptions = new Map([
    ['Meals', 'Daily food, snacks, coffee, drinks, and water.'],
    ['Household Supplies', 'Toiletries, tissue, soap, deodorant, cleaning, and kost supplies.'],
    ['Transportation', 'Gojek, KRL, TransJakarta, parking, and short city trips.'],
    ['Utilities', 'Kost electricity token and recurring utility needs.'],
    ['Mobile Data', 'Phone data package and connectivity top-up.'],
    ['Subscriptions', 'Spotify, apps, cloud, and small recurring digital tools.'],
    ['Personal Care', 'Laundry, haircut, and grooming services.'],
    ['Fun Money', 'Self-reward, hangouts, movies, games, events, and mood spending.'],
    ['Health', 'Medicine, supplements, clinic, and small fitness needs.'],
    ['Learning', 'Books, courses, tools, and study-related spending.'],
    ['Admin', 'Bank fees, transfer fees, document/admin costs.'],
    ['One-off', 'Irregular purchases, replacements, and unexpected daily needs.'],
    ['Reimbursements', 'Temporary spending expected to be paid back.'],
    ['?', 'Unclassified spending to clean up later.']
  ]);
  const budgetCategoryGroups: BudgetPerformanceGroup[] = [
    {
      label: 'Daily Living',
      categories: ['Meals', 'Transportation', 'Household Supplies', 'Utilities', 'Mobile Data']
    },
    {
      label: 'Lifestyle',
      categories: ['Fun Money', 'Personal Care', 'Subscriptions']
    },
    {
      label: 'Growth and Health',
      categories: ['Health', 'Learning']
    },
    {
      label: 'Irregular and Admin',
      categories: ['One-off', 'Admin', '?']
    }
  ];
  const hiddenBudgetPerformanceCategories = new Set(['Reimbursements']);
  const walletGroups: WalletGroup[] = [
    {
      label: 'Cash and Banks',
      wallets: ['Cash', 'BCA', 'BNI', 'Bank Jago', 'OCTO Pay', 'CIMB Tabunganku']
    },
    {
      label: 'E-Wallets',
      wallets: ['GoPay', 'DANA', 'ShopeePay', 'OVO', 'Flip']
    },
    {
      label: 'Transit Cards',
      wallets: ['TapCash', 'e-Money Mandiri']
    }
  ];
  const walletLogos = new Map([
    ['BCA', bcaLogo],
    ['Bank Jago', bankJagoLogo],
    ['BNI', bniLogo],
    ['CIMB', cimbLogo],
    ['CIMB Tabunganku', cimbLogo],
    ['DANA', danaLogo],
    ['Flip', flipLogo],
    ['GoPay', gopayLogo],
    ['OCTO Pay', octoPayLogo],
    ['e-Money Mandiri', mandiriEmoneyLogo],
    ['OVO', ovoLogo],
    ['ShopeePay', shopeepayLogo],
    ['TapCash', tapcashLogo]
  ]);
  let trackerData: TrackerData = $derived((data.trackerData ?? emptyTrackerData) as TrackerData);
  let budgetCategoryOptions: TrackerData['budgetCategoryOptions'] = $derived(
    trackerData.budgetCategoryOptions
  );
  let budgetCategoryLabels = $derived(budgetCategoryOptions.map((category) => category.label));
  let categories: CategoryRow[] = $derived(trackerData.categories);
  let mayCategories: CategoryRow[] = $derived(trackerData.mayCategories);
  let juneCategories: CategoryRow[] = $derived(trackerData.juneCategories);
  const forecastBaseYear = 2026;
  const forecastCurrentAge = 22;
  const forecastCurrentMonthIndex = 5;
  const forecastCurrentMonthlySalary = 8_000_000;
  const defaultForecastRetirementAge = 40;
  const minForecastRetirementAge = 25;
  const maxForecastRetirementAge = 71;
  const forecastLifeExpectancyAge = 71;
  const millionaireTarget = 1_000_000_000;
  const defaultSalaryGrowthRate = 0.07;
  const defaultInvestmentContributionRate = 0.3;
  const defaultInflationRate = 0.03;
  const returnProfiles: Record<
    ReturnProfileKey,
    { label: string; optimistic: number; pessimistic: number }
  > = {
    vti: { label: 'VTI', optimistic: 0.09, pessimistic: 0.06 },
    sp500: { label: 'S&P 500', optimistic: 0.1, pessimistic: 0.06 },
    gold: { label: 'Gold', optimistic: 0.076, pessimistic: 0.03 },
    conservative: { label: 'Conservative', optimistic: 0.05, pessimistic: 0.03 }
  };
  const returnProfileOptions = Object.entries(returnProfiles) as [
    ReturnProfileKey,
    (typeof returnProfiles)[ReturnProfileKey]
  ][];
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

  function monthlyInvestmentGain(balance: number, annualReturn: number) {
    return Math.round(balance * ((1 + annualReturn) ** (1 / 12) - 1));
  }

  function yearlyInvestmentGain(balance: number, annualReturn: number, months = 12) {
    return Math.round(balance * ((1 + annualReturn) ** (months / 12) - 1));
  }

  function percent(value: number) {
    return `${amount.format(value * 100)}%`;
  }

  function percentNumber(value: number) {
    return amount.format(value * 100);
  }

  function returnProfileLabel(key: ReturnProfileKey) {
    const profile = returnProfiles[key];
    return `${profile.label} (${percentNumber(profile.pessimistic)}-${percent(profile.optimistic)})`;
  }

  function shortDateTime(value?: string) {
    if (!value) return 'Not synced';

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function investmentGainAmount(investment: InvestmentRow) {
    return investment.costBasis === undefined
      ? undefined
      : investment.balance - investment.costBasis;
  }

  function idrToUsd(value: number) {
    return trackerData.usdIdrRate && trackerData.usdIdrRate > 0
      ? value / trackerData.usdIdrRate
      : undefined;
  }

  function investmentUsdValue(investment: InvestmentRow) {
    const convertedValue = idrToUsd(investment.balance);
    if (convertedValue !== undefined) return convertedValue;

    if (!investment.shares || !investment.latestPrice) return undefined;
    return investment.shares * investment.latestPrice;
  }

  function investmentUsdCostBasis(investment: InvestmentRow) {
    if (investment.costBasis === undefined) return undefined;

    const convertedCostBasis = idrToUsd(investment.costBasis);
    if (convertedCostBasis !== undefined) return convertedCostBasis;

    const usdValue = investmentUsdValue(investment);
    if (usdValue === undefined || investment.balance === 0) return undefined;
    return investment.costBasis / (investment.balance / usdValue);
  }

  function investmentUnitPriceIdr(investment: InvestmentRow) {
    if (!investment.shares || investment.shares <= 0) return undefined;
    return investment.balance / investment.shares;
  }

  function displayedInvestmentUnitPrice(investment: InvestmentRow) {
    if (investmentCurrencyMode === 'usd') {
      if (investment.latestPrice !== undefined) return compactUsd.format(investment.latestPrice);

      const unitPriceIdr = investmentUnitPriceIdr(investment);
      const unitPriceUsd = unitPriceIdr === undefined ? undefined : idrToUsd(unitPriceIdr);
      return unitPriceUsd === undefined ? undefined : compactUsd.format(unitPriceUsd);
    }

    const unitPriceIdr = investmentUnitPriceIdr(investment);
    return unitPriceIdr === undefined ? undefined : currency.format(unitPriceIdr);
  }

  function displayedInvestmentValue(investment: InvestmentRow) {
    if (investmentCurrencyMode === 'usd') {
      const usdValue = investmentUsdValue(investment);
      return usdValue === undefined ? '-' : compactUsd.format(usdValue);
    }

    return currency.format(investment.balance);
  }

  function displayedInvestmentGain(investment: InvestmentRow) {
    const gain = investmentGainAmount(investment);
    if (gain === undefined) return undefined;

    if (investmentCurrencyMode === 'usd') {
      const usdCostBasis = investmentUsdCostBasis(investment);
      const usdValue = investmentUsdValue(investment);
      if (usdCostBasis === undefined || usdValue === undefined) return undefined;
      return compactUsd.format(usdValue - usdCostBasis);
    }

    return currency.format(gain);
  }

  function displayedPortfolioValue() {
    return investmentCurrencyMode === 'usd'
      ? compactUsd.format(totalInvestmentUsdValue)
      : currency.format(totalInvestments);
  }

  function displayedPortfolioGain() {
    return investmentCurrencyMode === 'usd'
      ? compactUsd.format(totalInvestmentUsdGain)
      : currency.format(totalInvestmentGain);
  }

  function displayedPortfolioCostBasis() {
    return investmentCurrencyMode === 'usd'
      ? compactUsd.format(totalInvestmentUsdCostBasis)
      : currency.format(totalInvestmentCostBasis);
  }

  function displayedUsdIdrRate() {
    return trackerData.usdIdrRate === undefined
      ? 'FX unavailable'
      : `1 USD = ${currency.format(trackerData.usdIdrRate)}`;
  }

  function displayedHistoryMoney(value: number) {
    if (investmentCurrencyMode === 'usd') {
      const usdValue = idrToUsd(value);
      return usdValue === undefined ? '-' : compactUsd.format(usdValue);
    }

    return currency.format(value);
  }

  function displayedMonthLabel(monthKey: string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
  }

  function displayedShortMonthLabel(value: Date | number | string) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC'
    }).format(new Date(value));
  }

  function displayedMonthlyGrowth(row: TrackerData['monthlyInvestmentHistory'][number]) {
    const sign = row.monthlyGrowth >= 0 ? '+' : '';
    const suffix = row.hasPreviousMonth ? '' : ' vs initial value';
    return `${sign}${displayedHistoryMoney(row.monthlyGrowth)} (${sign}${row.monthlyGrowthPercent.toFixed(2)}%)${suffix}`;
  }

  function displayedHistoryChartMoney(value: number) {
    if (investmentCurrencyMode === 'usd') {
      const usdValue = idrToUsd(value);
      return usdValue === undefined ? '-' : compactUsd.format(usdValue);
    }

    return compactForecastCurrency(value);
  }

  function investmentQuoteIsStale(investment: InvestmentRow) {
    if (!investment.latestPriceAt) return true;
    return Date.now() - new Date(investment.latestPriceAt).getTime() > investmentQuoteRefreshMs;
  }

  function forecastValue(row: InvestmentForecastRow | MonthlyInvestmentForecastRow) {
    return forecastMode === 'optimistic' ? row.optimistic : row.pessimist;
  }

  function forecastMonthlyGain(row: InvestmentForecastRow | MonthlyInvestmentForecastRow) {
    return forecastMode === 'optimistic' ? row.optimisticMonthlyGain : row.pessimisticMonthlyGain;
  }

  function forecastYearlyGain(row: InvestmentForecastRow) {
    return forecastMode === 'optimistic' ? row.optimisticYearlyGain : row.pessimisticYearlyGain;
  }

  function forecastInvestmentReturn(row: InvestmentForecastRow | MonthlyInvestmentForecastRow) {
    return forecastMode === 'optimistic' ? row.optimisticReturn : row.pessimisticReturn;
  }

  function displayedForecastMonthlyInvestment(
    row: InvestmentForecastRow | MonthlyInvestmentForecastRow
  ) {
    return Math.max(0, row.monthlyInvestment);
  }

  function forecastBudgetAfterInvestment(
    row: InvestmentForecastRow | MonthlyInvestmentForecastRow
  ) {
    return row.salary - displayedForecastMonthlyInvestment(row);
  }

  function forecastRowMuted(relativeYear: number) {
    return Boolean(mutedForecastRows[relativeYear]);
  }

  function toggleForecastRowMuted(relativeYear: number) {
    mutedForecastRows = {
      ...mutedForecastRows,
      [relativeYear]: !mutedForecastRows[relativeYear]
    };
  }

  function forecastRealValue(row: InvestmentForecastRow | MonthlyInvestmentForecastRow) {
    return forecastMode === 'optimistic' ? row.realOptimistic : row.realPessimist;
  }

  function setForecastInvestmentContributionRate(relativeYear: number, value: string) {
    const parsedPercent = value.trim() === '' ? 0 : Number(value);
    const clampedPercent = Math.min(Math.max(parsedPercent, 0), 100);
    forecastInvestmentContributionOverrides = {
      ...forecastInvestmentContributionOverrides,
      [relativeYear]: Number.isFinite(parsedPercent) ? clampedPercent / 100 : undefined
    };
  }

  function setForecastMonthlySalary(relativeYear: number, value: string) {
    if (value.trim() === '') {
      forecastSalaryOverrides = {
        ...forecastSalaryOverrides,
        [relativeYear]: undefined
      };
      return;
    }

    const parsedSalary = Number(value);
    forecastSalaryOverrides = {
      ...forecastSalaryOverrides,
      [relativeYear]: Number.isFinite(parsedSalary) ? Math.max(parsedSalary, 0) : undefined
    };
  }

  function setForecastExtraInvestment(relativeYear: number, value: string) {
    if (value.trim() === '') {
      forecastExtraInvestmentOverrides = {
        ...forecastExtraInvestmentOverrides,
        [relativeYear]: undefined
      };
      return;
    }

    const parsedExtraInvestment = Number(value);
    forecastExtraInvestmentOverrides = {
      ...forecastExtraInvestmentOverrides,
      [relativeYear]: Number.isFinite(parsedExtraInvestment) ? parsedExtraInvestment : undefined
    };
  }

  function setCurrentYearMonthlyExtraInvestment(monthIndex: number, value: string) {
    if (value.trim() === '') {
      currentYearMonthlyExtraInvestmentOverrides = {
        ...currentYearMonthlyExtraInvestmentOverrides,
        [monthIndex]: undefined
      };
      return;
    }

    const parsedExtraInvestment = Number(value);
    currentYearMonthlyExtraInvestmentOverrides = {
      ...currentYearMonthlyExtraInvestmentOverrides,
      [monthIndex]: Number.isFinite(parsedExtraInvestment) ? parsedExtraInvestment : undefined
    };
  }

  function handleForecastSalaryInput(relativeYear: number, input: HTMLInputElement) {
    setForecastMonthlySalary(relativeYear, input.value.replace(/\D/g, ''));
  }

  function handleForecastExtraInvestmentInput(relativeYear: number, input: HTMLInputElement) {
    setForecastExtraInvestment(relativeYear, input.value.replace(/[^\d-]/g, '').replace(/(?!^)-/g, ''));
  }

  function handleCurrentYearMonthlyExtraInvestmentInput(
    monthIndex: number,
    input: HTMLInputElement
  ) {
    setCurrentYearMonthlyExtraInvestment(
      monthIndex,
      input.value.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '')
    );
  }

  function formatForecastSalaryInput(input: HTMLInputElement, value: number) {
    input.value = compactForecastAmount(value);
  }

  function displayedForecastSalaryInput(row: InvestmentForecastRow) {
    return focusedForecastSalaryYear === row.year
      ? String(row.salary)
      : compactForecastAmount(row.salary);
  }

  function displayedForecastMoneyInput(relativeYear: number, value: number) {
    return focusedForecastExtraInvestmentYear === relativeYear ? String(value) : amount.format(value);
  }

  function displayedCurrentYearMonthlyExtraInput(monthIndex: number, value: number) {
    return focusedCurrentYearMonthlyExtraInvestmentMonth === monthIndex
      ? String(value)
      : amount.format(value);
  }

  function formatForecastMoneyInput(input: HTMLInputElement, value: number) {
    input.value = amount.format(value);
  }

  let baseInvestmentForecast: TrackerData['investmentForecast'] = $derived(
    trackerData.investmentForecast
  );
  let investments: TrackerData['investments'] = $derived(trackerData.investments);
  let ledgerEntries: LedgerEntry[] = $derived(trackerData.ledgerEntries);
  let monthlySummaries: TrackerData['monthlySummaries'] = $derived(trackerData.monthlySummaries);
  let baseWallets: TrackerData['wallets'] = $derived(trackerData.wallets);
  let walletStatusSelections = $state<Record<string, boolean>>({});
  let wallets: TrackerData['wallets'] = $derived(
    baseWallets.map((wallet) => {
      const selectedStatus = walletStatusSelections[wallet.label];
      if (selectedStatus === undefined) return wallet;

      return {
        ...wallet,
        balanceProvided: selectedStatus,
        transactionsProvided: selectedStatus
      };
    })
  );
  let totalWalletBalance = $derived(wallets.reduce((sum, row) => sum + row.balance, 0));
  let totalWallets = $derived(
    wallets.reduce((sum, row) => sum + Math.max(row.balance - (row.minimumHold ?? 0), 0), 0)
  );
  let groupedWallets = $derived(groupWalletRows(wallets));
  let totalInvestments = $derived(investments.reduce((sum, row) => sum + row.balance, 0));
  let totalInvestmentCostBasis = $derived(
    investments.reduce((sum, row) => sum + (row.costBasis ?? row.balance), 0)
  );
  let totalInvestmentGain = $derived(totalInvestments - totalInvestmentCostBasis);
  let totalInvestmentGainPercent = $derived(
    totalInvestmentCostBasis > 0 ? (totalInvestmentGain / totalInvestmentCostBasis) * 100 : 0
  );
  let totalInvestmentUsdValue = $derived(
    investments.reduce((sum, row) => sum + (investmentUsdValue(row) ?? 0), 0)
  );
  let totalInvestmentUsdCostBasis = $derived(
    investments.reduce((sum, row) => sum + (investmentUsdCostBasis(row) ?? 0), 0)
  );
  let totalInvestmentUsdGain = $derived(totalInvestmentUsdValue - totalInvestmentUsdCostBasis);
  let investmentQuotesNeedRefresh = $derived(investments.some(investmentQuoteIsStale));
  let monthlyInvestmentHistory = $derived(trackerData.monthlyInvestmentHistory);
  let investmentHistoryChartRows = $derived.by(() => {
    return [...monthlyInvestmentHistory].slice(-6).map((row): InvestmentHistoryChartDatum => {
      const date = new Date(`${row.monthKey}-01T00:00:00.000Z`);

      return {
        ...row,
        date,
        label: displayedMonthLabel(row.monthKey),
        valueLabel: displayedHistoryChartMoney(row.portfolioValue),
        growthLabel: displayedMonthlyGrowth(row)
      };
    });
  });
  let investmentHistoryYDomain = $derived.by(() => {
    if (investmentHistoryChartRows.length === 0) return undefined;

    const values = investmentHistoryChartRows.map((row) => row.portfolioValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = Math.max(maxValue - minValue, 1);
    const domainPadding = Math.max(valueRange * 1.35, maxValue * 0.035, 1);

    return [Math.max(0, minValue - domainPadding), maxValue + domainPadding] as [number, number];
  });
  let forecastFinalRelativeYear = $derived(
    Math.max(
      forecastLifeExpectancyAge - forecastCurrentAge - 1,
      ...baseInvestmentForecast.map((row) => row.year)
    )
  );
  let investmentForecast = $derived.by(() => {
    const rows: InvestmentForecastRow[] = [
      {
        year: -1,
        optimistic: totalInvestments,
        pessimist: totalInvestments,
        realOptimistic: totalInvestments,
        realPessimist: totalInvestments,
        salary: forecastMonthlySalary(-1),
        monthlyInvestment: forecastMonthlyContribution(-1),
        investmentContributionRate: investmentContributionRateForYear(-1),
        extraMonthlyInvestment: currentYearTotalExtraInvestment(),
        optimisticMonthlyGain: monthlyInvestmentGain(
          totalInvestments,
          investmentGrowthForYear().optimistic
        ),
        pessimisticMonthlyGain: monthlyInvestmentGain(
          totalInvestments,
          investmentGrowthForYear().pessimistic
        ),
        optimisticYearlyGain: yearlyInvestmentGain(
          totalInvestments,
          investmentGrowthForYear().optimistic,
          12 - forecastCurrentMonthIndex
        ),
        pessimisticYearlyGain: yearlyInvestmentGain(
          totalInvestments,
          investmentGrowthForYear().pessimistic,
          12 - forecastCurrentMonthIndex
        ),
        optimisticReturn: investmentGrowthForYear().optimistic,
        pessimisticReturn: investmentGrowthForYear().pessimistic,
        salaryGrowth: salaryGrowthForForecastYear(-1)
      }
    ];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;
    const currentYearInvestmentGrowth = investmentGrowthForYear();

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      const monthlyContribution = currentYearForecastMonthContribution(monthIndex);
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
  });
  let currentYearMonthlyForecast = $derived.by(() => {
    const rows: MonthlyInvestmentForecastRow[] = [];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;
    const monthlySalary = forecastMonthlySalary(-1);
    const investmentGrowth = investmentGrowthForYear();

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      const monthlyContribution = currentYearForecastMonthContribution(monthIndex);
      const optimisticMonthlyGain = monthlyInvestmentGain(
        optimisticBalance,
        investmentGrowth.optimistic
      );
      const pessimisticMonthlyGain = monthlyInvestmentGain(
        pessimisticBalance,
        investmentGrowth.pessimistic
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
            (1 + defaultInflationRate) ** ((monthIndex - forecastCurrentMonthIndex) / 12)
        ),
        realPessimist: Math.round(
          pessimisticBalance /
            (1 + defaultInflationRate) ** ((monthIndex - forecastCurrentMonthIndex) / 12)
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
  });
  let millionaireForecastYear = $derived(
    investmentForecast.find((row) => forecastRealValue(row) >= millionaireTarget)?.year
  );
  let debtSchedule = $derived(trackerData.mayDebtSchedule);
  let upcomingDebt = $derived(
    debtSchedule
      .filter((row) => row.status === 'upcoming')
      .reduce((sum, row) => sum + row.amount, 0)
  );
  let ledgerBaseCategoryOptions: string[] = $derived([
    ...budgetCategoryLabels.filter((category) => category !== '?'),
    'Gift',
    'Honorarium',
    'Wallet Transfer',
    'Debt Payment',
    '?'
  ]);

  function yearlyForecastOverrideMap<K extends keyof TrackerData['forecastOverrides'][number]>(
    source: TrackerData,
    key: K
  ) {
    return Object.fromEntries(
      source.forecastOverrides
        .filter((row) => row.monthIndex === undefined && row[key] !== undefined)
        .map((row) => [row.relativeYear, row[key]])
    ) as Record<number, number | undefined>;
  }

  function monthlyForecastExtraOverrideMap(source: TrackerData) {
    return Object.fromEntries(
      source.forecastOverrides
        .filter((row) => row.monthIndex !== undefined && row.extraMonthlyInvestment !== undefined)
        .map((row) => [row.monthIndex!, row.extraMonthlyInvestment])
    ) as Record<number, number | undefined>;
  }

  let selectedMonth = $state('jun-2026');
  let selectedView = $state<'accounting' | 'investments'>('accounting');
  let forecastMode = $state<ForecastMode>(initialTrackerData.forecastPreferences.forecastMode);
  let investmentCurrencyMode = $state<InvestmentCurrencyMode>(
    initialTrackerData.forecastPreferences.investmentCurrency
  );
  let investmentRefreshPending = $state(false);
  let selectedReturnProfile = $state<ReturnProfileKey>(
    initialTrackerData.forecastPreferences.returnProfile
  );
  let forecastRetirementAge = $state(
    initialTrackerData.forecastPreferences.retirementAge ?? defaultForecastRetirementAge
  );
  let returnProfileMenuOpen = $state(false);
  let focusedForecastSalaryYear = $state<number | null>(null);
  let focusedForecastExtraInvestmentYear = $state<number | null>(null);
  let focusedCurrentYearMonthlyExtraInvestmentMonth = $state<number | null>(null);
  let mutedForecastRows = $state<Record<number, boolean>>({});
  let forecastInvestmentContributionOverrides = $state<Record<number, number | undefined>>(
    yearlyForecastOverrideMap(initialTrackerData, 'investmentContributionRate')
  );
  let forecastSalaryOverrides = $state<Record<number, number | undefined>>(
    yearlyForecastOverrideMap(initialTrackerData, 'salary')
  );
  let forecastExtraInvestmentOverrides = $state<Record<number, number | undefined>>(
    yearlyForecastOverrideMap(initialTrackerData, 'extraMonthlyInvestment')
  );
  let currentYearMonthlyExtraInvestmentOverrides = $state<Record<number, number | undefined>>(
    monthlyForecastExtraOverrideMap(initialTrackerData)
  );
  let preferencesLoaded = $state(false);
  let ledgerSortKey = $state<LedgerSortKey>('date');
  let ledgerSortDirection = $state<SortDirection>('desc');
  let ledgerCategorySelections = $state<Record<string, string>>({});
  let openCategoryEntryId = $state<string | null>(null);
  let categorySearchByEntry = $state<Record<string, string>>({});
  let budgetShareSelections = $state<Record<string, number>>({});
  let openBudgetDescriptions = $state<Record<string, boolean>>({});
  let monthlyAllocationInput = $state(0);
  let visibleMonthlySummaries: TrackerData['monthlySummaries'] = $derived(
    monthlySummaries.map((month) => ledgerSummaryForMonth(month))
  );
  let monthTabs = $derived([{ key: 'all', label: 'All' }, ...visibleMonthlySummaries]);
  let latestMonthKey = $derived(visibleMonthlySummaries[0]?.key ?? '');
  let allMonthSummary = $derived({
    key: 'all',
    label: 'All',
    period: 'All tracked months',
    updated: visibleMonthlySummaries[0]?.updated ?? '',
    rollover: {
      label: 'Rollover',
      planned: 0,
      actual: 0,
      variant: 'income' as const
    },
    income: {
      label: 'Income',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.income.planned, 0),
      actual: visibleMonthlySummaries.reduce((sum, month) => sum + month.income.actual, 0),
      variant: 'income' as const
    },
    expenses: {
      label: 'Expenses',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.expenses.planned, 0),
      actual: visibleMonthlySummaries.reduce((sum, month) => sum + month.expenses.actual, 0),
      variant: 'expense' as const
    },
    bills: {
      label: 'Bills',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.bills.planned, 0),
      actual: visibleMonthlySummaries.reduce((sum, month) => sum + month.bills.actual, 0),
      variant: 'expense' as const
    },
    savings: {
      label: 'Savings',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.savings.planned, 0),
      actual: visibleMonthlySummaries.reduce((sum, month) => sum + month.savings.actual, 0),
      variant: 'expense' as const
    },
    debt: {
      label: 'Debt',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.debt.planned, 0),
      actual: visibleMonthlySummaries.reduce((sum, month) => sum + month.debt.actual, 0),
      variant: 'expense' as const
    },
    leftover: {
      label: 'Leftover',
      planned: visibleMonthlySummaries.reduce((sum, month) => sum + month.leftover.planned, 0),
      actual: totalWallets,
      variant: 'neutral' as const
    }
  });
  let currentMonth = $derived(
    selectedMonth === 'all'
      ? allMonthSummary
      : (visibleMonthlySummaries.find((month) => month.key === selectedMonth) ??
          visibleMonthlySummaries[0] ??
          emptyMonth)
  );
  let activeLedgerEntries: LedgerEntry[] = $derived(
    selectedMonth === 'all' ? ledgerEntries : entriesForMonth(currentMonth.key)
  );
  let budgetIncomeActual = $derived(
    selectedMonth === 'all' || isLedgerMonth(currentMonth.key)
      ? activeLedgerEntries
          .filter((entry) => entry.kind === 'income' && entry.category !== 'Reimbursements')
          .reduce((sum, entry) => sum + entry.amount, 0)
      : currentMonth.income.actual
  );
  let effectiveLedgerEntries: LedgerEntry[] = $derived(
    activeLedgerEntries.map((entry) => ({
      ...entry,
      category: ledgerCategorySelections[entry.id] ?? entry.category
    }))
  );
  let sortedLedgerEntries = $derived(
    sortLedgerEntries(effectiveLedgerEntries, ledgerSortKey, ledgerSortDirection)
  );
  let ledgerCategoryOptions = $derived(
    [...new Set([...ledgerBaseCategoryOptions, ...Object.values(ledgerCategorySelections)])].filter(
      Boolean
    )
  );
  let allLedgerCategories = $derived(
    mergeRows([ledgerCategoryRows('may-2026'), ledgerCategoryRows('jun-2026')])
  );
  let activeCategories = $derived(
    selectedMonth === 'all'
      ? categoryRowsFromEntries(effectiveLedgerEntries, allLedgerCategories)
      : isLedgerMonth(currentMonth.key)
        ? categoryRowsFromEntries(effectiveLedgerEntries, ledgerCategoryRows(currentMonth.key))
        : currentMonth.key === 'jun-2026'
          ? juneCategories
          : currentMonth.key === 'may-2026'
            ? mayCategories
            : categories
  );
  let activeBudgetRows: BudgetPerformanceRow[] = $derived(
    activeCategories
      .filter((row) => !hiddenBudgetPerformanceCategories.has(row.label))
      .map((row) => {
        const allocationShare =
          budgetShareSelections[row.label] ??
          budgetCategoryOptions.find((category) => category.label === row.label)?.allocationShare ??
          0;
        const share = allocationShare / 100;
        const planned = Math.round(monthlyAllocationInput * share);
        return {
          ...row,
          planned,
          share,
          allocationShare
        };
      })
  );
  let groupedBudgetRows = $derived(groupBudgetPerformanceRows(activeBudgetRows));
  let activeExpenseRows: { actualAmount: number; paymentType: LedgerEntry['paymentType'] }[] =
    $derived(
      activeLedgerEntries
        .filter((row) => row.kind === 'expense' || row.kind === 'bill')
        .map((entry) => ({
          actualAmount: entry.amount,
          paymentType: entry.paymentType
        }))
    );
  let cashPaidNow = $derived(
    activeExpenseRows.reduce((sum, row) => {
      const isPayLater = row.paymentType === 'paylater';
      return sum + (isPayLater ? 0 : row.actualAmount);
    }, 0)
  );
  let passThroughReimbursementIncome = $derived(
    activeLedgerEntries
      .filter(
        (entry) =>
          entry.kind === 'income' &&
          entry.category === 'Reimbursements' &&
          entry.description.toLowerCase().includes('selempang')
      )
      .reduce((sum, entry) => sum + entry.amount, 0)
  );
  let reconciliationCashIn = $derived(
    Math.max(currentMonth.income.actual - passThroughReimbursementIncome, 0)
  );
  let startingLiquidBalance = $derived(currentMonth.rollover.actual);
  let recordedEndingLiquidBalance = $derived(
    selectedMonth === 'all' || currentMonth.key === latestMonthKey
      ? totalWallets
      : currentMonth.leftover.actual
  );
  let expectedEndingBalance = $derived(
    startingLiquidBalance +
      reconciliationCashIn -
      cashPaidNow -
      currentMonth.debt.actual -
      currentMonth.savings.actual
  );
  let reconciliationFormula = $derived([
    { label: 'Starting liquid', value: startingLiquidBalance, operator: '' },
    { label: 'Cash in', value: reconciliationCashIn, operator: '+' },
    { label: 'Cash expenses', value: cashPaidNow, operator: '-' },
    { label: 'Debt paid', value: currentMonth.debt.actual, operator: '-' },
    { label: 'Savings held', value: currentMonth.savings.actual, operator: '-' }
  ]);
  let reconciliationDifference = $derived(recordedEndingLiquidBalance - expectedEndingBalance);

  let actualOutflow = $derived(
    currentMonth.expenses.actual +
      currentMonth.bills.actual +
      currentMonth.savings.actual +
      currentMonth.debt.actual
  );

  onMount(() => {
    const savedMonth = localStorage.getItem(selectedMonthStorageKey);
    const savedView = localStorage.getItem(selectedViewStorageKey);

    if (
      savedMonth &&
      (savedMonth === 'all' || visibleMonthlySummaries.some((month) => month.key === savedMonth))
    ) {
      selectedMonth = savedMonth;
    }

    if (savedView === 'accounting' || savedView === 'investments') {
      selectedView = savedView;
    }

    preferencesLoaded = true;
  });

  $effect(() => {
    if (!preferencesLoaded) return;
    localStorage.setItem(selectedMonthStorageKey, selectedMonth);
    localStorage.setItem(selectedViewStorageKey, selectedView);
  });

  $effect(() => {
    monthlyAllocationInput = trackerData.monthlyAllocation;
    budgetShareSelections = Object.fromEntries(
      trackerData.budgetCategoryOptions.map((category) => [
        category.label,
        category.allocationShare
      ])
    );
  });

  function progress(actual: number, planned: number) {
    if (planned <= 0) return actual > 0 ? 100 : 0;
    return Math.min((actual / planned) * 100, 100);
  }

  function usedPercentage(actual: number, planned: number) {
    if (planned <= 0) return actual > 0 ? 100 : 0;
    return (actual / planned) * 100;
  }

  function budgetCategoryDescription(label: string) {
    return budgetCategoryDescriptions.get(label) ?? 'Tracked monthly allocation category.';
  }

  function toggleBudgetDescription(label: string) {
    openBudgetDescriptions = {
      ...openBudgetDescriptions,
      [label]: !openBudgetDescriptions[label]
    };
  }

  function groupBudgetPerformanceRows(rows: BudgetPerformanceRow[]) {
    const rowByLabel = new Map(rows.map((row) => [row.label, row]));
    const usedLabels = new Set<string>();
    const groups = budgetCategoryGroups
      .map((group) => {
        const groupRows = group.categories
          .map((category) => rowByLabel.get(category))
          .filter((row): row is BudgetPerformanceRow => Boolean(row));

        for (const row of groupRows) usedLabels.add(row.label);

        return {
          label: group.label,
          rows: groupRows
        };
      })
      .filter((group) => group.rows.length > 0);

    const otherRows = rows.filter((row) => !usedLabels.has(row.label));
    if (otherRows.length > 0) groups.push({ label: 'Other', rows: otherRows });

    return groups;
  }

  function groupWalletRows(rows: TrackerData['wallets']) {
    const rowByLabel = new Map(rows.map((row) => [row.label, row]));
    const usedLabels = new Set<string>();
    const groups = walletGroups
      .map((group) => {
        const groupRows = group.wallets
          .map((wallet) => rowByLabel.get(wallet))
          .filter((row): row is TrackerData['wallets'][number] => Boolean(row));

        for (const row of groupRows) usedLabels.add(row.label);

        return {
          label: group.label,
          rows: groupRows
        };
      })
      .filter((group) => group.rows.length > 0);

    const otherRows = rows.filter((row) => !usedLabels.has(row.label));
    if (otherRows.length > 0) groups.push({ label: 'Other', rows: otherRows });

    return groups;
  }

  function total<T extends Record<K, number>, K extends keyof T>(rows: T[], key: K) {
    return rows.reduce((sum, row) => sum + row[key], 0);
  }

  function ledgerAccount(entry: LedgerEntry) {
    if (entry.kind === 'income') return entry.toAccount ?? '-';
    if (entry.kind === 'transfer')
      return `${entry.fromAccount ?? '-'} -> ${entry.toAccount ?? '-'}`;
    if (entry.kind === 'debt-payment')
      return `${entry.fromAccount ?? '-'} -> ${entry.toAccount ?? '-'}`;
    return entry.fromAccount ?? '-';
  }

  function walletLiquidBalance(balance: number, minimumHold = 0) {
    return Math.max(balance - minimumHold, 0);
  }

  function walletStatusComplete(wallet: TrackerData['wallets'][number]) {
    return Boolean(wallet.balanceProvided && wallet.transactionsProvided);
  }

  function walletInitials(label: string) {
    return label
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function submitWalletStatus(event: Event) {
    const checkbox = event.currentTarget as HTMLInputElement;
    const form = checkbox.form;
    const checkedInput = form?.querySelector<HTMLInputElement>('input[name="checked"]');
    const labelInput = form?.querySelector<HTMLInputElement>('input[name="label"]');
    if (!form || !checkedInput || !labelInput) return;

    checkedInput.value = checkbox.checked ? 'true' : 'false';
    walletStatusSelections = {
      ...walletStatusSelections,
      [labelInput.value]: checkbox.checked
    };
    form.requestSubmit();
  }

  function keepFormState() {
    return async ({
      update
    }: {
      update: (options: { reset: boolean; invalidateAll: boolean }) => Promise<void>;
    }) => {
      await update({ reset: false, invalidateAll: false });
    };
  }

  async function saveForecastPreferences(values: {
    forecastMode?: ForecastMode;
    returnProfile?: ReturnProfileKey;
    investmentCurrency?: InvestmentCurrencyMode;
    retirementAge?: number;
  }) {
    const formData = new FormData();
    if (values.forecastMode) formData.set('forecastMode', values.forecastMode);
    if (values.returnProfile) formData.set('returnProfile', values.returnProfile);
    if (values.investmentCurrency) formData.set('investmentCurrency', values.investmentCurrency);
    if (values.retirementAge !== undefined) formData.set('retirementAge', String(values.retirementAge));

    await fetch('?/forecastPreferences', {
      method: 'POST',
      body: formData
    });
  }

  function normalizeForecastRetirementAge(value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return defaultForecastRetirementAge;
    return Math.min(
      maxForecastRetirementAge,
      Math.max(minForecastRetirementAge, Math.round(parsed))
    );
  }

  function setForecastRetirementAge(input: HTMLInputElement) {
    const nextAge = normalizeForecastRetirementAge(input.value);
    forecastRetirementAge = nextAge;
    input.value = String(nextAge);
    void saveForecastPreferences({ retirementAge: nextAge });
  }

  function toggleCategoryMenu(entryId: string) {
    openCategoryEntryId = openCategoryEntryId === entryId ? null : entryId;
    if (openCategoryEntryId === entryId) {
      categorySearchByEntry = {
        ...categorySearchByEntry,
        [entryId]: ''
      };
    }
  }

  function closeCategoryMenu(event: FocusEvent, entryId: string) {
    const form = event.currentTarget as HTMLFormElement;
    window.setTimeout(() => {
      if (form.contains(document.activeElement)) return;
      if (openCategoryEntryId === entryId) openCategoryEntryId = null;
    });
  }

  function toggleReturnProfileMenu() {
    returnProfileMenuOpen = !returnProfileMenuOpen;
  }

  function closeReturnProfileMenu(event: FocusEvent) {
    const container = event.currentTarget as HTMLElement;
    window.setTimeout(() => {
      if (container.contains(document.activeElement)) return;
      returnProfileMenuOpen = false;
    });
  }

  function chooseReturnProfile(key: ReturnProfileKey) {
    selectedReturnProfile = key;
    returnProfileMenuOpen = false;
    void saveForecastPreferences({ returnProfile: key });
  }

  function chooseLedgerCategory(form: HTMLFormElement, entryId: string, category: string) {
    const categoryInput = form.querySelector<HTMLInputElement>('input[name="category"]');
    if (!categoryInput) return;

    categoryInput.value = category;
    ledgerCategorySelections = {
      ...ledgerCategorySelections,
      [entryId]: category
    };
    categorySearchByEntry = {
      ...categorySearchByEntry,
      [entryId]: ''
    };
    openCategoryEntryId = null;
    form.requestSubmit();
  }

  function updateCategorySearch(event: Event, entryId: string) {
    const input = event.currentTarget as HTMLInputElement;
    categorySearchByEntry = {
      ...categorySearchByEntry,
      [entryId]: input.value
    };
  }

  function filteredLedgerCategoryOptions(entryId: string) {
    const query = (categorySearchByEntry[entryId] ?? '').trim().toLowerCase();
    if (!query) return ledgerCategoryOptions;

    return ledgerCategoryOptions.filter((category) => category.toLowerCase().includes(query));
  }

  function submitBudgetShare(event: Event, label: string) {
    const input = event.currentTarget as HTMLInputElement;
    const nextShare = Math.min(Math.max(Math.round(input.valueAsNumber || 0), 0), 100);
    input.value = String(nextShare);
    budgetShareSelections = {
      ...budgetShareSelections,
      [label]: nextShare
    };
    input.form?.requestSubmit();
  }

  function submitMonthlyAllocation(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const nextAllocation = Math.max(Math.round(Number(input.value.replace(/\D/g, '')) || 0), 0);
    const hiddenInput = input.form?.querySelector<HTMLInputElement>(
      'input[name="monthlyAllocation"]'
    );
    input.value = amount.format(nextAllocation);
    if (hiddenInput) hiddenInput.value = String(nextAllocation);
    monthlyAllocationInput = nextAllocation;
    input.form?.requestSubmit();
  }

  function categoryRowsFromEntries(entries: LedgerEntry[], baseRows: CategoryRow[]) {
    const totals = new Map<string, number>();

    for (const entry of entries) {
      if (entry.kind !== 'expense' && entry.kind !== 'bill') continue;
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
    }

    const rows = new Map<string, CategoryRow>();
    for (const row of baseRows) {
      rows.set(row.label, {
        label: row.label,
        planned: row.planned,
        actual: totals.get(row.label) ?? 0
      });
    }

    for (const [label, actual] of totals) {
      if (!rows.has(label)) rows.set(label, { label, planned: 0, actual });
    }

    return [...rows.values()];
  }

  function ledgerSortValue(entry: LedgerEntry, key: LedgerSortKey) {
    if (key === 'date') return Date.parse(entry.date);
    if (key === 'account') return ledgerAccount(entry);
    return entry[key];
  }

  function setLedgerSort(key: LedgerSortKey) {
    if (ledgerSortKey === key) {
      ledgerSortDirection = ledgerSortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    ledgerSortKey = key;
    ledgerSortDirection = key === 'date' || key === 'amount' ? 'desc' : 'asc';
  }

  function sortLedgerEntries(entries: LedgerEntry[], key: LedgerSortKey, direction: SortDirection) {
    const modifier = direction === 'asc' ? 1 : -1;

    return [...entries].sort((first, second) => {
      const firstValue = ledgerSortValue(first, key);
      const secondValue = ledgerSortValue(second, key);

      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return (firstValue - secondValue) * modifier;
      }

      return (
        String(firstValue).localeCompare(String(secondValue), 'id-ID', {
          numeric: true,
          sensitivity: 'base'
        }) * modifier
      );
    });
  }

  function mergeRows(rowSets: CategoryRow[][]) {
    const rows = new Map<string, CategoryRow>();
    for (const rowSet of rowSets) {
      for (const row of rowSet) {
        const existing = rows.get(row.label);
        rows.set(row.label, {
          label: row.label,
          planned: (existing?.planned ?? 0) + row.planned,
          actual: (existing?.actual ?? 0) + row.actual
        });
      }
    }
    return [...rows.values()];
  }

  function entriesForMonth(monthKey: string) {
    return ledgerEntries.filter((entry) => entry.monthKey === monthKey);
  }

  function isLedgerMonth(monthKey: string) {
    return trackerData.ledgerMonthKeys.includes(monthKey);
  }

  function baseCategoryRowsForMonth(monthKey: string) {
    if (monthKey === 'jun-2026') return juneCategories;
    if (monthKey === 'may-2026') return mayCategories;
    return categories;
  }

  function ledgerCategoryRows(monthKey: string): CategoryRow[] {
    const totals = new Map<string, number>();
    for (const entry of entriesForMonth(monthKey).filter((row) => row.kind === 'expense')) {
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount);
    }

    const rows = new Map<string, CategoryRow>();
    for (const row of baseCategoryRowsForMonth(monthKey)) {
      rows.set(row.label, {
        label: row.label,
        planned: row.planned,
        actual: totals.get(row.label) ?? 0
      });
    }

    for (const category of budgetCategoryLabels) {
      if (!rows.has(category)) rows.set(category, { label: category, planned: 0, actual: 0 });
    }

    for (const [label, actual] of totals) {
      if (!rows.has(label)) rows.set(label, { label, planned: 0, actual });
    }

    return [...rows.values()];
  }

  function ledgerSummaryForMonth(month: (typeof monthlySummaries)[number]) {
    if (!isLedgerMonth(month.key)) return month;

    const monthEntries = entriesForMonth(month.key);
    const sumByKind = (kinds: LedgerEntry['kind'][]) =>
      monthEntries
        .filter((row) => kinds.includes(row.kind))
        .reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = sumByKind(['expense']);
    const bills = sumByKind(['bill']);
    const income = sumByKind(['income']);
    const debt = sumByKind(['debt-payment']);

    return {
      ...month,
      income: { ...month.income, actual: income },
      expenses: { ...month.expenses, actual: expenses },
      bills: { ...month.bills, actual: bills },
      debt: { ...month.debt, actual: debt }
    };
  }
</script>

<svelte:head>
  <title>Financial Tracker | Produck</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-2.5">
  <header class="grid gap-2 xl:grid-cols-[auto_1fr] xl:items-center">
    <div class="min-w-48">
      <h1 class="text-xl font-semibold text-cork-900 md:text-2xl">Financial Tracker</h1>
      <div class="mt-2 flex gap-1 rounded-lg border border-cork-300/45 bg-cork-50/70 p-1">
        <button
          type="button"
          class="view-tab"
          class:active={selectedView === 'accounting'}
          onclick={() => (selectedView = 'accounting')}
        >
          Accounting
        </button>
        <button
          type="button"
          class="view-tab"
          class:active={selectedView === 'investments'}
          onclick={() => (selectedView = 'investments')}
        >
          Investments
        </button>
      </div>
    </div>

    {#if selectedView === 'accounting'}
      <div class="flex min-w-0 gap-1.5 overflow-x-auto">
        {#each monthTabs as month (month.key)}
          <button
            type="button"
            class="month-tab"
            class:active={selectedMonth === month.key}
            onclick={() => (selectedMonth = month.key)}
          >
            <span>{month.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </header>

  {#if selectedView === 'accounting'}
    <section class="grid grid-cols-4 gap-1.5">
      <div class="metric">
        <span class="metric-icon bg-emerald-100 text-emerald-700"
          ><CircleDollarSign class="size-4" /></span
        >
        <p class="metric-label">Liquid cash</p>
        <p class="metric-value text-emerald-700">{currency.format(totalWallets)}</p>
      </div>
      <div class="metric">
        <span class="metric-icon bg-blue-100 text-blue-700"><ArrowUpRight class="size-4" /></span>
        <p class="metric-label">Income</p>
        <p class="metric-value text-cork-900">{currency.format(budgetIncomeActual)}</p>
      </div>
      <div class="metric">
        <span class="metric-icon bg-red-100 text-red-700"><ArrowDownRight class="size-4" /></span>
        <p class="metric-label">Spent</p>
        <p class="metric-value text-cork-900">{currency.format(actualOutflow)}</p>
      </div>
      <div class="metric">
        <span class="metric-icon bg-amber-100 text-amber-700"><CalendarDays class="size-4" /></span>
        <p class="metric-label">Upcoming debt</p>
        <p class="metric-value text-red-700">{currency.format(upcomingDebt)}</p>
      </div>
    </section>

    <section class="panel">
      <div class="mb-3 flex items-center justify-between gap-3 border-b border-cork-200 pb-2">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-cork-900">
          <ReceiptText class="size-4 text-cork-500" />
          Budget Performance
        </h2>
        <div class="flex flex-wrap justify-end gap-x-4 gap-y-0.5 text-right text-[10px]">
          <div>
            <span class="text-cork-400">Budget period</span>
            <span class="ml-1 font-medium text-cork-800">{currentMonth.period}</span>
          </div>
          <div>
            <span class="text-cork-400">Updated</span>
            <span class="ml-1 font-medium text-cork-800">{currentMonth.updated}</span>
          </div>
          <div class="allocation-header-item">
            <span class="text-cork-400">Monthly allocation</span>
            <form method="POST" action="?/monthlyAllocation" use:enhance class="inline-block">
              <input type="hidden" name="monthlyAllocation" value={monthlyAllocationInput} />
              <span class="allocation-control">
                <span>Rp</span>
                <input
                  class="allocation-input"
                  type="text"
                  inputmode="numeric"
                  value={amount.format(monthlyAllocationInput)}
                  aria-label="Monthly allocation"
                  onchange={submitMonthlyAllocation}
                />
              </span>
            </form>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="tracker-table budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Share</th>
              {@render MoneyHead('Plan')}
              {@render MoneyHead('Actual')}
              <th>Used</th>
            </tr>
          </thead>
          <tbody>
            {#each groupedBudgetRows as group (group.label)}
              <tr class="budget-group-row">
                <td colspan="7">{group.label}</td>
              </tr>
              {#each group.rows as row (row.label)}
                <tr class="budget-child-row">
                  <td>
                    <div class="budget-category-cell">
                      <button
                        type="button"
                        class="budget-category-name"
                        aria-expanded={Boolean(openBudgetDescriptions[row.label])}
                        onclick={() => toggleBudgetDescription(row.label)}
                      >
                        {row.label}
                      </button>
                      {#if openBudgetDescriptions[row.label]}
                        <span class="budget-category-desc"
                          >{budgetCategoryDescription(row.label)}</span
                        >
                      {/if}
                    </div>
                  </td>
                  <td>
                    <form method="POST" action="?/budgetShare" use:enhance class="share-form">
                      <input type="hidden" name="label" value={row.label} />
                      <input
                        class="share-input"
                        type="number"
                        name="share"
                        min="0"
                        max="100"
                        step="1"
                        value={row.allocationShare}
                        aria-label={`${row.label} allocation share`}
                        onchange={(event) => submitBudgetShare(event, row.label)}
                      />
                      <span>%</span>
                    </form>
                  </td>
                  {@render MoneyCell(row.planned)}
                  {@render MoneyCell(row.actual)}
                  <td>
                    <div class="flex min-w-24 items-center gap-1.5">
                      <div class="h-1.5 flex-1 rounded-full bg-cork-200">
                        <div
                          class="h-full rounded-full"
                          class:bg-emerald-500={row.planned > 0 &&
                            progress(row.actual, row.planned) < 80}
                          class:bg-amber-500={row.planned > 0 &&
                            progress(row.actual, row.planned) >= 80 &&
                            progress(row.actual, row.planned) <= 100}
                          class:bg-red-500={(row.planned <= 0 && row.actual > 0) ||
                            progress(row.actual, row.planned) > 100}
                          style:width={`${progress(row.actual, row.planned)}%`}
                        ></div>
                      </div>
                      <span class="w-11 text-right"
                        >{usedPercentage(row.actual, row.planned).toFixed(0)}%</span
                      >
                    </div>
                  </td>
                </tr>
              {/each}
            {/each}
            {#if activeBudgetRows.length === 0}
              <tr>
                <td colspan="7" class="text-center text-cork-400"
                  >No budget categories entered yet</td
                >
              </tr>
            {:else}
              <tr class="total-row">
                <td>Total</td>
                <td>{total(activeBudgetRows, 'allocationShare')}%</td>
                {@render MoneyCell(total(activeBudgetRows, 'planned'))}
                {@render MoneyCell(total(activeBudgetRows, 'actual'))}
                <td
                  >{usedPercentage(
                    total(activeBudgetRows, 'actual'),
                    total(activeBudgetRows, 'planned')
                  ).toFixed(0)}%</td
                >
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid gap-3 xl:grid-cols-2">
      {@render BalanceReconciliation()}
      {@render DebtDetail()}
    </section>

    <section class="grid gap-3 xl:grid-cols-2">
      <div class="panel">
        {@render PanelTitle(WalletCards, 'Liquid Wallets')}
        <div class="overflow-x-auto">
          <table class="tracker-table dense wallet-table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Rekening</th>
                {@render MoneyHead('Balance')}
                {@render MoneyHead('Min hold')}
                {@render MoneyHead('Liquid')}
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {#each groupedWallets as group (group.label)}
                <tr class="wallet-group-row">
                  <td colspan="9">{group.label}</td>
                </tr>
                {#each group.rows as wallet (wallet.label)}
                  <tr class="wallet-child-row">
                    <td>
                      <div class="wallet-label">
                        {#if walletLogos.has(wallet.label)}
                          <img
                            class="wallet-logo"
                            src={walletLogos.get(wallet.label)}
                            alt=""
                            loading="lazy"
                          />
                        {:else if wallet.label === 'Cash'}
                          <span class="wallet-logo wallet-cash-icon">
                            <Banknote class="size-3.5" />
                          </span>
                        {:else}
                          <span class="wallet-logo wallet-logo-fallback">
                            {walletInitials(wallet.label)}
                          </span>
                        {/if}
                        <span>{wallet.label}</span>
                      </div>
                    </td>
                    <td data-label="Rekening">{wallet.accountNumber ?? '-'}</td>
                    <td class="currency-col" data-label="Balance"></td>
                    <td data-label="Balance">{currency.format(wallet.balance)}</td>
                    <td class="currency-col" data-label="Min hold"></td>
                    <td data-label="Min hold">{currency.format(wallet.minimumHold ?? 0)}</td>
                    <td class="currency-col" data-label="Liquid"></td>
                    <td data-label="Liquid">
                      {currency.format(walletLiquidBalance(wallet.balance, wallet.minimumHold))}
                    </td>
                    <td class="check-cell" data-label="Updated">
                      <form
                        method="POST"
                        action="?/walletStatus"
                        class="wallet-status-form"
                        use:enhance={keepFormState}
                      >
                        <input type="hidden" name="label" value={wallet.label} />
                        <input
                          type="hidden"
                          name="checked"
                          value={walletStatusComplete(wallet) ? 'true' : 'false'}
                        />
                        <input
                          type="checkbox"
                          checked={walletStatusComplete(wallet)}
                          onchange={submitWalletStatus}
                          aria-label={`${wallet.label} balance and monthly mutation entered`}
                        />
                      </form>
                    </td>
                  </tr>
                {/each}
              {/each}
              <tr class="total-row">
                <td>Total</td>
                <td></td>
                <td class="currency-col" data-label="Balance"></td>
                <td data-label="Balance">{currency.format(totalWalletBalance)}</td>
                <td class="currency-col" data-label="Min hold"></td>
                <td data-label="Min hold">{currency.format(totalWalletBalance - totalWallets)}</td>
                <td class="currency-col" data-label="Liquid"></td>
                <td data-label="Liquid">{currency.format(totalWallets)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {#if selectedMonth === 'all' || isLedgerMonth(currentMonth.key)}
      <section class="panel">
        {@render PanelTitle(ReceiptText, 'Ledger')}
        <div class="overflow-x-auto">
          <table class="tracker-table dense">
            <thead>
              <tr>
                {@render LedgerSortHead('Date', 'date')}
                <th class="currency-col"></th>
                {@render LedgerSortHead('Amount', 'amount')}
                {@render LedgerSortHead('Category', 'category')}
                {@render LedgerSortHead('Description', 'description')}
                {@render LedgerSortHead('Account', 'account')}
                {@render LedgerSortHead('Payment', 'paymentType')}
                {@render LedgerSortHead('Kind', 'kind')}
              </tr>
            </thead>
            <tbody>
              {#each sortedLedgerEntries as entry (entry.id)}
                <tr>
                  <td>{entry.date}</td>
                  {@render MoneyCell(entry.amount)}
                  <td>
                    <form
                      method="POST"
                      action="?/ledgerCategory"
                      use:enhance
                      class="category-form"
                      class:open={openCategoryEntryId === entry.id}
                      onfocusout={(event) => closeCategoryMenu(event, entry.id)}
                    >
                      <input type="hidden" name="entryId" value={entry.id} />
                      <input type="hidden" name="category" value={entry.category} />
                      <button
                        type="button"
                        class="category-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={openCategoryEntryId === entry.id}
                        aria-label={`Category for ${entry.description}`}
                        onclick={() => toggleCategoryMenu(entry.id)}
                      >
                        <span>{entry.category}</span>
                      </button>
                      {#if openCategoryEntryId === entry.id}
                        <div class="category-menu" role="listbox" tabindex="-1">
                          <label class="category-search">
                            <Search
                              class="category-search-icon"
                              size={14}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            <input
                              type="text"
                              value={categorySearchByEntry[entry.id] ?? ''}
                              placeholder="Search category"
                              aria-label="Search category"
                              oninput={(event) => updateCategorySearch(event, entry.id)}
                              onkeydown={(event) => {
                                if (event.key === 'Enter') event.preventDefault();
                              }}
                            />
                          </label>
                          <div class="category-options">
                            {#each filteredLedgerCategoryOptions(entry.id) as category (category)}
                              <button
                                type="button"
                                class="category-option"
                                class:active={category === entry.category}
                                role="option"
                                aria-selected={category === entry.category}
                                onclick={(event) =>
                                  chooseLedgerCategory(
                                    event.currentTarget.form as HTMLFormElement,
                                    entry.id,
                                    category
                                  )}
                              >
                                <span>{category}</span>
                                {#if category === entry.category}
                                  <Check
                                    class="category-check"
                                    size={9}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                {/if}
                              </button>
                            {:else}
                              <div class="category-empty">No match</div>
                            {/each}
                          </div>
                        </div>
                      {/if}
                    </form>
                  </td>
                  <td>{entry.description}</td>
                  <td>{ledgerAccount(entry)}</td>
                  <td>{entry.paymentType}</td>
                  <td>{entry.kind}</td>
                </tr>
              {/each}
              {#if sortedLedgerEntries.length === 0}
                <tr>
                  <td colspan="8" class="text-center text-cork-400"
                    >No transactions for this month</td
                  >
                </tr>
              {/if}
            </tbody>
          </table>
        </div>
      </section>
    {/if}
  {:else}
    <section class="grid min-w-0 gap-3 xl:grid-cols-[0.8fr_1.2fr]">
      <div class="panel min-w-0">
        <div
          class="forecast-panel-header investment-panel-header mb-3 flex items-center justify-between gap-2 border-b border-cork-200 pb-2"
        >
          <h2 class="investment-panel-title flex items-center gap-2 text-sm font-semibold text-cork-900">
            <PiggyBank class="size-4 text-cork-500" />
            Long-Term Investments
          </h2>
          <div class="flex items-center gap-1.5">
            <span class="investment-fx-rate">{displayedUsdIdrRate()}</span>
            <form
              method="POST"
              action="?/refreshInvestments"
              use:enhance={() => {
                investmentRefreshPending = true;

                return async ({ update }) => {
                  await update();
                  investmentRefreshPending = false;
                };
              }}
            >
              <button
                type="submit"
                class="panel-icon-button investment-refresh-button"
                class:attention={investmentQuotesNeedRefresh}
                class:spinning={investmentRefreshPending}
                disabled={investmentRefreshPending}
                title="Refresh prices"
              >
                <RefreshCw class="size-3.5" />
              </button>
            </form>
            <div class="investment-currency-switch" role="group" aria-label="Investment currency">
              <button
                type="button"
                class:active={investmentCurrencyMode === 'idr'}
                onclick={() => {
                  investmentCurrencyMode = 'idr';
                  void saveForecastPreferences({ investmentCurrency: 'idr' });
                }}
              >
                Rp
              </button>
              <button
                type="button"
                class:active={investmentCurrencyMode === 'usd'}
                onclick={() => {
                  investmentCurrencyMode = 'usd';
                  void saveForecastPreferences({ investmentCurrency: 'usd' });
                }}
              >
                $
              </button>
            </div>
          </div>
        </div>
        <div class="space-y-1.5">
          {#each investments as investment (investment.label)}
            <div class="investment-row">
              <span class="flex min-w-0 flex-col">
                <span class="investment-ticker">{investment.label}</span>
                <span class="investment-meta">
                  {#if displayedInvestmentUnitPrice(investment)}
                    {displayedInvestmentUnitPrice(investment)} · {shortDateTime(
                      investment.latestPriceAt
                    )}
                  {:else}
                    {shortDateTime(investment.latestPriceAt)}
                  {/if}
                </span>
              </span>
              <span
                class={`investment-change ${
                  investment.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                <span class="font-semibold">{investment.change}</span>
              </span>
              <span
                class={`investment-gain ${
                  investment.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {displayedInvestmentGain(investment) ?? '-'}
              </span>
              <span class="font-medium text-cork-900">{displayedInvestmentValue(investment)}</span>
            </div>
          {/each}
          <div class="investment-summary">
            <div class="investment-summary-row primary">
              <span>Portfolio value</span>
              <strong>{displayedPortfolioValue()}</strong>
            </div>
            <div class="investment-summary-row">
              <span>Total gain</span>
              <strong
                class={`investment-summary-gain ${
                  totalInvestmentGain >= 0 ? 'positive' : 'negative'
                }`}
              >
                <span class="portfolio-gain-percent"
                  >{totalInvestmentGain >= 0 ? '+' : ''}{totalInvestmentGainPercent.toFixed(
                    2
                  )}%</span
                >
                <span class="portfolio-gain-amount">{displayedPortfolioGain()}</span>
              </strong>
            </div>
            <div class="investment-summary-row">
              <span>Cost basis</span>
              <strong>{displayedPortfolioCostBasis()}</strong>
            </div>
          </div>
          <p class="text-[10px] text-cork-400">Excluded from liquid wallet balance.</p>
          <div class="investment-history">
            <div class="investment-history-title">
              <span>Monthly Growth</span>
              <span>Month-close values</span>
            </div>
            {#if investmentHistoryChartRows.length > 0}
              <div class="investment-history-chart" aria-label="Monthly portfolio growth chart">
                <Chart
                  data={investmentHistoryChartRows}
                  x="date"
                  y="portfolioValue"
                  xScale={scaleTime()}
                  yDomain={investmentHistoryYDomain}
                  padding={{ top: 14, right: 18, bottom: 28, left: 18 }}
                  tooltip={{ mode: 'bisect-x' }}
                >
                  <Svg>
                    <Grid y classes={{ line: 'investment-history-grid-line' }} />
                    <Area curve={curveMonotoneX} class="investment-history-area" />
                    <Spline curve={curveMonotoneX} class="investment-history-line" />
                    <Axis
                      placement="bottom"
                      ticks={investmentHistoryChartRows.map((row) => row.date)}
                      format={displayedShortMonthLabel}
                      tickLength={0}
                      classes={{
                        rule: 'investment-history-axis-rule',
                        tick: 'investment-history-axis-tick',
                        tickLabel: 'investment-history-axis-label'
                      }}
                    />
                    <Highlight
                      lines={{ class: 'investment-history-highlight-line' }}
                      points={{ class: 'investment-history-highlight-point', r: 3.2 }}
                    />
                  </Svg>

                  <Tooltip.Root
                    anchor="top"
                    variant="none"
                    classes={{ container: 'investment-history-tooltip-container' }}
                    let:data
                  >
                    <div class="investment-history-tooltip">
                      <span>{data.label}</span>
                      <strong>{data.valueLabel}</strong>
                      <em
                        class:positive-growth={data.monthlyGrowth >= 0}
                        class:negative-growth={data.monthlyGrowth < 0}
                      >
                        {data.growthLabel}
                      </em>
                    </div>
                  </Tooltip.Root>
                </Chart>
              </div>
            {:else}
              <p class="investment-history-empty">
                No snapshots yet. Refresh prices to start history.
              </p>
            {/if}
          </div>
        </div>
      </div>

      <div class="panel min-w-0">
        <div class="mb-3 flex items-center justify-between gap-2 border-b border-cork-200 pb-2">
          <h2 class="flex items-center gap-2 text-sm font-semibold text-cork-900">
            <ChartColumn class="size-4 text-cork-500" />
            Investments Forecast
          </h2>
          <div class="forecast-assumptions">
            <span class="forecast-assumption-inline">
              <span>Inflation/yr</span>
              <strong>{percent(defaultInflationRate)}</strong>
            </span>
            <label class="forecast-assumption-inline forecast-retirement-age-control">
              <span>Retire age</span>
              <input
                class="forecast-input forecast-age-input"
                type="number"
                min={minForecastRetirementAge}
                max={maxForecastRetirementAge}
                step="1"
                value={forecastRetirementAge}
                aria-label="Retirement age"
                onchange={(event) => setForecastRetirementAge(event.currentTarget)}
                onblur={(event) => setForecastRetirementAge(event.currentTarget)}
              />
            </label>
            <div class="forecast-return-profile" onfocusout={closeReturnProfileMenu}>
              <span>Return</span>
              <div class="return-profile-picker" class:open={returnProfileMenuOpen}>
                <button
                  type="button"
                  class="return-profile-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={returnProfileMenuOpen}
                  onclick={toggleReturnProfileMenu}
                >
                  <span>{returnProfileLabel(selectedReturnProfile)}</span>
                </button>
                {#if returnProfileMenuOpen}
                  <div class="return-profile-menu" role="listbox" tabindex="-1">
                    {#each returnProfileOptions as [key] (key)}
                      <button
                        type="button"
                        class="return-profile-option"
                        class:active={selectedReturnProfile === key}
                        role="option"
                        aria-selected={selectedReturnProfile === key}
                        onclick={() => chooseReturnProfile(key)}
                      >
                        <span>{returnProfileLabel(key)}</span>
                        {#if selectedReturnProfile === key}
                          <Check class="return-profile-check" />
                        {/if}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            <div class="forecast-mode-switch" role="group" aria-label="Forecast mode">
              <button
                type="button"
                class="optimist"
                class:active={forecastMode === 'optimistic'}
                onclick={() => {
                  forecastMode = 'optimistic';
                  void saveForecastPreferences({ forecastMode: 'optimistic' });
                }}
              >
                Optimist
              </button>
              <button
                type="button"
                class="pessimist"
                class:active={forecastMode === 'pessimistic'}
                onclick={() => {
                  forecastMode = 'pessimistic';
                  void saveForecastPreferences({ forecastMode: 'pessimistic' });
                }}
              >
                Pessimist
              </button>
            </div>
          </div>
        </div>
        <div class="forecast-scroll overflow-x-auto">
          <table class="tracker-table dense forecast-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Age</th>
                {@render MoneyHead('Salary/mo')}
                <th>Invest %</th>
                {@render MoneyHead('Extra 1x')}
                {@render MoneyHead('Invest/mo')}
                {@render MoneyHead('Budget/mo')}
                {@render MoneyHead('Projected')}
                {@render MoneyHead('Today Value')}
                {@render MoneyHead('Gain')}
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {#each investmentForecast as row (row.year)}
                <tr
                  class:forecast-current-row={row.year < 0}
                  class:forecast-millionaire-row={row.year === millionaireForecastYear}
                  class:forecast-retirement-row={forecastAge(row.year) === forecastRetirementAge}
                  class:forecast-muted-row={forecastRowMuted(row.year)}
                >
                  <td>
                    <span>{forecastCalendarYear(row.year)}</span>
                  </td>
                  <td>{forecastAge(row.year)}</td>
                  <td class="currency-col">Rp</td>
                  <td>
                    <form
                      method="POST"
                      action="?/forecastOverride"
                      use:enhance={keepFormState}
                      class="forecast-inline-form"
                    >
                      <input type="hidden" name="relativeYear" value={row.year} />
                      <input type="hidden" name="salary" value={row.salary} />
                      <input
                        class="forecast-input forecast-salary-input"
                        type="text"
                        inputmode="numeric"
                        disabled={isRetiredForecastYear(row.year) || forecastRowMuted(row.year)}
                        value={displayedForecastSalaryInput(row)}
                        aria-label={`Monthly salary for ${forecastCalendarYear(row.year)}`}
                        onfocus={(event) => {
                          focusedForecastSalaryYear = row.year;
                          event.currentTarget.value = String(row.salary);
                        }}
                        oninput={(event) =>
                          handleForecastSalaryInput(row.year, event.currentTarget)}
                        onblur={(event) => {
                          focusedForecastSalaryYear = null;
                          formatForecastSalaryInput(event.currentTarget, row.salary);
                          event.currentTarget.form?.requestSubmit();
                        }}
                      />
                    </form>
                  </td>
                  <td>
                    <form
                      method="POST"
                      action="?/forecastOverride"
                      use:enhance={keepFormState}
                      class="forecast-inline-form"
                    >
                      <input type="hidden" name="relativeYear" value={row.year} />
                      <span class="forecast-percent-control">
                        <input
                          class="forecast-input forecast-percent-input"
                          name="investmentContributionPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          disabled={isRetiredForecastYear(row.year) || forecastRowMuted(row.year)}
                          value={Math.round(row.investmentContributionRate * 100)}
                          aria-label={`Investment percentage for ${forecastCalendarYear(row.year)}`}
                          oninput={(event) =>
                            setForecastInvestmentContributionRate(
                              row.year,
                              event.currentTarget.value
                            )}
                          onchange={(event) => event.currentTarget.form?.requestSubmit()}
                          onblur={(event) => {
                            if (event.currentTarget.value.trim() === '') {
                              event.currentTarget.value = '0';
                              setForecastInvestmentContributionRate(row.year, '0');
                            }
                            event.currentTarget.form?.requestSubmit();
                          }}
                        />
                        <span>%</span>
                      </span>
                    </form>
                  </td>
                  <td class="currency-col">Rp</td>
                  <td>
                    {#if row.year < 0}
                      <span class="forecast-extra-summary">
                        {compactForecastAmount(row.extraMonthlyInvestment)}
                      </span>
                    {:else}
                      <form
                        method="POST"
                        action="?/forecastOverride"
                        use:enhance={keepFormState}
                        class="forecast-inline-form"
                      >
                        <input type="hidden" name="relativeYear" value={row.year} />
                        <input
                          class="forecast-input forecast-money-input"
                          name="extraMonthlyInvestment"
                          type="text"
                          inputmode="numeric"
                          value={displayedForecastMoneyInput(row.year, row.extraMonthlyInvestment)}
                          aria-label={`One-time extra investment for ${forecastCalendarYear(row.year)}`}
                          onfocus={(event) => {
                            focusedForecastExtraInvestmentYear = row.year;
                            event.currentTarget.value = String(row.extraMonthlyInvestment);
                          }}
                          oninput={(event) =>
                            handleForecastExtraInvestmentInput(row.year, event.currentTarget)}
                          onblur={(event) => {
                            focusedForecastExtraInvestmentYear = null;
                            formatForecastMoneyInput(
                              event.currentTarget,
                              row.extraMonthlyInvestment
                            );
                            event.currentTarget.form?.requestSubmit();
                          }}
                        />
                      </form>
                    {/if}
                  </td>
                  <td class="currency-col">Rp</td>
                  <td
                    class="forecast-contribution forecast-mute-toggle-cell"
                    title={forecastRowMuted(row.year)
                      ? 'Double-click to restore this forecast row'
                      : 'Double-click to temporarily zero this forecast row'}
                    ondblclick={() => toggleForecastRowMuted(row.year)}
                  >
                    {compactForecastAmount(displayedForecastMonthlyInvestment(row))}
                  </td>
                  {@render MoneyCell(
                    forecastBudgetAfterInvestment(row),
                    forecastBudgetAfterInvestment(row) >= 0
                      ? 'forecast-budget-leftover'
                      : 'forecast-budget-leftover negative',
                    true
                  )}
                  {@render MoneyCell(forecastValue(row), '', true)}
                  {@render MoneyCell(forecastRealValue(row), 'forecast-real-value', true)}
                  <td class="currency-col">Rp</td>
                  <td class="forecast-gain">
                    {compactForecastGainAmount(forecastYearlyGain(row))}
                  </td>
                  <td class="forecast-return">{percent(forecastInvestmentReturn(row))}</td>
                </tr>
                {#if row.year < 0}
                  {#each currentYearMonthlyForecast as monthRow (monthRow.month)}
                    <tr class="forecast-month-row" class:forecast-muted-row={forecastRowMuted(-1)}>
                      <td>{monthRow.month}</td>
                      <td></td>
                      <td class="currency-col"></td>
                      <td></td>
                      <td></td>
                      <td class="currency-col">Rp</td>
                      <td>
                        <form
                          method="POST"
                          action="?/forecastOverride"
                          use:enhance={keepFormState}
                          class="forecast-inline-form"
                        >
                          <input type="hidden" name="relativeYear" value="-1" />
                          <input type="hidden" name="monthIndex" value={monthRow.monthIndex} />
                          <input
                            class="forecast-input forecast-money-input"
                            name="extraMonthlyInvestment"
                            type="text"
                            inputmode="numeric"
                            value={displayedCurrentYearMonthlyExtraInput(
                              monthRow.monthIndex,
                              monthRow.extraMonthlyInvestment
                            )}
                            aria-label={`One-time extra investment for ${monthRow.month}`}
                            onfocus={(event) => {
                              focusedCurrentYearMonthlyExtraInvestmentMonth = monthRow.monthIndex;
                              event.currentTarget.value = String(monthRow.extraMonthlyInvestment);
                            }}
                            oninput={(event) =>
                              handleCurrentYearMonthlyExtraInvestmentInput(
                                monthRow.monthIndex,
                                event.currentTarget
                              )}
                            onblur={(event) => {
                              focusedCurrentYearMonthlyExtraInvestmentMonth = null;
                              formatForecastMoneyInput(
                                event.currentTarget,
                                monthRow.extraMonthlyInvestment
                              );
                              event.currentTarget.form?.requestSubmit();
                            }}
                          />
                        </form>
                      </td>
                      <td class="currency-col">Rp</td>
                      <td
                        class="forecast-contribution forecast-mute-toggle-cell"
                        title={forecastRowMuted(-1)
                          ? 'Double-click to restore the current-year row'
                          : 'Double-click to temporarily zero the current-year row'}
                        ondblclick={() => toggleForecastRowMuted(-1)}
                      >
                        {compactForecastAmount(displayedForecastMonthlyInvestment(monthRow))}
                      </td>
                      {@render MoneyCell(
                        forecastBudgetAfterInvestment(monthRow),
                        forecastBudgetAfterInvestment(monthRow) >= 0
                          ? 'forecast-budget-leftover'
                          : 'forecast-budget-leftover negative',
                        true
                      )}
                      {@render MoneyCell(forecastValue(monthRow), '', true)}
                      {@render MoneyCell(forecastRealValue(monthRow), 'forecast-real-value', true)}
                      <td class="currency-col">Rp</td>
                      <td class="forecast-gain"
                        >{compactForecastGainAmount(forecastMonthlyGain(monthRow))}</td
                      >
                      <td></td>
                    </tr>
                  {/each}
                {/if}
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  {/if}
</div>

{#snippet PanelTitle(icon: typeof WalletCards, title: string)}
  {@const Icon = icon}
  <div class="mb-3 flex items-center justify-between border-b border-cork-200 pb-2">
    <h2 class="flex items-center gap-2 text-sm font-semibold text-cork-900">
      <Icon class="size-4 text-cork-500" />
      {title}
    </h2>
  </div>
{/snippet}

{#snippet MoneyHead(label: string)}
  <th class="currency-col"></th>
  <th>{label}</th>
{/snippet}

{#snippet MoneyCell(value: number, tone = '', compact = false)}
  <td class="currency-col">Rp</td>
  <td class={tone}>{compact ? compactForecastAmount(value) : amount.format(value)}</td>
{/snippet}

{#snippet LedgerSortHead(label: string, key: LedgerSortKey)}
  <th>
    <button
      type="button"
      class="sort-button"
      class:active={ledgerSortKey === key}
      aria-label={`Sort ledger by ${label}`}
      onclick={() => setLedgerSort(key)}
    >
      <span>{label.toUpperCase()}</span>
      {#if ledgerSortKey === key}
        {#if ledgerSortDirection === 'asc'}
          <ArrowUp class="size-3" />
        {:else}
          <ArrowDown class="size-3" />
        {/if}
      {:else}
        <ArrowUpDown class="size-3 opacity-55" />
      {/if}
    </button>
  </th>
{/snippet}

{#snippet BalanceReconciliation()}
  <div class="panel">
    {@render PanelTitle(GitCompareArrows, 'Balance Reconciliation')}
    <div class="reconciliation-formula" aria-label="Balance reconciliation formula">
      {#each reconciliationFormula as term, index (term.label)}
        {#if index > 0}
          <span class="formula-operator">{term.operator}</span>
        {/if}
        <div class="formula-term">
          <div class="formula-amount">
            <span class="formula-amount-full">{currency.format(term.value)}</span>
            <span class="formula-amount-compact">{compactCurrency(term.value)}</span>
          </div>
          <div class="formula-label">{term.label}</div>
        </div>
      {/each}
      <span class="formula-operator">=</span>
      <div class="formula-term formula-result">
        <div class="formula-amount">
          <span class="formula-amount-full">{currency.format(expectedEndingBalance)}</span>
          <span class="formula-amount-compact">{compactCurrency(expectedEndingBalance)}</span>
        </div>
        <div class="formula-label">Expected ending</div>
      </div>
    </div>

    <div class="reconciliation-compare">
      <div class="compare-item">
        <span>Recorded ending</span>
        <strong>{currency.format(recordedEndingLiquidBalance)}</strong>
      </div>
      <div class="compare-item difference-item">
        <span>Difference</span>
        <strong
          class="difference-value"
          class:negative={reconciliationDifference < 0}
          class:balanced={reconciliationDifference === 0}
          >{currency.format(reconciliationDifference)}</strong
        >
      </div>
    </div>
  </div>
{/snippet}

{#snippet DebtDetail()}
  <div class="panel">
    {@render PanelTitle(CalendarDays, 'Debt Detail')}
    <div class="overflow-x-auto">
      <table class="tracker-table dense debt-detail-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Due</th>
            {@render MoneyHead('Amount')}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {#each debtSchedule as debt (`${debt.provider}-${debt.due}-${debt.amount}-${debt.status}`)}
            <tr>
              <td>{debt.provider}</td>
              <td data-label="Due">{debt.due}</td>
              <td class="currency-col" data-label="Amount"></td>
              <td data-label="Amount">{currency.format(debt.amount)}</td>
              <td data-label="Status">
                <span class="debt-status" class:paid={debt.status === 'paid'}>
                  {debt.status}
                </span>
              </td>
            </tr>
          {/each}
          {#if debtSchedule.length === 0}
            <tr>
              <td colspan="5" class="text-center text-cork-400">No debt schedule entered yet</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
{/snippet}

{#snippet CompactTable(
  icon: typeof WalletCards,
  title: string,
  rows: MoneyRow[],
  showProgress = false
)}
  <div class="panel">
    {@render PanelTitle(icon, title)}
    <div class="overflow-x-auto">
      <table class="tracker-table">
        <thead>
          <tr>
            <th>{title}</th>
            {@render MoneyHead('Planned')}
            {@render MoneyHead('Actual')}
            {#if showProgress}
              <th>Progress</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row.label)}
            <tr>
              <td>{row.label}</td>
              {@render MoneyCell(row.planned)}
              {@render MoneyCell(row.actual)}
              {#if showProgress}
                <td>
                  <div class="flex min-w-20 items-center gap-1.5">
                    <div class="h-1.5 flex-1 rounded-full bg-cork-200">
                      <div
                        class="h-full rounded-full bg-blue-500"
                        style:width={`${progress(row.actual, row.planned)}%`}
                      ></div>
                    </div>
                    <span class="w-9 text-right"
                      >{progress(row.actual, row.planned).toFixed(1)}%</span
                    >
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
          <tr class="total-row">
            <td>Total</td>
            {@render MoneyCell(total(rows, 'planned'))}
            {@render MoneyCell(total(rows, 'actual'))}
            {#if showProgress}
              <td>{progress(total(rows, 'actual'), total(rows, 'planned')).toFixed(1)}%</td>
            {/if}
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/snippet}

<style>
  .panel {
    border: 1px solid color-mix(in oklab, var(--color-cork-300) 55%, transparent);
    border-radius: 8px;
    background: color-mix(in oklab, white 52%, var(--color-cork-50));
    padding: 0.6rem;
  }

  .metric {
    position: relative;
    min-height: 3.2rem;
    border: 1px solid color-mix(in oklab, var(--color-cork-300) 55%, transparent);
    border-radius: 8px;
    background: color-mix(in oklab, white 50%, var(--color-cork-50));
    padding: 0.45rem 0.6rem;
  }

  .metric-icon {
    display: inline-flex;
    height: 1.35rem;
    width: 1.35rem;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .metric-label {
    margin-top: 0.22rem;
    font-size: 0.64rem;
    color: var(--color-cork-500);
  }

  .metric-value {
    margin-top: 0;
    font-size: 0.92rem;
    font-weight: 700;
  }

  .month-tab {
    min-width: max-content;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    padding: 0.3rem 0.7rem;
    text-align: center;
    color: var(--color-cork-700);
    cursor: pointer;
  }

  .month-tab span {
    font-size: 0.72rem;
    font-weight: 700;
  }

  .month-tab.active {
    border-color: #1f527a;
    background: #e6eefc;
    color: #1f527a;
  }

  .view-tab {
    flex: 1;
    border-radius: 6px;
    padding: 0.25rem 0.45rem;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-cork-600);
    cursor: pointer;
  }

  .view-tab.active {
    background: #1f527a;
    color: white;
  }

  :global(.overflow-x-auto) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :global(.overflow-x-auto::-webkit-scrollbar) {
    display: none;
  }

  .reconciliation-formula {
    display: grid;
    grid-template-columns:
      max-content max-content max-content max-content max-content max-content max-content
      max-content max-content max-content max-content;
    align-items: end;
    column-gap: 0.56rem;
    width: max-content;
    max-width: 100%;
    margin-inline: auto;
    overflow: hidden;
    padding: 0.18rem 0 0.4rem;
  }

  .formula-term {
    min-width: 0;
  }

  .formula-amount {
    font-size: 0.76rem;
    font-weight: 800;
    color: var(--color-cork-900);
    line-height: 1.1;
    white-space: nowrap;
  }

  .formula-amount-compact {
    display: none;
  }

  .formula-label {
    margin-top: 0.08rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.56rem;
    color: var(--color-cork-500);
    line-height: 1.15;
    white-space: nowrap;
  }

  .formula-operator {
    align-self: start;
    line-height: 1.1;
    color: #1f527a;
    font-size: 0.76rem;
    font-weight: 800;
  }

  .formula-result {
    min-width: 0;
  }

  .formula-result .formula-amount {
    color: #1f527a;
  }

  .reconciliation-compare {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem 1.25rem;
    border-top: 1px solid rgba(31, 82, 122, 0.14);
    padding-top: 0.46rem;
  }

  .compare-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.64rem;
  }

  .reconciliation-compare span {
    color: var(--color-cork-500);
  }

  .reconciliation-compare strong {
    color: var(--color-cork-900);
    font-weight: 800;
    overflow-wrap: anywhere;
    text-align: right;
  }

  .difference-item {
    border-left: 1px solid rgba(31, 82, 122, 0.16);
    padding-left: 1.25rem;
  }

  .reconciliation-compare .difference-value {
    color: #b45309;
  }

  .reconciliation-compare .difference-value.negative {
    color: #b91c1c;
  }

  .reconciliation-compare .difference-value.balanced {
    color: #15803d;
  }

  .debt-detail-table tbody tr {
    background: transparent;
  }

  .debt-status {
    color: #b45309;
    font-weight: 700;
    text-transform: capitalize;
  }

  .debt-status.paid {
    color: #15803d;
  }

  @media (max-width: 520px) {
    .reconciliation-formula {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.32rem 0.42rem;
      overflow: visible;
    }

    .formula-amount {
      font-size: 0.68rem;
    }

    .formula-amount-full {
      display: none;
    }

    .formula-amount-compact {
      display: inline;
    }

    .formula-operator {
      align-self: center;
      font-size: 0.68rem;
    }

    .formula-label {
      font-size: 0.52rem;
    }

    .reconciliation-compare {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.35rem;
      justify-content: stretch;
    }

    .compare-item {
      justify-content: space-between;
      gap: 0.8rem;
    }

    .difference-item {
      border-left: 0;
      border-top: 1px solid rgba(31, 82, 122, 0.12);
      padding-top: 0.35rem;
      padding-left: 0;
    }

    .debt-detail-table,
    .wallet-table {
      border-collapse: separate;
      border-spacing: 0 0.45rem;
    }

    .debt-detail-table thead,
    .wallet-table thead {
      display: none;
    }

    .debt-detail-table tbody,
    .debt-detail-table tr,
    .debt-detail-table td,
    .wallet-table tbody,
    .wallet-table tr,
    .wallet-table td {
      display: block;
      width: 100%;
    }

    .debt-detail-table tr:not(.total-row):not(.wallet-group-row),
    .wallet-table tr.wallet-child-row,
    .wallet-table tr.total-row {
      overflow: hidden;
      border: 1px solid rgba(31, 82, 122, 0.12);
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.5) !important;
    }

    .debt-detail-table td,
    .wallet-table td {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.9rem;
      border-width: 0 0 1px;
      padding: 0.38rem 0.5rem;
      text-align: right;
      white-space: normal;
    }

    .debt-detail-table td:first-child,
    .wallet-table td:first-child {
      border-bottom-color: rgba(31, 82, 122, 0.14);
      background: rgba(31, 82, 122, 0.04);
      text-align: left;
      font-weight: 800;
    }

    .debt-detail-table td:last-child,
    .wallet-table td:last-child {
      border-bottom: 0;
    }

    .debt-detail-table td[data-label]::before,
    .wallet-table td[data-label]::before {
      content: attr(data-label);
      flex: 0 0 auto;
      color: var(--color-cork-400);
      font-size: 0.58rem;
      font-weight: 700;
      text-align: left;
      text-transform: uppercase;
    }

    .debt-detail-table .currency-col,
    .wallet-table .currency-col {
      display: none;
    }

    .wallet-group-row {
      display: block;
      margin-top: 0.1rem;
    }

    .wallet-group-row td {
      display: block;
      border: 0;
      border-radius: 6px;
      padding: 0.3rem 0.5rem;
      background: color-mix(in oklab, #1f527a 12%, white);
    }

    .wallet-child-row td:first-child {
      padding-left: 0.5rem;
    }

    .wallet-label {
      width: 100%;
      min-width: 0;
    }

    .wallet-label span:last-child {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .wallet-status-form {
      justify-content: flex-end;
    }
  }

  .tracker-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.68rem;
  }

  .tracker-table th {
    background: #1f527a;
    color: white;
    font-size: 0.56rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .tracker-table th,
  .tracker-table td {
    border: 1px solid rgba(31, 82, 122, 0.12);
    padding: 0.22rem 0.34rem;
    text-align: right;
    white-space: nowrap;
  }

  .tracker-table th:first-child,
  .tracker-table td:first-child {
    text-align: left;
  }

  .tracker-table .currency-col {
    width: 1.35rem;
    min-width: 1.35rem;
    padding-right: 0.15rem;
    padding-left: 0.2rem;
    text-align: center;
    color: var(--color-cork-500);
    font-weight: 500;
  }

  .budget-category-cell {
    display: flex;
    max-width: 18rem;
    flex-direction: column;
    gap: 0.08rem;
    white-space: normal;
  }

  .budget-category-name {
    width: fit-content;
    text-align: left;
    font-weight: 500;
    color: var(--color-cork-900);
    cursor: pointer;
  }

  .budget-category-name:hover,
  .budget-category-name[aria-expanded='true'] {
    color: #1f527a;
  }

  .budget-category-desc {
    font-size: 0.58rem;
    line-height: 1.2;
    color: var(--color-cork-500);
  }

  .allocation-input,
  .share-input {
    border: 1px solid transparent;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.34);
    color: var(--color-cork-900);
    font-weight: 700;
    outline: none;
  }

  .allocation-control {
    display: inline-flex;
    margin-left: 0.22rem;
    align-items: center;
    gap: 0.12rem;
    border: 1px solid rgba(31, 82, 122, 0.14);
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.56);
    padding: 0.02rem 0.18rem 0.02rem 0.26rem;
    color: var(--color-cork-800);
    font-weight: 700;
  }

  .allocation-control:hover,
  .allocation-control:focus-within {
    border-color: rgba(31, 82, 122, 0.32);
    background: white;
  }

  .allocation-input:hover,
  .share-input:hover {
    border-color: rgba(31, 82, 122, 0.16);
    background: rgba(255, 255, 255, 0.68);
  }

  .allocation-input:focus,
  .share-input:focus {
    border-color: #1f527a;
    background: white;
    box-shadow: 0 0 0 2px rgba(31, 82, 122, 0.12);
  }

  .allocation-input::-webkit-outer-spin-button,
  .allocation-input::-webkit-inner-spin-button,
  .share-input::-webkit-outer-spin-button,
  .share-input::-webkit-inner-spin-button {
    margin: 0;
    appearance: none;
  }

  .allocation-input {
    width: 4.6rem;
    padding: 0.02rem 0;
    border: 0;
    background: transparent;
    text-align: left;
    font-size: 0.62rem;
    line-height: 1.25;
  }

  .allocation-header-item {
    white-space: nowrap;
  }

  .share-form {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.12rem;
    color: #1f527a;
    font-weight: 700;
  }

  .share-input {
    width: 2.3rem;
    border-color: rgba(31, 82, 122, 0.18);
    background: #eef4ff;
    padding: 0.03rem 0.16rem;
    text-align: right;
    color: #1f527a;
    font-size: 0.62rem;
    line-height: 1.2;
  }

  .share-input:hover {
    border-color: rgba(31, 82, 122, 0.34);
    background: #e6eefc;
  }

  .share-input:focus {
    border-color: #1f527a;
    background: white;
  }

  .sort-button {
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: flex-end;
    gap: 0.22rem;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .tracker-table th:first-child .sort-button {
    justify-content: flex-start;
  }

  .sort-button.active {
    color: #ffffff;
  }

  .category-form {
    position: relative;
    display: inline-flex;
    width: 9.6rem;
    max-width: 100%;
    align-items: center;
    overflow: visible;
  }

  .category-form.open {
    z-index: 80;
  }

  .category-trigger {
    display: inline-flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
    border: 1px solid rgba(31, 82, 122, 0.1);
    border-radius: 6px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.46));
    padding: 0.09rem 0.42rem;
    text-align: left;
    color: var(--color-cork-800);
    font: inherit;
    font-weight: 500;
    line-height: 1.2;
    outline: none;
    cursor: pointer;
  }

  .category-trigger span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-trigger:hover {
    border-color: rgba(31, 82, 122, 0.24);
    background: white;
  }

  .category-trigger:focus,
  .category-trigger[aria-expanded='true'] {
    border-color: #1f527a;
    background: #fbfdff;
    box-shadow:
      inset 0 0 0 1px rgba(31, 82, 122, 0.08),
      0 0 0 2px rgba(31, 82, 122, 0.12);
  }

  .category-menu {
    position: absolute;
    z-index: 90;
    top: calc(100% + 0.22rem);
    left: 0;
    width: 12.2rem;
    overflow: hidden;
    border: 1px solid rgba(31, 82, 122, 0.18);
    border-radius: 7px;
    background: #fffdf9;
    box-shadow: 0 12px 28px rgba(31, 82, 122, 0.16);
    padding: 0.16rem;
    text-align: left;
    scrollbar-color: rgba(31, 82, 122, 0.38) transparent;
    scrollbar-width: thin;
  }

  .category-search {
    display: flex;
    align-items: center;
    gap: 0.16rem;
    border-bottom: 1px solid rgba(31, 82, 122, 0.1);
    margin: 0.04rem 0.08rem 0.14rem;
    border-radius: 6px;
    padding: 0.14rem 0.24rem 0.16rem 0.34rem;
    color: var(--color-cork-500);
  }

  .category-search:focus-within {
    border-bottom-color: rgba(31, 82, 122, 0.1);
  }

  .category-search-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
  }

  .category-search input {
    min-width: 0;
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--color-cork-900);
    font: inherit;
    outline: none;
    box-shadow: none;
  }

  .category-search input:focus {
    outline: none;
    box-shadow: none;
  }

  .category-search input::placeholder {
    color: var(--color-cork-400);
  }

  .category-options {
    max-height: 11.4rem;
    overflow-y: auto;
    padding-top: 0.1rem;
    scrollbar-color: rgba(31, 82, 122, 0.38) transparent;
    scrollbar-width: thin;
  }

  .category-options::-webkit-scrollbar {
    width: 0.42rem;
  }

  .category-options::-webkit-scrollbar-track {
    background: transparent;
  }

  .category-options::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(31, 82, 122, 0.34);
  }

  .category-option {
    display: flex;
    width: 100%;
    min-height: 1.42rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border-radius: 5px;
    padding: 0.18rem 0.42rem;
    text-align: left;
    color: var(--color-cork-800);
    font: inherit;
    line-height: 1.15;
    cursor: pointer;
  }

  .category-option span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-option:hover,
  .category-option:focus {
    background: rgba(31, 82, 122, 0.09);
    color: #1f527a;
    outline: none;
  }

  .category-option.active {
    background: #e6eefc;
    color: #1f527a;
    font-weight: 600;
  }

  .category-empty {
    padding: 0.42rem;
    color: var(--color-cork-400);
    font-size: 0.62rem;
    text-align: center;
  }

  .category-check {
    width: 0.56rem;
    height: 0.56rem;
    flex: 0 0 auto;
    color: #1f527a;
  }

  .wallet-label {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-width: 7rem;
  }

  .wallet-logo {
    height: 1.35rem;
    width: 1.35rem;
    flex: 0 0 auto;
    border-radius: 4px;
    object-fit: contain;
  }

  .wallet-logo-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(31, 82, 122, 0.1);
    color: #1f527a;
    font-size: 0.56rem;
    font-weight: 700;
  }

  .wallet-cash-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 118, 110, 0.1);
    color: #0f766e;
  }

  .check-cell {
    text-align: center;
  }

  .check-cell input {
    height: 0.82rem;
    width: 0.82rem;
    accent-color: #1f527a;
    vertical-align: middle;
  }

  .wallet-status-form {
    display: flex;
    justify-content: center;
  }

  .wallet-status-form input {
    cursor: pointer;
  }

  .tracker-table tbody tr:nth-child(odd) {
    background: rgba(157, 188, 240, 0.2);
  }

  .tracker-table tbody tr:nth-child(even) {
    background: rgba(157, 188, 240, 0.38);
  }

  .budget-table .budget-group-row {
    background: color-mix(in oklab, #1f527a 12%, white);
    color: #1f527a;
    font-size: 0.58rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .budget-table .budget-group-row td {
    padding-top: 0.24rem;
    padding-bottom: 0.2rem;
    text-align: left;
  }

  .budget-table .budget-child-row td:first-child {
    padding-left: 1.05rem;
  }

  .budget-table .budget-child-row .budget-category-name {
    position: relative;
  }

  .budget-table .budget-child-row .budget-category-name::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -0.48rem;
    width: 0.24rem;
    border-top: 1px solid rgba(31, 82, 122, 0.28);
    transform: translateY(-50%);
  }

  .budget-table tbody tr:not(.budget-group-row):not(.total-row),
  .wallet-table tbody tr:not(.wallet-group-row):not(.total-row) {
    background: transparent;
  }

  .wallet-group-row {
    background: color-mix(in oklab, #1f527a 12%, white);
    color: #1f527a;
    font-size: 0.58rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .wallet-group-row td {
    padding-top: 0.24rem;
    padding-bottom: 0.2rem;
    text-align: left;
  }

  .wallet-child-row td:first-child {
    padding-left: 1.05rem;
  }

  .forecast-current-row {
    background: color-mix(in oklab, #1f527a 12%, white) !important;
    color: #1f527a;
    font-weight: 800;
  }

  .forecast-millionaire-row {
    background: color-mix(in oklab, #15803d 14%, white) !important;
    color: #14532d;
    font-weight: 800;
  }

  .forecast-retirement-row {
    background: color-mix(in oklab, #d97706 16%, white) !important;
    color: #92400e;
    font-weight: 800;
  }

  .forecast-muted-row {
    background: color-mix(in oklab, #1f527a 5%, white) !important;
  }

  .forecast-muted-row td {
    color: var(--color-cork-400);
  }

  .forecast-muted-row .forecast-contribution {
    color: var(--color-cork-700);
  }

  .forecast-panel-header {
    align-items: flex-start;
  }

  .forecast-panel-header h2 {
    flex: 0 0 auto;
    max-width: 10rem;
    line-height: 1.2;
  }

  .investment-panel-title {
    max-width: none !important;
    white-space: nowrap;
  }

  .investment-panel-header {
    align-items: center;
  }

  .forecast-mode-switch,
  .investment-currency-switch {
    display: inline-flex;
    flex-shrink: 0;
    height: 1.75rem;
    gap: 0.1rem;
    border: 1px solid rgba(31, 82, 122, 0.16);
    border-radius: 7px;
    background: rgba(31, 82, 122, 0.05);
    padding: 0.12rem;
  }

  .forecast-mode-switch button,
  .investment-currency-switch button {
    height: 100%;
    border-radius: 5px;
    padding: 0.16rem 0.42rem;
    color: var(--color-cork-600);
    font-size: 0.62rem;
    font-weight: 700;
    cursor: pointer;
  }

  .forecast-mode-switch button.active,
  .investment-currency-switch button.active {
    background: #1f527a;
    color: white;
  }

  .forecast-mode-switch button.optimist.active {
    background: #047857;
    color: white;
  }

  .forecast-mode-switch button.pessimist.active {
    background: #b45309;
    color: white;
  }

  .forecast-assumptions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.42rem 0.72rem;
    min-width: 0;
    text-align: right;
    font-size: 0.625rem;
  }

  .forecast-assumption-inline,
  .forecast-return-profile {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    color: var(--color-cork-400);
    font-weight: 500;
    white-space: nowrap;
  }

  .forecast-assumption-inline strong {
    color: var(--color-cork-800);
    font-weight: 500;
  }

  .forecast-age-input {
    height: 1.55rem;
    width: 2.95rem;
    padding: 0 0.24rem;
    text-align: center;
  }

  .return-profile-picker {
    position: relative;
    display: inline-flex;
  }

  .return-profile-picker.open {
    z-index: 80;
  }

  .return-profile-trigger {
    display: inline-flex;
    width: 7.9rem;
    height: 1.55rem;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid rgba(31, 82, 122, 0.14);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.56);
    padding: 0 0.46rem;
    color: var(--color-cork-800);
    font: inherit;
    font-size: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .return-profile-trigger span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .return-profile-trigger:hover,
  .return-profile-trigger:focus,
  .return-profile-trigger[aria-expanded='true'] {
    border-color: rgba(31, 82, 122, 0.32);
    background: white;
    outline: none;
    box-shadow: 0 0 0 2px rgba(31, 82, 122, 0.08);
  }

  .return-profile-menu {
    position: absolute;
    z-index: 90;
    top: calc(100% + 0.22rem);
    right: 0;
    width: 10.8rem;
    overflow: hidden;
    border: 1px solid rgba(31, 82, 122, 0.18);
    border-radius: 7px;
    background: #fffdf9;
    box-shadow: 0 12px 28px rgba(31, 82, 122, 0.16);
    padding: 0.16rem;
    text-align: left;
  }

  .return-profile-option {
    display: flex;
    width: 100%;
    min-height: 1.42rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    border-radius: 5px;
    padding: 0.18rem 0.42rem;
    text-align: left;
    color: var(--color-cork-800);
    font: inherit;
    line-height: 1.15;
    cursor: pointer;
  }

  .return-profile-option span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .return-profile-option:hover,
  .return-profile-option:focus {
    background: rgba(31, 82, 122, 0.09);
    color: #1f527a;
    outline: none;
  }

  .return-profile-option.active {
    background: #e6eefc;
    color: #1f527a;
    font-weight: 600;
  }

  :global(.return-profile-check) {
    width: 0.56rem !important;
    height: 0.56rem !important;
    flex: 0 0 auto;
    color: #1f527a;
    stroke-width: 2;
  }

  .panel-icon-button {
    display: inline-flex;
    width: 1.92rem;
    height: 1.92rem;
    align-items: center;
    justify-content: center;
    color: var(--color-cork-600);
    cursor: pointer;
  }

  .panel-icon-button:hover,
  .panel-icon-button.active {
    color: #1f527a;
  }

  .panel-icon-button.attention {
    color: #b45309;
  }

  .panel-icon-button.spinning :global(svg) {
    animation: icon-spin 0.8s linear infinite;
  }

  .panel-icon-button:disabled {
    cursor: default;
    opacity: 0.78;
  }

  @keyframes icon-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .investment-row {
    display: grid;
    grid-template-columns: minmax(7rem, 1fr) 4.2rem 5.8rem 6.2rem;
    align-items: center;
    gap: 0.7rem;
    border-bottom: 1px solid rgba(31, 82, 122, 0.12);
    padding: 0.5rem 0.35rem;
    font-size: 0.72rem;
  }

  .investment-row:last-child {
    border-bottom: 0;
  }

  .investment-ticker {
    color: var(--color-cork-900);
    font-weight: 800;
  }

  .investment-meta {
    color: var(--color-cork-400);
    font-size: 0.6rem;
  }

  .investment-change,
  .investment-gain,
  .investment-row > span:last-child {
    text-align: right;
    font-weight: 800;
  }

  .investment-gain {
    font-size: 0.66rem;
  }

  .investment-currency-switch button {
    min-width: 1.3rem;
    font-weight: 800;
  }

  .investment-fx-rate {
    max-width: 11rem;
    overflow: hidden;
    color: var(--color-cork-500);
    font-size: 0.62rem;
    font-weight: 700;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .investment-summary {
    display: grid;
    gap: 0.18rem;
    border-top: 1px solid rgba(31, 82, 122, 0.12);
    padding: 0.6rem 0.35rem 0;
  }

  .investment-summary-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    color: var(--color-cork-500);
    font-size: 0.66rem;
  }

  .investment-summary-row strong {
    color: var(--color-cork-900);
    font-weight: 800;
    text-align: right;
  }

  .investment-summary-row.primary {
    color: var(--color-cork-700);
  }

  .investment-summary-row.primary strong {
    font-size: 0.86rem;
  }

  .investment-summary-gain {
    display: inline-grid;
    grid-template-columns: auto auto;
    gap: 0.55rem;
  }

  .investment-summary-row strong.investment-summary-gain.positive {
    color: #047857;
  }

  .investment-summary-row strong.investment-summary-gain.negative {
    color: #b91c1c;
  }

  .portfolio-gain-percent,
  .portfolio-gain-amount {
    font-weight: 800;
  }

  .investment-history {
    display: grid;
    gap: 0.45rem;
    border-top: 1px solid rgba(31, 82, 122, 0.12);
    padding-top: 0.6rem;
  }

  .investment-history-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    color: var(--color-cork-900);
    font-size: 0.68rem;
    font-weight: 800;
  }

  .investment-history-title span:last-child {
    color: var(--color-cork-400);
    font-size: 0.58rem;
    font-weight: 700;
  }

  .investment-history-chart {
    position: relative;
    height: 11.4rem;
    border: 1px solid rgba(31, 82, 122, 0.1);
    border-radius: 7px;
    background: linear-gradient(180deg, rgba(255, 253, 249, 0.86), rgba(255, 253, 249, 0.48));
    padding: 0.25rem 0.34rem 0.12rem;
  }

  :global(.investment-history-area) {
    fill: #1f527a;
    fill-opacity: 0.08;
    stroke: none;
  }

  :global(.investment-history-line) {
    fill: none;
    stroke: #1f527a;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.4;
  }

  :global(.investment-history-grid-line) {
    stroke: rgba(31, 82, 122, 0.08);
    stroke-dasharray: 2 3;
    stroke-width: 1;
  }

  :global(.investment-history-axis-rule),
  :global(.investment-history-axis-tick) {
    stroke: transparent;
  }

  :global(.investment-history-axis-label) {
    fill: var(--color-cork-400);
    font-size: 0.58rem;
    font-weight: 800;
  }

  :global(.investment-history-highlight-line) {
    stroke: rgba(31, 82, 122, 0.22);
    stroke-dasharray: 3 3;
    stroke-width: 1.1;
  }

  :global(.investment-history-highlight-point) {
    fill: #1f527a;
    stroke: white;
    stroke-width: 4;
    paint-order: stroke;
  }

  :global(.investment-history-tooltip-container) {
    border: 1px solid rgba(31, 82, 122, 0.14);
    border-radius: 7px;
    background: rgba(255, 253, 249, 0.96);
    box-shadow: 0 12px 30px rgba(31, 82, 122, 0.16);
    padding: 0.45rem 0.55rem;
  }

  .investment-history-tooltip {
    display: grid;
    gap: 0.16rem;
    min-width: 9.4rem;
    color: var(--color-cork-500);
    font-size: 0.62rem;
    line-height: 1.2;
  }

  .investment-history-tooltip span {
    color: var(--color-cork-400);
    font-weight: 700;
  }

  .investment-history-tooltip strong {
    color: var(--color-cork-900);
    font-size: 0.78rem;
    font-weight: 800;
  }

  .investment-history-tooltip em {
    font-style: normal;
    font-weight: 800;
  }

  .investment-history-tooltip .positive-growth {
    color: #047857;
  }

  .investment-history-tooltip .negative-growth {
    color: #b91c1c;
  }

  .investment-history-empty {
    border: 1px dashed rgba(31, 82, 122, 0.18);
    border-radius: 6px;
    padding: 0.6rem;
    color: var(--color-cork-400);
    font-size: 0.62rem;
    text-align: center;
  }

  @media (max-width: 520px) {
    .investment-row {
      grid-template-columns: 1fr auto;
      gap: 0.35rem 0.7rem;
    }

    .investment-change,
    .investment-gain {
      grid-column: 2;
    }
  }

  .forecast-month-row {
    background: transparent !important;
  }

  .forecast-month-row td:first-child {
    padding-left: 1.05rem;
    color: var(--color-cork-600);
    font-weight: 600;
  }

  .forecast-contribution {
    color: var(--color-cork-900);
    font-weight: 700;
  }

  .forecast-mute-toggle-cell {
    border-radius: 4px;
    cursor: pointer;
    transition:
      background 120ms ease,
      color 120ms ease;
  }

  .forecast-mute-toggle-cell:hover {
    background: rgba(31, 82, 122, 0.08);
    color: #1f527a;
  }

  .forecast-real-value {
    color: var(--color-cork-900);
    font-weight: 700;
  }

  .forecast-input {
    height: 1.25rem;
    border: 1px solid rgba(31, 82, 122, 0.16);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.54);
    color: var(--color-cork-900);
    font-size: 0.62rem;
    font-weight: 500;
    line-height: 1;
    outline: none;
  }

  .forecast-inline-form {
    display: inline-flex;
    margin: 0;
  }

  .forecast-input:hover {
    border-color: rgba(31, 82, 122, 0.32);
    background: white;
  }

  .forecast-input:focus {
    border-color: #1f527a;
    background: white;
    box-shadow: 0 0 0 2px rgba(31, 82, 122, 0.12);
  }

  .forecast-input:disabled {
    border-color: rgba(31, 82, 122, 0.08);
    background: rgba(31, 82, 122, 0.04);
    color: var(--color-cork-400);
    cursor: default;
  }

  .forecast-input::-webkit-outer-spin-button,
  .forecast-input::-webkit-inner-spin-button {
    margin: 0;
    appearance: none;
  }

  .forecast-percent-input {
    width: 2.2rem;
    padding: 0 0.24rem;
    text-align: right;
  }

  .forecast-percent-control {
    display: inline-flex;
    height: 1.25rem;
    align-items: center;
    gap: 0.12rem;
    color: var(--color-cork-500);
    font-size: 0.62rem;
    font-weight: 700;
  }

  .forecast-salary-input,
  .forecast-money-input {
    width: 5.7rem;
    padding: 0 0.28rem;
    text-align: right;
  }

  .forecast-extra-summary {
    display: inline-flex;
    width: 5.7rem;
    height: 1.25rem;
    align-items: center;
    justify-content: flex-end;
    padding: 0 0.28rem;
    color: var(--color-cork-500);
    font-size: 0.62rem;
    font-weight: 700;
  }

  .forecast-gain {
    color: #15803d;
    font-weight: 800;
  }

  .forecast-return {
    color: var(--color-cork-700);
    font-weight: 600;
  }

  .forecast-budget-leftover {
    color: var(--color-cork-900);
    font-weight: 700;
  }

  .forecast-budget-leftover.negative {
    color: #b91c1c;
    font-weight: 800;
  }

  .forecast-scroll {
    max-width: 100%;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .forecast-scroll::-webkit-scrollbar {
    display: none;
  }

  .forecast-table {
    width: max-content;
    min-width: 100%;
  }

  .forecast-table th,
  .forecast-table td {
    padding-right: 0.22rem;
    padding-left: 0.22rem;
  }

  .forecast-table .currency-col {
    width: 1rem;
    min-width: 1rem;
    padding-right: 0.08rem;
    padding-left: 0.08rem;
  }

  .tracker-table .total-row {
    background: rgba(221, 212, 194, 0.9);
    font-weight: 700;
  }

  .tracker-table.dense {
    font-size: 0.64rem;
  }

  .tracker-table.dense th,
  .tracker-table.dense td {
    padding: 0.18rem 0.28rem;
  }

  .plus,
  .minus {
    margin-right: 0.4rem;
    font-weight: 800;
  }

  .plus {
    color: #15803d;
  }

  .minus {
    color: #b91c1c;
  }
</style>
