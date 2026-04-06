import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { artifactPick } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const projectId = Number(cookies.get('active_project'));
  if (!projectId) return json({ error: 'No active project' }, { status: 400 });

  const { bookId, artifactName } = await request.json();
  if (!bookId || !artifactName)
    return json({ error: 'Missing bookId or artifactName' }, { status: 400 });

  const [existing] = await db
    .select()
    .from(artifactPick)
    .where(
      and(
        eq(artifactPick.projectId, projectId),
        eq(artifactPick.bookId, bookId),
        eq(artifactPick.artifactName, artifactName)
      )
    );

  if (existing) {
    await db.delete(artifactPick).where(eq(artifactPick.id, existing.id));
    return json({ ok: true, picked: false });
  }

  await db.insert(artifactPick).values({ projectId, bookId, artifactName });
  return json({ ok: true, picked: true });
};
