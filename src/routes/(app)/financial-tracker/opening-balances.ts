import type { LedgerEntry } from './financial-tracker-data.js';

export function monthOpeningBalances(
  entries: readonly LedgerEntry[],
  monthKey: string,
  wallets: readonly { label: string; minimumHold?: number }[]
) {
  const amounts = new Map<string, number>();
  const walletLabels = new Set(wallets.map((wallet) => wallet.label));
  for (const entry of entries) {
    if (
      entry.monthKey !== monthKey ||
      entry.status === 'pending' ||
      entry.kind !== 'opening-balance' ||
      !entry.toAccount ||
      !walletLabels.has(entry.toAccount)
    )
      continue;
    amounts.set(entry.toAccount, (amounts.get(entry.toAccount) ?? 0) + entry.amount);
  }
  if (amounts.size === 0) return undefined;

  const rows = wallets
    .filter((wallet) => amounts.has(wallet.label))
    .map((wallet) => {
      const balance = amounts.get(wallet.label)!;
      const minimumHold = wallet.minimumHold ?? 0;
      return {
        label: wallet.label,
        balance,
        minimumHold,
        liquid: Math.max(balance - minimumHold, 0)
      };
    });
  return { rows, total: rows.reduce((sum, wallet) => sum + wallet.liquid, 0) };
}
