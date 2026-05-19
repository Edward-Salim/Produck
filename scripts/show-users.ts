import { Database } from 'bun:sqlite';

const db = new Database('local.db');
try {
  const users = db.query('SELECT * FROM app_user').all();
  console.log('App Users:');
  console.log(JSON.stringify(users, null, 2));
} catch (e) {
  console.error('Error querying users:', e);
}
