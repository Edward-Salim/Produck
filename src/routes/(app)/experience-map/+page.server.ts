import { db } from '$lib/server/db/index.js';
import { experiencePhase, experienceStep, experienceTouchpoint } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface ExperienceTouchpointData {
  id: number;
  title: string;
  actor: string;
  action: string;
  outcome: string;
  emotion: 'positive' | 'neutral' | 'negative';
  emotionScore: number;
  pains: string[];
  gains: string[];
  pic: string;
  picColor: string;
}

export interface ExperienceStepData {
  id: number;
  title: string;
  touchpoints: ExperienceTouchpointData[];
  avgEmotion: number;
}

export interface ExperiencePhaseData {
  id: number;
  title: string;
  actors: string[];
  steps: ExperienceStepData[];
  avgEmotion: number;
}

function deriveEmotion(
  pains: string[],
  gains: string[]
): { label: 'positive' | 'neutral' | 'negative'; score: number } {
  const total = pains.length + gains.length;
  if (total === 0) return { label: 'neutral', score: 0 };
  const diff = gains.length - pains.length;
  const score = Math.max(-1, Math.min(1, diff / Math.max(total, 1)));
  const label = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
  return { label, score };
}

export const load: PageServerLoad = async ({ url, parent }) => {
  const { projects } = await parent();
  const projectId = Number(url.searchParams.get('project')) || projects[0]?.id;

  if (!projectId) return { activities: [] };

  const phases = await db
    .select()
    .from(experiencePhase)
    .where(eq(experiencePhase.projectId, projectId))
    .orderBy(asc(experiencePhase.sortOrder));

  const phaseIds = phases.map((p) => p.id);

  const allSteps =
    phaseIds.length > 0
      ? await db
          .select()
          .from(experienceStep)
          .orderBy(asc(experienceStep.sortOrder))
          .then((rows) => rows.filter((s) => phaseIds.includes(s.phaseId)))
      : [];

  const stepIds = allSteps.map((s) => s.id);

  const allTouchpoints =
    stepIds.length > 0
      ? await db
          .select()
          .from(experienceTouchpoint)
          .orderBy(asc(experienceTouchpoint.sortOrder))
          .then((rows) => rows.filter((t) => stepIds.includes(t.stepId)))
      : [];

  function mapTouchpoint(t: (typeof allTouchpoints)[0]): ExperienceTouchpointData {
    const pains = (t.pains as string[]) ?? [];
    const gains = (t.gains as string[]) ?? [];
    const emo = deriveEmotion(pains, gains);
    return {
      id: t.id,
      title: t.title,
      actor: t.asA ?? t.pic ?? '',
      action: t.wantTo ?? '',
      outcome: t.soThat ?? '',
      emotion: emo.label,
      emotionScore: emo.score,
      pains,
      gains,
      pic: t.pic,
      picColor: t.picColor
    };
  }

  const result: ExperiencePhaseData[] = phases.map((phase) => {
    const phaseSteps = allSteps.filter((s) => s.phaseId === phase.id);

    const steps: ExperienceStepData[] = phaseSteps.map((step) => {
      const stepTouchpoints = allTouchpoints.filter((t) => t.stepId === step.id).map(mapTouchpoint);
      const totalPains = stepTouchpoints.reduce((sum, s) => sum + s.pains.length, 0);
      const totalGains = stepTouchpoints.reduce((sum, s) => sum + s.gains.length, 0);
      const total = totalPains + totalGains;
      const avgEmotion =
        total > 0 ? Math.max(-1, Math.min(1, (totalGains - totalPains) / Math.max(total, 1))) : 0;
      return { id: step.id, title: step.title, touchpoints: stepTouchpoints, avgEmotion };
    });

    const allTps = steps.flatMap((s) => s.touchpoints);
    const avgEmotion =
      allTps.length > 0 ? allTps.reduce((sum, tp) => sum + tp.emotionScore, 0) / allTps.length : 0;

    return {
      id: phase.id,
      title: phase.title,
      actors: (phase.actorEmojis as string[]) ?? [],
      steps,
      avgEmotion
    };
  });

  return { phases: result };
};
