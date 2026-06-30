import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { appUser, applicationCoverLetterJob } from '$lib/server/db/schema.js';
import { ensureApplicationCoverLetterJobTable } from '$lib/server/application-cover-letter-schema.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  await ensureApplicationCoverLetterJobTable(db);

  const [job] = await db
    .select({
      id: applicationCoverLetterJob.id,
      status: applicationCoverLetterJob.status,
      result: applicationCoverLetterJob.result,
      error: applicationCoverLetterJob.error,
      model: applicationCoverLetterJob.model,
      updatedAt: applicationCoverLetterJob.updatedAt
    })
    .from(applicationCoverLetterJob)
    .where(
      and(eq(applicationCoverLetterJob.id, params.id), eq(applicationCoverLetterJob.userId, caller.id))
    );

  if (!job) return json({ error: 'Job not found' }, { status: 404 });

  return json(job);
};
