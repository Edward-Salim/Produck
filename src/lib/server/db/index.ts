import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required. Set it to your Neon Postgres connection string.');
    }

    if (!env.DATABASE_URL.startsWith('postgres://') && !env.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a Postgres connection string.');
    }

    const client = postgres(env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });

    _db = drizzle(client, { schema });
  }
  return _db;
}

// Backwards-compatible lazy getter — use `db` as before, it connects on first access
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  }
});
