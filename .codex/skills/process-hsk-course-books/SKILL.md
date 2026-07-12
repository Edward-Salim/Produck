---
name: process-hsk-course-books
description: Import, transcribe, structure, and audit Xiaoyu’s Classroom content from New HSK Course PDFs into Produck’s native HSK Svelte page. Use when adding another HSK course level, correcting a classroom section from a book screenshot, checking Chinese or English fidelity, restoring cross-page continuations, building book-style tables and read-aloud groups, or changing HSK study-progress behavior.
---

# Process HSK Course Books

Preserve completed course levels unless the user explicitly asks to change them. Treat the PDF or supplied screenshot as the source of truth.

## Locate the implementation

Read the relevant files before editing:

- `src/routes/(app)/tools/chinese-game/hsk/+page.svelte`: level filters and page shell.
- `src/lib/components/chinese-game/HskTopicAccordion.svelte`: shared accordion, blocks, tables, dialogues, progress.
- `src/lib/components/chinese-game/ElegantCurlyText.svelte`: curly-quote rendering and Hanzi quote spacing.
- `src/lib/data/hsk1-course.ts`, `hsk2-course.ts`, or the requested level file: lesson and classroom data.
- `src/routes/api/preferences/+server.ts` and `src/lib/server/db/schema.ts`: persisted studied topics.

Follow the established types instead of embedding PDF screenshots or page images.

## Extract and inventory a PDF

1. Inspect the PDF with `pdfinfo`.
2. Extract OCR text with `pdftotext -layout` into a temporary file.
3. Find every `Xiaoyu’s Classroom` / `小语讲堂` marker and build the lesson-topic inventory from the contents pages.
4. Inspect the text before and after every marker. A classroom section frequently continues onto the following PDF page.
5. Render or inspect source pages when OCR is ambiguous, especially for Hanzi, punctuation, tables, pinyin, glosses, and page breaks.
6. Delete temporary extraction artifacts after use.

Do not assume a section ends at a page break. Continue until the next exercise or content section begins.

## Transcribe faithfully

- Copy Chinese and English as printed. Do not paraphrase translations.
- Preserve title numbering such as `(1)`, `(2)`, and exact labels such as `Expression of Time (1)`.
- Use Latin curly quotation marks `“…”`, including around Hanzi in English text.
- Let `ElegantCurlyText` provide readable spacing around quoted Hanzi. Do not substitute straight quotes.
- Preserve inline pinyin or English glosses such as `（yǒu, have）` and `（māma, mother）` when present.
- Preserve punctuation, slashes, ellipses, arrows, capitalization, and the book’s terminology.
- Do not invent headings such as “Basic structure.” Include `Basic structure:` inline only when the book contains it.
- Do not add a separate pattern card. Keep structures in the explanatory paragraph.

When a screenshot contradicts existing data, update the data to the screenshot and check adjacent pages for continuations.

## Structure classroom content

Use native data structures:

- Use `blocks` when rules and examples occur in ordered groups.
- Put Chinese in `zh`, the matching printed English in `en`, and examples in `examples`.
- Each block with examples renders its own `大声朗读 · Read aloud` label and restarts numbering.
- Use `exampleLabel: '朗读对话 · Read the dialogues aloud'` for dialogue groups.
- Represent dialogues as `{ a: '…', b: '…' }`; never flatten `A：… B：…` into one string.
- All A/B dialogue lines must render vertically.
- Keep `Read aloud` and `Read the dialogues aloud` as separate groups when the book does.
- The user does not want `完成对话 · Complete the dialogues` exercises imported. Ignore them unless explicitly requested.
- Source paragraphs ending in `For example:` should still use the page’s current `Read aloud` presentation for the examples.

## Reproduce tables

- Parse tables into `TopicTable`; never use the PDF page itself as content.
- Add `readAloud: true` when the source shows `大声朗读 · Read aloud` above a table.
- Do not add a header row when the source has none.
- Use `fluidColumns` for independent rows with different column counts.
- Use `centerCells` only when the source centers the table content.
- Combine multiline cells when the source has one body row rather than inventing horizontal separators.
- Preserve the book’s pinyin, Hanzi, English, numerical notation, and blank-cell structure.
- Keep wide tables horizontally scrollable on mobile without a visible page-level scrollbar.

## Add a new HSK level

1. Create `src/lib/data/hskN-course.ts` using the exported shared data types.
2. Define all lessons, printed page labels, and classroom topics.
3. Create a guide for every classroom topic; verify there are no unresolved keys.
4. Add native tables where required.
5. Enable the level filter only when its content exists.
6. Keep level accordions mounted and hide inactive ones so switching levels does not refetch studied progress.
7. Persist the selected HSK filter in local storage.
8. Give each level an independent studied-topic preference field in the API and schema.
9. Make the completed level filter bright gold when selected and muted gold when not selected.
10. Keep open-topic local-storage keys level-specific.

## Preserve UI conventions

- Topic number circles toggle studied state and persist to the database.
- Keep the circle visually small but provide an enlarged touch target.
- Keep circles top-aligned on mobile and desktop.
- Do not show PDF page numbers in accordion headers.
- Show lesson text without a badge design.
- Use slide animation for opening and closing sections.
- Remember the opened section after refresh.
- Do not add hover effects where the existing HSK design intentionally omits them.
- Keep explanations non-italic.
- Maintain mobile spacing and horizontal table swiping.

## Audit and verify

Before handing off:

1. Compare each edited section against the full source span, including the next page.
2. Confirm exact Chinese, exact English, all read-aloud items, glosses, and table cells.
3. Search for flattened `A：` / `B：` dialogue strings and convert them to structured dialogue objects.
4. Programmatically confirm every classroom title resolves to a guide.
5. Run `pnpm check` and `git diff --check`.
6. Do not run Prettier when the user says it is unnecessary.
7. Avoid modifying unrelated dirty-worktree files.

When reporting completion, state what source content changed and whether validation passed. Do not claim a full-book audit if only one screenshot or section was checked.
