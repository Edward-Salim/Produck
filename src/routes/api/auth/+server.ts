import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '$lib/server/auth.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const [user] = await db.select().from(appUser).where(eq(appUser.email, email));

  if (!user || !user.passwordHash) {
    return json({ error: 'Invalid credentials or account not initialized.' }, { status: 401 });
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    return json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Create session and set cookie
  const sessionId = await createSession(user.id);
  cookies.set('session_id', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  return json({ ok: true });
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
