import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { connectDatabase } from './connect.js';
import * as schema from './schema';

type Database = PostgresJsDatabase<typeof schema>;
const requestDatabases = new WeakMap<Request, Database>();
let localDatabase: Database | undefined;

export function getDb(): Database {
  if (dev) return (localDatabase ??= connectDatabase(env.DATABASE_URL).database);

  // Worker sockets belong to their request, including any streamed load data.
  const { request } = getRequestEvent();
  let database = requestDatabases.get(request);
  if (!database) {
    database = connectDatabase(env.DATABASE_URL).database;
    requestDatabases.set(request, database);
  }
  return database;
}

// Backwards-compatible lazy getter — use `db` as before, it connects on first access
export const db = new Proxy({} as Database, {
  get(_, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  }
});
