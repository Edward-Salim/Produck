import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { libraryBookPdf } from '$lib/server/db/schema.js';
import { pdfDownloadHeaders, streamPdf } from '$lib/server/book-download.js';
import type { RequestHandler } from './$types.js';

const download: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.session?.user?.id) error(401, 'Unauthorized');

  const [file] = await db
    .select({
      filename: libraryBookPdf.filename,
      sha256: libraryBookPdf.sha256,
      byteLength: libraryBookPdf.byteLength
    })
    .from(libraryBookPdf)
    .where(eq(libraryBookPdf.bookId, params.book))
    .limit(1);
  if (!file) error(404, 'Original PDF is not available');

  const headers = pdfDownloadHeaders(file);
  if (request.method === 'HEAD') return new Response(null, { headers });

  const [pdf] = await db
    .select({ data: libraryBookPdf.data })
    .from(libraryBookPdf)
    .where(and(eq(libraryBookPdf.bookId, params.book), eq(libraryBookPdf.sha256, file.sha256)))
    .limit(1);
  if (!pdf) error(404, 'Original PDF changed. Please try again.');

  return new Response(streamPdf(new Uint8Array(pdf.data)), { headers });
};

export const GET = download;
export const HEAD = download;
