import type { DebtScheduleRow } from './financial-tracker-data.js';

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function dueMonthIndex(due: string) {
  const iso = /^(\d{4})-(\d{2})-\d{2}$/.exec(due.trim());
  if (iso) {
    const month = Number(iso[2]) - 1;
    return month >= 0 && month < 12 ? Number(iso[1]) * 12 + month : undefined;
  }

  const text = /^\d{1,2}\s+([a-z]+)\s+(\d{4})$/i.exec(due.trim());
  if (!text) return undefined;
  const month = months.indexOf(text[1].slice(0, 3).toLowerCase());
  return month >= 0 ? Number(text[2]) * 12 + month : undefined;
}

export function summarizeDebtProviders(schedule: DebtScheduleRow[], monthKey: string) {
  const [monthName, yearText] = monthKey.toLowerCase().split('-');
  const month = months.indexOf(monthName);
  const year = Number(yearText);
  if (month < 0 || !Number.isInteger(year)) return [];
  const selectedMonth = year * 12 + month;
  const providers = [...new Set(schedule.map((payment) => payment.provider))];
  const sum = (payments: DebtScheduleRow[]) =>
    payments.reduce((total, payment) => total + payment.amount, 0);

  return providers.map((provider) => {
    const payments = schedule.filter((payment) => payment.provider === provider);
    const dueThisMonth = payments.filter((payment) => dueMonthIndex(payment.due) === selectedMonth);
    const overdue = payments.filter((payment) => {
      const dueMonth = dueMonthIndex(payment.due);
      return payment.status !== 'paid' && dueMonth !== undefined && dueMonth < selectedMonth;
    });
    const upcoming = payments.filter((payment) => {
      const dueMonth = dueMonthIndex(payment.due);
      return payment.status !== 'paid' && dueMonth !== undefined && dueMonth > selectedMonth;
    });
    const history = payments.filter(
      (payment) => payment.status === 'paid' && dueMonthIndex(payment.due) !== selectedMonth
    );
    const undated = payments.filter(
      (payment) => payment.status !== 'paid' && dueMonthIndex(payment.due) === undefined
    );

    return {
      provider,
      dueThisMonth,
      overdue,
      upcoming,
      history,
      undated,
      allPaid: payments.every((payment) => payment.status === 'paid'),
      monthDue: sum(dueThisMonth.filter((payment) => payment.status !== 'paid')),
      overdueAmount: sum(overdue),
      upcomingAmount: sum(upcoming)
    };
  });
}
