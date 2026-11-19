import type { KVNamespace } from '@cloudflare/workers-types';
import { BOOK_CHUNK_SIZE, bookChunkKey, isBookFileSize } from './book-storage.js';

export async function readBookKv(namespace: KVNamespace, sha256: string) {
  const manifest = await namespace.get<{ byteLength: unknown }>(sha256, 'json');
  if (!manifest || !isBookFileSize(manifest.byteLength)) return null;

  const byteLength = manifest.byteLength;
  const count = Math.ceil(byteLength / BOOK_CHUNK_SIZE);
  let index = 0;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const data = new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (index < count) {
        if (!reader) {
          const chunk = await namespace.get(bookChunkKey(sha256, index), 'stream');
          if (!chunk) throw new Error(`Book file chunk ${index} is unavailable.`);
          reader = chunk.getReader() as ReadableStreamDefaultReader<Uint8Array>;
        }

        const { done, value } = await reader.read();
        if (!done) {
          controller.enqueue(value);
          return;
        }
        reader.releaseLock();
        reader = undefined;
        index += 1;
      }
      controller.close();
    },
    async cancel(reason) {
      await reader?.cancel(reason);
    }
  });

  return { data, metadata: { sha256, byteLength } };
}
