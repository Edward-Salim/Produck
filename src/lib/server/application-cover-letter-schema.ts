import { sql } from 'drizzle-orm';

let tableReady = false;

export async function ensureApplicationCoverLetterJobTable(database: {
  execute: (query: ReturnType<typeof sql>) => Promise<unknown>;
}) {
  if (tableReady) return;

  const existing = await database.execute(sql`
    SELECT to_regclass('public.application_cover_letter_job') AS "exists"
  `);
  const rows = Array.isArray(existing) ? (existing as { exists: string | null }[]) : [];

  if (rows[0]?.exists) {
    tableReady = true;
    return;
  }

  await database.execute(sql`
    CREATE TABLE "application_cover_letter_job" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL REFERENCES "app_user"("id") ON DELETE cascade,
      "status" text DEFAULT 'queued' NOT NULL,
      "dump" text NOT NULL,
      "result" jsonb,
      "error" text,
      "model" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
}
