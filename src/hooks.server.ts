import { createSupabaseServerClient } from '$lib/server/supabase';
import { redirect, type Handle } from '@sveltejs/kit';

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

  // Redirect to login if not authenticated
  if (!session && !isPublic) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
