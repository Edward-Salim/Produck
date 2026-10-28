import { getStore } from '@netlify/blobs';
import { serveBookBlob } from '../../src/lib/server/book-blob-download.ts';

export default async function download(request: Request) {
  return serveBookBlob(request, {
    getMetadata: async (bookId) => {
      const url = new URL(`/api/books/${bookId}/download?metadata=1`, request.url);
      return fetch(url, {
        headers: { cookie: request.headers.get('cookie') || '', accept: 'application/json' },
        redirect: 'manual'
      });
    },
    getBlob: (key) => getStore('library-book-pdfs').getWithMetadata(key, { type: 'stream' })
  });
}

export const config = { path: '/api/books/:book/file' };
