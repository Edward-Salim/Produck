CREATE TABLE IF NOT EXISTS "library_book_asset" (
  "id" text PRIMARY KEY NOT NULL,
  "content_type" text NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "library_book_asset_id_check" CHECK ("id" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "library_book_asset_type_check" CHECK ("content_type" IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  CONSTRAINT "library_book_asset_size_check" CHECK (octet_length("data") BETWEEN 1 AND 4194304)
);
