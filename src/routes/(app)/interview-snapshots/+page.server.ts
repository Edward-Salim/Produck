import { db } from '$lib/server/db/index.js';
import { interviewSnapshot } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface SnapshotRow {
  id: number;
  personName: string;
  personRole: string | null;
  personPhoto: string | null;
  interviewDate: string;
  quote: string | null;
  quickFacts: string[];
  insights: string[];
  opportunities: string[];
  transcript: string | null;
}

export const load: PageServerLoad = async ({ cookies }) => {
  const projectId = Number(cookies.get('active_project'));
  if (!projectId) return { snapshots: [] as SnapshotRow[] };

  const rows = await db
    .select()
    .from(interviewSnapshot)
    .where(eq(interviewSnapshot.projectId, projectId))
    .orderBy(desc(interviewSnapshot.interviewDate));

  const snapshots: SnapshotRow[] = rows.map((r) => ({
    id: r.id,
    personName: r.personName,
    personRole: r.personRole,
    personPhoto: r.personPhoto,
    interviewDate: r.interviewDate,
    quote: r.quote,
    quickFacts: (r.quickFacts ?? []) as string[],
    insights: (r.insights ?? []) as string[],
    opportunities: (r.opportunities ?? []) as string[],
    transcript: r.transcript
  }));

  return { snapshots };
};
