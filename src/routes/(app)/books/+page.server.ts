import type { BookLibraryItem } from '$lib/data/book-summaries.js';
import { getBookLibrary } from '$lib/server/book-library.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const books = await getBookLibrary();
  const shelves: BookLibraryItem[][] = [];
  let offset = 0;

  while (offset < books.length) {
    const remaining = books.length - offset;
    const maxSize = Math.min(6, remaining - 4);
    const size = remaining <= 7 ? remaining : 4 + Math.floor(Math.random() * (maxSize - 3));
    shelves.push(books.slice(offset, offset + size));
    offset += size;
  }

  return { shelves };
};
