import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appUser, authSession } from '../src/lib/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(import.meta.dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
if (!dbUrlMatch) throw new Error('DATABASE_URL not found in .env');
const dbUrl = dbUrlMatch[1].trim().replace(/^["']|["']$/g, '');

const client = postgres(dbUrl, { ssl: 'require', max: 1 });
const db = drizzle(client, { schema: { appUser, authSession } });

const passwordHashAlgorithm = 'pbkdf2_sha512';
const hashIter = 310_000;
const keyLen = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const h = pbkdf2Sync(password, salt, hashIter, keyLen, 'sha512').toString('hex');
  return `${passwordHashAlgorithm}$${hashIter}$${salt}$${h}`;
}

async function main() {
  // Set ewodku password
  const ewodHash = hashPassword('PBlW0z$proHQpY8jeSR^');
  await db.update(appUser).set({ passwordHash: ewodHash }).where(eq(appUser.email, 'ewodku@dummy.com'));
  console.log('Set password for ewodku@dummy.com');

  // Remove alice, bob, carol (delete sessions first, then users)
  const toDelete = ['alice@dummy.com', 'bob@dummy.com', 'carol@dummy.com', 'acquaintance@produck.app'];
  const usersToDelete = await db.select({ id: appUser.id }).from(appUser).where(inArray(appUser.email, toDelete));
  const ids = usersToDelete.map(u => u.id);
  if (ids.length > 0) {
    await db.delete(authSession).where(inArray(authSession.userId, ids));
    await db.delete(appUser).where(inArray(appUser.email, toDelete));
    console.log(`Removed users: ${toDelete.join(', ')}`);
  }

  await client.end();
}
main().catch(e => { console.error(e); client.end(); });
