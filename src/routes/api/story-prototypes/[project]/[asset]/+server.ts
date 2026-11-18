import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { storyPrototypeAsset } from '$lib/server/db/schema.js';
import { assertProjectAccess } from '$lib/server/access.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ params, request, locals }) => {
  const projectId = Number(params.project);
  if (
    !/^[1-9]\d*$/.test(params.project) ||
    !Number.isSafeInteger(projectId) ||
    !/^[a-f0-9]{64}$/.test(params.asset)
  ) {
    error(404, 'Image not found');
  }

  await assertProjectAccess(locals, projectId);
  const [asset] = await db
    .select({ contentType: storyPrototypeAsset.contentType, data: storyPrototypeAsset.data })
    .from(storyPrototypeAsset)
    .where(
      and(eq(storyPrototypeAsset.projectId, projectId), eq(storyPrototypeAsset.id, params.asset))
    )
    .limit(1);
  if (!asset) error(404, 'Image not found');

  const etag = `"${params.asset}"`;
  const headers = {
    'content-type': asset.contentType,
    'cache-control': 'private, no-cache',
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
