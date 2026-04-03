import { db } from '$lib/server/db/index.js';
import { project, persona } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { projects } = await parent();
	const projectId = Number(url.searchParams.get('project')) || projects[0]?.id;

	if (!projectId) return { personas: [], projectName: '' };

	const [proj] = await db.select().from(project).where(eq(project.id, projectId));
	if (!proj) return { personas: [], projectName: '' };

	const personas = await db
		.select()
		.from(persona)
		.where(eq(persona.projectId, projectId))
		.orderBy(asc(persona.sortOrder));

	return { personas, projectName: proj.name };
};
