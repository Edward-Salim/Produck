import 'dotenv/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { publishBookFile } from './lib/book-blob-store.mjs';
import { inspectBookSource } from './lib/book-source.mjs';
import { MAX_BOOK_FILE_BYTES } from '../src/lib/server/book-storage.js';

const DATABASE_LIMIT = 20_000_000;

const [bookId, input, ...options] = process.argv.slice(2);
if (
  !bookId ||
  !input ||
  !/^[a-z0-9-]+$/.test(bookId) ||
  options.some((arg) => arg !== '--dry-run')
) {
  throw new Error(
    'Usage: node scripts/import-book-file.mjs <book-id> <source.pdf|source.epub> [--dry-run]'
  );
}
const dryRun = options.includes('--dry-run');
const path = resolve(input);
const info = await stat(path);
if (!info.isFile() || info.size < 5 || info.size > MAX_BOOK_FILE_BYTES) {
  throw new Error('Source must be a nonempty file no larger than 500 MB.');
}
const data = await readFile(path);
if (data.length > MAX_BOOK_FILE_BYTES) {
  throw new Error('Source must be no larger than 500 MB.');
}
const format = inspectBookSource(data);
const sha256 = createHash('sha256').update(data).digest('hex');
const useBlob = data.length > DATABASE_LIMIT;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 15 });
try {
  const [existingBook] = await sql`select id from library_book where id = ${bookId}`;
  if (!existingBook) throw new Error(`Book not found: ${bookId}`);
  if (useBlob && !dryRun) await publishBookFile(sha256, data);
  await sql.begin(async (tx) => {
    const [book] = await tx`select title, author from library_book where id = ${bookId} for update`;
    if (!book) throw new Error(`Book not found: ${bookId}`);
    const filename = `${book.title} - ${book.author}${format.extension}`.replace(
      /[\r\n"\\/]/g,
      '_'
    );
    if (!dryRun) {
      await tx`insert into library_book_pdf (book_id, filename, sha256, byte_length, data, blob_key)
        values (${bookId}, ${filename}, ${sha256}, ${data.length}, ${useBlob ? null : data}, ${useBlob ? sha256 : null})
        on conflict (book_id) do update set filename = excluded.filename, sha256 = excluded.sha256,
          byte_length = excluded.byte_length, data = excluded.data, blob_key = excluded.blob_key, updated_at = now()
        where library_book_pdf.sha256 <> excluded.sha256 or library_book_pdf.filename <> excluded.filename
          or library_book_pdf.blob_key is distinct from excluded.blob_key`;
      const [stored] =
        await tx`select sha256, data, blob_key from library_book_pdf where book_id = ${bookId}`;
      assert.equal(stored.sha256, sha256);
      assert.equal(stored.blob_key, useBlob ? sha256 : null);
      assert.deepEqual(stored.data, useBlob ? null : data);
    }
    console.log(
      JSON.stringify({
        book: bookId,
        dryRun,
        storage: useBlob ? 'cloudflare-kv' : 'database',
        bytes: data.length,
        sha256,
        saved: !dryRun
      })
    );
  });
} finally {
  await sql.end();
}
