import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export function connectDatabase(url: string | undefined) {
  if (!url || !/^postgres(?:ql)?:\/\//.test(url)) {
    throw new Error('DATABASE_URL must be a Neon Postgres connection string.');
  }

  const sql = postgres(url, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });
  return { database: drizzle(sql, { schema }), close: () => sql.end({ timeout: 5 }) };
}
