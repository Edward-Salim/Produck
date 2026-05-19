import { db } from './db/index.js';
import { authSession, appUser } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

// Hash password with salt using PBKDF2
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password against stored hash
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// Create user session in SQLite database
export async function createSession(userId: number): Promise<string> {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days expiration
  
  await db.insert(authSession).values({
    id: sessionId,
    userId,
    expiresAt
  });
  
  return sessionId;
}

// Validate session ID and retrieve associated user information
export async function validateSession(sessionId: string) {
  const [sessionRow] = await db
    .select()
    .from(authSession)
    .where(eq(authSession.id, sessionId));
    
  if (!sessionRow) return null;
  
  const now = Math.floor(Date.now() / 1000);
  if (now > sessionRow.expiresAt) {
    await db.delete(authSession).where(eq(authSession.id, sessionId));
    return null;
  }
  
  // Extend session if it is close to expiration (optional, let's keep it simple for now)
  const [userRow] = await db
    .select()
    .from(appUser)
    .where(eq(appUser.id, sessionRow.userId));
    
  if (!userRow) return null;
  
  return {
    session: sessionRow,
    user: {
      id: userRow.id,
      email: userRow.email,
      displayName: userRow.displayName,
      role: userRow.role
    }
  };
}

// Delete session from SQLite database
export async function deleteSession(sessionId: string) {
  await db.delete(authSession).where(eq(authSession.id, sessionId));
}
