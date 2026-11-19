import { dev } from '$app/environment';
import { db } from './db/index.js';
import { authSession, appUser } from './db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const passwordHashAlgorithm = 'pbkdf2_sha512';
const passwordHashIterations = 310_000;
const passwordKeyLength = 64;

export function hashPassword(password: string): string {
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

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (typeof password !== 'string') return false;

  let iterations = 10_000;
  let salt: string;
  let originalHash: string;
  if (stored.startsWith(`${passwordHashAlgorithm}$`)) {
    const parts = stored.split('$');
    if (parts.length !== 4) return false;
    const [, iterationsText, parsedSalt, parsedHash] = parts;
    salt = parsedSalt;
    originalHash = parsedHash;
    iterations = Number(iterationsText);
    if (!Number.isSafeInteger(iterations) || iterations <= 0) return false;
  } else {
    const parts = stored.split(':');
    if (parts.length !== 2) return false;
    [salt, originalHash] = parts;
  }

  if (!/^[a-f0-9]{128}$/i.test(originalHash)) return false;
  const expected = Buffer.from(originalHash, 'hex');
  if (dev)
    return timingSafeEqual(
      pbkdf2Sync(password, salt, iterations, passwordKeyLength, 'sha512'),
      expected
    );

  // Run the existing work factor in Neon to fit the Worker CPU and PBKDF2 limits.
  // Keep Drizzle errors containing bound credentials out of application logs.
  try {
    const [row] = await db.execute<{ digest: string }>(sql`
      select public.produck_pbkdf2_sha512(${Buffer.from(password)}, ${Buffer.from(salt)}, ${iterations})::text as digest
    `);
    const expectedBits = [...expected].map((byte) => byte.toString(2).padStart(8, '0')).join('');
    return timingSafeEqual(Buffer.from(row.digest), Buffer.from(expectedBits));
  } catch {
    throw new Error('Could not verify the password with Neon.');
  }
}

// Create user session in database
export async function createSession(userId: number): Promise<string> {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days expiration

  await db.insert(authSession).values({
    id: sessionId,
    userId,
    expiresAt
  });

  return sessionId;
}

// Validate session ID and retrieve associated user information
export async function validateSession(sessionId: string) {
  const [sessionRow] = await db.select().from(authSession).where(eq(authSession.id, sessionId));

  if (!sessionRow) return null;

  const now = Math.floor(Date.now() / 1000);
  if (now > sessionRow.expiresAt) {
    await db.delete(authSession).where(eq(authSession.id, sessionId));
    return null;
  }

  // Extend session expiry on each request (sliding expiration)
  const newExpiresAt = now + 60 * 60 * 24 * 7;
  await db
    .update(authSession)
    .set({ expiresAt: newExpiresAt })
    .where(eq(authSession.id, sessionId));

  const [userRow] = await db.select().from(appUser).where(eq(appUser.id, sessionRow.userId));

  if (!userRow) return null;

  return {
    session: sessionRow,
    user: {
      id: userRow.id,
      authId: userRow.authId,
      email: userRow.email,
      displayName: userRow.displayName,
      role: userRow.role,
      restrictedSections: userRow.restrictedSections
    }
  };
}

// Delete session from database
export async function deleteSession(sessionId: string) {
  await db.delete(authSession).where(eq(authSession.id, sessionId));
}
