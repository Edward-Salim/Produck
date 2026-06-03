import postgres from 'postgres';
import { Database } from 'bun:sqlite';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith('postgres')) {
  throw new Error('DATABASE_URL must be set to your Neon Postgres connection string.');
}

const sqlite = new Database('local.db', { readonly: true });
const pg = postgres(databaseUrl, { ssl: 'require', max: 1 });

const tables = [
  'workspace',
  'app_user',
  'project',
  'workspace_access',
  'project_access',
  'pm_book',
  'pm_artifact',
  'pm_methodology',
  'business_outcome',
  'product_objective',
  'key_result',
  'idea',
  'actor',
  'activity',
  'story_map_task',
  'story',
  'persona',
  'interview_snapshot',
  'milestone',
  'roadmap_item',
  'backlog_item',
  'experience_phase',
  'experience_step',
  'experience_touchpoint',
  'artifact_pick',
  'fintech_pick',
  'rss_source',
  'rss_article',
  'trend_summary',
  'auth_session'
] as const;

const jsonColumns = new Set([
  'metrics',
  'how_to',
  'figures',
  'related_artifacts',
  'actor_emojis',
  'pains',
  'gains',
  'details',
  'checked_acs',
  'assumptions',
  'goals',
  'challenges',
  'motivators',
  'info_sources',
  'quick_facts',
  'insights',
  'opportunities'
]);

const booleanColumns = new Set(['done', 'enabled']);

const timestampColumns = new Set([
  'created_at',
  'updated_at',
  'published_at',
  'fetched_at',
  'generated_at'
]);

type SqliteColumn = {
  name: string;
};

function sqliteTableExists(tableName: string) {
  const row = sqlite
    .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  return Boolean(row);
}

function sqliteColumns(tableName: string) {
  return (sqlite.query(`PRAGMA table_info(${tableName})`).all() as SqliteColumn[]).map(
    (column) => column.name
  );
}

function toPostgresValue(column: string, value: unknown) {
  if (value === null || value === undefined) return null;

  if (jsonColumns.has(column)) {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (booleanColumns.has(column)) {
    return Boolean(value);
  }

  if (timestampColumns.has(column)) {
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value * 1000);
    if (typeof value === 'string' && /^\d+$/.test(value)) return new Date(Number(value) * 1000);
  }

  return value;
}

async function migrateTable(tableName: string) {
  if (!sqliteTableExists(tableName)) {
    console.log(`${tableName}: skipped, not present in local.db`);
    return;
  }

  const columns = sqliteColumns(tableName);
  const rows = sqlite.query(`SELECT ${columns.map((column) => `"${column}"`).join(', ')} FROM ${tableName}`).all() as Record<
    string,
    unknown
  >[];

  if (rows.length === 0) {
    console.log(`${tableName}: 0 rows`);
    return;
  }

  await pg.begin(async (tx) => {
    for (const row of rows) {
      const values = Object.fromEntries(
        columns.map((column) => [column, toPostgresValue(column, row[column])])
      );
      await tx`INSERT INTO ${tx(tableName)} ${tx(values, ...columns)}`;
    }
  });

  if (columns.includes('id')) {
    const [sequence] = await pg<{ name: string | null }[]>`
      SELECT pg_get_serial_sequence(${tableName}, 'id') AS name
    `;

    if (sequence?.name) {
      await pg`
        SELECT setval(
          ${sequence.name},
          COALESCE((SELECT MAX(id) FROM ${pg(tableName)}), 1),
          (SELECT COUNT(*) > 0 FROM ${pg(tableName)})
        )
      `;
    }
  }

  console.log(`${tableName}: ${rows.length} rows`);
}

async function run() {
  if (!sqliteTableExists('app_user')) {
    throw new Error('local.db does not look like the Produck SQLite database.');
  }

  const truncateTables = [...tables].reverse();
  await pg`TRUNCATE ${pg(truncateTables)} RESTART IDENTITY CASCADE`;

  for (const table of tables) {
    await migrateTable(table);
  }

  await pg.end();
  sqlite.close();
  console.log('Migration completed.');
}

run().catch(async (error) => {
  console.error(error);
  await pg.end({ timeout: 1 });
  sqlite.close();
  process.exit(1);
});
