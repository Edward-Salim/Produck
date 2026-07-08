import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

const fixes = {
  'gua-niu-jay-chou': [
    ['verse-1', 'Verse 1', 0, 4],
    ['chorus', 'Chorus', 4, 8],
    ['chorus-2', 'Chorus 2', 8, 12],
    ['outro', 'Outro', 12, 18]
  ],
  'zhou-da-xia-jay-chou': [
    ['verse-1', 'Verse 1', 0, 12],
    ['chorus', 'Chorus', 12, 22],
    ['verse-2', 'Verse 2', 22, 34],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['chorus-2', 'Chorus 2', 34, 44]
  ],
  'tian-ya-guo-ke-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['chorus', 'Chorus', 8, 16],
    ['verse-2', 'Verse 2', 16, 23],
    ['chorus-2', 'Chorus 2', 23, 32],
    ['outro', 'Outro', 32, 37]
  ],
  'zui-wei-da-de-zuo-pin-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['verse-2', 'Verse 2', 8, 16],
    ['pre-chorus', 'Pre-Chorus', 16, 24],
    ['chorus', 'Chorus', 24, 28],
    ['verse-3', 'Verse 3', 28, 36],
    ['repeat-chorus', 'Repeat Chorus', 'chorus']
  ],
  'shou-xie-de-cong-qian-jay-chou': [
    ['verse-1', 'Verse 1', 0, 9],
    ['pre-chorus', 'Pre-Chorus', 9, 14],
    ['chorus', 'Chorus', 14, 21],
    ['chorus-2', 'Chorus 2', 21, 27],
    ['verse-2', 'Verse 2', 27, 39],
    ['bridge', 'Bridge', 39, 53],
    ['repeat-pre-chorus', 'Repeat Pre-Chorus', 'pre-chorus'],
    ['repeat-chorus', 'Repeat Chorus', 'chorus']
  ],
  'yang-ming-shan-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['pre-chorus', 'Pre-Chorus', 8, 16],
    ['chorus', 'Chorus', 16, 24],
    ['bridge', 'Bridge', 24, 31],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['verse-2', 'Verse 2', 31, 39]
  ],
  'ting-ma-ma-de-hua-jay-chou-request': [
    ['verse-1', 'Verse 1', 0, 14],
    ['chorus', 'Chorus', 14, 22],
    ['verse-2', 'Verse 2', 22, 41],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['bridge', 'Bridge', 41, 47],
    ['repeat-chorus-2', 'Repeat Chorus', 'chorus']
  ],
  'wu-ke-li-li-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['pre-chorus', 'Pre-Chorus', 8, 12],
    ['chorus', 'Chorus', 12, 24],
    ['bridge', 'Bridge', 24, 26],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['chorus-2', 'Chorus 2', 26, 30],
    ['repeat-chorus-2', 'Repeat Chorus', 'chorus']
  ],
  'hong-chen-ke-zhan-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['chorus', 'Chorus', 8, 14],
    ['verse-2', 'Verse 2', 14, 22],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['outro', 'Outro', 22, 25]
  ],
  'mi-hun-qu-jay-chou': [
    ['verse-1', 'Verse 1', 0, 14],
    ['chorus', 'Chorus', 14, 23],
    ['verse-2', 'Verse 2', 23, 31],
    ['bridge', 'Bridge', 31, 34],
    ['outro', 'Outro', 34, 36],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['ad-lib', 'Ad-lib', 36, 40]
  ],
  'ni-hao-ma-jay-chou': [
    ['verse-1', 'Verse 1', 0, 8],
    ['chorus', 'Chorus', 8, 12],
    ['verse-2', 'Verse 2', 12, 16],
    ['chorus-2', 'Chorus 2', 16, 20],
    ['outro', 'Outro', 20, 24],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['bridge', 'Bridge', 24, 26]
  ],
  'qian-li-zhi-wai-jay-chou-request': [
    ['verse-1', 'Verse 1', 0, 6],
    ['chorus', 'Chorus', 6, 11],
    ['bridge', 'Bridge', 11, 15],
    ['verse-2', 'Verse 2', 15, 21],
    ['repeat-chorus', 'Repeat Chorus', 'chorus'],
    ['outro', 'Outro', 21, 22]
  ]
};

function flattenLines(song) {
  return (song.sections ?? []).flatMap((section) => section.lines ?? []);
}

function makeSections(lines, specs) {
  return specs
    .map(([id, label, start, end]) => {
      if (typeof start === 'string') return { id, label, repeatOf: start };
      return { id, label, lines: lines.slice(start, end) };
    })
    .filter((section) => section.repeatOf || section.lines.length);
}

let updated = 0;

for (const [slug, specs] of Object.entries(fixes)) {
  const rows = await sql.unsafe(
    `select song from chinese_song_lyric where slug = $1`,
    [slug]
  );
  if (!rows.length) {
    console.warn(`Missing ${slug}`);
    continue;
  }

  const song = rows[0].song;
  const lines = flattenLines(song);
  song.sections = makeSections(lines, specs);

  await sql.unsafe(
    `update chinese_song_lyric set song = $1, updated_at = now() where slug = $2`,
    [song, slug]
  );
  updated += 1;
}

await sql.end();
console.log(`Updated ${updated} songs.`);
