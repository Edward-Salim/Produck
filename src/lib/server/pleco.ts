import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = dirname(fileURLToPath(import.meta.url));

export function readPlecoLevelFile(label: string) {
  const fileName = `hsk3.0-level${label}.txt`;
  const candidates = [
    resolve(process.cwd(), 'static', 'pleco', fileName),
    resolve(moduleDir, '..', '..', '..', 'static', 'pleco', fileName),
    resolve(moduleDir, '..', '..', '..', '..', 'static', 'pleco', fileName),
    resolve('/var/task', 'static', 'pleco', fileName)
  ];

  const filePath = candidates.find((candidate) => existsSync(candidate));
  if (!filePath) {
    throw new Error(`Missing Pleco HSK file ${fileName}. Checked: ${candidates.join(', ')}`);
  }

  return readFileSync(filePath, 'utf-8');
}
