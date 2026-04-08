import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { artifactPick, pmArtifact, pmBook } from '$lib/server/db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
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

export const PUT: RequestHandler = async ({ request, cookies }) => {
  const projectId = Number(cookies.get('active_project'));
  if (!projectId) return json({ error: 'No active project' }, { status: 400 });

  const { preset } = await request.json();
  if (!Array.isArray(preset)) return json({ error: 'Missing preset array' }, { status: 400 });

  // Wipe all existing picks for this project
  await db.delete(artifactPick).where(eq(artifactPick.projectId, projectId));

  if (preset.length === 0) return json({ ok: true, count: 0 });

  // Find artifacts by name and get their book slugs
  const artifacts = await db
    .select({ name: pmArtifact.name, bookSlug: pmBook.slug })
    .from(pmArtifact)
    .innerJoin(pmBook, eq(pmArtifact.bookId, pmBook.id))
    .where(inArray(pmArtifact.name, preset));

  // Insert picks
  if (artifacts.length > 0) {
    await db
      .insert(artifactPick)
      .values(artifacts.map((a) => ({ projectId, bookId: a.bookSlug, artifactName: a.name })));
  }

  return json({ ok: true, count: artifacts.length });
};
