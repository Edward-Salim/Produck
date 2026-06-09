import { config } from 'dotenv'; config();
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { idea, story, activity } from '../src/lib/server/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 });
const db = drizzle(client);

async function main() {
  const ideas = await db.select().from(idea);
  console.log(`Found ${ideas.length} ideas\n`);

  for (const i of ideas) {
    const activities = await db.select().from(activity).where(eq(activity.ideaId, i.id));
    const activityIds = activities.map(a => a.id);

    if (activityIds.length === 0) {
      console.log(`${i.title}: 0 stories, 0 assumptions`);
      continue;
    }

    const allStories = await db.select().from(story);
    const ideaStories = allStories.filter(s => activityIds.includes(s.activityId));
    const totalAssumptions = ideaStories.reduce((c,s) => c + (Array.isArray(s.assumptions) ? s.assumptions.length : 0), 0);

    console.log(`${i.title}: ${ideaStories.length} stories, ${totalAssumptions} assumptions`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
