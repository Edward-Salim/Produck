import type { LedgerEntry } from './financial-tracker-data.js';
import type { LedgerSortKey, LedgerSortDirection } from './financial-tracker-types.js';

export function partitionLedgerEntries(entries: readonly LedgerEntry[]) {
  return {
    recorded: entries.filter((entry) => entry.status !== 'pending'),
    pending: entries.filter((entry) => entry.status === 'pending')
  };
}

export function ledgerAccount(entry: LedgerEntry) {
  if (entry.kind === 'income' || entry.kind === 'opening-balance') return entry.toAccount ?? '-';
  if (entry.kind === 'transfer') return `${entry.fromAccount ?? '-'} -> ${entry.toAccount ?? '-'}`;
  if (entry.kind === 'debt-payment')
    return `${entry.fromAccount ?? '-'} -> ${entry.toAccount ?? '-'}`;
  return entry.fromAccount ?? '-';
}

function ledgerSortValue(entry: LedgerEntry, key: LedgerSortKey) {
  if (key === 'date') {
    const date = Date.parse(entry.date);
    return Number.isFinite(date) ? date : Number.MAX_SAFE_INTEGER;
  }
  if (key === 'account') return ledgerAccount(entry);
  return entry[key];
}

export function sortLedgerEntries(
  entries: LedgerEntry[],
  key: LedgerSortKey,
  direction: LedgerSortDirection
) {
  if (direction === null) return entries;

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

export function nextLedgerSort(
  currentKey: LedgerSortKey,
  currentDirection: LedgerSortDirection,
  key: LedgerSortKey
): { key: LedgerSortKey; direction: LedgerSortDirection } {
  const defaultDirection = key === 'date' || key === 'amount' ? 'desc' : 'asc';
  const direction =
    currentKey !== key || currentDirection === null
      ? defaultDirection
      : currentDirection === defaultDirection
        ? defaultDirection === 'asc'
          ? 'desc'
          : 'asc'
        : null;
  return { key, direction };
}
