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
