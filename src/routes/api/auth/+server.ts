import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth.js';
import type { RequestHandler } from './$types.js';

const loginWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function loginAttemptKey(email: string, address: string) {
  return `${address}:${email.toLowerCase()}`;
}

function loginIsLimited(key: string) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;

  if (Date.now() > attempt.resetAt) {
    loginAttempts.delete(key);
    return false;
  }

  return attempt.count >= maxLoginAttempts;
}

function recordFailedLogin(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + loginWindowMs });
    return;
  }

  attempt.count += 1;
}

function safeClientAddress(getClientAddress: () => string) {
  try {
    return getClientAddress();
  } catch {
    return 'unknown';
  }
}

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
  let stage = 'parse';

  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const attemptKey = loginAttemptKey(normalizedEmail, safeClientAddress(getClientAddress));

    stage = 'rate-limit';
    if (loginIsLimited(attemptKey)) {
      return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    stage = 'select-user';
    const [user] = await db.select().from(appUser).where(eq(appUser.email, normalizedEmail));

    if (!user || !user.passwordHash) {
      recordFailedLogin(attemptKey);
      return json({ error: 'Invalid credentials or account not initialized.' }, { status: 401 });
    }

    stage = 'verify-password';
    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(attemptKey);
      return json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    loginAttempts.delete(attemptKey);

    stage = 'create-session';
    const sessionId = await createSession(user.id);
    stage = 'set-cookie';
    cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30
    });

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;
    console.error('Login failed unexpectedly', { stage, error });
    return json({ error: 'Login failed unexpectedly.', stage, message, cause }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('session_id');
  if (sessionId) {
    const { deleteSession } = await import('$lib/server/auth.js');
    await deleteSession(sessionId);
    cookies.delete('session_id', { path: '/' });
  }
  return json({ ok: true });
};
