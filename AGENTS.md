# Frameworks

Framework aliases and diagram content are developer-maintained through direct database updates. Treat seed scripts as temporary import tools and remove them after the data is loaded. Keep read-only framework diagrams free of user inputs and localStorage persistence.

# Books

Read `docs/book-library.md` before importing books. Publish new covers, portraits, and figures to `library_book_asset` with `scripts/import-book-assets.mjs`, using a temporary asset root for new imports. Store the resulting `/api/book-assets/<sha256>` URLs in `library_book`. Future book imports must not depend on adding deployed static files. Keep imports developer-maintained through direct database updates.
