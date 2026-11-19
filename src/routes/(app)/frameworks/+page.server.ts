import { assertProjectAccess } from '$lib/server/access.js';
import {
  loadFrameworkPageInstances,
  type FrameworkPageInstance
} from '$lib/server/framework-page-data.js';
import { db } from '$lib/server/db/index.js';
import { fintechPick, project } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export type { FrameworkPageInstance };

export const load: PageServerLoad = async ({ cookies, locals, parent }) => {
  const context = await parent();
  const workspaceId = Number(context.activeWorkspaceId);
  const projectId = Number(context.lastProject);
  const displayName = locals.session?.user?.displayName;
  const showStoryMapIds = cookies.get('story_map_show_ids') !== 'false';

  if (!projectId) {
    return {
      frameworkInstances: [] as FrameworkPageInstance[],
      workspaceId,
      projectId: 0,
      projectName: '',
      epicKanbanSyncEnabled: false,
      fintechPicks: [] as { companyId: string }[],
      showStoryMapIds,
      displayName
    };
  }

  await assertProjectAccess(locals, projectId);

  const [activeProject] = await db
    .select({
      name: project.name,
      epicKanbanSyncEnabled: project.epicKanbanSyncEnabled
    })
    .from(project)
    .where(eq(project.id, projectId));

  const fintechPicks = await db
    .select({ companyId: fintechPick.companyId })
    .from(fintechPick)
    .where(eq(fintechPick.projectId, projectId));

  return {
    frameworkInstances: await loadFrameworkPageInstances(projectId, displayName),
    workspaceId,
    projectId,
    projectName: activeProject?.name ?? '',
    epicKanbanSyncEnabled: activeProject?.epicKanbanSyncEnabled ?? false,
    fintechPicks,
    showStoryMapIds,
    displayName
  };
};
