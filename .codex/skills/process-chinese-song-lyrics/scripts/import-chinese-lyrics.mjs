#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs/promises';
import postgres from 'postgres';
import { Converter } from 'opencc-js';

const HAN_RE = /[\u3400-\u9fff]/u;
const MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
const t2s = Converter({ from: 't', to: 'cn' });

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const inputPath = argValue('--input');
const overridePath = argValue('--overrides');
const concurrency = Number(argValue('--concurrency', '4'));

if (!inputPath) {
  console.error('Usage: node import-chinese-lyrics.mjs --input song-imports/songs-new.md [--concurrency 4] [--overrides overrides.json]');
  process.exit(1);
}

function normalizeSpace(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function normalizeSlug(value) {
  const slug = normalizeSpace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || `song-${Date.now()}`;
}

function stripFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractJsonObject(text) {
  const raw = stripFences(text);
  if (raw.startsWith('{') && raw.endsWith('}')) return raw;

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) return raw.slice(start, index + 1);
    }
  }

  return raw;
}

function normalizeComparable(value) {
  return normalizeSpace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function duplicateLatinEnglish(hanzi, english) {
  return !HAN_RE.test(hanzi) && normalizeComparable(hanzi) === normalizeComparable(english);
}

function normalizeLinePinyin(hanzi, pinyin) {
  if (!HAN_RE.test(hanzi)) return '';
  const latinTokens = new Set(
    [...hanzi.matchAll(/[A-Za-z0-9'’.-]+/gu)]
      .map((match) => normalizeComparable(match[0]))
      .filter(Boolean)
  );
  if (!latinTokens.size) return normalizeSpace(pinyin);
  return normalizeSpace(pinyin)
    .split(/\s+/u)
    .filter((token) => !latinTokens.has(normalizeComparable(token)))
    .join(' ');
}

function simplifySong(song) {
  const next = {
    id: normalizeSlug(song.id || song.titlePinyin || song.titleEnglish || song.titleHanzi),
    titlePinyin: normalizeSpace(song.titlePinyin),
    titleHanzi: t2s(normalizeSpace(song.titleHanzi)),
    titleEnglish: normalizeSpace(song.titleEnglish),
    singer: normalizeSpace(song.singer) || 'Unknown Artist',
    singerHanzi: t2s(normalizeSpace(song.singerHanzi || song.singer || 'Unknown Artist')),
    singerPinyin: normalizeSpace(song.singerPinyin),
    tags: Array.isArray(song.tags)
      ? song.tags.map(normalizeSpace).filter(Boolean).slice(0, 8)
      : ['mandopop'],
    sections: []
  };

  for (const section of Array.isArray(song.sections) ? song.sections : []) {
    const id = normalizeSlug(section.id || section.label || `section-${next.sections.length + 1}`);
    const label = normalizeSpace(section.label) || `Section ${next.sections.length + 1}`;
    const repeatOf = normalizeSpace(section.repeatOf);
    if (repeatOf) {
      next.sections.push({ id, label, repeatOf: normalizeSlug(repeatOf) });
      continue;
    }

    const lines = [];
    for (const line of Array.isArray(section.lines) ? section.lines : []) {
      let hanzi = t2s(normalizeSpace(line.hanzi));
      hanzi = hanzi.replace(/著/gu, '着');
      if (!hanzi) continue;
      const pinyin = normalizeLinePinyin(hanzi, line.pinyin);
      const english = normalizeSpace(line.english);
      lines.push({
        hanzi,
        pinyin,
        english: duplicateLatinEnglish(hanzi, english) ? '' : english
      });
    }
    if (lines.length) next.sections.push({ id, label, lines });
  }

  if (!next.titleHanzi || !next.titlePinyin || !next.titleEnglish || !next.sections.length) {
    throw new Error(`Incomplete standardized song: ${JSON.stringify({
      titleHanzi: next.titleHanzi,
      titlePinyin: next.titlePinyin,
      titleEnglish: next.titleEnglish,
      sections: next.sections.length
    })}`);
  }

  return next;
}

function applyOverrides(song, rawSong, overrides) {
  for (const [key, patch] of Object.entries(overrides)) {
    if (song.titleHanzi === key || rawSong.includes(key)) {
      const next = { ...song, ...patch };
      next.id = normalizeSlug(next.id || next.titlePinyin || next.titleEnglish || next.titleHanzi);
      return next;
    }
  }
  return song;
}

function buildPrompt(rawSong) {
  return `Standardize this pasted Chinese song into this JSON schema only:
{
  "id": "lowercase-url-slug",
  "titlePinyin": "Mandarin title pinyin with tone marks",
  "titleHanzi": "simplified Chinese title",
  "titleEnglish": "natural concise English title translation",
  "singer": "artist name in English or romanization",
  "singerHanzi": "artist name in simplified Chinese if known, otherwise same as singer",
  "singerPinyin": "artist Mandarin pinyin with tone marks if singerHanzi is Chinese, otherwise empty string",
  "tags": ["mandopop"],
  "sections": [{ "id": "verse-1", "label": "Verse 1", "lines": [{ "hanzi": "simplified Chinese lyric line", "pinyin": "Mandarin pinyin with tone marks", "english": "natural English translation" }] }]
}

Rules:
- Return only valid JSON.
- Use simplified Chinese for titleHanzi, singerHanzi, and all Chinese lyric lines.
- Remove lyric-site noise, credits, preview labels, album labels, decorative symbols, and duplicated artist text.
- Keep lyric line order exactly.
- Generate accurate Mandarin pinyin with tone marks for each Chinese line.
- For mixed Chinese and Latin lines, pinyin must include only Chinese-character syllables.
- Preserve non-Chinese lyric lines in hanzi exactly with empty pinyin; if english duplicates it, make english empty.
- Use repeatOf sections for exact repeated sections when appropriate.
- Never use alphabetic suffixes in section ids or labels (for example, chorus-1a or Chorus 1B). Give genuinely different sections consecutive whole numbers such as chorus-1, chorus-2, and chorus-3.

Pasted song:
${rawSong}`;
}

async function callDeepSeek(rawSong) {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is not configured.');

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: buildPrompt(rawSong) }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API ${response.status}: ${await response.text().catch(() => '')}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('DeepSeek returned empty content.');
  return text;
}

async function mapConcurrent(items, mapper) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await mapper(items[index], index);
      }
    })
  );
  return results;
}

