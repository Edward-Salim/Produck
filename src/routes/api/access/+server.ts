import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
  appUser,
  project,
  projectAccess,
  workspace,
  workspaceAccess
} from '$lib/server/db/schema.js';
import { eq, and, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

async function requireAdmin(locals: App.Locals) {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  return caller?.role === 'admin' ? caller : null;
}

// List all users with their project + workspace access
export const GET: RequestHandler = async ({ locals }) => {
  if (!(await requireAdmin(locals))) return json({ error: 'Forbidden' }, { status: 403 });

  const [users, pAccess, wAccess, projects] = await Promise.all([
    db.select().from(appUser),
    db.select().from(projectAccess),
    db.select().from(workspaceAccess),
    db
      .select({
        id: project.id,
        workspaceId: project.workspaceId,
        workspaceName: workspace.name,
        name: project.name,
        shortName: project.shortName
      })
      .from(project)
      .innerJoin(workspace, eq(project.workspaceId, workspace.id))
      .orderBy(asc(workspace.id), asc(project.id))
  ]);

  return json({
    projects,
    users: users.map((u) => ({
      id: u.id,
      authId: u.authId,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      projectIds: pAccess.filter((a) => a.userId === u.id).map((a) => a.projectId),
      workspaceIds: wAccess.filter((a) => a.userId === u.id).map((a) => a.workspaceId)
    }))
  });
};

// Grant access: POST { userId, projectId } or { userId, workspaceId }
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!(await requireAdmin(locals))) return json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { userId, projectId, workspaceId } = body;
  if (!userId) return json({ error: 'Missing userId' }, { status: 400 });

  if (workspaceId) {
    const existing = await db
      .select()
      .from(workspaceAccess)
      .where(and(eq(workspaceAccess.userId, userId), eq(workspaceAccess.workspaceId, workspaceId)));
    if (existing.length === 0) {
      await db.insert(workspaceAccess).values({ userId, workspaceId });
    }
  } else if (projectId) {
    const existing = await db
      .select()
      .from(projectAccess)
      .where(and(eq(projectAccess.userId, userId), eq(projectAccess.projectId, projectId)));
    if (existing.length === 0) {
      await db.insert(projectAccess).values({ userId, projectId });
    }
  } else {
    return json({ error: 'Missing projectId or workspaceId' }, { status: 400 });
  }

  return json({ ok: true });
};

// Revoke access or delete user
// DELETE ?userId=X&projectId=Y or ?userId=X&workspaceId=Y or ?userId=X&deleteUser=1
export const DELETE: RequestHandler = async ({ url, locals }) => {
  const admin = await requireAdmin(locals);
  if (!admin) return json({ error: 'Forbidden' }, { status: 403 });

  const userId = Number(url.searchParams.get('userId'));
  if (!userId) return json({ error: 'Missing userId' }, { status: 400 });

  const deleteUser = url.searchParams.get('deleteUser') === '1';
  if (deleteUser) {
    // Get the user's auth ID before deleting
    const [user] = await db.select().from(appUser).where(eq(appUser.id, userId));
    if (!user) return json({ error: 'User not found' }, { status: 404 });
    if (user.role === 'admin') return json({ error: 'Cannot delete admin' }, { status: 400 });

    // Delete from app_user (cascades to access tables)
    await db.delete(appUser).where(eq(appUser.id, userId));

    return json({ ok: true });
  }

  const workspaceId = Number(url.searchParams.get('workspaceId'));
  if (workspaceId) {
    await db
      .delete(workspaceAccess)
      .where(and(eq(workspaceAccess.userId, userId), eq(workspaceAccess.workspaceId, workspaceId)));
    return json({ ok: true });
  }

  const projectId = Number(url.searchParams.get('projectId'));
  if (projectId) {
    await db
      .delete(projectAccess)
      .where(and(eq(projectAccess.userId, userId), eq(projectAccess.projectId, projectId)));
    return json({ ok: true });
  }

  return json({ error: 'Missing params' }, { status: 400 });
};
