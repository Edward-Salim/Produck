import { assertProjectAccess, assertWorkspaceAccess } from '$lib/server/access.js';
import {
  loadFrameworkPageInstances,
  type FrameworkPageInstance
} from '$lib/server/framework-page-data.js';
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
      displayName
    };
  }

  await assertWorkspaceAccess(locals, workspaceId);

  if (!projectId) {
    return {
      frameworkInstances: [] as FrameworkPageInstance[],
      workspaceId,
      projectId: 0,
      displayName
    };
  }

  await assertProjectAccess(locals, projectId);

  return {
    frameworkInstances: await loadFrameworkPageInstances(projectId, displayName),
    workspaceId,
    projectId,
    displayName
  };
};
