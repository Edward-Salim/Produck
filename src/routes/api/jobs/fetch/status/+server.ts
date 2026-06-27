import { json } from '@sveltejs/kit';
import { getJobRefreshStatus } from '$lib/server/jobs-refresh-status.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  return json(getJobRefreshStatus());
};
