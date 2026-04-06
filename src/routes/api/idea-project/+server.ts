import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { idea, project } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const wsId = Number(cookies.get('active_workspace'));
  if (!wsId) return json({ error: 'No active workspace' }, { status: 400 });

  const { ideaId } = await request.json();
  if (!ideaId) return json({ error: 'Missing ideaId' }, { status: 400 });

  // Check if idea already has a project
  const [existing] = await db.select().from(idea).where(eq(idea.id, ideaId));
  if (!existing) return json({ error: 'Idea not found' }, { status: 404 });
  if (existing.projectId) return json({ projectId: existing.projectId });

  // Create a project for this idea
  const [newProject] = await db
    .insert(project)
    .values({
      workspaceId: wsId,
      name: existing.title,
      shortName: existing.title.length > 20 ? existing.title.slice(0, 20) : existing.title
    })
    .returning();

  // Link idea to project
  await db.update(idea).set({ projectId: newProject.id }).where(eq(idea.id, ideaId));

  return json({ projectId: newProject.id });
};
