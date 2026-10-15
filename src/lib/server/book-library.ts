import { asc, eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BookLibraryItem, BookSummary } from '$lib/data/book-summaries.js';
import { db } from './db/index.js';
import { libraryBook } from './db/schema.js';

export async function getBookLibrary(): Promise<BookLibraryItem[]> {
  return db
    .select({
      id: libraryBook.id,
      title: libraryBook.title,
      cover: libraryBook.coverPath,
      shelfSpan: libraryBook.shelfSpan
    })
    .from(libraryBook)
    .orderBy(asc(libraryBook.sortOrder), asc(libraryBook.id));
}

export async function getBookSummary(id: string): Promise<BookSummary | null> {
  const [book] = await db.select().from(libraryBook).where(eq(libraryBook.id, id)).limit(1);
  if (!book) return null;

  let draftParts: BookSummary['parts'];
  if (dev) {
    try {
      const drafts: Record<string, Pick<BookSummary, 'parts'>> = JSON.parse(
        await readFile(
          join(process.cwd(), 'src/lib/server/book-summary-drafts.private.json'),
          'utf8'
        )
      );
      draftParts = drafts[id]?.parts;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    authorImage: book.authorImagePath ?? undefined,
    authorPortraits: book.authorPortraits,
    edition: book.edition ?? undefined,
    cover: book.coverPath,
    source: book.source,
    parts: draftParts ?? book.parts,
    chapters: book.chapters
  };
}
