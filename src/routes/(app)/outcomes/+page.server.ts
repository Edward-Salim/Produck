import { db } from '$lib/server/db/index.js';
import { businessOutcome, productObjective, keyResult } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface KRRow {
  id: number;
  code: string;
  description: string;
  target: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  carriedFrom: string | null;
  lastUpdated: string;
}

export interface ObjectiveRow {
  id: number;
  code: string;
  title: string;
  year: number;
  quarter: number;
  keyResults: KRRow[];
}

export interface BORow {
  id: number;
  code: string;
  title: string;
  description: string | null;
  metrics: string[];
  year: number;
}

export const load: PageServerLoad = async ({ cookies }) => {
  const projectId = Number(cookies.get('active_project'));
  if (!projectId) return { businessOutcomes: [], objectives: [], availableYears: [] };

  const bos = await db
    .select()
    .from(businessOutcome)
    .where(eq(businessOutcome.projectId, projectId))
    .orderBy(asc(businessOutcome.year));

  const objs = await db
    .select()
    .from(productObjective)
    .where(eq(productObjective.projectId, projectId))
    .orderBy(asc(productObjective.sortOrder));

  const objectives: ObjectiveRow[] = [];
  for (const obj of objs) {
    const krs = await db
      .select()
      .from(keyResult)
      .where(eq(keyResult.objectiveId, obj.id))
      .orderBy(asc(keyResult.code));

    objectives.push({
      id: obj.id,
      code: obj.code,
      title: obj.title,
      year: obj.year,
      quarter: obj.quarter,
      keyResults: krs.map((kr) => ({
        id: kr.id,
        code: kr.code,
        description: kr.description,
        target: kr.target,
        targetValue: kr.targetValue,
        currentValue: kr.currentValue,
        unit: kr.unit,
        carriedFrom: kr.carriedFrom,
        lastUpdated: kr.lastUpdated
      }))
    });
  }

  const boRows: BORow[] = bos.map((b) => ({
    id: b.id,
    code: b.code,
    title: b.title,
    description: b.description,
    metrics: (b.metrics ?? []) as string[],
    year: b.year
  }));

  const availableYears = [...new Set(boRows.map((b) => b.year))].sort();

  return { businessOutcomes: boRows, objectives, availableYears };
};
