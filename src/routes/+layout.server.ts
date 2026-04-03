import { db } from '$lib/server/db/index.js';
import { project } from '$lib/server/db/schema.js';
import { asc } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async () => {
	const projects = await db
		.select({ id: project.id, name: project.name })
		.from(project)
		.orderBy(asc(project.id));

	return { projects };
};
