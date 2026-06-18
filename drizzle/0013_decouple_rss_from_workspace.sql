-- Decouple rss_source and trend_summary from workspace
-- These tables should be workspace-agnostic

-- Drop FK constraints first
ALTER TABLE "rss_source" DROP CONSTRAINT IF EXISTS "rss_source_workspace_id_workspace_id_fk";
ALTER TABLE "trend_summary" DROP CONSTRAINT IF EXISTS "trend_summary_workspace_id_workspace_id_fk";

-- Make workspace_id nullable (after FK is gone)
ALTER TABLE "rss_source" ALTER COLUMN "workspace_id" DROP NOT NULL;
ALTER TABLE "trend_summary" ALTER COLUMN "workspace_id" DROP NOT NULL;

-- Now safe to set to NULL
UPDATE "rss_source" SET "workspace_id" = NULL;
UPDATE "trend_summary" SET "workspace_id" = NULL;
