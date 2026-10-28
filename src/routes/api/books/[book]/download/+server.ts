import { error, json, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { libraryBookPdf } from '$lib/server/db/schema.js';
import { pdfDownloadHeaders, streamPdf } from '$lib/server/book-download.js';
import { getBookPdfMetadata } from '$lib/server/book-pdf.js';
import type { RequestHandler } from './$types.js';

const download: RequestHandler = async ({ params, locals, request, url }) => {
  if (!locals.session?.user?.id) error(401, 'Unauthorized');

  const file = await getBookPdfMetadata(params.book);
  if (!file) error(404, 'Original PDF is not available');

  const headers = pdfDownloadHeaders(file);
  if (request.method === 'HEAD') return new Response(null, { headers });
  if (url.searchParams.get('metadata') === '1')
    return json(file, {
      headers: { 'cache-control': 'private, no-store' }
    });
  if (file.blobKey) redirect(307, `/api/books/${params.book}/file`);

  const [pdf] = await db
    .select({ data: libraryBookPdf.data })
    .from(libraryBookPdf)
    .where(and(eq(libraryBookPdf.bookId, params.book), eq(libraryBookPdf.sha256, file.sha256)))
    .limit(1);
  if (!pdf?.data) error(404, 'Original PDF changed. Please try again.');

  return new Response(streamPdf(new Uint8Array(pdf.data)), { headers });
};

export const GET = download;
export const HEAD = download;
