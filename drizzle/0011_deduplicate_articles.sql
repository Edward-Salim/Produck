-- Remove duplicate articles, keeping the one with the smallest id per URL
DELETE FROM "rss_article"
WHERE "id" NOT IN (
  SELECT MIN("id")
  FROM "rss_article"
  GROUP BY "url"
);--> statement-breakpoint
ALTER TABLE "trend_summary" ADD COLUMN "window" text DEFAULT 'morning' NOT NULL;--> statement-breakpoint
ALTER TABLE "rss_article" ADD CONSTRAINT "rss_article_url_unique" UNIQUE("url");
