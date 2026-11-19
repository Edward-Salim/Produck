import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dispatchJob } from '$lib/server/background-job.js';
import { db } from '$lib/server/db/index.js';
import { appUser, applicationCoverLetterJob } from '$lib/server/db/schema.js';
import { processApplicationCoverLetterJob } from '$lib/server/application-cover-letter-jobs.js';
import { ensureApplicationCoverLetterJobTable } from '$lib/server/application-cover-letter-schema.js';
import { cleanApplicationDump } from '$lib/application-dump-cleaner.js';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (caller?.role !== 'admin') return json({ error: 'Forbidden' }, { status: 403 });

  const { dump, replaceJobId } = (await request.json()) as {
    dump?: string;
    replaceJobId?: string;
  };
  const input = cleanApplicationDump(dump ?? '');
  if (!input)
    return json({ error: 'Paste a job post or application brief first' }, { status: 400 });
  if (input.length > 40000)
    return json({ error: 'Input is too long. Keep it under 40k characters.' }, { status: 400 });

  try {
    const jobId = crypto.randomUUID();
    await ensureApplicationCoverLetterJobTable(db);
    if (replaceJobId) {
      await db
        .delete(applicationCoverLetterJob)
        .where(
          and(
            eq(applicationCoverLetterJob.id, replaceJobId),
            eq(applicationCoverLetterJob.userId, caller.id)
          )
        );
    }
    await db.insert(applicationCoverLetterJob).values({
      id: jobId,
      userId: caller.id,
      status: 'queued',
      dump: input
    });

    await dispatchJob(platform, { kind: 'application-cover-letter', id: jobId }, () =>
      processApplicationCoverLetterJob(db, env, jobId)
    );

    return json({ jobId, status: 'queued' }, { status: 202 });
  } catch (err) {
    console.error('Application cover letter job creation failed:', err);
    return json(
      {
        error: err instanceof Error ? err.message : 'Cover letter job creation failed'
      },
      { status: 500 }
    );
  }
};
