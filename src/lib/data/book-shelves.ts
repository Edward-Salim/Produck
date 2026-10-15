import type { BookLibraryItem } from './book-summaries.js';

export function bookShelfCapacity(width: number | undefined) {
  if (!width) return 6;
  return width < 160
    ? 1
    : width < 260
      ? 2
      : width < 380
        ? 3
        : width < 480
          ? 4
          : width < 600
            ? 5
            : 6;
}

export function bookShelfSpan(book: BookLibraryItem, width: number | undefined) {
  return Math.min(book.shelfSpan ?? 1, bookShelfCapacity(width));
}

export function bookShelfSlots(shelf: BookLibraryItem[], width: number | undefined) {
  return shelf.reduce((slots, book) => slots + bookShelfSpan(book, width), 0);
}

export function fitBookShelves(shelves: BookLibraryItem[][], width: number | undefined) {
  if (!width) return shelves;

  const capacity = bookShelfCapacity(width);
  if (shelves.every((shelf) => bookShelfSlots(shelf, width) <= capacity)) return shelves;

  const books = shelves.flat();
  if (books.some((book) => bookShelfSpan(book, width) > 1)) {
    const fitted: BookLibraryItem[][] = [];
    let row: BookLibraryItem[] = [];
    let slots = 0;
    for (const book of books) {
      const span = bookShelfSpan(book, width);
      if (slots + span > capacity) {
        fitted.push(row);
        row = [];
        slots = 0;
      }
      row.push(book);
      slots += span;
    }
    if (row.length) fitted.push(row);
    return fitted;
  }

  const rowCount = Math.ceil(books.length / capacity);
  if (!rowCount) return [];

  const baseSize = Math.floor(books.length / rowCount);
  const extraBooks = books.length % rowCount;
  let offset = 0;

  return Array.from({ length: rowCount }, (_, index) => {
    const size = baseSize + (index < extraBooks ? 1 : 0);
    const shelf = books.slice(offset, offset + size);
    offset += size;
    return shelf;
  });
}
