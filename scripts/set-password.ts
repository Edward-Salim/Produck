import { Database } from 'bun:sqlite';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

// Replicating password hashing logic from src/lib/server/auth.ts to avoid imports issues in scripts
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: bun scripts/set-password.ts <email> <password>');
  process.exit(1);
}

const [email, password] = args;

const db = new Database('local.db');
try {
  const user = db.query('SELECT * FROM app_user WHERE email = ?').get(email) as any;
  if (!user) {
    console.error(`User with email "${email}" not found.`);
    process.exit(1);
  }

  const passwordHash = hashPassword(password);
  db.query('UPDATE app_user SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);

  console.log(`Successfully set password for user "${email}" (ID: ${user.id}).`);
} catch (e) {
  console.error('Error setting password:', e);
}
