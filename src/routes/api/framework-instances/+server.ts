import { db } from '$lib/server/db/index.js';
import { frameworkInstance } from '$lib/server/db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { assertProjectAccess } from '$lib/server/access.js';
import { syncBacklogToKanban } from '$lib/server/epic-kanban-sync.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ url, locals }) => {
  const projectId = Number(url.searchParams.get('projectId'));
  if (!projectId) return json({ instances: [] });
  await assertProjectAccess(locals, projectId);

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
    await assertProjectAccess(locals, Number(projectId));

    const displayName = locals.session?.user?.displayName ?? updatedBy;

    // Update existing instance if id is provided
    if (id && typeof id === 'string' && id.startsWith('db-')) {
      const numericId = Number(id.slice(3));
      const [existing] = await db
        .select({ projectId: frameworkInstance.projectId })
        .from(frameworkInstance)
        .where(eq(frameworkInstance.id, numericId))
        .limit(1);
      if (!existing) return json({ error: 'Instance not found' }, { status: 404 });
      await assertProjectAccess(locals, existing.projectId);

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

      if (row.templateId === 'backlog') {
        await syncBacklogToKanban(row.projectId, (row.values ?? {}) as Record<string, unknown>);
      }

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

    if (row.templateId === 'backlog') {
      await syncBacklogToKanban(row.projectId, (row.values ?? {}) as Record<string, unknown>);
    }

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
    if (err && typeof err === 'object' && 'status' in err) throw err;
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
    const [existing] = await db
      .select({ projectId: frameworkInstance.projectId })
      .from(frameworkInstance)
      .where(eq(frameworkInstance.id, numericId))
      .limit(1);
    if (!existing) return json({ error: 'Instance not found' }, { status: 404 });
    await assertProjectAccess(locals, existing.projectId);

    await db.delete(frameworkInstance).where(eq(frameworkInstance.id, numericId));
    return json({ ok: true });
  } catch (err: any) {
    if (err && typeof err === 'object' && 'status' in err) throw err;
    console.error('Failed to delete framework instance:', err?.message ?? err);
    return json({ error: 'Failed to delete instance' }, { status: 500 });
  }
};
