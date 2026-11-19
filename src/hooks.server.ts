import { error, json, redirect, type Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { isRestrictedSectionRoute } from '$lib/constants/restricted-sections.js';

export const handle: Handle = async ({ event, resolve }) => {
  const legacyChineseLearningPrefix = ['/tools/chinese-game', '/tools/chinese-learning'].find(
    (prefix) => event.url.pathname === prefix || event.url.pathname.startsWith(`${prefix}/`)
  );
  if (legacyChineseLearningPrefix) {
    const destination = event.url.pathname.replace(
      legacyChineseLearningPrefix,
      '/chinese-learning'
    );
    throw redirect(308, `${destination}${event.url.search}`);
  }

  // Public routes that don't require auth
  const publicPaths = ['/login', '/api/auth'];
  const isPublic =
    event.url.pathname === '/' || publicPaths.some((p) => event.url.pathname.startsWith(p));

  // Retrieve local session ID from cookie
  const sessionId = event.cookies.get('session_id') || '';

  let sessionResult = null;
  if (sessionId) {
    try {
      sessionResult = await validateSession(sessionId);
    } catch (err) {
      console.error('Session validation failed:', err);
      event.cookies.delete('session_id', { path: '/' });
    }
  }

  if (sessionResult) {
    event.locals.session = {
      user: {
        id: sessionResult.user.authId,
        email: sessionResult.user.email,
        displayName: sessionResult.user.displayName,
        role: sessionResult.user.role,
        restrictedSections: sessionResult.user.restrictedSections
      }
    };
    // Refresh cookie to slide expiration
    event.cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
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

  const routeId = event.route.id;
  const user = event.locals.session?.user;
  if (user && routeId && isRestrictedSectionRoute(routeId, user.restrictedSections)) {
    if (routeId.startsWith('/api/')) return json({ error: 'Forbidden' }, { status: 403 });
    error(403, 'This section is unavailable for your account.');
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
