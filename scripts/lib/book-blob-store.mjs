import { getStore } from '@netlify/blobs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const BOOK_PDF_STORE = 'library-book-pdfs';

// Developer imports and local Vite use the existing Netlify CLI login.
// Deployed edge functions use Netlify's automatic, site-scoped Blobs context.
export async function getLocalBookPdfStore() {
  let siteID = process.env.NETLIFY_SITE_ID;
  let token = process.env.NETLIFY_AUTH_TOKEN;
  if (!siteID) {
    const state = JSON.parse(await readFile('.netlify/state.json', 'utf8'));
    siteID = state.siteId;
  }
  if (!token) {
    const configRoot =
      process.platform === 'win32'
        ? join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'netlify', 'Config')
        : process.platform === 'darwin'
          ? join(homedir(), 'Library', 'Preferences', 'netlify')
          : join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'netlify');
    const config = JSON.parse(await readFile(join(configRoot, 'config.json'), 'utf8'));
    token = config.users?.[config.userId]?.auth?.token;
  }
  if (!siteID || !token)
    throw new Error('Link this project and sign in with Netlify CLI before importing large PDFs.');
  return getStore(BOOK_PDF_STORE, { siteID, token, consistency: 'strong' });
}
