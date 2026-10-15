# Book library content

The `/books` shelf and `/books/[book]` reader load content from Postgres on each request. `library_book` is the source of truth for metadata and summaries. `library_book_asset` stores new image bytes. `src/lib/data/book-summaries.ts` contains shared types only. There is no static content fallback or startup import. Once the asset endpoint is deployed, new books and their images can be published without another app deployment.

The database connected through `DATABASE_URL` contains ten library books, all five Inspired part summaries, seven Sprint section summaries, nine The Mom Test summaries, 14 Continuous Discovery Habits chapter summaries, ten Evidence-Guided summaries, 18 User Story Mapping chapter summaries, five Outcomes Over Output chapter summaries, four Lean Analytics part summaries covering its 31 chapters, six The PAYTECH Book part summaries covering its 67 essays, and ten Storytelling with Data chapter summaries. These books use the `parts` array for mixed paragraphs, lists, and images, with no separate chapter entries. Problem Solving 101 and Make It Stick were removed from the shelves at the user's request. Their source PDFs and static covers remain available. The unrelated `pm_book` artifact catalog is unchanged.

Sprint follows the book's Set the Stage, Monday through Friday, and Liftoff sections. The setup summary also covers the introduction, and Liftoff includes the checklists and FAQs. Together they cover all 17 chapters. The supplied Sprint file is an ebook PDF without printed page numbers, so its ranges explicitly use PDF page numbers, such as `15–55 (PDF)`.

Sprint includes four original illustrations extracted from the supplied PDF: Flatiron Health's customer map (PDF page 68), Blue Bottle Coffee's solution sketch (123), Savioke's delivery storyboard detail (165), and the interview notes grid (223). They are saved under `static/books/sprint/` and referenced next to the relevant explanation. Captions and source ranges consistently use PDF page numbers.

The Mom Test follows all eight chapters and adds a closing Conclusion and Cheatsheet tab. The first tab also covers the introduction. References use the source's printed page numbers, from pages 3–120. In the supplied file, each printed page number is one higher than the PDF page number. The only embedded image is the cover, and the note symbols and cheatsheet work as text, so these summaries have no image blocks.

Continuous Discovery Habits uses one tab for each of the 14 instructional chapters across the book's three parts. Chapter 1 also covers the introduction. Chapter 15, What's Next, is omitted because it lists the author's newsletter, membership, courses, and coaching. Its supplied ebook has no printed pagination, so references explicitly use PDF pages, covering pages 10–186. No edition is identified in the source.

Eight original illustrations are saved under `static/books/continuous-discovery-habits/`: the opportunity solution tree (PDF page 26), outcome types (40), experience map (55), interview snapshot (69), opportunity branches (85), opportunity prioritization (99), story map (123), and assumption map (131). Each diagram appears beside its explanation and retains the source image's dimensions and bytes.

Evidence-Guided follows all nine chapters, then adds an Endnote tab about learning from reader feedback during the writing process. The promotional What's Next resource list is omitted. The first chapter also covers the introduction. The supplied ebook has no printed pagination, so references explicitly use PDF pages, covering pages 9–191. No edition is identified in the source.

Eight original Evidence-Guided diagrams are saved under `static/books/evidence-guided/`: the GIST model (PDF page 19), value exchange loop (34, with its caption on 35), metrics tree (41), Confidence Meter (68), AFTER model (92), GIST board (106), outcome roadmap (137), and idea flow (186). The images retain their original embedded bytes and dimensions and appear beside the relevant explanation.

User Story Mapping uses one tab for each of its 18 chapters, covering printed pages 1–258. Printed page 1 is PDF page 43 in the supplied file, so PDF page numbers are 42 higher throughout these chapters. The source identifies the first edition, September 2014. The author credit follows the cover: Jeff Patton with Peter Economy. Foreword contributors are not included as authors.

Ten original User Story Mapping illustrations are saved under `static/books/user-story-mapping/`: map anatomy (printed page 14), release slices (28), iterative development (61), the morning routine map (76), cake and cupcakes (135), the story lifecycle (143), the discovery team (159), Good-Better-Best (229), bundling stories (243), and release readiness (257). The source embeds JPEG 2000 images. These are losslessly converted to browser-compatible PNGs with their source pixels and dimensions preserved, and placed beside the relevant explanations.

