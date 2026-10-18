import 'dotenv/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';

const [bookId, input, ...options] = process.argv.slice(2);
if (
  !bookId ||
  !input ||
  !/^[a-z0-9-]+$/.test(bookId) ||
  options.some((arg) => arg !== '--dry-run')
) {
  throw new Error('Usage: node scripts/import-book-pdf.mjs <book-id> <source.pdf> [--dry-run]');
}
const dryRun = options.includes('--dry-run');
const path = resolve(input);
const info = await stat(path);
if (!info.isFile() || info.size < 5 || info.size > 20_000_000) {
  throw new Error('PDF must be a nonempty file no larger than 20 MB.');
}
const data = await readFile(path);
if (data.length > 20_000_000 || data.subarray(0, 5).toString('ascii') !== '%PDF-') {
  throw new Error('Source must contain a PDF no larger than 20 MB.');
}
const sha256 = createHash('sha256').update(data).digest('hex');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 15 });
try {
  await sql.begin(async (tx) => {
    const [book] = await tx`select title, author from library_book where id = ${bookId} for update`;
    if (!book) throw new Error(`Book not found: ${bookId}`);
    const filename = `${book.title} - ${book.author}.pdf`.replace(/[\r\n"\\/]/g, '_');
    if (!dryRun) {
      await tx`insert into library_book_pdf (book_id, filename, sha256, byte_length, data)
        values (${bookId}, ${filename}, ${sha256}, ${data.length}, ${data})
        on conflict (book_id) do update set filename = excluded.filename, sha256 = excluded.sha256,
          byte_length = excluded.byte_length, data = excluded.data, updated_at = now()
        where library_book_pdf.sha256 <> excluded.sha256 or library_book_pdf.filename <> excluded.filename`;
      const [stored] =
        await tx`select sha256, data from library_book_pdf where book_id = ${bookId}`;
      assert.equal(stored.sha256, sha256);
      assert.deepEqual(stored.data, data);
    }
    console.log(
      JSON.stringify({ book: bookId, dryRun, bytes: data.length, sha256, saved: !dryRun })
    );
  });
} finally {
  await sql.end();
}
