import { db } from '$lib/server/db/index.js';
import { workspace, project } from '$lib/server/db/schema.js';
import { asc, eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ cookies }) => {
	try {
		const workspaces = await db
			.select({ id: workspace.id, name: workspace.name })
			.from(workspace)
			.orderBy(asc(workspace.id));

		// Workspace: use cookie, fall back to first
		const cookieWorkspace = cookies.get('active_workspace') ?? '';
		const activeWorkspaceId = Number(cookieWorkspace) || workspaces[0]?.id;

		// Projects: scoped to active workspace
		const projects = activeWorkspaceId
			? await db
					.select({ id: project.id, name: project.name, shortName: project.shortName })
					.from(project)
					.where(eq(project.workspaceId, activeWorkspaceId))
					.orderBy(asc(project.id))
			: [];

		// Project: use cookie only if it belongs to this workspace, otherwise first
		const cookieProject = cookies.get('active_project') ?? '';
		const projectBelongs = projects.some((p) => String(p.id) === cookieProject);
		const lastProject = projectBelongs ? cookieProject : String(projects[0]?.id ?? '');

		// Persist corrected values back to cookies
		if (activeWorkspaceId) {
			cookies.set('active_workspace', String(activeWorkspaceId), { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
		}
		if (lastProject) {
			cookies.set('active_project', lastProject, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
		}

		return {
			workspaces,
			activeWorkspaceId: activeWorkspaceId ? String(activeWorkspaceId) : '',
			projects,
			lastProject
		};
	} catch (err) {
		console.error('DB query failed:', err);
		return { workspaces: [], activeWorkspaceId: '', projects: [], lastProject: '' };
	}
};
