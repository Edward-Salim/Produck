import { json, redirect, type Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Public routes that don't require auth
  const publicPaths = ['/login', '/api/auth'];
  const isPublic =
    event.url.pathname === '/' || publicPaths.some((p) => event.url.pathname.startsWith(p));

  // Retrieve local session ID from cookie
  const sessionId = event.cookies.get('session_id') || '';

  let sessionResult = null;
  if (sessionId) {
    sessionResult = await validateSession(sessionId);
  }

  if (sessionResult) {
    event.locals.session = {
      user: {
        id: sessionResult.user.authId,
        email: sessionResult.user.email,
        displayName: sessionResult.user.displayName,
        role: sessionResult.user.role
      }
    };
    // Refresh cookie to slide expiration
    event.cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });
  } else {
    event.locals.session = null;
  }

  if (!event.locals.session && !isPublic) {
    if (event.url.pathname.startsWith('/api/')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    throw redirect(303, '/login');
  }

  const pathname = event.url.pathname.replace(/\/$/, '') || '/';

  return resolve(event, {
    preload: ({ type }) => {
      if (pathname === '/tools/application-kit') {
        return type === 'css';
      }

      return type === 'js' || type === 'css';
    }
  });
};
