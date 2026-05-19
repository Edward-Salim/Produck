/**
 * Generate SQL to seed PM artifacts and methodologies into the database.
 * Run with: bun scripts/seed-pm-data.ts
 */
import { ARTIFACTS, METHODOLOGIES } from '../src/lib/components/toolkit/pm-data.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

const sqlStatements: string[] = [];
function addSql(s: string) {
  sqlStatements.push(s);
}

// ── Book metadata ──
const BOOK_META: Record<
  string,
  { slug: string; title: string; subtitle: string; author: string; year: number; coverPath: string }
> = {
  'Continuous Discovery Habits': {
    slug: 'cdh',
    title: 'Continuous Discovery Habits',
    subtitle: 'Discover Products that Create Customer Value and Business Value',
    author: 'Teresa Torres',
    year: 2021,
    coverPath: '/covers/continuous_discovery_habits.jpg'
  },
  INSPIRED: {
    slug: 'inspired',
    title: 'INSPIRED',
    subtitle: 'How to Create Tech Products Customers Love',
    author: 'Marty Cagan',
    year: 2017,
    coverPath: '/covers/inspired.jpg'
  },
  'Outcomes Over Output': {
    slug: 'outcomes',
    title: 'Outcomes Over Output',
    subtitle: 'Why Behavior Change Is the Key to Results',
    author: 'Josh Seiden',
    year: 2019,
    coverPath: '/covers/outcomes_over_output.png'
  },
  Sprint: {
    slug: 'sprint',
    title: 'Sprint',
    subtitle: 'How to Solve Big Problems and Test New Ideas in Just Five Days',
    author: 'Jake Knapp',
    year: 2016,
    coverPath: '/covers/sprint.jpg'
  },
  'The Mom Test': {
    slug: 'momtest',
    title: 'The Mom Test',
    subtitle: 'How to Talk to Customers and Learn If Your Business Is a Good Idea',
    author: 'Rob Fitzpatrick',
    year: 2013,
    coverPath: '/covers/the_mom_test.jpg'
  },
  'User Story Mapping': {
    slug: 'usm',
    title: 'User Story Mapping',
    subtitle: 'Discover the Whole Story, Build the Right Product',
    author: 'Jeff Patton',
    year: 2014,
    coverPath: '/covers/user_story_mapping.jpg'
  },
  'Problem Solving 101': {
    slug: 'ps101',
    title: 'Problem Solving 101',
    subtitle: 'A Simple Book for Smart People',
    author: 'Ken Watanabe',
    year: 2009,
    coverPath: '/covers/problem_solving_101.png'
  },
  'Evidence-Guided': {
    slug: 'eg',
    title: 'Evidence-Guided',
    subtitle: 'Creating High-Impact Products in the Face of Uncertainty',
    author: 'Itamar Gilad',
    year: 2024,
    coverPath: '/covers/evidence_guided.png'
  },
  'PPD Class': {
    slug: 'ppd',
    title: 'PPD Class',
    subtitle: 'Pengembangan Produk Digital',
    author: 'UI Course',
    year: 2025,
    coverPath: ''
  }
};

// ── Books ──
const sources = new Set(ARTIFACTS.map((a) => a.source));
for (const source of sources) {
  const meta = BOOK_META[source];
  if (meta) {
    addSql(
      `INSERT INTO pm_book (slug, title, subtitle, author, year, cover_path) VALUES ('${esc(meta.slug)}', '${esc(meta.title)}', '${esc(meta.subtitle)}', '${esc(meta.author)}', ${meta.year}, '${esc(meta.coverPath)}') ON CONFLICT (slug) DO NOTHING;`
    );
  } else {
    const slug = source
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    addSql(
      `INSERT INTO pm_book (slug, title) VALUES ('${esc(slug)}', '${esc(source)}') ON CONFLICT (slug) DO NOTHING;`
    );
  }
}

// ── Artifacts ──
for (const a of ARTIFACTS) {
  const meta = BOOK_META[a.source];
  const slug =
    meta?.slug ??
    a.source
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  const howTo = JSON.stringify(a.howTo ?? []);
  const figure = a.figure ? `'${esc(a.figure)}'` : 'NULL';
  addSql(
    `INSERT INTO pm_artifact (book_id, name, category, description, how_to, figure) VALUES ((SELECT id FROM pm_book WHERE slug = '${esc(slug)}'), '${esc(a.name)}', '${esc(a.category)}', '${esc(a.description)}', '${esc(howTo)}', ${figure});`
  );
}

// ── Methodologies ──
for (const m of METHODOLOGIES) {
  const relatedArtifacts = JSON.stringify(m.relatedArtifacts ?? []);
  const figure = m.figure ? `'${esc(m.figure)}'` : 'NULL';
  addSql(
    `INSERT INTO pm_methodology (name, phase, origin, description, related_artifacts, figure) VALUES ('${esc(m.name)}', '${esc(m.phase)}', '${esc(m.origin)}', '${esc(m.description)}', '${esc(relatedArtifacts)}', ${figure});`
  );
}

// Write to seed-pm.sql file directly (UTF-8, no BOM)
const outputPath = path.join(__dirname, 'seed-pm.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n') + '\n', 'utf-8');
console.log(`Successfully wrote ${sqlStatements.length} seed statements to ${outputPath}`);
