import { error } from '@sveltejs/kit';
import { getBookSummary } from '$lib/server/book-library.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const book = await getBookSummary(params.book);
  if (!book) error(404, 'Book not found');
  return { book };
};
