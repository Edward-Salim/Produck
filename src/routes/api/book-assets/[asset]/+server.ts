import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { libraryBookAsset } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.session?.user?.id) error(401, 'Unauthorized');
  if (!/^[a-f0-9]{64}$/.test(params.asset)) error(404, 'Image not found');

  const [asset] = await db
    .select({ contentType: libraryBookAsset.contentType, data: libraryBookAsset.data })
    .from(libraryBookAsset)
    .where(eq(libraryBookAsset.id, params.asset))
    .limit(1);

  if (!asset) error(404, 'Image not found');

  const etag = `"${params.asset}"`;
  const headers = {
    'content-type': asset.contentType,
    'cache-control': 'private, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    etag
  };
  const matches = request.headers
    .get('if-none-match')
    ?.split(',')
    .some((value) => ['*', etag, `W/${etag}`].includes(value.trim()));

  if (matches) return new Response(null, { status: 304, headers });
  return new Response(new Uint8Array(asset.data), { headers });
};
