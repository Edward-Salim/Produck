<script lang="ts">
  import { onMount } from 'svelte';
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
    ReceiptText,
    Search,
    WalletCards
  } from '@lucide/svelte';
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
    LedgerEntry,
    MoneyRow,
    MonthlySummary,
    TrackerData
  } from './financial-tracker-data';

  let { data } = $props<{ data: { trackerData: TrackerData | null } }>();

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
    maximumFractionDigits: 2
  });
  const compactForecastAmount = (value: number) => {
    if (Math.abs(value) >= 1_000_000_000) return `${forecastAmount.format(value / 1_000_000_000)}M`;
    if (Math.abs(value) >= 1_000_000) return `${forecastAmount.format(value / 1_000_000)}jt`;
    if (Math.abs(value) >= 1_000) return `${forecastAmount.format(value / 1_000)}rb`;
    return amount.format(value);
  };

  type LedgerSortKey =
    | 'date'
    | 'description'
    | 'kind'
    | 'category'
    | 'account'
    | 'paymentType'
    | 'amount';
  type SortDirection = 'asc' | 'desc';
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
  };
  type MonthlyInvestmentForecastRow = InvestmentForecastRow & {
    month: string;
    calendarYear: number;
    age: number;
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
  const optimisticAnnualReturn = 0.12;
  const pessimisticAnnualReturn = 0.05;
  const investmentContributionRate = 0.5;
  const salaryGrowthRate = 0.25;
  const forecastBaseYear = 2026;
  const forecastCurrentAge = 22;
  const forecastCurrentMonthIndex = 5;
  const forecastCurrentMonthlySalary = 8_000_000;
  const forecastRetirementAge = 40;
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

  function forecastMonthlySalary(relativeYear: number) {
    const yearsAfterCurrentYear = Math.max(relativeYear + 1, 0);
    return Math.round(
      forecastCurrentMonthlySalary * (1 + salaryGrowthRate) ** yearsAfterCurrentYear
    );
  }

  function forecastMonthlyContribution(relativeYear: number) {
    return Math.round(forecastMonthlySalary(relativeYear) * investmentContributionRate);
  }

  function compoundMonth(balance: number, annualReturn: number, monthlyContribution: number) {
    return balance * (1 + annualReturn) ** (1 / 12) + monthlyContribution;
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
  let forecastFinalRelativeYear = $derived(
    Math.max(
      forecastRetirementAge - forecastCurrentAge - 1,
      ...baseInvestmentForecast.map((row) => row.year)
    )
  );
  let investmentForecast = $derived.by(() => {
    const rows: InvestmentForecastRow[] = [
      {
        year: -1,
        optimistic: totalInvestments,
        pessimist: totalInvestments,
        salary: forecastCurrentMonthlySalary,
        monthlyInvestment: forecastMonthlyContribution(-1)
      }
    ];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      const monthlyContribution = forecastMonthlyContribution(-1);
      optimisticBalance = compoundMonth(
        optimisticBalance,
        optimisticAnnualReturn,
        monthlyContribution
      );
      pessimisticBalance = compoundMonth(
        pessimisticBalance,
        pessimisticAnnualReturn,
        monthlyContribution
      );
    }

    for (let relativeYear = 0; relativeYear <= forecastFinalRelativeYear; relativeYear += 1) {
      const monthlySalary = forecastMonthlySalary(relativeYear);
      const monthlyContribution = forecastMonthlyContribution(relativeYear);

      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        optimisticBalance = compoundMonth(
          optimisticBalance,
          optimisticAnnualReturn,
          monthlyContribution
        );
        pessimisticBalance = compoundMonth(
          pessimisticBalance,
          pessimisticAnnualReturn,
          monthlyContribution
        );
      }

      rows.push({
        year: relativeYear,
        optimistic: Math.round(optimisticBalance),
        pessimist: Math.round(pessimisticBalance),
        salary: monthlySalary,
        monthlyInvestment: monthlyContribution
      });
    }

    return rows;
  });
  let currentYearMonthlyForecast = $derived.by(() => {
    const rows: MonthlyInvestmentForecastRow[] = [];
    let optimisticBalance = totalInvestments;
    let pessimisticBalance = totalInvestments;
    const monthlySalary = forecastMonthlySalary(-1);
    const monthlyContribution = forecastMonthlyContribution(-1);

    for (let monthIndex = forecastCurrentMonthIndex; monthIndex < 12; monthIndex += 1) {
      optimisticBalance = compoundMonth(
        optimisticBalance,
        optimisticAnnualReturn,
        monthlyContribution
      );
      pessimisticBalance = compoundMonth(
        pessimisticBalance,
        pessimisticAnnualReturn,
        monthlyContribution
      );
      rows.push({
        year: -1,
        month: monthLabels[monthIndex],
        calendarYear: forecastBaseYear,
        age: forecastCurrentAge,
        optimistic: Math.round(optimisticBalance),
        pessimist: Math.round(pessimisticBalance),
        salary: monthlySalary,
        monthlyInvestment: monthlyContribution
      });
    }

    return rows;
  });
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

  let selectedMonth = $state('jun-2026');
  let selectedView = $state<'accounting' | 'investments'>('accounting');
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
  let investmentTargetRate = 10;
  let investmentTargetAmount = $derived(
    Math.round(budgetIncomeActual * (investmentTargetRate / 100))
  );

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
      <div
        class="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-cork-500 uppercase"
      >
        <WalletCards class="size-4" />
        {currentMonth.label}
      </div>
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

    <div
      class="flex min-w-0 gap-1.5 overflow-x-auto rounded-lg border border-cork-300/45 bg-cork-50/70 p-1"
    >
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
                    <td>{wallet.accountNumber ?? '-'}</td>
                    {@render MoneyCell(wallet.balance)}
                    {@render MoneyCell(wallet.minimumHold ?? 0)}
                    {@render MoneyCell(walletLiquidBalance(wallet.balance, wallet.minimumHold))}
                    <td class="check-cell">
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
                {@render MoneyCell(totalWalletBalance)}
                {@render MoneyCell(totalWalletBalance - totalWallets)}
                {@render MoneyCell(totalWallets)}
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
          <table class="tracker-table dense forecast-table">
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
    <section class="grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
      <div class="panel">
        {@render PanelTitle(PiggyBank, 'Long-Term Investments')}
        <div class="space-y-1.5">
          {#each investments as investment (investment.label)}
            <div
              class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 rounded bg-emerald-50/70 px-2 py-1 text-xs"
            >
              <span class="font-medium text-cork-700">{investment.label}</span>
              <span class={investment.direction === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                {investment.change}
              </span>
              <span class="text-cork-400">Rp</span>
              <span class="font-medium text-cork-900">{amount.format(investment.balance)}</span>
            </div>
          {/each}
          <div
            class="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded bg-cork-200 px-2 py-1 text-xs font-semibold"
          >
            <span>Total invested</span>
            <span class="text-cork-500">Rp</span>
            <span>{amount.format(totalInvestments)}</span>
          </div>
          <p class="text-[10px] text-cork-400">Excluded from liquid wallet balance.</p>
        </div>
      </div>

      <div class="panel">
        {@render PanelTitle(ChartColumn, 'Investments Forecast')}
        <div class="mb-3 grid grid-cols-4 gap-2 text-xs">
          <div class="rounded bg-blue-50 p-2">
            <p class="text-cork-500">Retirement age</p>
            <p class="font-semibold text-cork-900">{forecastRetirementAge}</p>
          </div>
          <div class="rounded bg-blue-50 p-2">
            <p class="text-cork-500">Monthly invest</p>
            <p class="font-semibold text-cork-900">{investmentContributionRate * 100}%</p>
          </div>
          <div class="rounded bg-blue-50 p-2">
            <p class="text-cork-500">Salary growth</p>
            <p class="font-semibold text-cork-900">25.0%</p>
          </div>
          <div class="rounded bg-blue-50 p-2">
            <p class="text-cork-500">Inflation</p>
            <p class="font-semibold text-cork-900">3.0%</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="tracker-table dense forecast-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Age</th>
                {@render MoneyHead('Optimist')}
                {@render MoneyHead('Pessimist')}
                {@render MoneyHead('Annual Salary')}
                {@render MoneyHead('Monthly Salary')}
                {@render MoneyHead('Monthly Invest')}
              </tr>
            </thead>
            <tbody>
              {#each investmentForecast as row (row.year)}
                <tr
                  class:forecast-current-row={row.year < 0}
                  class:bg-amber-100={forecastAge(row.year) === forecastRetirementAge}
                >
                  <td>{forecastCalendarYear(row.year)}</td>
                  <td>{forecastAge(row.year)}</td>
                  {@render MoneyCell(row.optimistic, '', true)}
                  {@render MoneyCell(row.pessimist, '', true)}
                  {@render MoneyCell(row.salary * 12, '', true)}
                  {@render MoneyCell(row.salary, '', true)}
                  {@render MoneyCell(row.monthlyInvestment, '', true)}
                </tr>
                {#if row.year < 0}
                  {#each currentYearMonthlyForecast as monthRow (monthRow.month)}
                    <tr class="forecast-month-row">
                      <td>{monthRow.month}</td>
                      <td>{monthRow.age}</td>
                      {@render MoneyCell(monthRow.optimistic, '', true)}
                      {@render MoneyCell(monthRow.pessimist, '', true)}
                      {@render MoneyCell(monthRow.salary * 12, '', true)}
                      {@render MoneyCell(monthRow.salary, '', true)}
                      {@render MoneyCell(monthRow.monthlyInvestment, '', true)}
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
      <div class="compare-item investment-target-item">
        <span>Investment target</span>
        <strong
          >{investmentTargetRate}% / {currency.format(investmentTargetAmount)} / Actual {currency.format(
            currentMonth.savings.actual
          )}</strong
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
              <td>{debt.due}</td>
              {@render MoneyCell(debt.amount)}
              <td>
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

  .investment-target-item {
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
      column-gap: 0.24rem;
    }

    .formula-amount {
      font-size: 0.62rem;
    }

    .formula-amount-full {
      display: none;
    }

    .formula-amount-compact {
      display: inline;
    }

    .formula-operator {
      font-size: 0.62rem;
    }

    .formula-label {
      font-size: 0.5rem;
    }

    .reconciliation-compare {
      gap: 0.7rem;
    }

    .difference-item {
      padding-left: 0.7rem;
    }

    .investment-target-item {
      border-left: 0;
      padding-left: 0;
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

  .forecast-month-row {
    background: transparent !important;
  }

  .forecast-month-row td:first-child {
    padding-left: 1.05rem;
    color: var(--color-cork-600);
    font-weight: 600;
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
