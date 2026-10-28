import { pdfDownloadHeaders } from './book-download.ts';

type BlobEntry = {
  data: ReadableStream<Uint8Array> | null;
  metadata: Record<string, unknown>;
};
type DownloadServices = {
  getMetadata: (bookId: string) => Promise<Response>;
  getBlob: (key: string) => Promise<BlobEntry | null>;
};

export async function serveBookBlob(
  request: Request,
  services: DownloadServices
): Promise<Response> {
  const failure = (message: string, status: number) =>
    new Response(message, {
      status,
      headers: { 'cache-control': 'private, no-store' }
    });
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response(null, {
      status: 405,
      headers: { allow: 'GET, HEAD', 'cache-control': 'private, no-store' }
    });
  const match = new URL(request.url).pathname.match(/^\/api\/books\/([a-z0-9-]+)\/file$/);
  if (!match) return failure('PDF not found', 404);
  const metadataResponse = await services.getMetadata(match[1]);
  if (!metadataResponse.ok) return failure('PDF is not available', metadataResponse.status);
  const file = await metadataResponse.json();
  if (
    typeof file.filename !== 'string' ||
    !/^[a-f0-9]{64}$/.test(file.sha256) ||
    file.blobKey !== file.sha256 ||
    !Number.isSafeInteger(file.byteLength) ||
    file.byteLength < 5 ||
    file.byteLength > 500_000_000
  )
    return failure('PDF not found', 404);
  const headers = pdfDownloadHeaders(file);
  const sessionCookie = metadataResponse.headers.get('set-cookie');
  if (sessionCookie) headers.set('set-cookie', sessionCookie);
  if (request.method === 'HEAD') return new Response(null, { headers });
  const blob = await services.getBlob(file.blobKey);
  if (
    !blob?.data ||
    blob.metadata.sha256 !== file.sha256 ||
    blob.metadata.byteLength !== file.byteLength
  ) {
    await blob?.data?.cancel();
    return failure('Original PDF changed. Please try again.', 404);
  }
  return new Response(blob.data, { headers });
}
