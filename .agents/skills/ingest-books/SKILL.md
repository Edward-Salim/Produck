---
name: ingest-books
description: Import source PDFs into Produck's bookshelf with original summaries, images, and downloadable originals.
---

# Ingest books

Inspect the current book types, schema, reader, and import utilities in the codebase for implementation details. Do not duplicate their schemas, limits, or storage logic here.

- Read the supplied PDF and write the summaries yourself. Do not use external model APIs for authorship. Confirm metadata from the source and include an edition only when explicitly identified.
- Follow the natural chapters or parts, including useful introductions and closing sections. Preserve full titles and original numbering without inventing numbers for unnumbered sections. Omit endorsements, promotions, acknowledgments, indexes, and reference lists. Keep dated claims in their publication context.
- Use casual English, paragraphs, useful lists, and selective `**bold**`. Avoid em dashes and semicolons. Give accurate printed page ranges, or label PDF page ranges with `(PDF)` when printed pagination is absent. Use mixed summary blocks in `parts`, leaving `chapters` empty.
- Link useful book stories and examples to suitable phrases through the reader's story popups. Write concise, source-grounded retellings of what happened, without an added lesson or connection. Identify hypothetical examples as such and preserve the main summary text.
- Include the original cover and useful figures beside their explanations. Obtain portraits from official author or publisher sources. Preserve image quality and proportions. Omit standalone illustration credits and attribution suffixes from summaries and captions. Captions should describe figures without page references.
- Keep imports developer-maintained through direct database updates. Publish new images with `scripts/import-book-assets.mjs` using a temporary asset root. Store its `/api/book-assets/<sha256>` URLs in the book record. New imports must not depend on deployed static files.
- Ensure every supplied PDF has a copy in `book-sources` under the appropriate shelf folder, named `Book Title - Author.pdf`. If it is not already there, copy it without changing or moving the original. Verify that the copy matches the original and record its filename in the library. Attach the unchanged PDF with `scripts/import-book-pdf.mjs`. Preserve unrelated books and shelf order.
- Verify section coverage, the authenticated reader, images, and PDF download integrity. Report unavailable checks honestly. Remove temporary extraction files, staged assets, and one-off import scripts after verification, keeping the source PDF and reusable utilities.
