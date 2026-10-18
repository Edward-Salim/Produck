CREATE TABLE IF NOT EXISTS "library_book_pdf" (
  "book_id" text PRIMARY KEY REFERENCES "library_book"("id") ON DELETE CASCADE,
  "filename" text NOT NULL,
  "sha256" text NOT NULL,
  "byte_length" integer NOT NULL,
  "data" bytea NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "library_book_pdf_digest_check" CHECK ("sha256" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "library_book_pdf_size_check" CHECK (
    "byte_length" = octet_length("data") AND "byte_length" BETWEEN 5 AND 20000000
  ),
  CONSTRAINT "library_book_pdf_signature_check" CHECK (substring("data" FROM 1 FOR 5) = decode('255044462d', 'hex'))
);
