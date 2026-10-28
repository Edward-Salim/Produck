import type { BookLibraryItem } from '$lib/data/book-summaries.js';
import { bookShelfCapacity } from '$lib/data/book-shelves.js';
import { getBookLibrary } from '$lib/server/book-library.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const books = await getBookLibrary();
  const shelves: Record<BookLibraryItem['shelfCategory'], BookLibraryItem[][]> = {
    work: [],
    misc: []
  };
  const capacity = bookShelfCapacity();

  for (const category of ['work', 'misc'] as const) {
    const categoryBooks = books.filter((book) => book.shelfCategory === category);
    for (let offset = 0; offset < categoryBooks.length; offset += capacity) {
      shelves[category].push(categoryBooks.slice(offset, offset + capacity));
    }
  }

  return { shelves };
};
