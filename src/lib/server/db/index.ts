import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';

let dbPath = env.DATABASE_URL || 'local.db';

// Fallback if the environment variable still contains legacy PostgreSQL connections from migration
if (dbPath.startsWith('postgres://') || dbPath.startsWith('postgresql://')) {
  dbPath = 'local.db';
}

// Detect serverless environment (Netlify/AWS Lambda)
const isServerless = process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME;

if (isServerless && dbPath !== ':memory:') {
  const tmpPath = '/tmp/local.db';
  const bundledPath = path.resolve(process.cwd(), 'local.db');

  if (!fs.existsSync(tmpPath)) {
    console.log(`[db] Serverless container detected. Initializing database in /tmp. Bundled path: ${bundledPath}`);
    if (fs.existsSync(bundledPath)) {
      try {
        fs.copyFileSync(bundledPath, tmpPath);
        console.log('[db] Successfully copied pre-seeded database to /tmp');
      } catch (err) {
        console.error('[db] Failed to copy pre-seeded database:', err);
      }
    } else {
      console.warn(`[db] Bundled database file not found at: ${bundledPath}`);
    }
  }
  dbPath = tmpPath;
}

// Ensure the directory exists if dbPath is not in-memory
if (dbPath !== ':memory:') {
  const dir = path.dirname(dbPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
