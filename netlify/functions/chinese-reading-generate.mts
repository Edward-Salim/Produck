import type { Config } from '@netlify/functions';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  getChineseReadingJobSecret,
  processChineseReadingJob
} from '../../src/lib/server/chinese-reading-jobs.js';
import * as schema from '../../src/lib/server/db/schema.js';

export default async (request: Request) => {
  const { jobId, secret } = (await request.json().catch(() => ({}))) as {
    jobId?: string;
    secret?: string;
  };

  if (!jobId) return new Response('Missing jobId', { status: 400 });

  const expectedSecret = getChineseReadingJobSecret(process.env);
  if (!expectedSecret || secret !== expectedSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const client = postgres(databaseUrl, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });

  const db = drizzle(client, { schema });

  try {
    await processChineseReadingJob(db, process.env, jobId);
    return new Response(null, { status: 202 });
  } finally {
    await client.end({ timeout: 5 });
  }
};

export const config: Config = {
  background: true,
  path: '/api/chinese-reading/jobs/run'
};
