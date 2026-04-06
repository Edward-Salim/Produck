import { db } from '$lib/server/db/index.js';
import { artifactPick } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
  const projectId = Number(cookies.get('active_project'));

  if (!projectId) return { picks: [] as { bookId: string; artifactName: string }[] };

  const dbPicks = await db
    .select({
      bookId: artifactPick.bookId,
      artifactName: artifactPick.artifactName
    })
    .from(artifactPick)
    .where(eq(artifactPick.projectId, projectId));

  return { picks: dbPicks };
};