Outcomes Over Output uses one tab for each of its five chapters. Source ranges cover PDF pages 7–50, including the chapter divider pages. The supplied ebook has no printed pagination, so its ranges explicitly say `(PDF)`. No edition is identified in the source. The afterword, reading list, acknowledgments, and author biography are outside the instructional summaries.

Three original Outcomes Over Output diagrams are saved under `static/books/outcomes-over-output/`: the Program Logic Model (PDF page 10), experiment loop (19), and journey map with boosters and blockers (31). The map without annotations on page 30 is omitted to avoid duplication. The extracted JPEGs retain their source bytes and dimensions, and appear beside the relevant explanations.

Lean Analytics follows its four parts: Stop Lying to Yourself (chapters 1–4, printed pages 1–42), Finding the Right Metric for Right Now (5–20, pages 43–270), Lines in the Sand (21–28, pages 271–350), and Putting Lean Analytics to Work (29–31, pages 351–392). Printed page numbers are 26 below PDF page numbers. The copyright page identifies the March 2013 first edition in hardcover and the February 2024 first edition in softcover. The supplied file is the 2024 softcover, not a new numbered edition. Its original benchmarks are summarized as contextual starting points, not universal current targets. Front-matter endorsements, promotional resources, author biographies, the reference appendix, and the index are outside the summaries.

The supplied Lean Analytics PDF was moved from Downloads to the raw book folder and renamed `PM - Lean Analytics - Alistair Croll and Benjamin Yoskovitz.pdf`, with its SHA-256 verified unchanged. Its front cover is rendered at `/books/lean-analytics/cover.jpg`. Five original diagrams are extracted under the same static folder: the analytics cycle (printed page 28), stages and gates (266), pricing revenue curve (280), enterprise stages (359), and intrapreneur stages (384). Diagram bytes and dimensions are preserved from the PDF.

The PAYTECH Book follows its six numbered parts and all 67 instructional essays: Payments Explained (chapters 1–11, PDF pages 36–89), Payment System Infrastructures and Money Transfer Technologies (12–20, 90–131), Payments Regulation and Compliance (21–31, 132–181), Blockchain Regulation Around the World (32–43, 182–235), Payments in Practice (44–55, 236–296), and Blueprint for Change (56–67, 297–361). Its supplied ebook PDF has no printed pagination, so references consistently say `(PDF)`. The copyright page identifies publication in 2020 without explicitly numbering an edition. The legal examples, market figures, adoption scenarios, and predictions retain that publication context. Endorsements, promotional pitches, editor biographies, contributor listings, and the index are outside the summaries. The source remains unchanged in `llm-wiki-vaults/wealth-builder/raw/Fintech - The PAYTECH Book - Chishti Craddock.pdf`.

Its cover reuses the landing page's landscape image at `/covers/the_paytech_book.jpg`. It counts as one shelf slot while displaying at 135% of the slot width, slightly in front of neighboring books. At row edges it expands inward, and on a single-slot rack it fits the slot without overlap. Its natural landscape proportions are preserved. Six original diagrams retain the embedded JPEG bytes and dimensions: the three blockchain payment models (PDF pages 192, 192, and 193), the many-sided payment platform (269), the proposed open banking ecosystem (319), and network patterns (334). The four editor portraits appear in cover order: Susanne Chishti, Tony Craddock, Robert Courtneidge, and Markos Zachariadis. Local portrait copies under `static/books/paytech/` come from [FINTECH Circle](https://fintechcircle.com/susanne-chishti), [The Payments Association EU](https://www.thepaymentsassociation.eu/team/tony-craddock), [QUBE Events](https://www.qubevents.com/npf-payments-speaker-profiles), and [Alba](https://alba.acg.edu/faculty/markos-zachariadis), respectively.

