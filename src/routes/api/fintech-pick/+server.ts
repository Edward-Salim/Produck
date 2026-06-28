import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { fintechPick } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { assertProjectAccess } from '$lib/server/access.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const { projectId: requestedProjectId, companyId } = await request.json();
  const projectId = Number(requestedProjectId || cookies.get('active_project'));
  if (!projectId) return json({ error: 'No active project' }, { status: 400 });
  await assertProjectAccess(locals, projectId);

  if (!companyId) return json({ error: 'Missing companyId' }, { status: 400 });

  const [existing] = await db
    .select()
    .from(fintechPick)
    .where(and(eq(fintechPick.projectId, projectId), eq(fintechPick.companyId, companyId)));

  if (existing) {
    await db.delete(fintechPick).where(eq(fintechPick.id, existing.id));
    return json({ ok: true, picked: false });
  }

  await db.insert(fintechPick).values({ projectId, companyId });
  return json({ ok: true, picked: true });
};
