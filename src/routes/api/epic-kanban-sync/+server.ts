import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { assertProjectAccess } from '$lib/server/access.js';
import { db } from '$lib/server/db/index.js';
import { frameworkInstance, project } from '$lib/server/db/schema.js';
import { syncBacklogToKanban } from '$lib/server/epic-kanban-sync.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const projectId = Number(url.searchParams.get('projectId'));
  if (!projectId) return json({ error: 'projectId required' }, { status: 400 });
  await assertProjectAccess(locals, projectId);

  const [settings] = await db
    .select({ enabled: project.epicKanbanSyncEnabled })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  return json({ enabled: settings?.enabled ?? false });
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, enabled } = await request.json();
  const numericProjectId = Number(projectId);
  if (!numericProjectId || typeof enabled !== 'boolean') {
    return json({ error: 'projectId and enabled are required' }, { status: 400 });
  }
  await assertProjectAccess(locals, numericProjectId);

  const [updatedProject] = await db
    .update(project)
    .set({ epicKanbanSyncEnabled: enabled, updatedAt: new Date() })
    .where(eq(project.id, numericProjectId))
    .returning({ enabled: project.epicKanbanSyncEnabled });
  if (!updatedProject) return json({ error: 'Project not found' }, { status: 404 });

  if (enabled) {
    const [backlogInstance] = await db
      .select({ values: frameworkInstance.values })
      .from(frameworkInstance)
      .where(
        and(
          eq(frameworkInstance.projectId, numericProjectId),
          eq(frameworkInstance.templateId, 'backlog')
        )
      )
      .limit(1);

    if (backlogInstance) {
      await syncBacklogToKanban(
        numericProjectId,
        (backlogInstance.values ?? {}) as Record<string, unknown>,
        { force: true }
      );
    }
  }

  return json({ enabled: updatedProject.enabled });
};
