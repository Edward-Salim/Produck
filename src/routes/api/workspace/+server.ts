import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { workspaceId } = await request.json();
  if (!workspaceId) return json({ error: 'Missing workspaceId' }, { status: 400 });

  cookies.set('active_workspace', String(workspaceId), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  });
  cookies.delete('active_project', { path: '/' });

  return json({ ok: true });
};
