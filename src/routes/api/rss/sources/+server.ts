import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { rssSource } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

// List sources for a workspace
export const GET: RequestHandler = async ({ url }) => {
  const workspaceId = Number(url.searchParams.get('workspaceId'));
  if (!workspaceId) return json({ error: 'Missing workspaceId' }, { status: 400 });

  const sources = await db.select().from(rssSource).where(eq(rssSource.workspaceId, workspaceId));

  return json(sources);
};

// Add a new source
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { workspaceId, name, url: feedUrl, category } = body;

  if (!workspaceId || !name || !feedUrl) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  const [inserted] = await db
    .insert(rssSource)
    .values({
      workspaceId,
      name,
      url: feedUrl,
      category: category || 'general'
    })
    .returning();

  return json(inserted);
};

// Update a source (toggle enabled, edit name/url/category)
export const PATCH: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, name, url: feedUrl, category, enabled } = body;

  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (typeof name === 'string') updates.name = name;
  if (typeof feedUrl === 'string') updates.url = feedUrl;
  if (typeof category === 'string') updates.category = category;
  if (typeof enabled === 'boolean') updates.enabled = enabled;

  if (Object.keys(updates).length === 0) {
    return json({ error: 'Nothing to update' }, { status: 400 });
  }

  await db.update(rssSource).set(updates).where(eq(rssSource.id, id));
  return json({ ok: true });
};

// Delete a source
export const DELETE: RequestHandler = async ({ url }) => {
  const id = Number(url.searchParams.get('id'));
  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  await db.delete(rssSource).where(eq(rssSource.id, id));
  return json({ ok: true });
};
