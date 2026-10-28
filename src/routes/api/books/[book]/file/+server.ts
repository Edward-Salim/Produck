import { dev } from '$app/environment';
import { error, json } from '@sveltejs/kit';
import { serveBookBlob } from '$lib/server/book-blob-download.js';
import { getBookPdfMetadata } from '$lib/server/book-pdf.js';
import type { RequestHandler } from './$types.js';

const download: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.user?.id) error(401, 'Unauthorized');
  if (dev) {
    const { getLocalBookPdfStore } =
      await import('../../../../../../scripts/lib/book-blob-store.mjs');
    return serveBookBlob(request, {
      getMetadata: async (bookId) => {
        const file = await getBookPdfMetadata(bookId);
        return file
          ? json(file, { headers: { 'cache-control': 'private, no-store' } })
          : new Response(null, { status: 404 });
      },
      getBlob: async (key) =>
        (await getLocalBookPdfStore()).getWithMetadata(key, { type: 'stream' })
    });
  }
  error(404, 'Large PDF downloads are served by the Netlify edge function.');
};

export const GET = download;
export const HEAD = download;
