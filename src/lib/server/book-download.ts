export type BookPdfMetadata = { filename: string; sha256: string; byteLength: number };

export function pdfDownloadHeaders(file: BookPdfMetadata): Headers {
  const filename = file.filename.replace(/[\r\n"\\/]/g, '_');
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_');
  const encoded = encodeURIComponent(filename).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return new Headers({
    'content-type': 'application/pdf',
    'content-disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
    'content-length': String(file.byteLength),
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff'
  });
}

// A ReadableStream keeps large PDFs on the hosting platform's streaming response path.
export function streamPdf(data: Uint8Array): ReadableStream<Uint8Array> {
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset === data.byteLength) {
        controller.close();
        return;
      }
      const end = Math.min(offset + 64 * 1024, data.byteLength);
      controller.enqueue(data.subarray(offset, end));
      offset = end;
    }
  });
}
