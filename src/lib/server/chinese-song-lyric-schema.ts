import { sql } from 'drizzle-orm';

let tableReady = false;

export async function ensureChineseSongLyricImportJobTable(database: {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
}) {
  if (tableReady) return;

  const existingJob = await database.execute(sql`
    SELECT to_regclass('public.chinese_song_lyric_import_job') AS "exists"
  `);
  const jobRows = Array.isArray(existingJob) ? (existingJob as { exists: string | null }[]) : [];

  if (!jobRows[0]?.exists) {
    await database.execute(sql`
      CREATE TABLE "chinese_song_lyric_import_job" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "app_user"("id") ON DELETE cascade,
        "status" text DEFAULT 'queued' NOT NULL,
        "raw_song" text NOT NULL,
        "song_slug" text,
        "error" text,
        "model" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await database.execute(sql`
      CREATE INDEX "chinese_song_lyric_import_job_user_idx"
        ON "chinese_song_lyric_import_job" ("user_id")
    `);

    await database.execute(sql`
      CREATE INDEX "chinese_song_lyric_import_job_status_idx"
        ON "chinese_song_lyric_import_job" ("status")
    `);
  }

  tableReady = true;
}