function collectHanzi(song) {
  return [
    song.titleHanzi,
    song.singerHanzi,
    ...song.sections.flatMap((section) => section.lines?.map((line) => line.hanzi) ?? [])
  ];
}

async function main() {
  const overrides = overridePath ? JSON.parse(await fs.readFile(overridePath, 'utf8')) : {};
  const raw = await fs.readFile(inputPath, 'utf8');
  const chunks = raw.split(/^---\s*$/m).map((chunk) => chunk.trim()).filter(Boolean);
  console.log(`Importing ${chunks.length} songs with concurrency ${concurrency} using ${MODEL}`);

  const songs = await mapConcurrent(chunks, async (chunk, index) => {
    const parsed = JSON.parse(extractJsonObject(await callDeepSeek(chunk)));
    const song = applyOverrides(simplifySong(parsed), chunk, overrides);
    console.log(`[${index + 1}] standardized ${song.titleHanzi} - ${song.singer}`);
    return song;
  });

  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 1 });
  try {
    const [{ next_sort_order: nextSortOrder }] = await sql`
      select coalesce(max(sort_order), -1) + 1 as next_sort_order from chinese_song_lyric
    `;

    for (const [index, song] of songs.entries()) {
      const [existing] = await sql`
        select slug, sort_order
        from chinese_song_lyric
        where slug = ${song.id}
           or (song->>'titleHanzi' = ${song.titleHanzi} and song->>'singerHanzi' = ${song.singerHanzi})
        limit 1
      `;
      const targetSlug = existing?.slug ?? song.id;
      const storedSong = { ...song, id: targetSlug };
      await sql`
        insert into chinese_song_lyric (slug, song, sort_order, updated_at)
        values (${targetSlug}, ${sql.json(storedSong)}, ${existing?.sort_order ?? nextSortOrder + index}, now())
        on conflict (slug) do update set song = excluded.song, updated_at = now()
      `;
      console.log(`[${index + 1}] saved ${targetSlug}`);
    }

    const rows = await sql`
      select slug,
             song->>'titleHanzi' as title_hanzi,
             song->>'singer' as singer,
             song->>'singerHanzi' as singer_hanzi,
             song->>'singerPinyin' as singer_pinyin,
             jsonb_array_length(song->'sections') as section_count
      from chinese_song_lyric
      where slug in ${sql(songs.map((song) => song.id))}
      order by slug
    `;

    const traditionalIssues = [];
    const duplicateLatinIssues = [];
    for (const song of songs) {
      for (const value of collectHanzi(song)) {
        if (t2s(value) !== value || value.includes('著')) traditionalIssues.push({ slug: song.id, value });
      }
      for (const section of song.sections) {
        for (const line of section.lines ?? []) {
          if (!HAN_RE.test(line.hanzi) && normalizeComparable(line.hanzi) && normalizeComparable(line.hanzi) === normalizeComparable(line.english)) {
            duplicateLatinIssues.push({ slug: song.id, line });
          }
        }
      }
    }

    console.log(JSON.stringify({ rows, traditionalIssues, duplicateLatinIssues }, null, 2));
    if (traditionalIssues.length || duplicateLatinIssues.length) process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
