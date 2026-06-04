import fs from 'node:fs';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import postgres from 'postgres';

const passwordHashAlgorithm = 'pbkdf2_sha512';
const passwordHashIterations = 310_000;
const passwordKeyLength = 64;

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envText = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  const match = envText.match(/^DATABASE_URL=(.*)$/m);
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(
    password,
    salt,
    passwordHashIterations,
    passwordKeyLength,
    'sha512'
  ).toString('hex');
  return `${passwordHashAlgorithm}$${passwordHashIterations}$${salt}$${hash}`;
}

const [email] = process.argv.slice(2);
const password = process.env.NEW_PASSWORD;
const databaseUrl = readDatabaseUrl();

if (!email || !password || !databaseUrl) {
  console.log('Usage: NEW_PASSWORD=... tsx scripts/set-password.ts <email>');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

try {
  await sql.begin(async (tx) => {
    const users = await tx`select id from app_user where email = ${email}`;
    if (users.length !== 1) {
      throw new Error(`Expected one user for "${email}", found ${users.length}.`);
    }

    await tx`
      update app_user
      set password_hash = ${hashPassword(password)}
      where id = ${users[0].id}
    `;
    await tx`delete from auth_session where user_id = ${users[0].id}`;
  });

  console.log(`Password updated and sessions cleared for "${email}".`);
} finally {
  await sql.end();
}
