import 'dotenv/config';
import fs from 'node:fs';
import * as OpenCC from 'opencc-js';
import { load as loadHtml } from 'cheerio';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });
const HAN_RE = /\p{Script=Han}/u;
const MARKER_RE = /^\*+$/;
const REPEAT_RE = /^Repeat\s+/i;
const BRACKET_SECTION_RE = /^\[[^\]]+\]$/;

function normalizeSpace(value) {
  return value.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
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
    .filter(Boolean);
}

function sourceSlug(entry) {
  const link = entry.link?.find((item) => item.rel === 'alternate')?.href ?? '';
  return link.match(/\/([^/]+)\.html(?:$|\?)/)?.[1] ?? '';
}

function isCreditOrNoise(line) {
  return /^(作词|作曲|Lyrics|Composer|Lyricist|Arranged|Produced|Share|Labels?:|Posted by)/i.test(
    line
  );
}

function isStandaloneLatinLyric(lines, index) {
  const line = normalizeSpace(lines[index]);
  const previous = lines[index - 1] ?? '';

  return (
    line &&
    !HAN_RE.test(line) &&
    /[A-Za-z]/.test(line) &&
    !MARKER_RE.test(line) &&
    !REPEAT_RE.test(line) &&
    !BRACKET_SECTION_RE.test(line) &&
    !isCreditOrNoise(line) &&
    !HAN_RE.test(previous)
  );
}

function nearestNextHanzi(lines, index) {
  for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
    const line = normalizeSpace(lines[cursor]);
    if (MARKER_RE.test(line) || REPEAT_RE.test(line)) return '';
    if (HAN_RE.test(line)) return toSimplified(line);
  }
  return '';
}

function nearestPreviousHanzi(lines, index) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const line = normalizeSpace(lines[cursor]);
    if (MARKER_RE.test(line) || REPEAT_RE.test(line)) return '';
    if (HAN_RE.test(line)) return toSimplified(line);
  }
  return '';
}

function lineCount(song, text) {
  return (song.sections ?? []).reduce(
    (count, section) =>
      count + (section.lines ?? []).filter((line) => line.hanzi === text).length,
    0
  );
}

function insertBefore(song, anchor, lyric) {
  if (!anchor) return false;

  for (const section of song.sections ?? []) {
    const lines = section.lines ?? [];
    const index = lines.findIndex((line) => line.hanzi === anchor);
    if (index >= 0) {
      lines.splice(index, 0, lyric);
      return true;
    }
  }

  return false;
}

function insertAfter(song, anchor, lyric) {
  if (!anchor) return false;

  for (const section of song.sections ?? []) {
    const lines = section.lines ?? [];
    const index = lines.findIndex((line) => line.hanzi === anchor);
    if (index >= 0) {
      lines.splice(index + 1, 0, lyric);
      return true;
    }
  }

  return false;
}

const feed = JSON.parse(fs.readFileSync('songs.json', 'utf8'));
const rows = await sql.unsafe(`select slug, song from chinese_song_lyric order by sort_order, id`);
const rowBySlug = new Map(rows.map((row) => [row.slug, row]));
const candidatesBySlug = new Map();

for (const entry of feed.feed?.entry ?? []) {
  const slug = sourceSlug(entry);
  if (!rowBySlug.has(slug)) continue;

  const lines = htmlToLines(entry.content?.$t ?? '');
  const candidates = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!isStandaloneLatinLyric(lines, index)) continue;

    candidates.push({
      text: toSimplified(normalizeSpace(lines[index])),
      nextHanzi: nearestNextHanzi(lines, index),
      previousHanzi: nearestPreviousHanzi(lines, index)
    });
  }

  if (candidates.length) candidatesBySlug.set(slug, candidates);
}

let updatedSongs = 0;
let insertedLines = 0;
const failures = [];

for (const [slug, candidates] of candidatesBySlug) {
  const row = rowBySlug.get(slug);
  const song = row.song;
  let changed = false;
  const desiredCounts = new Map();

  for (const candidate of candidates) {
    desiredCounts.set(candidate.text, (desiredCounts.get(candidate.text) ?? 0) + 1);
  }

  // Reverse order keeps multiple Latin lines before the same Hanzi in the source order.
  for (const candidate of [...candidates].reverse()) {
    const existing = lineCount(song, candidate.text);
    const desired = desiredCounts.get(candidate.text) ?? 0;
    if (existing >= desired) {
      desiredCounts.set(candidate.text, desired - 1);
      continue;
    }

    const lyric = { hanzi: candidate.text, pinyin: '', english: '' };
    const inserted =
      insertBefore(song, candidate.nextHanzi, lyric) ||
      insertAfter(song, candidate.previousHanzi, lyric);

    if (inserted) {
      changed = true;
      insertedLines += 1;
    } else {
      failures.push({ slug, line: candidate.text });
    }

    desiredCounts.set(candidate.text, desired - 1);
  }

  if (changed) {
    await sql.unsafe(
      `update chinese_song_lyric set song = $1, updated_at = now() where slug = $2`,
      [song, slug]
    );
    updatedSongs += 1;
  }
}

await sql.end();

console.log(`Updated ${updatedSongs} songs.`);
console.log(`Inserted ${insertedLines} standalone Latin lyric lines.`);
if (failures.length) {
  console.log(JSON.stringify({ failures }, null, 2));
}
