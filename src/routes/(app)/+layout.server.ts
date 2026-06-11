import { db } from '$lib/server/db/index.js';
import {
  workspace,
  project,
  productObjective,
  keyResult,
  appUser,
  projectAccess,
  workspaceAccess
} from '$lib/server/db/schema.js';
import { asc, eq, and } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
  try {
    // Look up current user + all workspaces in parallel
    const authId = locals.session?.user?.id;
    const [userRows, allWorkspaces] = await Promise.all([
      authId ? db.select().from(appUser).where(eq(appUser.authId, authId)) : Promise.resolve([]),
      db
        .select({ id: workspace.id, name: workspace.name })
        .from(workspace)
        .orderBy(asc(workspace.id))
    ]);
    const currentUser = userRows[0];
    const isAdmin = currentUser?.role === 'admin';
    const userPreferences = (currentUser?.preferences ?? {}) as {
      lastWorkspaceId?: number;
      lastProjectId?: number;
      [key: string]: unknown;
    };

    // Filter workspaces by access for members
    let workspaces = allWorkspaces;
    if (!isAdmin && currentUser) {
      const wsAccess = await db
        .select({ workspaceId: workspaceAccess.workspaceId })
        .from(workspaceAccess)
        .where(eq(workspaceAccess.userId, currentUser.id));
      const allowedWsIds = new Set(wsAccess.map((a) => a.workspaceId));
      workspaces = allWorkspaces.filter((w) => allowedWsIds.has(w.id));
    }

    // Workspace: cookie → DB prefs → first fallback
    const cookieWorkspace = cookies.get('active_workspace') ?? '';
    const cookieWsId = Number(cookieWorkspace) || 0;
    let activeWorkspaceId =
      (cookieWsId && workspaces.some((w) => w.id === cookieWsId)
        ? cookieWsId
        : 0);
    if (!activeWorkspaceId && userPreferences.lastWorkspaceId) {
      activeWorkspaceId = workspaces.some((w) => w.id === userPreferences.lastWorkspaceId)
        ? userPreferences.lastWorkspaceId
        : 0;
    }
    if (!activeWorkspaceId) {
      activeWorkspaceId = workspaces[0]?.id ?? 0;
    }

    // Projects + access in parallel
    const [allProjects, accessRows] = await Promise.all([
      activeWorkspaceId
        ? db
            .select({ id: project.id, name: project.name, shortName: project.shortName })
            .from(project)
            .where(eq(project.workspaceId, activeWorkspaceId))
            .orderBy(asc(project.id))
        : Promise.resolve([]),
      !isAdmin && currentUser
        ? db
            .select({ projectId: projectAccess.projectId })
            .from(projectAccess)
            .where(eq(projectAccess.userId, currentUser.id))
        : Promise.resolve(null)
    ]);

    const projects =
      accessRows !== null
        ? (() => {
            const allowedIds = new Set(accessRows.map((a) => a.projectId));
            return allProjects.filter((p) => allowedIds.has(p.id));
          })()
        : allProjects;

    // Project: cookie → DB prefs → first fallback (must belong to this workspace)
    const cookieProject = cookies.get('active_project') ?? '';
    let projectBelongs = projects.some((p) => String(p.id) === cookieProject);
    let lastProject = projectBelongs ? cookieProject : '';
    if (!lastProject && userPreferences.lastProjectId) {
      const dbProjectValid = projects.some((p) => p.id === userPreferences.lastProjectId);
      if (dbProjectValid) {
        lastProject = String(userPreferences.lastProjectId);
        projectBelongs = true;
      }
    }
    if (!lastProject) {
      lastProject = String(projects[0]?.id ?? '');
    }

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

    // Sync resolved values to DB preferences for cross-device fallback
    const resolvedLastWsId = Number(activeWorkspaceId);
    const resolvedLastProjId = Number(lastProject);
    if (
      authId &&
      currentUser &&
      (userPreferences.lastWorkspaceId !== resolvedLastWsId ||
        userPreferences.lastProjectId !== resolvedLastProjId)
    ) {
      try {
        await db
          .update(appUser)
          .set({
            preferences: {
              ...(currentUser.preferences ?? {}),
              lastWorkspaceId: resolvedLastWsId,
              lastProjectId: resolvedLastProjId
            }
          })
          .where(eq(appUser.authId, authId));
      } catch {
        // Non-critical — cookies still work for the current session
      }
    }

    // OKR gauge data for current quarter
    const now = new Date();
    const gaugeYear = now.getFullYear();
    const gaugeQuarter = Math.floor(now.getMonth() / 3) + 1;
    const activeProjectId = Number(lastProject);

    const gaugeKRs = activeProjectId
      ? await db
          .select({
            description: keyResult.description,
            targetValue: keyResult.targetValue,
            currentValue: keyResult.currentValue,
            unit: keyResult.unit
          })
          .from(keyResult)
          .innerJoin(productObjective, eq(keyResult.objectiveId, productObjective.id))
          .where(
            and(
              eq(productObjective.projectId, activeProjectId),
              eq(productObjective.year, gaugeYear),
              eq(productObjective.quarter, gaugeQuarter)
            )
          )
          .orderBy(asc(keyResult.code))
      : [];

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
  } catch (err: any) {
    console.error('DB query failed:', err?.message ?? err);
    return {
      workspaces: [],
      activeWorkspaceId: '',
      projects: [],
      lastProject: '',
      gaugeKRs: [],
      gaugeYear: new Date().getFullYear(),
      gaugeQuarter: Math.floor(new Date().getMonth() / 3) + 1,
      currentUser: null,
      isAdmin: false
    };
  }
};
