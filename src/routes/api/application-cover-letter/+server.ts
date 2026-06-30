import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { appUser, applicationCoverLetterJob } from '$lib/server/db/schema.js';
import { getApplicationJobSecret } from '$lib/server/application-cover-letter.js';
import { processApplicationCoverLetterJob } from '$lib/server/application-cover-letter-jobs.js';
import { ensureApplicationCoverLetterJobTable } from '$lib/server/application-cover-letter-schema.js';
import { cleanApplicationDump } from '$lib/application-dump-cleaner.js';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

async function triggerBackgroundJob(
  origin: string,
  jobId: string,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  const fallback = () =>
    processApplicationCoverLetterJob(db, env, jobId).catch((fallbackErr) => {
      console.error('Application cover letter fallback job failed:', fallbackErr);
    });

  if (!waitUntil) {
    void fallback();
    return;
  }

  const secret = getApplicationJobSecret(env);
  const trigger = fetch(`${origin}/api/application-cover-letter/jobs/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, secret })
  });

  try {
    const response = await trigger;
    if (response.ok || response.status === 202) return;
    throw new Error(`Background function returned ${response.status}`);
  } catch (err) {
    console.warn('Background function trigger failed, using in-process fallback:', err);
    waitUntil(fallback());
  }
}

export const POST: RequestHandler = async ({ request, locals, url, platform }) => {
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

    const netlifyContext = (platform as any)?.context;
    await triggerBackgroundJob(url.origin, jobId, netlifyContext?.waitUntil?.bind(netlifyContext));

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
