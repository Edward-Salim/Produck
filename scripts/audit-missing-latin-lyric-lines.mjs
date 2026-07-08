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

const feed = JSON.parse(fs.readFileSync('songs.json', 'utf8'));
const dbRows = await sql.unsafe(`select slug, song from chinese_song_lyric`);
const dbTextBySlug = new Map(dbRows.map((row) => [row.slug, JSON.stringify(row.song)]));
const candidates = [];

for (const entry of feed.feed?.entry ?? []) {
  const slug = sourceSlug(entry);
  const title = entry.title?.$t ?? slug;
  const lines = htmlToLines(entry.content?.$t ?? '');
  const dbText = dbTextBySlug.get(slug) ?? '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeSpace(lines[index]);

    if (
      !line ||
      HAN_RE.test(line) ||
      MARKER_RE.test(line) ||
      REPEAT_RE.test(line) ||
      BRACKET_SECTION_RE.test(line) ||
      !/[A-Za-z]/.test(line) ||
      isCreditOrNoise(line)
    ) {
      continue;
    }

    const previous = lines[index - 1] ?? '';
    if (HAN_RE.test(previous)) continue;

    const simplified = toSimplified(line);
    const inDb = dbText.includes(simplified);

    candidates.push({
      slug,
      title,
      line: simplified,
      previous,
      next: lines[index + 1] ?? '',
      inDb
    });
  }
}

await sql.end();

const missing = candidates.filter((candidate) => !candidate.inDb);
console.log(JSON.stringify({ count: candidates.length, missingCount: missing.length, missing }, null, 2));
