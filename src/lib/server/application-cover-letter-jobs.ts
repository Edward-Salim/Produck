import { eq } from 'drizzle-orm';
import {
  generateApplicationCoverLetter,
  generateLinkedInMessages,
  type GeneratedApplicationCoverLetter
} from './application-cover-letter.js';
import { ensureApplicationCoverLetterJobTable } from './application-cover-letter-schema.js';
import { applicationCoverLetterJob } from './db/schema.js';

type ApplicationJobEnv = {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  GEMINI_API_KEYS?: string;
};

function publicResult(result: GeneratedApplicationCoverLetter) {
  return {
    company: result.company,
    role: result.role,
    recipient: result.recipient,
    companyTag: result.companyTag,
    plainText: result.plainText,
    model: result.model,
    linkedinStatus: 'running',
    linkedinSkills: '',
    linkedinMessages: []
  };
}

export async function processApplicationCoverLetterJob(
  database: any,
  env: ApplicationJobEnv,
  jobId: string
) {
  await ensureApplicationCoverLetterJobTable(database);

  const [job] = await database
    .select()
    .from(applicationCoverLetterJob)
    .where(eq(applicationCoverLetterJob.id, jobId));

  if (!job) throw new Error(`Application cover letter job not found: ${jobId}`);
  if (job.status === 'completed') return job.result;

  await database
    .update(applicationCoverLetterJob)
    .set({ status: 'running', error: null, updatedAt: new Date() })
    .where(eq(applicationCoverLetterJob.id, jobId));

  try {
    const result = await generateApplicationCoverLetter(env, job.dump);
    const savedResult = publicResult(result);

    await database
      .update(applicationCoverLetterJob)
      .set({
        status: 'completed',
        result: savedResult,
        model: result.model,
        error: null,
        updatedAt: new Date()
      })
      .where(eq(applicationCoverLetterJob.id, jobId));

    try {
      const linkedinAssets = await generateLinkedInMessages(env, job.dump, {
        company: result.company,
        role: result.role
      });

      await database
        .update(applicationCoverLetterJob)
        .set({
          result: {
            ...savedResult,
            linkedinStatus: 'completed',
            linkedinSkills: linkedinAssets.skills,
            linkedinMessages: linkedinAssets.messages
          },
          updatedAt: new Date()
        })
        .where(eq(applicationCoverLetterJob.id, jobId));
    } catch (err) {
      const linkedinError =
        err instanceof Error ? err.message : 'LinkedIn message generation failed';
      console.warn('LinkedIn message generation failed:', err);

      await database
        .update(applicationCoverLetterJob)
        .set({
          result: {
            ...savedResult,
            linkedinStatus: 'failed',
            linkedinError
          },
          updatedAt: new Date()
        })
        .where(eq(applicationCoverLetterJob.id, jobId));
    }

    return savedResult;
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes('timed out')
        ? 'The AI provider took too long to respond. Try again with a shorter application dump.'
        : err instanceof Error
          ? err.message
          : 'Cover letter generation failed';

    await database
      .update(applicationCoverLetterJob)
      .set({ status: 'failed', error: message, updatedAt: new Date() })
      .where(eq(applicationCoverLetterJob.id, jobId));

    throw new Error(message);
  }
}
