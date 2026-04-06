import { createSupabaseServerClient } from '$lib/server/supabase';
import { json, redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createSupabaseServerClient(event.cookies);
  event.locals.supabase = supabase;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Build a lightweight session object from the authenticated user
  const session = user
    ? { user, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0, token_type: '' }
    : null;
  event.locals.session = session as any;

  // Public routes that don't require auth
  const publicPaths = ['/login', '/api/auth'];
  const isPublic = publicPaths.some((p) => event.url.pathname.startsWith(p));

  if (!session && !isPublic) {
    // API routes get 401 JSON, pages get redirected
    if (event.url.pathname.startsWith('/api/')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    throw redirect(303, '/login');
  }

  return resolve(event);
};
