import { createSupabaseServerClient } from '$lib/server/supabase';
import { json, redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createSupabaseServerClient(event.cookies);
  event.locals.supabase = supabase;

  // Public routes that don't require auth
  const publicPaths = ['/login', '/api/auth'];
  const isPublic = publicPaths.some((p) => event.url.pathname.startsWith(p));

  if (isPublic) {
    event.locals.session = null as any;
    return resolve(event);
  }

  // getUser() verifies the JWT with Supabase (network call) — only for protected routes
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const session = user
    ? { user, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0, token_type: '' }
    : null;
  event.locals.session = session as any;

  if (!session) {
    if (event.url.pathname.startsWith('/api/')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    throw redirect(303, '/login');
  }

  return resolve(event);
};
