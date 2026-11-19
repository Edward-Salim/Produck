import { error, json } from '@sveltejs/kit';
import { serveBookBlob } from '$lib/server/book-blob-download.js';
import { readBookKv } from '$lib/server/book-kv.js';
import { getBookPdfMetadata } from '$lib/server/book-pdf.js';
import type { RequestHandler } from './$types.js';

const download: RequestHandler = async ({ request, locals, platform }) => {
  if (!locals.session?.user?.id) error(401, 'Unauthorized');
  const namespace = platform?.env.BOOK_FILES;
  if (!namespace) error(503, 'Book file storage is unavailable.');

  return serveBookBlob(request, {
    getMetadata: async (bookId) => {
      const file = await getBookPdfMetadata(bookId);
      return file ? json(file) : new Response(null, { status: 404 });
    },
    getBlob: (key) => readBookKv(namespace, key)
  });
};

export const GET = download;
export const HEAD = download;
