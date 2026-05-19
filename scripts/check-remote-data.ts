import postgres from 'postgres';

const sql = postgres('postgresql://postgres:akuakan3digit@db.ttzgvzqmmqtrnamrxecy.supabase.co:5432/postgres');

async function run() {
  try {
    const tables = [
      'app_user', 'workspace', 'project', 'workspace_access', 'project_access',
      'idea', 'actor', 'activity', 'story_map_task', 'story',
      'persona', 'interview_snapshot', 'business_outcome', 'product_objective',
      'key_result', 'milestone', 'roadmap_item', 'backlog_item',
      'experience_phase', 'experience_step', 'experience_touchpoint',
      'rss_source', 'rss_article', 'trend_summary'
    ];

    console.log('Remote row counts:');
    for (const table of tables) {
      const [result] = await sql`SELECT COUNT(*)::integer as count FROM ${sql(table)}`;
      console.log(`- ${table}: ${result.count}`);
    }
  } catch (e) {
    console.error('Error fetching table counts:', e);
  } finally {
    await sql.end();
  }
}

run();
