import { dailyActivity } from '$lib/server/db/schema.js';
import { db } from '$lib/server/db/index.js';
import { asc, desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

function stageFromLevel(level: number) {
  if (!Number.isInteger(level)) return 1;
  return Math.min(3, Math.max(1, level));
}

export const load: PageServerLoad = async () => {
  const rows = await db
    .select({
      id: dailyActivity.id,
      category: dailyActivity.category,
      categoryDescription: dailyActivity.categoryDescription,
      name: dailyActivity.name,
      detail: dailyActivity.detail,
      icon: dailyActivity.icon,
      level: dailyActivity.level,
      sortOrder: dailyActivity.sortOrder
    })
    .from(dailyActivity)
    .where(eq(dailyActivity.enabled, true))
    .orderBy(asc(dailyActivity.category), desc(dailyActivity.level), asc(dailyActivity.sortOrder));

  const activityGroups = rows.reduce<
    {
      category: string;
      description: string;
      activities: { id: number; name: string; detail: string; icon: string; level: number }[];
    }[]
  >((groups, row) => {
    let group = groups.find((item) => item.category === row.category);

    if (!group) {
      group = {
        category: row.category,
        description: row.categoryDescription,
        activities: []
      };
      groups.push(group);
    }

    group.activities.push({
      id: row.id,
      name: row.name,
      detail: row.detail,
      icon: row.icon,
      level: stageFromLevel(Number(row.level))
    });

    return groups;
  }, []);

  return { activityGroups };
};

export const actions: Actions = {
  updateLevel: async ({ request }) => {
    const formData = await request.formData();
    const activityId = Number(formData.get('activityId'));
    const level = Number(formData.get('level'));

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return fail(400, { message: 'Invalid activity' });
    }

    if (!Number.isInteger(level) || level < 1 || level > 3) {
      return fail(400, { message: 'Invalid stage' });
    }

    await db
      .update(dailyActivity)
      .set({ level, updatedAt: new Date() })
      .where(eq(dailyActivity.id, activityId));

    return { success: true };
  }
};
