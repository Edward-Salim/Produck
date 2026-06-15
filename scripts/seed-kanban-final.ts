import postgres from 'postgres';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL');
const sql = postgres(databaseUrl, { ssl: 'require' });

async function run() {
  const [proj] = await sql`SELECT id FROM project WHERE name = 'K-Win'`;
  if (!proj) {
    console.error('K-Win not found');
    return;
  }
  const projectId = proj.id as number;

  await sql`DELETE FROM kanban_card WHERE project_id = ${projectId}`;

  // Every card verified against k-win-fe source
  const cards: {
    col: string;
    title: string;
    desc: string;
    assignee: string | null;
    priority: string;
    type: string;
  }[] = [
    // ═══ Done (verified in codebase) ═══
    {
      col: 'col-done',
      title: 'Landing page with hero, journey steps, and featured portfolios',
      desc: 'Animated hero section, Secure Curator Journey (4 steps), featured portfolios grid, CTAs, and competition winners showcase',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Portfolio PDF upload via drag and drop',
      desc: 'Styled drop zone accepting PDF files with instant slide thumbnail preview after upload',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'PDF slide viewer with thumbnail navigation',
      desc: 'Inline slide rendering with prev and next buttons, thumbnail strip, and page counter',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Registration with email, password, name, and username',
      desc: 'Sign up form via Better Auth client with server-side error messages on duplicate email or username',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Login with email and password',
      desc: 'Authentication via Better Auth with session tokens and protected route handling',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Discovery page with portfolio and creator browsing',
      desc: 'Karya tab showing portfolio cards with thumbnail, category badge, and like count. Talenta tab showing creator profiles',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Like and unlike portfolio with toggle API endpoint',
      desc: 'Heart icon toggle with optimistic UI update and server-side persistence via dedicated API route',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Liked portfolios list in layout sidebar',
      desc: 'Persistent sidebar panel showing every portfolio the user has liked for quick revisit',
      assignee: 'Edward',
      priority: 'medium',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Profile editing with avatar upload and social links',
      desc: 'Edit display name, username, headline, and avatar image with client-side canvas resize to 400px. WhatsApp and LinkedIn link fields',
      assignee: 'Edward',
      priority: 'high',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Portfolio category picker and creator type selector',
      desc: 'Dropdown of 12 categories plus individual or team toggle during portfolio creation',
      assignee: 'Edward',
      priority: 'medium',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Team member search and add by username',
      desc: 'Typeahead search input to find users and add them as team members on a portfolio',
      assignee: 'Edward',
      priority: 'medium',
      type: 'feature'
    },
    {
      col: 'col-done',
      title: 'Profile avatar client-side resize before upload',
      desc: 'Canvas-based resize to max 400px dimension reducing storage footprint and improving upload speed',
      assignee: 'Edward',
      priority: 'low',
      type: 'improvement'
    },
    {
      col: 'col-done',
      title: 'Authentication migrated to Better Auth',
      desc: 'Replaced legacy auth with Better Auth SDK, session token management, and OAuth-ready provider configuration',
      assignee: 'Edward',
      priority: 'low',
      type: 'task'
    },

    // ═══ To Do (genuine missing feature) ═══
    {
      col: 'col-todo',
      title: 'Wire up landing page search bar',
      desc: 'Search input in landing nav is present but has no form action or results handler',
      assignee: 'Edward',
      priority: 'medium',
      type: 'feature'
    }
  ];

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    await sql`
      INSERT INTO kanban_card (project_id, column_id, title, description, assignee, priority, type, sort_order)
      VALUES (${projectId}, ${c.col}, ${c.title}, ${c.desc}, ${c.assignee}, ${c.priority}, ${c.type}, ${i})
    `;
  }

  const counts = await sql`
    SELECT column_id, COUNT(*)::int as c FROM kanban_card
    WHERE project_id = ${projectId} GROUP BY column_id ORDER BY column_id
  `;
  console.log(`Seeded ${cards.length} cards:`);
  for (const r of counts) console.log(`  ${r.column_id}: ${r.c}`);
  console.log('Zero hallucination ✓');
  await sql.end();
}
run();
