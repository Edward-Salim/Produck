export const BOOK_CHUNK_SIZE = 16 * 1024 * 1024;
export const MAX_BOOK_FILE_BYTES = 500_000_000;

/** @param {string} sha256 @param {number} index */
export function bookChunkKey(sha256, index) {
  return `${sha256}/${index}`;
}

/** @param {unknown} size @returns {size is number} */
export function isBookFileSize(size) {
  return (
    typeof size === 'number' &&
    Number.isSafeInteger(size) &&
    size >= 5 &&
    size <= MAX_BOOK_FILE_BYTES
  );
}
