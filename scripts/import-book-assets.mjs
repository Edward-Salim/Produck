import 'dotenv/config';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { prepareBookAssets } from './lib/book-assets.mjs';

const args = process.argv.slice(2);
const bookId = args.shift();
let assetRoot = resolve('static');
let dryRun = false;
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--dry-run') dryRun = true;
  else if (args[index] === '--asset-root' && args[index + 1]) assetRoot = resolve(args[++index]);
  else throw new Error(`Unknown or incomplete option: ${args[index]}`);
}
if (!bookId || !/^[a-z0-9-]+$/.test(bookId)) {
  throw new Error(
    'Usage: node scripts/import-book-assets.mjs <book-id> [--asset-root <directory>] [--dry-run]'
  );
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 15 });
try {
  await sql.begin(async (tx) => {
    const [original] = await tx`select * from library_book where id = ${bookId} for update`;
    if (!original) throw new Error(`Book not found: ${bookId}`);
    const { book, assets, replacements } = await prepareBookAssets(original, assetRoot);
    const report = {
      book: bookId,
      dryRun,
      uniqueImages: assets.length,
      referencesChanged: replacements.size,
      totalBytes: assets.reduce((sum, asset) => sum + asset.data.length, 0)
    };
    if (dryRun || !replacements.size) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    for (const asset of assets) {
      await tx`insert into library_book_asset (id, content_type, data)
        values (${asset.id}, ${asset.contentType}, ${asset.data}) on conflict (id) do nothing`;
      const [stored] =
        await tx`select content_type, data from library_book_asset where id = ${asset.id}`;
      assert.equal(stored.content_type, asset.contentType);
      assert.deepEqual(stored.data, asset.data);
    }
    await tx`update library_book set cover_path = ${book.cover_path},
      author_image_path = ${book.author_image_path},
      author_portraits = ${tx.json(book.author_portraits)},
      parts = ${tx.json(book.parts)}, chapters = ${tx.json(book.chapters)}, updated_at = now()
      where id = ${bookId}`;
    const [stored] = await tx`select * from library_book where id = ${bookId}`;
    assert.deepEqual(
      { ...stored, updated_at: original.updated_at },
      { ...book, updated_at: original.updated_at }
    );
    console.log(JSON.stringify({ ...report, saved: true }, null, 2));
  });
} finally {
  await sql.end();
}
