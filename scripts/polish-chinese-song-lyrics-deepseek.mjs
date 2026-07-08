import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
const deepseekModel = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';
const onlySlug = process.argv.find((arg) => arg.startsWith('--slug='))?.slice('--slug='.length);
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))?.slice('--limit='.length);
const limit = limitArg ? Number.parseInt(limitArg, 10) : null;

if (!databaseUrl) throw new Error('DATABASE_URL is required.');
if (!deepseekKey) throw new Error('DEEPSEEK_API_KEY is required.');

const sql = postgres(databaseUrl, { ssl: 'require', max: 1 });
const HAN_RE = /\p{Script=Han}/u;

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

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) return raw.slice(start, end + 1);
  throw new Error('DeepSeek did not return JSON.');
}

function collectEditableSections(song) {
  return song.sections
    .map((section) => ({
      id: section.id,
      label: section.label,
      lines: (section.lines ?? []).map((line, index) => ({
        index,
        hanzi: line.hanzi,
        pinyin: line.pinyin ?? '',
        english: line.english ?? ''
      }))
    }))
    .filter((section) => section.lines.length > 0);
}

function needsPolish(song) {
  return song.sections.some((section) =>
    (section.lines ?? []).some((line) => {
      const hasHanzi = HAN_RE.test(line.hanzi);
      const missingTranslation = hasHanzi && !(line.english ?? '').trim();
      const missingPinyin = hasHanzi && !(line.pinyin ?? '').trim();
      const numericTonePinyin = /\b[a-züv]+[1-5]\b/i.test(line.pinyin ?? '');
      return missingTranslation || missingPinyin || numericTonePinyin;
    })
  );
}

function buildPrompt(song) {
  const editable = collectEditableSections(song);

  return `You are cleaning a curated Chinese song lyric JSON object for a language-learning app.

Return ONLY valid JSON with this exact shape:
{
  "sections": [
    {
      "id": "same section id",
      "lines": [
        {
          "index": 0,
          "hanzi": "exact same hanzi text",
          "pinyin": "Mandarin pinyin with tone marks",
          "english": "natural concise English translation"
        }
      ]
    }
  ]
}

Rules:
- Preserve every section id, line index, and hanzi string exactly.
- Do not add, remove, merge, split, romanize, or rewrite the hanzi.
- For Chinese lines, fix pinyin into Mandarin pinyin with tone marks, syllables separated by spaces.
- For Chinese lines, fill or improve the English translation.
- For lines that are already English or mostly non-Chinese, keep pinyin as an empty string and use the same text as english only if it helps; otherwise english can be empty.
- Keep translations concise and literal enough for learners.
- Do not include markdown fences or explanations.

Song:
${JSON.stringify(
  {
    titleHanzi: song.titleHanzi,
    titlePinyin: song.titlePinyin,
    titleEnglish: song.titleEnglish,
    singer: song.singer,
    sections: editable
  },
  null,
  2
)}`;
}

async function callDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${deepseekKey}`
    },
    body: JSON.stringify({
      model: deepseekModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API ${response.status}: ${await response.text().catch(() => '')}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('DeepSeek returned empty content.');
  return JSON.parse(extractJsonObject(text));
}

function applyPolish(song, polished) {
  const sectionMap = new Map((polished.sections ?? []).map((section) => [section.id, section]));

  for (const section of song.sections) {
    if (!section.lines?.length) continue;
    const polishedSection = sectionMap.get(section.id);
    if (!polishedSection) throw new Error(`Missing polished section ${section.id}`);

    const lineMap = new Map((polishedSection.lines ?? []).map((line) => [line.index, line]));

    section.lines = section.lines.map((line, index) => {
      const polishedLine = lineMap.get(index);
      if (!polishedLine) throw new Error(`Missing polished line ${section.id}[${index}]`);
      if (polishedLine.hanzi !== line.hanzi) {
        throw new Error(`Hanzi mismatch in ${section.id}[${index}]`);
      }

      return {
        ...line,
        pinyin: String(polishedLine.pinyin ?? '').trim(),
        english: String(polishedLine.english ?? '').trim()
      };
    });
  }

  return song;
}

async function polishSong(row, attempt = 1) {
  const song = row.song;
  const prompt = buildPrompt(song);
  const polished = await callDeepSeek(prompt);
  const nextSong = applyPolish(song, polished);

  await sql`
    update chinese_song_lyric
    set song = ${sql.json(nextSong)}, updated_at = now()
    where slug = ${row.slug}
  `;

  return { attempts: attempt };
}

let rows = await sql`
  select slug, song
  from chinese_song_lyric
  order by sort_order, id
`;

if (onlySlug) rows = rows.filter((row) => row.slug === onlySlug);
if (Number.isInteger(limit) && limit > 0) rows = rows.slice(0, limit);

let polishedCount = 0;
let skippedCount = 0;
const failures = [];

for (let index = 0; index < rows.length; index += 1) {
  const row = rows[index];
  const song = row.song;

  if (!needsPolish(song)) {
    skippedCount += 1;
    console.log(`[${index + 1}/${rows.length}] skip ${row.slug}`);
    continue;
  }

  try {
    await polishSong(row);
    polishedCount += 1;
    console.log(`[${index + 1}/${rows.length}] polished ${row.slug}`);
  } catch (firstError) {
    try {
      await polishSong(row, 2);
      polishedCount += 1;
      console.log(`[${index + 1}/${rows.length}] polished ${row.slug} after retry`);
    } catch (secondError) {
      failures.push({
        slug: row.slug,
        error: secondError instanceof Error ? secondError.message : String(secondError),
        firstError: firstError instanceof Error ? firstError.message : String(firstError)
      });
      console.error(`[${index + 1}/${rows.length}] failed ${row.slug}: ${failures.at(-1).error}`);
    }
  }
}

await sql.end();

console.log(`Done. Polished ${polishedCount}, skipped ${skippedCount}, failed ${failures.length}.`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
