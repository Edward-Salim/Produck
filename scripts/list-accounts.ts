import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appUser } from '../src/lib/server/db/schema.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(import.meta.dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const dbUrl = dbUrlMatch[1].trim().replace(/^["']|["']$/g, '');

const client = postgres(dbUrl, { ssl: 'require', max: 1 });
const db = drizzle(client, { schema: { appUser } });

async function main() {
  const users = await db
    .select({
      email: appUser.email,
      role: appUser.role
    })
    .from(appUser);
  console.log(JSON.stringify(users, null, 2));
  await client.end();
}
main().catch((e) => {
  console.error(e);
  client.end();
});
