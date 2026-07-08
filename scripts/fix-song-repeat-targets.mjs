import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

function targetLabel(label) {
  return label.replace(/^Repeat\s+/i, '').replace(/\s+x\d+$/i, '').trim();
}

function findTarget(sections, repeat, index) {
  const ids = new Set(sections.map((section) => section.id));
  if (repeat.repeatOf && ids.has(repeat.repeatOf)) return repeat.repeatOf;

  const wanted = targetLabel(repeat.label ?? '').toLowerCase();
  const byLabel = sections.find(
    (section) => !section.repeatOf && (section.label ?? '').toLowerCase() === wanted
  );
  if (byLabel) return byLabel.id;

  if (repeat.repeatOf === 'x2') {
    return [...sections.slice(0, index)].reverse().find((section) => !section.repeatOf)?.id;
  }

  if (repeat.repeatOf === 'chorus' || wanted === 'chorus') {
    const chorus = sections.find(
      (section) => !section.repeatOf && /chorus/i.test(section.label ?? '')
    );
    if (chorus) return chorus.id;

    const sectionA = sections.find((section) => section.id === 'section-a');
    if (sectionA) return sectionA.id;
  }

  if (repeat.repeatOf === 'chorus-x2') {
    const chorus = sections.find(
      (section) => !section.repeatOf && /chorus/i.test(section.label ?? '')
    );
    if (chorus) return chorus.id;

    const sectionA = sections.find((section) => section.id === 'section-a');
    if (sectionA) return sectionA.id;
  }

  if (repeat.repeatOf === 'section-a') {
    const verse1 = sections.find((section) => section.id === 'verse-1');
    if (verse1) return verse1.id;
  }

  return undefined;
}

function flattenLines(song) {
  return (song.sections ?? []).flatMap((section) => section.lines ?? []);
}

let updated = 0;
const rows = await sql.unsafe(`select slug, song from chinese_song_lyric order by sort_order, id`);

for (const row of rows) {
  const song = row.song;
  let changed = false;

  if (row.slug === 'ting-ma-ma-de-hua-jay-chou-request') {
    const lines = flattenLines(song);
    song.sections = [
      { id: 'verse-1', label: 'Verse 1', lines: lines.slice(0, 14) },
      { id: 'chorus', label: 'Chorus', lines: lines.slice(14, 22) },
      { id: 'verse-2', label: 'Verse 2', lines: lines.slice(22, 33) },
      { id: 'verse-3', label: 'Verse 3', lines: lines.slice(33, 41) },
      { id: 'repeat-chorus', label: 'Repeat Chorus', repeatOf: 'chorus' },
      { id: 'bridge', label: 'Bridge', lines: lines.slice(41, 47) },
      { id: 'repeat-chorus-2', label: 'Repeat Chorus', repeatOf: 'chorus' }
    ].filter((section) => section.repeatOf || section.lines.length);
    changed = true;
  }

  for (const [index, section] of (song.sections ?? []).entries()) {
    if (!section.repeatOf) continue;

    const target = findTarget(song.sections, section, index);
    if (target && target !== section.repeatOf) {
      section.repeatOf = target;
      changed = true;
    }

    if (/^Repeat \*+/i.test(section.label ?? '') && target) {
      const targetSection = song.sections.find((candidate) => candidate.id === target);
      const xCount = section.label.match(/x\d+/i)?.[0] ?? '';
      const nextLabel = `Repeat ${targetSection?.label ?? 'Section'}${xCount ? ` ${xCount}` : ''}`;
      if (section.label !== nextLabel) {
        section.label = nextLabel;
        changed = true;
      }
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
