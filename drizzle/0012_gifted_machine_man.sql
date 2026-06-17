ALTER TABLE "rss_source" ADD COLUMN "total_screened" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rss_source" ADD COLUMN "total_kept" integer DEFAULT 0 NOT NULL;