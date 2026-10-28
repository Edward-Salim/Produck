import 'dotenv/config';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { getLocalBookPdfStore } from './lib/book-blob-store.mjs';

const DATABASE_LIMIT = 20_000_000;
const MAX_PDF_BYTES = 500_000_000;

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
if (!info.isFile() || info.size < 5 || info.size > MAX_PDF_BYTES) {
  throw new Error('PDF must be a nonempty file no larger than 500 MB.');
}
const data = await readFile(path);
if (data.length > MAX_PDF_BYTES || data.subarray(0, 5).toString('ascii') !== '%PDF-') {
  throw new Error('Source must contain a PDF no larger than 500 MB.');
}
const sha256 = createHash('sha256').update(data).digest('hex');
const useBlob = data.length > DATABASE_LIMIT;
async function publishBlob() {
  const store = await getLocalBookPdfStore();
  await store.set(sha256, new Blob([data], { type: 'application/pdf' }), {
    onlyIfNew: true,
    metadata: { sha256, byteLength: data.length }
  });
  const stored = await store.getWithMetadata(sha256, { type: 'stream' });
  assert.ok(stored?.data, 'Uploaded PDF not found in Netlify Blobs');
  assert.equal(stored.metadata.sha256, sha256);
  assert.equal(stored.metadata.byteLength, data.length);
  const digest = createHash('sha256');
  let bytes = 0;
  for await (const chunk of stored.data) {
    digest.update(chunk);
    bytes += chunk.byteLength;
  }
  assert.equal(bytes, data.length);
  assert.equal(digest.digest('hex'), sha256);
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 15 });
try {
  const [existingBook] = await sql`select id from library_book where id = ${bookId}`;
  if (!existingBook) throw new Error(`Book not found: ${bookId}`);
  if (useBlob && !dryRun) await publishBlob();
  await sql.begin(async (tx) => {
    const [book] = await tx`select title, author from library_book where id = ${bookId} for update`;
    if (!book) throw new Error(`Book not found: ${bookId}`);
    const filename = `${book.title} - ${book.author}.pdf`.replace(/[\r\n"\\/]/g, '_');
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
        storage: useBlob ? 'netlify-blobs' : 'database',
        bytes: data.length,
        sha256,
        saved: !dryRun
      })
    );
  });
} finally {
  await sql.end();
}
