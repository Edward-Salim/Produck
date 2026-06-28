import { assertProjectAccess, assertWorkspaceAccess } from '$lib/server/access.js';
import {
  loadFrameworkPageInstances,
  type FrameworkPageInstance
} from '$lib/server/framework-page-data.js';
import { db } from '$lib/server/db/index.js';
import { fintechPick, project } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export type { FrameworkPageInstance };

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
  const workspaceId = Number(cookies.get('active_workspace'));
  const projectId = Number(url.searchParams.get('project') || cookies.get('active_project'));
  const displayName = locals.session?.user?.displayName;

  if (!workspaceId) {
    return {
      frameworkInstances: [] as FrameworkPageInstance[],
      workspaceId: 0,
      projectId: 0,
      projectName: '',
      fintechPicks: [] as { companyId: string }[],
      displayName
    };
  }

  await assertWorkspaceAccess(locals, workspaceId);

  if (!projectId) {
    return {
      frameworkInstances: [] as FrameworkPageInstance[],
      workspaceId,
      projectId: 0,
      projectName: '',
      fintechPicks: [] as { companyId: string }[],
      displayName
    };
  }

  await assertProjectAccess(locals, projectId);

  const [activeProject] = await db
    .select({ name: project.name })
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
    fintechPicks,
    displayName
  };
};
