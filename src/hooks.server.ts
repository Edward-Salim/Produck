import { createSupabaseServerClient } from '$lib/server/supabase';
import { json, redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createSupabaseServerClient(event.cookies);
  event.locals.supabase = supabase;

  const {
    data: { session }
  } = await supabase.auth.getSession();
  event.locals.session = session;

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
