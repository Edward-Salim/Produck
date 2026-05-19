import { Database } from 'bun:sqlite';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_URL || 'local.db';
console.log(`Seeding database: ${dbPath}`);

const db = new Database(dbPath);

const sqlPath = path.join(__dirname, 'seed-pm.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Split SQL content into statements
const statements = sqlContent
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

db.run('PRAGMA foreign_keys = ON;');

let count = 0;
db.transaction(() => {
  for (const stmt of statements) {
    db.run(stmt);
    count++;
  }
})();

console.log(`Seeding completed. Executed ${count} statements.`);
