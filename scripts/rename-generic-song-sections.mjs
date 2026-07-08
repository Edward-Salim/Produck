import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

const BASE_LABELS = [
  'Verse 1',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Post-Chorus',
  'Outro',
  'Part 7',
  'Part 8'
];

function isGenericSection(label = '') {
  return /^Section\s+[A-Z](?:\s*\d+)?$/i.test(label.trim());
}

function isGenericRepeat(label = '') {
  return /^Repeat\s+Section\s+[A-Z](?:\s*\d+)?(?:\s+x\d+)?$/i.test(label.trim());
}

function repeatSuffix(label = '') {
  return label.match(/\s+x\d+$/i)?.[0]?.trim() ?? '';
}

function uniqueLabel(base, used) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 2;
  while (used.has(`${base} ${index}`)) index += 1;
  const label = `${base} ${index}`;
  used.add(label);
  return label;
}

function nextBaseLabel(index, lineCount) {
  const base = BASE_LABELS[index] ?? `Part ${index + 1}`;
  if (index === 0 && lineCount <= 2) return 'Intro';
  return base;
}

const rows = await sql.unsafe(`select slug, song from chinese_song_lyric order by sort_order, id`);
let updated = 0;
let renamedSections = 0;
let renamedRepeats = 0;

for (const row of rows) {
  const song = row.song;
  const sections = song.sections ?? [];
  let changed = false;
  let genericIndex = 0;
  const usedLabels = new Set(
    sections
      .filter((section) => !section.repeatOf && !isGenericSection(section.label))
      .map((section) => section.label)
      .filter(Boolean)
  );

  for (const section of sections) {
    if (section.repeatOf || !isGenericSection(section.label)) continue;

    const nextLabel = uniqueLabel(
      nextBaseLabel(genericIndex, section.lines?.length ?? 0),
      usedLabels
    );
    genericIndex += 1;

    if (section.label !== nextLabel) {
      section.label = nextLabel;
      changed = true;
      renamedSections += 1;
    }
  }

  const byId = new Map(sections.map((section) => [section.id, section]));

  for (const section of sections) {
    if (!section.repeatOf || !isGenericRepeat(section.label)) continue;

    const target = byId.get(section.repeatOf);
    if (!target?.label) continue;

    const suffix = repeatSuffix(section.label);
    const nextLabel = `Repeat ${target.label}${suffix ? ` ${suffix}` : ''}`;
    if (section.label !== nextLabel) {
      section.label = nextLabel;
      changed = true;
      renamedRepeats += 1;
    }
  }

  if (changed) {
    await sql.unsafe(
      `update chinese_song_lyric set song = $1, updated_at = now() where slug = $2`,
      [song, row.slug]
    );
    updated += 1;
  }
}

await sql.end();
console.log(`Updated ${updated} songs.`);
console.log(`Renamed ${renamedSections} generic sections.`);
console.log(`Renamed ${renamedRepeats} generic repeats.`);
