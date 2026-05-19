import postgres from 'postgres';
import { Database } from 'bun:sqlite';

const pg = postgres('postgresql://postgres:akuakan3digit@db.ttzgvzqmmqtrnamrxecy.supabase.co:5432/postgres');
const sqlite = new Database('local.db');

async function migrateTable(tableName: string) {
  console.log(`Migrating table: ${tableName}...`);
  try {
    // 1. Get remote rows
    const rows = await pg`SELECT * FROM ${pg(tableName)}`;
    if (rows.length === 0) {
      console.log(`  Table ${tableName} is empty. Skipping.`);
      return;
    }
    
    // 2. Clear local table
    sqlite.run(`DELETE FROM ${tableName}`);
    
    // 3. Get local SQLite columns
    const pragmaInfo = sqlite.query(`PRAGMA table_info(${tableName})`).all() as any[];
    const localColumns = new Set(pragmaInfo.map(c => c.name));
    
    // 4. Prepare insert statement using only columns that exist locally
    const remoteColumns = Object.keys(rows[0]);
    const columns = remoteColumns.filter(c => localColumns.has(c));
    
    if (columns.length === 0) {
      console.log(`  No matching columns for table ${tableName}. Skipping.`);
      return;
    }
    
    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT INTO ${tableName} (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
    const stmt = sqlite.prepare(query);
    
    // 5. Insert rows inside transaction
    sqlite.transaction(() => {
      for (const row of rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) {
            return null;
          }
          if (val instanceof Date) {
            // Store timestamps as Unix epoch seconds
            return Math.floor(val.getTime() / 1000);
          }
          if (typeof val === 'boolean') {
            return val ? 1 : 0;
          }
          if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
            return JSON.stringify(val);
          }
          return val;
        });
        stmt.run(...values);
      }
    })();
    
    console.log(`  Successfully migrated ${rows.length} rows.`);
  } catch (e) {
    console.error(`  Error migrating table ${tableName}:`, e);
  }
}

async function run() {
  sqlite.run('PRAGMA foreign_keys = OFF;');
  try {
    const tables = [
      'app_user', 'workspace', 'project', 'workspace_access', 'project_access',
      'idea', 'actor', 'activity', 'story_map_task', 'story',
      'persona', 'interview_snapshot', 'business_outcome', 'product_objective',
      'key_result', 'milestone', 'roadmap_item', 'backlog_item',
      'experience_phase', 'experience_step', 'experience_touchpoint',
      'rss_source', 'rss_article', 'trend_summary'
    ];
    
    for (const table of tables) {
      await migrateTable(table);
    }
    console.log('\nMigration completed successfully!');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    sqlite.run('PRAGMA foreign_keys = ON;');
    await pg.end();
  }
}

run();
