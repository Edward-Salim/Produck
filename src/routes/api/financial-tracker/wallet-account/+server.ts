import { json, error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { financialTrackerWallet } from '$lib/server/db/schema';
import { assertFinancialTrackerAccess } from '$lib/server/financial-tracker';
import { decryptSensitiveValue } from '$lib/server/sensitive-data';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.session?.user;
  if (!user) throw error(401, 'Unauthorized');
  assertFinancialTrackerAccess(user);

  const { label } = (await request.json()) as { label?: string };
  const walletLabel = String(label ?? '').trim();
  if (!walletLabel) throw error(400, 'Wallet label is required.');

  const [wallet] = await db
    .select({ accountNumber: financialTrackerWallet.accountNumber })
    .from(financialTrackerWallet)
    .where(
      and(
        eq(financialTrackerWallet.ownerEmail, user.email.toLowerCase()),
        eq(financialTrackerWallet.label, walletLabel)
      )
    )
    .limit(1);

  if (!wallet) throw error(404, 'Wallet not found.');

  return json({ accountNumber: decryptSensitiveValue(wallet.accountNumber) });
};
