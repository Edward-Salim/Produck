import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { keyResult, productObjective } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { assertProjectAccess } from '$lib/server/access.js';
import type { RequestHandler } from './$types.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const { id, currentValue } = await request.json();
  if (!id || currentValue === undefined)
    return json({ error: 'Missing id or currentValue' }, { status: 400 });

  const [row] = await db
    .select({ projectId: productObjective.projectId })
    .from(keyResult)
    .innerJoin(productObjective, eq(keyResult.objectiveId, productObjective.id))
    .where(eq(keyResult.id, id))
    .limit(1);
  if (!row) return json({ error: 'Key result not found' }, { status: 404 });
  await assertProjectAccess(locals, row.projectId);

  await db
    .update(keyResult)
    .set({
      currentValue: Math.round(Number(currentValue)),
      lastUpdated: new Date().toISOString().split('T')[0]
    })
    .where(eq(keyResult.id, id));

  return json({ ok: true });
};
