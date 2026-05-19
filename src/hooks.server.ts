import { json, redirect, type Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  // Public routes that don't require auth
  const publicPaths = ['/login', '/api/auth'];
  const isPublic = event.url.pathname === '/' || publicPaths.some((p) => event.url.pathname.startsWith(p));

  // Retrieve local session ID from cookie
  const sessionId = event.cookies.get('session_id') || '';
  
  let sessionResult = null;
  if (sessionId) {
    sessionResult = await validateSession(sessionId);
  }

  if (sessionResult) {
    // Set locals.session to mimic Supabase session layout so existing code works unchanged
    event.locals.session = {
      user: {
        id: sessionResult.user.id.toString(), // Keep string compatibility if needed, or pass authId
        email: sessionResult.user.email,
        displayName: sessionResult.user.displayName,
        role: sessionResult.user.role
      }
    } as any;
    
    // Also map to correct authId for database layouts looking up appUser by authId
    const [userRow] = await validateSession(sessionId).then(res => {
      // Return details needed by layout loaders querying appUser by auth_id
      if (!res) return [];
      // We query database to get the auth_id
      return [res.user];
    });
    
    // We can fetch the user details or just read from SQLite app_user table
    // Let's make sure locals.session.user.id returns the authId (e.g. Supabase uuid or local auth id string)
    // To match layout.server.ts and other queries, it MUST match appUser.authId
    // Let's get the auth_id from the database
    const { db } = await import('$lib/server/db/index.js');
    const { appUser } = await import('$lib/server/db/schema.js');
    const { eq } = await import('drizzle-orm');
    const [dbUser] = await db.select().from(appUser).where(eq(appUser.id, sessionResult.user.id));
    
    if (dbUser) {
      event.locals.session = {
        user: {
          id: dbUser.authId, // Matches appUser.authId string (e.g. 7135a3a0-...)
          email: dbUser.email,
          displayName: dbUser.displayName,
          role: dbUser.role
        }
      } as any;
    }
  } else {
    event.locals.session = null;
  }

  // Inject a mock Supabase client if any legacy typing imports it (prevents crashes)
  event.locals.supabase = {} as any;

  if (!event.locals.session && !isPublic) {
    if (event.url.pathname.startsWith('/api/')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    throw redirect(303, '/login');
  }

  return resolve(event);
};
