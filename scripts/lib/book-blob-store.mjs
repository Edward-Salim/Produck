import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { BOOK_CHUNK_SIZE, bookChunkKey } from '../../src/lib/server/book-storage.js';

export async function publishBookFile(sha256, data) {
  const config = JSON.parse(
    await readFile(new URL('../../wrangler.jsonc', import.meta.url), 'utf8')
  );
  const namespace = config.kv_namespaces.find(({ binding }) => binding === 'BOOK_FILES');
  const wrangler = fileURLToPath(
    new URL('../../node_modules/wrangler/bin/wrangler.js', import.meta.url)
  );
  const token =
    process.env.CLOUDFLARE_API_TOKEN ??
    JSON.parse(
      execFileSync(process.execPath, [wrangler, 'auth', 'token', '--json'], { encoding: 'utf8' })
    ).token;
  assert.ok(token && namespace, 'Sign in with Wrangler and configure the BOOK_FILES binding.');

  const base = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/storage/kv/namespaces/${namespace.id}/values`;
  async function access(method, key, body) {
    return fetch(`${base}/${encodeURIComponent(key)}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body,
      signal: AbortSignal.timeout(120_000)
    });
  }

  for (let offset = 0; offset < data.length; offset += BOOK_CHUNK_SIZE) {
    const key = bookChunkKey(sha256, offset / BOOK_CHUNK_SIZE);
    const chunk = data.subarray(offset, offset + BOOK_CHUNK_SIZE);
    const existing = await access('GET', key);
    if (existing.ok) {
      assert.ok(
        chunk.equals(Buffer.from(await existing.arrayBuffer())),
        `KV chunk differs: ${key}`
      );
      continue;
    }
    assert.equal(existing.status, 404, `Could not read KV chunk ${key}`);
    await existing.body?.cancel();
    const upload = await access('PUT', key, chunk);
    assert.ok(upload.ok, `Cloudflare rejected KV chunk ${key}: ${upload.status}`);
    const stored = await access('GET', key);
    assert.ok(stored.ok, `Could not verify KV chunk ${key}: ${stored.status}`);
    assert.ok(chunk.equals(Buffer.from(await stored.arrayBuffer())), `KV chunk differs: ${key}`);
  }

  const manifest = await access('PUT', sha256, JSON.stringify({ byteLength: data.length }));
  assert.ok(manifest.ok, `Cloudflare rejected the book file manifest: ${manifest.status}`);
}
