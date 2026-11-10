-- Retain the existing storage table so all PDF downloads keep their identifiers.
ALTER TABLE "library_book_pdf" DROP CONSTRAINT "library_book_pdf_signature_check";
--> statement-breakpoint
ALTER TABLE "library_book_pdf" ADD CONSTRAINT "library_book_pdf_signature_check" CHECK (
  "data" IS NULL
  OR substring("data" from 1 for 5) = decode('255044462d', 'hex')
  OR (
    lower("filename") LIKE '%.epub'
    AND substring("data" from 1 for 4) = decode('504b0304', 'hex')
    AND substring("data" from 31 for 28) = decode('6d696d65747970656170706c69636174696f6e2f657075622b7a6970', 'hex')
  )
);
