import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appUser } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(import.meta.dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const dbUrl = dbUrlMatch[1].trim().replace(/^["']|["']$/g, '');

const client = postgres(dbUrl, { ssl: 'require', max: 1 });
const db = drizzle(client, { schema: { appUser } });

const passwordHashAlgorithm = 'pbkdf2_sha512';
const passwordHashIterations = 310_000;
const passwordKeyLength = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(
    password,
    salt,
    passwordHashIterations,
    passwordKeyLength,
    'sha512'
  ).toString('hex');
  return `${passwordHashAlgorithm}$${passwordHashIterations}$${salt}$${hash}`;
}

const emails = ['kelvin.saputra@produck.com', 'acquaintance@produck.app'];

async function main() {
  const hash = hashPassword('REDACTED_PASSWORD');
  for (const email of emails) {
    await db.update(appUser).set({ passwordHash: hash }).where(eq(appUser.email, email));
    console.log(`Set password for ${email}`);
  }
  await client.end();
}
main().catch((e) => {
  console.error(e);
  client.end();
});
