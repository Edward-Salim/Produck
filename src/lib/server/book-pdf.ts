import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { libraryBookPdf } from './db/schema.js';

export async function getBookPdfMetadata(bookId: string) {
  const [file] = await db
    .select({
      filename: libraryBookPdf.filename,
      sha256: libraryBookPdf.sha256,
      byteLength: libraryBookPdf.byteLength,
      blobKey: libraryBookPdf.blobKey
    })
    .from(libraryBookPdf)
    .where(eq(libraryBookPdf.bookId, bookId))
    .limit(1);
  return file;
}
