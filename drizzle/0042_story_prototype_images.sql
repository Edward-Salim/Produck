ALTER TABLE "story"
  ADD COLUMN IF NOT EXISTS "prototype_images" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "story_prototype_asset" (
  "project_id" integer NOT NULL REFERENCES "project"("id") ON DELETE CASCADE,
  "id" text NOT NULL,
  "content_type" text NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "story_prototype_asset_pk" PRIMARY KEY ("project_id", "id"),
  CONSTRAINT "story_prototype_asset_id_check" CHECK ("id" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "story_prototype_asset_type_check"
    CHECK ("content_type" IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  CONSTRAINT "story_prototype_asset_size_check"
    CHECK (octet_length("data") BETWEEN 1 AND 10485760)
);
