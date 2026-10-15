import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { bookAssetContentType, MAX_BOOK_ASSET_BYTES, prepareBookAssets } from './book-assets.mjs';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
  'base64'
);

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'produck-book-assets-test-'));
  await mkdir(join(root, 'books', 'example'), { recursive: true });
  await writeFile(join(root, 'books', 'example', 'cover.png'), png);
  return root;
}

test('detects image bytes and rejects unsupported content', () => {
  assert.equal(bookAssetContentType(png), 'image/png');
  assert.equal(bookAssetContentType(Buffer.from('ffd8ffe0', 'hex')), 'image/jpeg');
  assert.equal(bookAssetContentType(Buffer.from('GIF89a')), 'image/gif');
  assert.equal(bookAssetContentType(Buffer.from('RIFF0000WEBP')), 'image/webp');
  assert.throws(() => bookAssetContentType(Buffer.from('<svg/>')), /must be PNG/);
  assert.throws(() => bookAssetContentType(Buffer.alloc(0)), /must be PNG/);
});

test('deduplicates repeated images, preserves text and hosted URLs, and leaves input untouched', async () => {
  const root = await fixture();
  const book = {
    cover_path: '/books/example/cover.png',
    author_image_path: null,
    author_portraits: [{ name: 'Author', src: 'https://example.com/author.jpg' }],
    parts: [
      {
        summary: [
          'Keep the teaching unchanged.',
          { type: 'image', src: '/books/example/cover.png', width: 1, height: 1, alt: 'Example' },
          { type: 'image', src: '/books/example/cover.png?v=2' }
        ]
      }
    ],
    chapters: []
  };
  const before = structuredClone(book);
  const result = await prepareBookAssets(book, root);
  assert.deepEqual(book, before);
  assert.equal(result.assets.length, 1);
  assert.deepEqual(result.assets[0].data, png);
  assert.match(result.book.cover_path, /^\/api\/book-assets\/[a-f0-9]{64}$/);
  assert.equal(result.book.parts[0].summary[1].src, result.book.cover_path);
  assert.equal(result.book.parts[0].summary[2].src, result.book.cover_path);
  assert.equal(result.book.parts[0].summary[1].alt, 'Example');
  assert.equal(result.book.parts[0].summary[0], before.parts[0].summary[0]);
  assert.deepEqual(result.book.author_portraits, before.author_portraits);
  const second = await prepareBookAssets(result.book, join(root, 'removed-temporary-root'));
  assert.equal(second.assets.length, 0);
  assert.equal(second.replacements.size, 0);
  assert.deepEqual(second.book, result.book);
});

test('rejects traversal, missing files, invalid image contents, and oversized files', async () => {
  const root = await fixture();
  for (const path of ['/books/../../outside.png', '/books/%2e%2e/%2e%2e/outside.png']) {
    await assert.rejects(prepareBookAssets({ cover_path: path }, root), /inside the asset root/);
  }
  await assert.rejects(prepareBookAssets({ cover_path: '/books/missing.png' }, root), /ENOENT/);
  await writeFile(join(root, 'books', 'example', 'fake.png'), '<svg/>');
  await assert.rejects(
    prepareBookAssets({ cover_path: '/books/example/fake.png' }, root),
    /must be PNG/
  );
  await writeFile(
    join(root, 'books', 'example', 'large.png'),
    Buffer.alloc(MAX_BOOK_ASSET_BYTES + 1)
  );
  await assert.rejects(
    prepareBookAssets({ cover_path: '/books/example/large.png' }, root),
    /no larger than 4 MiB/
  );
});
