import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { appUser, project, projectAccess, workspaceAccess } from '$lib/server/db/schema.js';

export type CurrentUser = typeof appUser.$inferSelect;

export async function getCurrentUser(locals: App.Locals): Promise<CurrentUser> {
  const authId = locals.session?.user?.id;
  if (!authId) error(401, 'Unauthorized');

  const [user] = await db.select().from(appUser).where(eq(appUser.authId, authId)).limit(1);
  if (!user) error(401, 'Unauthorized');

  return user;
}

export function isAdmin(user: Pick<CurrentUser, 'role'>): boolean {
  return user.role === 'admin';
}

export async function assertAdmin(locals: App.Locals): Promise<CurrentUser> {
  const user = await getCurrentUser(locals);
  if (!isAdmin(user)) error(403, 'Forbidden');

  return user;
}

export async function assertWorkspaceAccess(
  locals: App.Locals,
  workspaceId: number
): Promise<CurrentUser> {
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) error(400, 'Invalid workspace id');

  const user = await getCurrentUser(locals);
  if (isAdmin(user)) return user;

  const [access] = await db
    .select({ id: workspaceAccess.id })
    .from(workspaceAccess)
    .where(and(eq(workspaceAccess.userId, user.id), eq(workspaceAccess.workspaceId, workspaceId)))
    .limit(1);

  if (!access) error(403, 'Forbidden');
  return user;
}

export async function assertProjectAccess(
  locals: App.Locals,
  projectId: number
): Promise<CurrentUser> {
  if (!Number.isInteger(projectId) || projectId <= 0) error(400, 'Invalid project id');

  const user = await getCurrentUser(locals);
  if (isAdmin(user)) return user;

  const [access] = await db
    .select({ id: projectAccess.id })
    .from(projectAccess)
    .where(and(eq(projectAccess.userId, user.id), eq(projectAccess.projectId, projectId)))
    .limit(1);

  if (!access) error(403, 'Forbidden');
  return user;
}

export async function assertProjectRowAccess(
  locals: App.Locals,
  projectId: number
): Promise<CurrentUser> {
  const [row] = await db.select({ id: project.id }).from(project).where(eq(project.id, projectId));
  if (!row) error(404, 'Project not found');

  return assertProjectAccess(locals, projectId);
}
