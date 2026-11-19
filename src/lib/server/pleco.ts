import type { Fetcher } from '@cloudflare/workers-types';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function readPlecoLevelFile(label: string, assets?: Fetcher) {
  const fileName = `hsk3.0-level${label}.txt`;
  if (assets) {
    const response = await assets.fetch(`https://produck.fun/pleco/${fileName}`);
    if (!response.ok) throw new Error(`Missing Pleco HSK file ${fileName}: ${response.status}`);
    return response.text();
  }
  return readFile(resolve('static', 'pleco', fileName), 'utf8');
}
