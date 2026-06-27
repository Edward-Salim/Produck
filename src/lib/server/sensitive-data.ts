import { env } from '$env/dynamic/private';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const encryptedPrefix = 'enc:v1:';

function decodeKey(value: string): Buffer {
  const trimmed = value.trim();
  const decoded = /^[0-9a-f]{64}$/i.test(trimmed)
    ? Buffer.from(trimmed, 'hex')
    : Buffer.from(trimmed, 'base64url');

  if (decoded.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must decode to 32 bytes.');
  }

  return decoded;
}

function dataEncryptionKey(): Buffer {
  const value = env.DATA_ENCRYPTION_KEY ?? process.env.DATA_ENCRYPTION_KEY;
  if (!value) throw new Error('DATA_ENCRYPTION_KEY is required for sensitive data encryption.');
  return decodeKey(value);
}

export function isEncryptedSensitiveValue(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(encryptedPrefix);
}

export function encryptSensitiveValue(value: string | null | undefined): string | null {
  if (value == null || value === '') return value ?? null;
  if (isEncryptedSensitiveValue(value)) return value;

  return encryptPlainSensitiveValue(value);
}

function encryptPlainSensitiveValue(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', dataEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${encryptedPrefix}${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
}

function encryptedValueParts(value: string): [string, string, string] {
  const body = value.slice(encryptedPrefix.length);
  const parts = body.split(':');
  if (parts.length === 3) return parts as [string, string, string];

  // Early encrypted rows used fixed-length base64url nonce/tag segments without separators.
  if (parts.length === 1 && body.length > 38) {
    return [body.slice(0, 16), body.slice(16, 38), body.slice(38)];
  }

  throw new Error('Invalid encrypted sensitive value.');
}

export function decryptSensitiveValue(value: string | null | undefined): string | null {
  if (value == null || value === '') return value ?? null;
  if (!isEncryptedSensitiveValue(value)) return value;

  const [ivText, tagText, ciphertextText] = encryptedValueParts(value);
  const decipher = createDecipheriv(
    'aes-256-gcm',
    dataEncryptionKey(),
    Buffer.from(ivText, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export function reencryptSensitiveValue(value: string | null | undefined): string | null {
  const plain = decryptSensitiveValue(value);
  return plain == null || plain === '' ? (plain ?? null) : encryptPlainSensitiveValue(plain);
}

export function maskSensitiveValue(value: string | null | undefined): string | undefined {
  const plain = decryptSensitiveValue(value);
  if (!plain) return undefined;

  const digits = plain.replace(/\D/g, '');
  if (digits.length >= 4) return `.... ${digits.slice(-4)}`;
  return '....';
}
