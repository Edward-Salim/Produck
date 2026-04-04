import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { story } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const PATCH: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { code, done, checkedAcs } = body;

	if (!code) return json({ error: 'Missing code' }, { status: 400 });

	const [existing] = await db.select().from(story).where(eq(story.code, code));
	if (!existing) return json({ error: 'Story not found' }, { status: 404 });

	const updates: Record<string, unknown> = {};
	if (typeof done === 'boolean') updates.done = done;
	if (Array.isArray(checkedAcs)) updates.checkedAcs = checkedAcs;

	if (Object.keys(updates).length === 0) {
		return json({ error: 'Nothing to update' }, { status: 400 });
	}

	await db.update(story).set(updates).where(eq(story.code, code));

	return json({ ok: true, code });
};
