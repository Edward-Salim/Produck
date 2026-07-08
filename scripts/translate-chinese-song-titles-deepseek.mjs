import 'dotenv/config';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
const deepseekModel = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-flash';

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

function normalizeRoman(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function needsTranslation(song) {
  if (!HAN_RE.test(song.titleHanzi)) return false;
  return normalizeRoman(song.titleEnglish) === normalizeRoman(song.titlePinyin);
}

async function translateBatch(songs) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${deepseekKey}`
    },
    body: JSON.stringify({
      model: deepseekModel,
      messages: [
        {
          role: 'user',
          content: `Translate these Chinese song titles into concise natural English.

Return ONLY valid JSON with this exact shape:
{"titles":[{"slug":"same slug","titleEnglish":"English title"}]}

Rules:
- Preserve every slug exactly.
- Translate the meaning, not pinyin.
- Keep well-known proper nouns natural.
- If the title is already English, keep it unchanged.
- Use Title Case unless a phrase is better as normal sentence case.

Songs:
${JSON.stringify(
  songs.map((song) => ({
    slug: song.slug,
    titleHanzi: song.titleHanzi,
    titlePinyin: song.titlePinyin,
    currentEnglish: song.titleEnglish
  })),
  null,
  2
)}`
        }
      ],
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
  return JSON.parse(extractJsonObject(text)).titles ?? [];
}

const rows = await sql`
  select slug, song
  from chinese_song_lyric
  order by sort_order, id
`;

const candidates = rows
  .map((row) => ({ slug: row.slug, ...row.song }))
  .filter((song) => needsTranslation(song));

let updated = 0;

for (let index = 0; index < candidates.length; index += 12) {
  const batch = candidates.slice(index, index + 12);
  const translated = await translateBatch(batch);
  const translatedBySlug = new Map(translated.map((item) => [item.slug, item.titleEnglish]));

  for (const candidate of batch) {
    const titleEnglish = String(translatedBySlug.get(candidate.slug) ?? '').trim();
    if (!titleEnglish) throw new Error(`Missing translated title for ${candidate.slug}`);

    const [row] = rows.filter((item) => item.slug === candidate.slug);
    row.song.titleEnglish = titleEnglish;

    await sql`
      update chinese_song_lyric
      set song = ${sql.json(row.song)}, updated_at = now()
      where slug = ${row.slug}
    `;
    updated += 1;
  }

  console.log(`Translated ${Math.min(index + batch.length, candidates.length)}/${candidates.length}`);
}

await sql.end();
console.log(`Done. Updated ${updated} title translations.`);
