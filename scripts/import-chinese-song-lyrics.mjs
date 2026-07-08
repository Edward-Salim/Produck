import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';
import { load as loadHtml } from 'cheerio';
import { pinyin } from 'pinyin-pro';
import postgres from 'postgres';

const inputPath = path.resolve(process.argv[2] ?? 'songs.json');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });

const HAN_RE = /\p{Script=Han}/u;
const MARKER_RE = /^\*+$/;
const REPEAT_RE = /^Repeat\s+(.+)$/i;
const TRAILING_NOISE_RE = /^(Share this|Labels?:|Posted by|Newer Post|Older Post|Home)$/i;

function normalizeSpace(value) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function titleCasePinyin(value) {
  return value.replace(/\S+/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}

function tonePinyinFor(value) {
  const hanOnly = [...value].map((char) => (HAN_RE.test(char) ? char : ' ')).join('');
  return normalizeSpace(pinyin(hanOnly, { toneType: 'symbol' }));
}

function slugify(value) {
  return normalizeSpace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function htmlToLines(html) {
  const shareIndex = html.search(/<div[^>]+class=["'][^"']*fb-share-button/i);
  const bodyHtml = shareIndex >= 0 ? html.slice(0, shareIndex) : html;
  const $ = loadHtml(bodyHtml);

  $('script, style, iframe, .fb-share-button').remove();
  $('br').replaceWith('\n');

  return $.root()
    .text()
    .split(/\r?\n/)
    .map(normalizeSpace)
    .filter((line) => line && !TRAILING_NOISE_RE.test(line));
}

function parseTitle(entry) {
  const rawTitle = normalizeSpace(entry.title?.$t ?? 'Untitled');
  const match = rawTitle.match(/^(.*?)\s+-\s+(.*?)\s+\((.*?)\s+-\s+(.*?)\)\s*$/);
  const link = entry.link?.find((item) => item.rel === 'alternate')?.href ?? '';
  const linkSlug = link.match(/\/([^/]+)\.html(?:$|\?)/)?.[1];

  if (!match) {
    return {
      rawTitle,
      id: linkSlug ?? slugify(rawTitle),
      titleHanzi: toSimplified(rawTitle),
      titlePinyin: titleCasePinyin(tonePinyinFor(rawTitle) || rawTitle),
      titleEnglish: rawTitle,
      singer: '',
      singerHanzi: '',
      singerPinyin: '',
      sourceUrl: link
    };
  }

  const [, titleRoman, singerRoman, titleHanziRaw, singerHanziRaw] = match;
  const titleHanzi = toSimplified(normalizeSpace(titleHanziRaw));
  const singerHanzi = toSimplified(normalizeSpace(singerHanziRaw));

  return {
    rawTitle,
    id: linkSlug ?? slugify(`${titleRoman}-${singerRoman}`),
    titleHanzi,
    titlePinyin: titleCasePinyin(tonePinyinFor(titleHanzi) || normalizeSpace(titleRoman)),
    titleEnglish: normalizeSpace(titleRoman),
    singer: normalizeSpace(singerRoman),
    singerHanzi,
    singerPinyin: titleCasePinyin(tonePinyinFor(singerHanzi) || normalizeSpace(singerRoman)),
    sourceUrl: link
  };
}

function sectionLabelForMarker(marker) {
  const index = marker.length;
  return `Section ${String.fromCharCode(64 + Math.min(index, 26))}`;
}

function sectionId(label, usedIds) {
  const base = slugify(label) || 'section';
  let id = base;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${base}-${suffix++}`;
  }

  usedIds.add(id);
  return id;
}

function isRomanizationLine(line) {
  return !HAN_RE.test(line) && /^[A-Za-z0-9\s'’().,!?;:\-–—&/]+$/.test(line);
}

function parseSections(lines) {
  const sections = [];
  const markerToSectionId = new Map();
  const markerToLabel = new Map();
  const usedIds = new Set();
  let verseCount = 1;
  let current = {
    id: sectionId(`Verse ${verseCount++}`, usedIds),
    label: 'Verse 1',
    lines: []
  };

  function pushCurrent() {
    if (current.lines?.length || current.repeatOf) sections.push(current);
  }

  function startSection(label) {
    pushCurrent();
    current = {
      id: sectionId(label, usedIds),
      label,
      lines: []
    };
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (MARKER_RE.test(line)) {
      const label = sectionLabelForMarker(line);
      startSection(label);
      markerToSectionId.set(line, current.id);
      markerToLabel.set(line, label);
      continue;
    }

    const repeatMatch = line.match(REPEAT_RE);
    if (repeatMatch) {
      pushCurrent();

      const targetKey = normalizeSpace(repeatMatch[1]);
      const targetId = markerToSectionId.get(targetKey) ?? slugify(targetKey);
      const targetLabel = markerToLabel.get(targetKey) ?? targetKey;
      const label = `Repeat ${targetLabel}`;

      current = {
        id: sectionId(label, usedIds),
        label,
        repeatOf: targetId
      };
      pushCurrent();

      current = {
        id: sectionId(`Verse ${verseCount++}`, usedIds),
        label: `Verse ${verseCount - 1}`,
        lines: []
      };
      continue;
    }

    if (HAN_RE.test(line)) {
      const hanzi = toSimplified(line);

      if (isRomanizationLine(lines[index + 1] ?? '')) {
        index++;
      }

      current.lines.push({
        hanzi,
        pinyin: tonePinyinFor(hanzi),
        english: ''
      });
      continue;
    }

    if (!isRomanizationLine(line)) {
      current.lines.push({
        hanzi: line,
        pinyin: '',
        english: ''
      });
    }
  }

  pushCurrent();

  return sections.filter((section) => section.repeatOf || section.lines?.length);
}

function entryToSong(entry, sortOrder) {
  const title = parseTitle(entry);
  const content = entry.content?.$t ?? '';
  const lines = htmlToLines(content);
  const tags = (entry.category ?? []).map((category) => category.term).filter(Boolean);

  return {
    slug: title.id,
    sortOrder,
    song: {
      id: title.id,
      titlePinyin: title.titlePinyin,
      titleHanzi: title.titleHanzi,
      titleEnglish: title.titleEnglish,
      singer: title.singer,
      singerHanzi: title.singerHanzi,
      singerPinyin: title.singerPinyin,
      tags,
      sourceUrl: title.sourceUrl,
      publishedAt: entry.published?.$t ?? null,
      sections: parseSections(lines)
    }
  };
}

const feed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const entries = feed.feed?.entry ?? [];
const rows = entries.map((entry, index) => entryToSong(entry, index + 1));

for (const row of rows) {
  await sql`
    insert into chinese_song_lyric (slug, song, sort_order, updated_at)
    values (${row.slug}, ${sql.json(row.song)}, ${row.sortOrder}, now())
    on conflict (slug) do update set
      song = excluded.song,
      sort_order = excluded.sort_order,
      updated_at = now()
  `;
}

await sql.end();

console.log(`Imported ${rows.length} songs from ${path.relative(process.cwd(), inputPath)}.`);
console.log(
  `Parsed ${rows.reduce((total, row) => total + row.song.sections.length, 0)} sections and ${rows.reduce(
    (total, row) =>
      total +
      row.song.sections.reduce((sectionTotal, section) => sectionTotal + (section.lines?.length ?? 0), 0),
    0
  )} lyric lines.`
);
