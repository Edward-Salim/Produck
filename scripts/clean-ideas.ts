import { config } from 'dotenv';
config();

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { idea, actor, activity, storyMapTask, story } from '../src/lib/server/db/schema.js';
import { eq, ne, inArray } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL not set');

const client = postgres(DATABASE_URL, { ssl: 'require', max: 1 });
const db = drizzle(client);

async function main() {
  const kowl = await db.select().from(idea).where(eq(idea.title, 'K-Owl LMS Platform'));

  if (kowl.length === 0) {
    console.log('K-Owl LMS Platform not found. Available ideas:');
    const all = await db.select({ id: idea.id, title: idea.title }).from(idea);
    console.table(all);
    process.exit(1);
  }

  const kowlId = kowl[0].id;
  console.log(`Keeping: "${kowl[0].title}" (id: ${kowlId})`);

  const others = await db
    .select({ id: idea.id, title: idea.title })
    .from(idea)
    .where(ne(idea.id, kowlId));
  const otherIds = others.map((i) => i.id);

  console.log(`Deleting ${others.length} ideas: ${others.map((i) => i.title).join(', ')}`);

  if (otherIds.length === 0) {
    console.log('Nothing to delete.');
    process.exit(0);
  }

  const otherActivities = await db
    .select({ id: activity.id })
    .from(activity)
    .where(inArray(activity.ideaId, otherIds));
  const otherActivityIds = otherActivities.map((a) => a.id);

  if (otherActivityIds.length > 0) {
    await db.delete(story).where(inArray(story.activityId, otherActivityIds));
    await db.delete(storyMapTask).where(inArray(storyMapTask.activityId, otherActivityIds));
  }

  await db.delete(activity).where(inArray(activity.ideaId, otherIds));
  await db.delete(actor).where(inArray(actor.ideaId, otherIds));
  await db.delete(idea).where(inArray(idea.id, otherIds));

  console.log('Done. Only K-Owl LMS Platform remains.');
  process.exit(0);
}

main();
