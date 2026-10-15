import type { BookLibraryItem } from '$lib/data/book-summaries.js';
import { bookShelfCapacity } from '$lib/data/book-shelves.js';
import { getBookLibrary } from '$lib/server/book-library.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const books = await getBookLibrary();
  const shelves: BookLibraryItem[][] = [];
  const capacity = bookShelfCapacity();

  for (let offset = 0; offset < books.length; offset += capacity) {
    shelves.push(books.slice(offset, offset + capacity));
  }

  return { shelves };
};
