import { sql } from 'drizzle-orm';

let tableReady = false;

export async function ensureChineseReadingStoryTable(database: {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
}) {
  if (tableReady) return;

  const existing = await database.execute(sql`
    SELECT to_regclass('public.chinese_reading_story') AS "exists"
  `);
  const rows = Array.isArray(existing) ? (existing as { exists: string | null }[]) : [];

  if (rows[0]?.exists) {
    tableReady = true;
    return;
  }

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

  tableReady = true;
}
