export const pocketWalletLabels = {
  BCA: { Main: 'BCA / Main', Savings: 'BCA / Savings' },
  'Bank Jago': { Meals: 'Bank Jago / Meals', Wants: 'Bank Jago / Wants' }
} as const;

export type PocketBank = keyof typeof pocketWalletLabels;

export function isPocketBank(label: string): label is PocketBank {
  return Object.hasOwn(pocketWalletLabels, label);
}

export function getPocketWalletBank(label: string): PocketBank | undefined {
  return (Object.keys(pocketWalletLabels) as PocketBank[]).find((bank) =>
    Object.values(pocketWalletLabels[bank]).some((walletLabel) => walletLabel === label)
  );
}

export function getPocketBank(name: string): PocketBank | undefined {
  return (Object.keys(pocketWalletLabels) as PocketBank[]).find((bank) =>
    Object.hasOwn(pocketWalletLabels[bank], name)
  );
}

export function summarizePocketBalances(
  bank: PocketBank,
  states: Readonly<Record<string, { balance?: number }>>
) {
  const labels = Object.values(pocketWalletLabels[bank]);
  const balances = labels
    .map((label) => states[label]?.balance)
    .filter(
      (balance): balance is number =>
        balance !== undefined && Number.isSafeInteger(balance) && balance >= 0
    );
  const sum = balances.reduce((total, balance) => total + balance, 0);
  return {
    entered: balances.length,
    total: balances.length === labels.length && Number.isSafeInteger(sum) ? sum : undefined
  };
}
