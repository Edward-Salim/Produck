import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
  const { email, password } = await request.json();

  const { error } = await locals.supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return json({ error: error.message }, { status: 401 });
  }

  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  return json({ ok: true });
};
