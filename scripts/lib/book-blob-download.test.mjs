import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { serveBookBlob } from '../../src/lib/server/book-blob-download.ts';

const key = 'a'.repeat(64);
const file = {
  filename: 'Refactoring UI - Adam Wathan & Steve Schoger.pdf',
  sha256: key,
  blobKey: key,
  byteLength: 55_665_277
};
const request = (method = 'GET', path = '/api/books/refactoring-ui/file') =>
  new Request(`https://produck.fun${path}`, { method });
const metadata = (value = file) =>
  new Response(JSON.stringify(value), {
    headers: {
      'content-type': 'application/json',
      'set-cookie': 'session_id=refreshed; HttpOnly; Secure; Path=/'
    }
  });

test('large original streams beyond 20 MB without truncation or buffering into a response string', async () => {
  const chunk = new Uint8Array(64 * 1024).fill(73);
  let sent = 0;
  const expected = createHash('sha256');
  const stream = new ReadableStream({
    pull(controller) {
      if (sent === file.byteLength) return controller.close();
      const value = chunk.subarray(0, Math.min(chunk.length, file.byteLength - sent));
      sent += value.length;
      expected.update(value);
      controller.enqueue(value);
    }
  });
  const response = await serveBookBlob(
    request('GET', '/api/books/refactoring-ui/file?key=untrusted'),
    {
      getMetadata: async (book) => {
        assert.equal(book, 'refactoring-ui');
        return metadata();
      },
      getBlob: async (requestedKey) => {
        assert.equal(requestedKey, key);
        return { data: stream, metadata: { sha256: key, byteLength: file.byteLength } };
      }
    }
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-length'), String(file.byteLength));
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.match(response.headers.get('content-disposition'), /^attachment;/);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  const actual = createHash('sha256');
  let received = 0;
  for await (const value of response.body) {
    actual.update(value);
    received += value.length;
  }
  assert.equal(received, file.byteLength);
  assert.equal(actual.digest('hex'), expected.digest('hex'));
});

test('authentication and authorization failures never open blob storage', async () => {
  for (const status of [401, 403, 404]) {
    const response = await serveBookBlob(request(), {
      getMetadata: async () => new Response(null, { status }),
      getBlob: async () => assert.fail('Unauthenticated request accessed storage')
    });
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});

test('HEAD checks authorization and metadata without opening the PDF', async () => {
  let checked = false;
  const response = await serveBookBlob(request('HEAD'), {
    getMetadata: async () => {
      checked = true;
      return metadata();
    },
    getBlob: async () => assert.fail('HEAD fetched PDF bytes')
  });
  assert.ok(checked);
  assert.equal(response.body, null);
  assert.equal(response.headers.get('content-length'), String(file.byteLength));
});

test('arbitrary keys, invalid metadata and unsupported methods are rejected', async () => {
  const never = async () => assert.fail('Unexpected storage read');
  for (const value of [
    { ...file, blobKey: 'another-object' },
    { ...file, byteLength: -1 },
    { ...file, sha256: '../secret' },
    { ...file, byteLength: 500_000_001 }
  ]) {
    assert.equal(
      (await serveBookBlob(request(), { getMetadata: async () => metadata(value), getBlob: never }))
        .status,
      404
    );
  }
  assert.equal(
    (await serveBookBlob(request('POST'), { getMetadata: never, getBlob: never })).status,
    405
  );
  assert.equal(
    (
      await serveBookBlob(request('GET', '/api/books/INVALID/file'), {
        getMetadata: never,
        getBlob: never
      })
    ).status,
    404
  );
});

test('missing or changed blobs are never sent with successful download headers', async () => {
  assert.equal(
    (
      await serveBookBlob(request(), {
        getMetadata: async () => metadata(),
        getBlob: async () => null
      })
    ).status,
    404
  );
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    }
  });
  const response = await serveBookBlob(request(), {
    getMetadata: async () => metadata(),
    getBlob: async () => ({ data: stream, metadata: { sha256: key, byteLength: 123 } })
  });
  assert.equal(response.status, 404);
  assert.ok(cancelled);
});
