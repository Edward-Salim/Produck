ALTER TABLE "library_book_pdf" ADD COLUMN IF NOT EXISTS "blob_key" text;
--> statement-breakpoint
ALTER TABLE "library_book_pdf" ALTER COLUMN "data" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "library_book_pdf" DROP CONSTRAINT "library_book_pdf_size_check";
--> statement-breakpoint
ALTER TABLE "library_book_pdf" DROP CONSTRAINT "library_book_pdf_signature_check";
--> statement-breakpoint
ALTER TABLE "library_book_pdf" ADD CONSTRAINT "library_book_pdf_size_check" CHECK (
  ("data" IS NOT NULL AND "blob_key" IS NULL AND "byte_length" = octet_length("data") AND "byte_length" BETWEEN 5 AND 20000000)
  OR
  ("data" IS NULL AND "blob_key" IS NOT NULL AND "blob_key" = "sha256" AND "byte_length" BETWEEN 5 AND 500000000)
);
--> statement-breakpoint
ALTER TABLE "library_book_pdf" ADD CONSTRAINT "library_book_pdf_signature_check" CHECK (
  "data" IS NULL OR substring("data" from 1 for 5) = decode('255044462d', 'hex')
);
