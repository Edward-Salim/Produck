export function inspectBookSource(data) {
  if (data.subarray(0, 5).toString('ascii') === '%PDF-')
    return { extension: '.pdf', contentType: 'application/pdf' };

  // EPUB requires an uncompressed, first ZIP entry named mimetype with no extra field.
  if (
    data.length >= 58 &&
    data.subarray(0, 4).equals(Buffer.from('504b0304', 'hex')) &&
    !(data.readUInt16LE(6) & 1) &&
    data.readUInt16LE(8) === 0 &&
    data.readUInt32LE(18) === 20 &&
    data.readUInt32LE(22) === 20 &&
    data.readUInt16LE(26) === 8 &&
    data.readUInt16LE(28) === 0 &&
    data.subarray(30, 38).toString('ascii') === 'mimetype' &&
    data.subarray(38, 58).toString('ascii') === 'application/epub+zip'
  )
    return { extension: '.epub', contentType: 'application/epub+zip' };

  throw new Error('Source must be a PDF or an EPUB with a valid mimetype entry.');
}
