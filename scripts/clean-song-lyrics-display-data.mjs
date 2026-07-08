import 'dotenv/config';
import postgres from 'postgres';
import { pinyin } from 'pinyin-pro';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });
const HAN_RE = /\p{Script=Han}/u;
const SECTION_MARKER_RE = /^\[(.+)\]$/;

function normalizeSpace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function isRomanizationOnly(value) {
  return /^[A-Za-z0-9\s'’().,!?;:\-–—&/（）]+$/.test(value.trim());
}

function isStandaloneEnglishLyric(line, text) {
  return text && !line.pinyin?.trim() && !line.english?.trim() && /[A-Za-z]/.test(text);
}

function pinyinForHanziOnly(value) {
  const hanziOnly = [...value].map((char) => (HAN_RE.test(char) ? char : ' ')).join('');
  return normalizeSpace(pinyin(hanziOnly, { toneType: 'symbol' })).replace(
    /^(\s*)([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ])/u,
    (_, space, first) => `${space}${first.toLocaleUpperCase()}`
  );
}

const rows = await sql`
  select slug, song
  from chinese_song_lyric
  order by sort_order, id
`;

let updatedSongs = 0;
let removedLines = 0;
let fixedPinyin = 0;

for (const row of rows) {
  const song = row.song;
  let changed = false;

  for (const section of song.sections ?? []) {
    if (!section.lines?.length) continue;

    const nextLines = [];

    for (const line of section.lines) {
      const text = normalizeSpace(line.hanzi ?? '');
      const marker = text.match(SECTION_MARKER_RE);

      if (!HAN_RE.test(text)) {
        if (marker) {
          section.label = marker[1];
        }

        if ((isRomanizationOnly(text) && !isStandaloneEnglishLyric(line, text)) || marker) {
          removedLines += 1;
          changed = true;
          continue;
        }
      }

      if (HAN_RE.test(text)) {
        const nextPinyin = pinyinForHanziOnly(text);
        if (line.pinyin !== nextPinyin) {
          line.pinyin = nextPinyin;
          fixedPinyin += 1;
          changed = true;
        }
      }

      nextLines.push(line);
    }

    section.lines = nextLines;
  }

  song.sections = (song.sections ?? []).filter((section) => section.repeatOf || section.lines?.length);

  if (changed) {
    await sql`
      update chinese_song_lyric
      set song = ${sql.json(song)}, updated_at = now()
      where slug = ${row.slug}
    `;
    updatedSongs += 1;
  }
}

await sql.end();

console.log(`Updated ${updatedSongs} songs.`);
console.log(`Removed ${removedLines} non-lyric rows.`);
console.log(`Regenerated ${fixedPinyin} pinyin lines from hanzi only.`);
