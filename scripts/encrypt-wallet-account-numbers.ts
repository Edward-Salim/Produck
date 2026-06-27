import 'dotenv/config';
import postgres from 'postgres';
import {
  encryptSensitiveValue,
  isEncryptedSensitiveValue,
  reencryptSensitiveValue
} from '../src/lib/server/sensitive-data.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');
if (!process.env.DATA_ENCRYPTION_KEY) throw new Error('DATA_ENCRYPTION_KEY is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

const wallets = await sql<{ id: number; account_number: string | null }[]>`
  select id, account_number
  from financial_tracker_wallet
  where account_number is not null and account_number <> ''
`;

let encrypted = 0;

await sql.begin(async (tx) => {
  for (const wallet of wallets) {
    if (!wallet.account_number) continue;
    const encryptedValue = isEncryptedSensitiveValue(wallet.account_number)
      ? reencryptSensitiveValue(wallet.account_number)
      : encryptSensitiveValue(wallet.account_number);

    await tx`
      update financial_tracker_wallet
      set account_number = ${encryptedValue}, updated_at = now()
      where id = ${wallet.id}
    `;
    encrypted += 1;
  }
});

console.log(`wallet_account_numbers_encrypted=${encrypted}`);
await sql.end();
