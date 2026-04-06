import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser, projectAccess, project } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

// List all users with their project access
export const GET: RequestHandler = async ({ locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const users = await db.select().from(appUser);
  const access = await db.select().from(projectAccess);

  return json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      projectIds: access.filter((a) => a.userId === u.id).map((a) => a.projectId)
    }))
  });
};

// Grant project access: POST { userId, projectId }
export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { userId, projectId } = await request.json();
  if (!userId || !projectId) return json({ error: 'Missing userId or projectId' }, { status: 400 });

  // Check if already exists
  const existing = await db
    .select()
    .from(projectAccess)
    .where(and(eq(projectAccess.userId, userId), eq(projectAccess.projectId, projectId)));
  if (existing.length > 0) return json({ ok: true, message: 'Already granted' });

  await db.insert(projectAccess).values({ userId, projectId });
  return json({ ok: true });
};

// Revoke project access: DELETE ?userId=X&projectId=Y
export const DELETE: RequestHandler = async ({ url, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const userId = Number(url.searchParams.get('userId'));
  const projectId = Number(url.searchParams.get('projectId'));
  if (!userId || !projectId) return json({ error: 'Missing params' }, { status: 400 });

  await db
    .delete(projectAccess)
    .where(and(eq(projectAccess.userId, userId), eq(projectAccess.projectId, projectId)));
  return json({ ok: true });
};
