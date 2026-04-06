import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { interviewSnapshot } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const projectId = Number(cookies.get('active_project'));
  if (!projectId) return json({ error: 'No active project' }, { status: 400 });

  const body = await request.json();
  const { personName, interviewDate } = body;
  if (!personName || !interviewDate)
    return json({ error: 'Missing personName or interviewDate' }, { status: 400 });

  const [created] = await db
    .insert(interviewSnapshot)
    .values({
      projectId,
      personName,
      personRole: body.personRole ?? null,
      personPhoto: body.personPhoto ?? null,
      interviewDate,
      quote: body.quote ?? '',
      quickFacts: body.quickFacts ?? [],
      insights: body.insights ?? [],
      opportunities: body.opportunities ?? []
    })
    .returning();

  return json({ ok: true, snapshot: created });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  const allowed: Record<string, unknown> = {};
  if (updates.personName !== undefined) allowed.personName = updates.personName;
  if (updates.personRole !== undefined) allowed.personRole = updates.personRole;
  if (updates.personPhoto !== undefined) allowed.personPhoto = updates.personPhoto;
  if (updates.quote !== undefined) allowed.quote = updates.quote;
  if (updates.quickFacts !== undefined) allowed.quickFacts = updates.quickFacts;
  if (updates.insights !== undefined) allowed.insights = updates.insights;
  if (updates.opportunities !== undefined) allowed.opportunities = updates.opportunities;
  if (updates.interviewDate !== undefined) allowed.interviewDate = updates.interviewDate;
  allowed.updatedAt = new Date();

  await db.update(interviewSnapshot).set(allowed).where(eq(interviewSnapshot.id, id));
  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();
  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  await db.delete(interviewSnapshot).where(eq(interviewSnapshot.id, id));
  return json({ ok: true });
};
