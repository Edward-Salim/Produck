CREATE TABLE IF NOT EXISTS "library_book" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "subtitle" text DEFAULT '' NOT NULL,
  "author" text NOT NULL,
  "edition" text,
  "cover_path" text NOT NULL,
  "source" jsonb NOT NULL,
  "parts" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
