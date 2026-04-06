import { db } from '$lib/server/db/index.js';
import {
  workspace,
  project,
  productObjective,
  keyResult,
  appUser,
  projectAccess
} from '$lib/server/db/schema.js';
import { asc, eq, and, inArray } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
  try {
    // Look up current user
    const authId = locals.session?.user?.id;
    const [currentUser] = authId
      ? await db.select().from(appUser).where(eq(appUser.authId, authId))
      : [];
    const isAdmin = currentUser?.role === 'admin';

    const workspaces = await db
      .select({ id: workspace.id, name: workspace.name })
      .from(workspace)
      .orderBy(asc(workspace.id));

    // Workspace: use cookie, fall back to first
    const cookieWorkspace = cookies.get('active_workspace') ?? '';
    const activeWorkspaceId = Number(cookieWorkspace) || workspaces[0]?.id;

    // Projects: scoped to active workspace, filtered by access for members
    let allProjects = activeWorkspaceId
      ? await db
          .select({ id: project.id, name: project.name, shortName: project.shortName })
          .from(project)
          .where(eq(project.workspaceId, activeWorkspaceId))
          .orderBy(asc(project.id))
      : [];

    // Members only see projects they have access to
    if (!isAdmin && currentUser) {
      const access = await db
        .select({ projectId: projectAccess.projectId })
        .from(projectAccess)
        .where(eq(projectAccess.userId, currentUser.id));
      const allowedIds = new Set(access.map((a) => a.projectId));
      allProjects = allProjects.filter((p) => allowedIds.has(p.id));
    }

    const projects = allProjects;

    // Project: use cookie only if it belongs to this workspace, otherwise first
    const cookieProject = cookies.get('active_project') ?? '';
    const projectBelongs = projects.some((p) => String(p.id) === cookieProject);
    const lastProject = projectBelongs ? cookieProject : String(projects[0]?.id ?? '');

    // Persist corrected values back to cookies
    if (activeWorkspaceId) {
      cookies.set('active_workspace', String(activeWorkspaceId), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      });
    }
    if (lastProject) {
      cookies.set('active_project', lastProject, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
      });
    }

    // OKR gauge data for current quarter
    const now = new Date();
    const gaugeYear = now.getFullYear();
    const gaugeQuarter = Math.floor(now.getMonth() / 3) + 1;
    const activeProjectId = Number(lastProject);

    let gaugeKRs: {
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
    }[] = [];
    if (activeProjectId) {
      const objs = await db
        .select({ id: productObjective.id })
        .from(productObjective)
        .where(
          and(
            eq(productObjective.projectId, activeProjectId),
            eq(productObjective.year, gaugeYear),
            eq(productObjective.quarter, gaugeQuarter)
          )
        );

      if (objs.length > 0) {
        const objIds = objs.map((o) => o.id);
        for (const objId of objIds) {
          const krs = await db
            .select({
              description: keyResult.description,
              targetValue: keyResult.targetValue,
              currentValue: keyResult.currentValue,
              unit: keyResult.unit
            })
            .from(keyResult)
            .where(eq(keyResult.objectiveId, objId))
            .orderBy(asc(keyResult.code));
          gaugeKRs.push(...krs);
        }
      }
    }

    return {
      workspaces,
      activeWorkspaceId: activeWorkspaceId ? String(activeWorkspaceId) : '',
      projects,
      lastProject,
      gaugeKRs,
      gaugeYear,
      gaugeQuarter,
      currentUser: currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: currentUser.role
          }
        : null,
      isAdmin
    };
  } catch (err) {
    console.error('DB query failed:', err);
    return {
      workspaces: [],
      activeWorkspaceId: '',
      projects: [],
      lastProject: '',
      currentUser: null,
      isAdmin: false
    };
  }
};
