import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appUser } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read DATABASE_URL from .env file
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
  const hash = pbkdf2Sync(password, salt, passwordHashIterations, passwordKeyLength, 'sha512').toString('hex');
  return `${passwordHashAlgorithm}$${passwordHashIterations}$${salt}$${hash}`;
}

const users = [
  { email: 'vincent.suhardi@produck.com', displayName: 'Vincent Suhardi' },
  { email: 'saras.lombok@produck.com', displayName: 'Saras Lombok' },
];

async function main() {
  for (const u of users) {
    const authId = crypto.randomUUID();
    const existing = await db.select().from(appUser).where(eq(appUser.email, u.email)).limit(1);

    if (existing.length > 0) {
      console.log(`User ${u.email} already exists, skipping.`);
      continue;
    }

    await db.insert(appUser).values({
      authId,
      email: u.email,
      displayName: u.displayName,
      role: 'member',
      passwordHash: hashPassword('REDACTED_PASSWORD'),
    });
    console.log(`Created user: ${u.email}`);
  }
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  client.end();
  process.exit(1);
});
