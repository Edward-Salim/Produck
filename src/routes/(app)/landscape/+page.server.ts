import { db } from '$lib/server/db/index.js';
import { fintechPick } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
  const projectId = Number(cookies.get('active_project'));

  if (!projectId) return { picks: [] as { companyId: string }[] };

  const dbPicks = await db
    .select({ companyId: fintechPick.companyId })
    .from(fintechPick)
    .where(eq(fintechPick.projectId, projectId));

  return { picks: dbPicks };
};
