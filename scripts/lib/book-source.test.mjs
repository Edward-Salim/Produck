import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectBookSource } from './book-source.mjs';

function epubHeader() {
  const data = Buffer.alloc(58);
  Buffer.from('504b0304', 'hex').copy(data);
  data.writeUInt32LE(20, 18);
  data.writeUInt32LE(20, 22);
  data.writeUInt16LE(8, 26);
  data.write('mimetypeapplication/epub+zip', 30, 'ascii');
  return data;
}

test('source format comes from file content, with existing PDFs preserved', () => {
  assert.deepEqual(inspectBookSource(Buffer.from('%PDF-1.7\n')), {
    extension: '.pdf',
    contentType: 'application/pdf'
  });
  assert.deepEqual(inspectBookSource(epubHeader()), {
    extension: '.epub',
    contentType: 'application/epub+zip'
  });
});

test('generic ZIPs, compressed mimetypes, encryption, and truncated or wrong media types are rejected', () => {
  for (const invalid of [Buffer.from('PK\x03\x04'), Buffer.from('<html>not a book</html>')])
    assert.throws(() => inspectBookSource(invalid));
  for (const offset of [6, 8, 18, 22, 26, 28, 30, 38]) {
    const invalid = epubHeader();
    invalid[offset] ^= 1;
    assert.throws(() => inspectBookSource(invalid), `invalid field at ${offset}`);
  }
});
