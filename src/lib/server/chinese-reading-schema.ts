import { sql } from 'drizzle-orm';

let tableReady = false;

export async function ensureChineseReadingStoryTable(database: {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
}) {
  if (tableReady) return;

  const existingStory = await database.execute(sql`
    SELECT to_regclass('public.chinese_reading_story') AS "exists"
  `);
  const storyRows = Array.isArray(existingStory)
    ? (existingStory as { exists: string | null }[])
    : [];

  if (!storyRows[0]?.exists) {
    await database.execute(sql`
      CREATE TABLE "chinese_reading_story" (
        "id" serial PRIMARY KEY NOT NULL,
        "level" integer NOT NULL,
        "reading" jsonb NOT NULL,
        "model" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "used_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await database.execute(sql`
      CREATE INDEX "chinese_reading_story_level_idx"
        ON "chinese_reading_story" ("level")
    `);
  }

  const existingJob = await database.execute(sql`
    SELECT to_regclass('public.chinese_reading_job') AS "exists"
  `);
  const jobRows = Array.isArray(existingJob) ? (existingJob as { exists: string | null }[]) : [];

  if (!jobRows[0]?.exists) {
    await database.execute(sql`
      CREATE TABLE "chinese_reading_job" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "app_user"("id") ON DELETE cascade,
        "level" integer NOT NULL,
        "status" text DEFAULT 'queued' NOT NULL,
        "reading" jsonb,
        "unknown_words" jsonb DEFAULT '[]',
        "error" text,
        "model" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await database.execute(sql`
      CREATE INDEX "chinese_reading_job_user_idx"
        ON "chinese_reading_job" ("user_id")
    `);

    await database.execute(sql`
      CREATE INDEX "chinese_reading_job_status_idx"
        ON "chinese_reading_job" ("status")
    `);
  }

  tableReady = true;
}
