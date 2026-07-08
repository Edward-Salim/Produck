CREATE TABLE "chinese_song_lyric" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"song" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chinese_song_lyric_slug_unique" UNIQUE("slug")
);
