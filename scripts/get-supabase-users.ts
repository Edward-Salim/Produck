import postgres from 'postgres';

const sql = postgres('postgresql://postgres:akuakan3digit@db.ttzgvzqmmqtrnamrxecy.supabase.co:5432/postgres');

async function run() {
  try {
    console.log('Querying remote Supabase database for accounts...');
    
    // Fetch from auth.users
    const authUsers = await sql`
      SELECT id, email, created_at, last_sign_in_at 
      FROM auth.users
    `;
    
    // Fetch from public.app_user
    const appUsers = await sql`
      SELECT id, auth_id, email, display_name, role 
      FROM public.app_user
    `;
    
    console.log('\n--- Supabase Auth Users (auth.users) ---');
    console.log(JSON.stringify(authUsers, null, 2));
    
    console.log('\n--- Public App Users (public.app_user) ---');
    console.log(JSON.stringify(appUsers, null, 2));
    
  } catch (e) {
    console.error('Error fetching remote users:', e);
  } finally {
    await sql.end();
  }
}

run();