Storytelling with Data uses one tab for each of its ten chapters, covering printed pages 1–255. The first tab includes the introduction. Printed page 1 is PDF page 17, so PDF page numbers are 16 higher throughout the instructional content. The source identifies Cole Nussbaumer Knaflic as the sole author and a 2015 copyright, with the subtitle A Data Visualization Guide for Business Professionals. It does not explicitly number the edition, so no edition label is added. Chapter 10 retains advice on practice, iteration, and building team capability while omitting promotional resource listings. The foreword, acknowledgments, author biography, bibliography, index, and license text are outside the summaries. The supplied source PDF remains unchanged at the repository root and is excluded from Git by the root-PDF ignore rule. Its SHA-256 is `27dbd5cb6e62447b97854acf940c71229e3f86e76a777e3ae8b369fac5009450`.

The Storytelling with Data cover retains the PDF's original embedded JPEG bytes and dimensions. Thirteen original figures are rendered directly from the PDF's vector artwork as cropped PNGs at three pixels per PDF point: the storyboard (printed page 33), slopegraph (49), zero-baseline comparison (51), decluttering comparison (98), preattentive attributes (105), selective labels (115), action title and annotation (144), actual results and forecast (154), horizontal logic (182), pricing trends (198), annotated user growth (218), small multiples (233), and stacked survey bars (238). Crops preserve the chart titles, labels, and any source notes within each figure. Figure numbers and printed pages appear in the reader captions. The preattentive-attributes caption retains the book's attribution to Stephen Few. The author portrait comes from [Cole's official author page](https://www.storytellingwithyou.com/author), using its [portrait image](https://images.squarespace-cdn.com/content/v1/62b62c8a244ab024556b72a6/4539bb96-c5c6-458e-a66b-dbfb4f35c2cf/OPTION%2BA.jpg?format=500w). All fifteen images are stored in `library_book_asset`, verified byte-for-byte during import, and referenced through `/api/book-assets/<sha256>` URLs. They do not require deployed static copies once the endpoint is deployed.

Deploy the database-backed page code once. After that, adding or updating rows in the same database takes effect on the next page load without a redeploy. An already open page needs a refresh. The routes send `Cache-Control: private, no-store`.

## Adding or editing content

Content is developer-maintained through direct database updates. No in-app editor is provided.

### Publishing images without deployment

New book images belong in `library_book_asset`. This uses the existing Postgres connection and requires no additional account, storage service, dependency, or environment variable. Deploy the asset route once. After that, insert or update a book and import its images directly into the database.

1. Prepare covers, portraits, and figures under a temporary root, for example `tmp/book-import/books/new-book/cover.jpg`. In the book data, use matching `/books/new-book/cover.jpg` paths. A temporary `covers/` directory works for `/covers/...` references too.
2. Insert or update the `library_book` row with its metadata and summaries, following the existing direct-update process.
3. Preview the image import with `node scripts/import-book-assets.mjs new-book --asset-root tmp/book-import --dry-run`.
4. Publish with `node scripts/import-book-assets.mjs new-book --asset-root tmp/book-import`.
5. Verify the reader and its image URLs. Remove the temporary source assets when finished. No new files under `static/`, Git commit, or app redeployment are needed for this content change.

The importer loads `.env`, reads only the selected book, and processes its cover, legacy portrait, ordered portraits, and image blocks. It accepts PNG, JPEG, WebP, and GIF based on their byte signatures, with a 4 MiB maximum per image to leave room beneath [Netlify's buffered binary payload limits](https://docs.netlify.com/build/functions/configuration/). It resolves paths inside the specified asset root and rejects missing files, unsupported contents, and paths that escape that root.

Each asset ID is the SHA-256 digest of its original bytes. The importer stores the bytes and replaces local image paths with `/api/book-assets/<sha256>` URLs in a single transaction. Duplicate bytes share one asset. An existing digest is verified rather than overwritten. A failed file or database check leaves the book unchanged. External hosted URLs and existing asset URLs remain unchanged. Repeating a completed import makes no changes. To migrate an older book whose source images are still under `static/`, omit `--asset-root`.

The image route requires the same authenticated session as the book reader. Its immutable content URLs use private browser caching and ETags. A replacement image gets a new URL, so updated book data can point to it immediately without stale browser content. Keep image bytes out of the book JSON and out of shelf queries. Older static and hosted URLs remain supported. This storage is for book illustrations and covers, not whole source PDFs. Treat unreferenced asset cleanup as a separate deliberate operation.

The persistent importer is a scoped publishing utility, not a startup seed. It cannot repopulate books or overwrite later text edits. Regression checks for image preparation run with `node --test scripts/lib/book-assets.test.mjs`.

Each `library_book` row has:

- `id`: Stable URL slug, such as `inspired`.
- `title`, `subtitle`, `author`, `edition`: Reader metadata. Edition is optional.
- `author_portraits`: An ordered JSON array of `{ "name": "Author name", "src": "https://example.com/portrait.jpg", "credit": "Photographer name" }`. The optional credit is included in the image's accessible description and title. Portraits appear as rectangles side by side at the right of the back-arrow row, wrapping if needed on narrow screens.
- `author_image_path`: Legacy single-author portrait path or hosted image URL. Used when `author_portraits` is empty. Leave both empty for books without portraits.
- `cover_path`: Existing static path or hosted image URL.
- `shelf_span`: One or two book slots, defaulting to one. PAYTECH uses one slot with a landscape presentation that can overlap its neighbors. A span of two increases an ordinary cover's maximum width proportionally. Responsive grouping counts slots instead of just book entries, and clamps a two-slot cover to one on extremely narrow single-slot racks.
- `source`: JSON with `filename` and an optional `chapterUrl`.
- `parts`: An ordered JSON array of part summaries.
- `chapters`: An ordered JSON array of chapter summaries.
- `sort_order`: Shelf order. Rows contain at most five slots before adapting to narrower racks.
- `created_at`, `updated_at`: Timestamps. Set `updated_at = now()` when editing a row.

New books appear on the shelf as soon as their rows are inserted. Empty `parts` and `chapters` arrays display the existing “No summaries yet” state. The reader shows part tabs first, then chapter tabs, using the array order. Reading time is calculated from the summary text automatically.

Shelf rows reserve the rack's full responsive capacity, up to five equal slots. A partly filled row leaves empty slots on the right instead of enlarging its books. Ordinary covers are capped at 7rem wide, while narrower racks reduce their size as needed. A book with `shelf_span = 2` occupies two adjacent slots, including the gap between them. Rows fill to their responsive slot capacity before starting another rack, preserving book order instead of balancing the number of books across rows. At three slots, the current ten books appear as 3–3–3–1, placing PAYTECH on the third rack. PAYTECH still counts as one slot with a landscape cover that can overlap its neighbors.

Each cover uses its image's natural aspect ratio. The book outline and shadow follow the rendered image, with no fixed portrait frame or padding around a differently proportioned cover. The cover inherits the book's corner radius so both edges match. Books stay aligned along the bottom of each shelf, and `shelf_span` continues to control how many width slots a cover occupies.

A part uses this shape:

```json
{
  "number": 1,
  "label": "Part I",
  "title": "Part title",
  "pages": "1–30",
  "chapterRange": "Chapters 1–8",
  "summary": [
    "A paragraph in plain English.",
    { "type": "bullets", "items": ["First point", "Second point"] },
    { "type": "numbered", "items": ["First step", "Second step"] },
    {
      "type": "image",
      "src": "https://your-image-host.example/diagram.png",
      "alt": "Describe what the diagram explains.",
      "caption": "Diagram name (p. 16)",
      "width": 660,
      "height": 417
    }
  ]
}
```

Use unique `number` values within each array so tab IDs remain unique. Chapter objects follow `BookChapterSummary` in the shared type file. A chapter’s `summary` currently contains paragraphs only. Use the `parts` format for the reader’s mixed paragraphs, lists, and images.

Preserve casual English, avoid em dashes and semicolons in summary prose, and include accurate printed page ranges. If a source has no printed pagination, label its PDF page ranges explicitly. Reference original diagrams only where they help explain the content.

Keep summaries focused on the book's teachings. Omit author promotions, including pitches for courses, workshops, memberships, coaching, consulting, newsletters, book purchases, and reader reviews. Omit a section entirely when it contains only promotional resources. Author metadata, portraits, source references, and useful tools explained in the book remain appropriate.

For bullet and numbered items, write labels as plain text followed by a colon and a space, such as `Value risk: Will people use it?`. The reader automatically bolds the label and colon. Items without a label stay plain text.

Wrap an important phrase in `**double asterisks**` to bold it in a paragraph or list item. Keep emphasis selective. The reader renders text safely, without accepting HTML.

For local review before publishing, `src/lib/server/book-summary-drafts.private.json` can contain book IDs mapped to `{ "parts": [...] }`. The development server applies these draft parts after loading the book from Postgres. This ignored file is read only in development. Production continues to use database content. Publish approved parts through a direct database update, then remove the local draft entry.

Use database asset URLs for future covers, portraits, and diagrams so imports do not require deployment. Hosted HTTPS URLs also remain supported. New files served directly under `static/` still require deployment, while existing static image references continue to work.

The Inspired portrait is saved at `/books/authors/marty-cagan.jpg` from [Marty Cagan’s official SVPG profile](https://www.svpg.com/team/marty-cagan/). Hosted portrait URLs can be added or changed through `author_image_path` without redeploying.

Sprint has three hosted portraits in `author_portraits`, ordered Jake Knapp, John Zeratsky, and Braden Kowitz. The images come from the [publisher's official author pages](https://www.simonandschuster.com/books/Sprint/Jake-Knapp/9781501121746), with photo credits to Luke Knapp, Jessica Kaminski, and Graham Hancock respectively. Future portrait additions and changes through this field appear on refresh without redeployment.

The Mom Test has one hosted portrait in `author_portraits`: `https://www.momtestbook.com/rob.jpg`, from the [official book site](https://www.momtestbook.com/), credited to Dan Taylor. Its subtitle comes from the supplied cover. The source does not identify an edition, so no edition label is added.

Continuous Discovery Habits has a hosted Teresa Torres portrait in `author_portraits`, taken from her [official Product Talk author profile](https://www.producttalk.org/author/teresa/). Teresa is the book's sole author. The foreword contributors are not added as authors.

Evidence-Guided has a hosted Itamar Gilad portrait in `author_portraits`: `https://itamargilad.com/wp-content/uploads/2018/10/Itamar-small-300x291.jpg`, from his [official author profile](https://itamargilad.com/about/).

User Story Mapping has two hosted portraits, ordered Jeff Patton, then Peter Economy, matching the cover credit. They come from [Jeff Patton's official profile](https://jpattonassociates.com/about-jeff-patton-associates/) and [Peter Economy's official site](https://petereconomy.com/). Portrait URLs are `https://jpattonassociates.com/wp-content/uploads/2026/03/image-300x283.png` and `https://petereconomy.com/wp-content/uploads/2013/08/Peter_Economy_8x101-240x300.jpg` respectively.

Outcomes Over Output has one portrait of Joshua Seiden, extracted from PDF page 55 and saved at `/books/authors/joshua-seiden.jpg`. It retains the source image's bytes. The subtitle follows the supplied title page, and the author credit follows the cover.

Lean Analytics has two hosted portraits, ordered Alistair Croll then Benjamin Yoskovitz, matching the cover. They come from [Alistair Croll's official site](https://alistaircroll.com/) and [Ben Yoskovitz's Focused Chaos profile](https://www.focusedchaos.co/about). The portrait URLs are `https://storage.ghost.io/c/e7/4a/e74acef3-dc3c-4c4d-8cb4-6bfba9d6db0d/content/images/2026/02/headshot.jpg` and `https://substackcdn.com/image/fetch/w_300,h_300,c_fill,f_auto,q_auto:good/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0fa4159c-fca1-4dc0-8be6-4101d8485e1d_1200x1200.jpeg`.

## Schema setup

`drizzle/0031_book_library.sql` creates the table and is registered in the migration journal. The initial content was imported once in a verified transaction. There is no retained seed script that could overwrite later database edits.

`drizzle/0032_book_author_portrait.sql` adds the optional portrait field.

`drizzle/0033_book_author_portraits.sql` adds the ordered portrait array. The legacy portrait field remains supported.

`drizzle/0035_book_assets.sql` adds the image-byte table and its digest, media-type, and size constraints. Its schema is applied directly to the current database. Deploy the asset endpoint once to activate production image serving. Subsequent image imports only update the database.
