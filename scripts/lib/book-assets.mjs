import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export const MAX_BOOK_ASSET_BYTES = 4 * 1024 * 1024;

export function bookAssetContentType(data) {
  if (data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return 'image/png';
  if (data.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString('ascii'))) return 'image/gif';
  if (
    data.subarray(0, 4).toString('ascii') === 'RIFF' &&
    data.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp';
  throw new Error('Book images must be PNG, JPEG, WebP, or GIF.');
}

function assertInside(root, path) {
  const child = relative(root, path);
  if (!child || child === '..' || child.startsWith('..' + sep) || isAbsolute(child)) {
    throw new Error('Image path must stay inside the asset root.');
  }
}

export async function prepareBookAssets(book, assetRoot) {
  let root;
  const updated = structuredClone(book);
  const assets = new Map();
  const replacements = new Map();

  async function replace(src) {
    if (typeof src !== 'string' || !/^\/(books|covers)\//.test(src)) return src;
    if (replacements.has(src)) return replacements.get(src);

    root ??= await realpath(assetRoot);
    const path = resolve(root, '.' + decodeURIComponent(src.split(/[?#]/)[0]));
    assertInside(root, path);
    const actualPath = await realpath(path);
    assertInside(root, actualPath);
    const info = await stat(actualPath);
    if (!info.isFile() || info.size < 1 || info.size > MAX_BOOK_ASSET_BYTES) {
      throw new Error(`Image must be a nonempty file no larger than 4 MiB: ${src}`);
    }

    const data = await readFile(actualPath);
    if (data.length > MAX_BOOK_ASSET_BYTES) throw new Error(`Image exceeds 4 MiB: ${src}`);
    const contentType = bookAssetContentType(data);
    const id = createHash('sha256').update(data).digest('hex');
    const url = '/api/book-assets/' + id;
    assets.set(id, { id, contentType, data });
    replacements.set(src, url);
    return url;
  }

  updated.cover_path = await replace(updated.cover_path);
  updated.author_image_path = await replace(updated.author_image_path);
  for (const portrait of updated.author_portraits ?? []) portrait.src = await replace(portrait.src);
  for (const section of [...(updated.parts ?? []), ...(updated.chapters ?? [])]) {
    for (const block of section.summary ?? []) {
      if (typeof block === 'object' && block?.type === 'image')
        block.src = await replace(block.src);
    }
  }
  return { book: updated, assets: [...assets.values()], replacements };
}
