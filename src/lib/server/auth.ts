import { db } from './db/index.js';
import { authSession, appUser } from './db/schema.js';
import { eq } from 'drizzle-orm';
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

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith(`${passwordHashAlgorithm}$`)) {
    const parts = stored.split('$');
    if (parts.length !== 4) return false;

    const [, iterationsText, salt, originalHash] = parts;
    const iterations = Number(iterationsText);
    if (!Number.isSafeInteger(iterations) || iterations <= 0) return false;

    const hash = pbkdf2Sync(password, salt, iterations, passwordKeyLength, 'sha512').toString(
      'hex'
    );
    const hashBuffer = Buffer.from(hash, 'hex');
    const originalHashBuffer = Buffer.from(originalHash, 'hex');
    return (
      hashBuffer.length === originalHashBuffer.length &&
      timingSafeEqual(hashBuffer, originalHashBuffer)
    );
  }

  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = pbkdf2Sync(password, salt, 10_000, passwordKeyLength, 'sha512').toString('hex');
  const hashBuffer = Buffer.from(hash, 'hex');
  const originalHashBuffer = Buffer.from(originalHash, 'hex');
  return (
    hashBuffer.length === originalHashBuffer.length &&
    timingSafeEqual(hashBuffer, originalHashBuffer)
  );
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
      role: userRow.role
    }
  };
}

// Delete session from database
export async function deleteSession(sessionId: string) {
  await db.delete(authSession).where(eq(authSession.id, sessionId));
}
