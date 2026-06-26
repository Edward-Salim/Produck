import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { assertWorkspaceAccess } from '$lib/server/access.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const { workspaceId } = await request.json();
  if (!workspaceId) return json({ error: 'Missing workspaceId' }, { status: 400 });
  await assertWorkspaceAccess(locals, Number(workspaceId));

  cookies.set('active_workspace', String(workspaceId), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  });
  cookies.delete('active_project', { path: '/' });

  // Persist to DB for cross-device sync; clear project since it belongs to old workspace
  const authId = locals.session?.user?.id;
  if (authId) {
    try {
      const [existing] = await db
        .select({ preferences: appUser.preferences })
        .from(appUser)
        .where(eq(appUser.authId, authId))
        .limit(1);
      const current = (existing?.preferences ?? {}) as Record<string, unknown>;
      await db
        .update(appUser)
        .set({
          preferences: {
            ...current,
            lastWorkspaceId: Number(workspaceId),
            lastProjectId: undefined
          }
        })
        .where(eq(appUser.authId, authId));
    } catch {
      // Non-critical — cookie still works for the current session
    }
  }

  return json({ ok: true });
};
