import { db } from '$lib/server/db/index.js';
import { idea, project } from '$lib/server/db/schema.js';
import { eq, and, or, isNull, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface IdeaItem {
  id: number;
  title: string;
  description: string | null;
  projectId: number | null;
  projectShortName: string | null;
  status: string;
  proposer: string | null;
  okrCode: string | null;
  createdAt: string;
}

export const load: PageServerLoad = async ({ parent, cookies, url }) => {
  const { activeWorkspaceId } = await parent();
  const wsId = Number(activeWorkspaceId);
  const projectId =
    Number(url.searchParams.get('project')) || Number(cookies.get('active_project'));

  if (!wsId) return { ideas: [] };

  // Load ideas that belong to this project OR have no project yet
  const dbIdeas = await db
    .select({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      projectId: idea.projectId,
      projectShortName: project.shortName,
      projectName: project.name,
      status: idea.status,
      proposer: idea.proposer,
      okrCode: idea.okrCode,
      createdAt: idea.createdAt
    })
    .from(idea)
    .leftJoin(project, eq(idea.projectId, project.id))
    .where(and(eq(idea.workspaceId, wsId), projectId ? eq(idea.projectId, projectId) : undefined))
    .orderBy(asc(idea.createdAt));

  const ideas: IdeaItem[] = dbIdeas.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    projectId: i.projectId,
    projectShortName: i.projectShortName ?? i.projectName ?? null,
    status: i.status,
    proposer: i.proposer,
    okrCode: i.okrCode,
    createdAt: i.createdAt.toISOString()
  }));

  return { ideas };
};
