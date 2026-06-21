import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { jobSource } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const sources = await db.select().from(jobSource);
  return json(sources);
};
