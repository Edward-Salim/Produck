import { db } from '$lib/server/db/index.js';
import { frameworkInstance } from '$lib/server/db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url }) => {
  const projectId = Number(url.searchParams.get('projectId'));
  if (!projectId) return json({ instances: [] });

  try {
    const rows = await db
      .select()
      .from(frameworkInstance)
      .where(eq(frameworkInstance.projectId, projectId))
      .orderBy(asc(frameworkInstance.updatedAt));

    return json({
      instances: rows.map((r) => ({
        id: `db-${r.id}`,
        templateId: r.templateId,
        title: r.title,
        values: r.values as Record<string, string>,
        updatedAt: r.updatedAt.toISOString(),
        updatedBy: r.updatedBy ?? undefined
      }))
    });
  } catch {
    return json({ instances: [] });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, projectId, templateId, title, values, updatedBy } = body;

    if (!projectId || !templateId || !title) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    const displayName = locals.session?.user?.displayName ?? updatedBy;

    // Update existing instance if id is provided
    if (id && typeof id === 'string' && id.startsWith('db-')) {
      const numericId = Number(id.slice(3));
      const [row] = await db
        .update(frameworkInstance)
        .set({
          title: String(title),
          values: values ?? {},
          updatedBy: displayName,
          updatedAt: new Date()
        })
        .where(eq(frameworkInstance.id, numericId))
        .returning();

      if (!row) return json({ error: 'Instance not found' }, { status: 404 });

      return json({
        instance: {
          id: `db-${row.id}`,
          templateId: row.templateId,
          title: row.title,
          values: row.values as Record<string, string>,
          updatedAt: row.updatedAt.toISOString(),
          updatedBy: row.updatedBy ?? undefined
        }
      });
    }

    // Create new instance
    const [row] = await db
      .insert(frameworkInstance)
      .values({
        projectId: Number(projectId),
        templateId: String(templateId),
        title: String(title),
        values: values ?? {},
        updatedBy: displayName
      })
      .returning();

    return json({
      instance: {
        id: `db-${row.id}`,
        templateId: row.templateId,
        title: row.title,
        values: row.values as Record<string, string>,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy ?? undefined
      }
    });
  } catch (err: any) {
    console.error('Failed to save framework instance:', err?.message ?? err);
    return json({ error: 'Failed to save instance' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({ error: 'Unauthorized' }, { status: 401 });

  const rawId = url.searchParams.get('id') ?? '';
  // ID format: "db-123" — strip prefix
  const numericId = Number(rawId.startsWith('db-') ? rawId.slice(3) : rawId);
  if (!numericId) return json({ error: 'Invalid id' }, { status: 400 });

  try {
    await db.delete(frameworkInstance).where(eq(frameworkInstance.id, numericId));
    return json({ ok: true });
  } catch (err: any) {
    console.error('Failed to delete framework instance:', err?.message ?? err);
    return json({ error: 'Failed to delete instance' }, { status: 500 });
  }
};
