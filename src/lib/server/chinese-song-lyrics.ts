import type { LyricLine, LyricSection, LyricSong } from '$lib/data/chinese-song-lyrics.js';

export type ChineseSongLyricsEnv = {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
};

export const CHINESE_SONG_LYRICS_MODEL = 'deepseek-v4-flash';

const DEEPSEEK_TIMEOUT_MS = 75_000;
const HAN_RE = /[\u3400-\u9fff]/u;

function stripFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractJsonObject(text: string) {
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

function normalizeSpace(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function lowerPinyin(value: string) {
  return value.toLocaleLowerCase();
}

function capitalizePinyinToken(value: string) {
  const chars = [...lowerPinyin(value)];
  const index = chars.findIndex((char) => /\p{L}/u.test(char));
  if (index < 0) return value;
  chars[index] = chars[index].toLocaleUpperCase();
  return chars.join('');
}

function normalizePinyinTokens(value: string, mode: 'title' | 'line') {
  const parts = normalizeSpace(value).split(/(\s+)/u);
  let capitalizedFirstSyllable = false;

  return parts
    .map((part) => {
      if (!part.trim()) return part;
      if (!/\p{L}/u.test(part)) return part;

      if (mode === 'title') return capitalizePinyinToken(part);
      if (!capitalizedFirstSyllable) {
        capitalizedFirstSyllable = true;
        return capitalizePinyinToken(part);
      }
      return lowerPinyin(part);
    })
    .join('');
}

function normalizeTitlePinyin(value: string) {
  return normalizePinyinTokens(value, 'title');
}

function normalizeLinePinyin(value: string) {
  return normalizePinyinTokens(value, 'line');
}

function normalizeComparableText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function duplicateLatinEnglish(hanzi: string, english: string) {
  return (
    !HAN_RE.test(hanzi) &&
    Boolean(normalizeComparableText(hanzi)) &&
    normalizeComparableText(hanzi) === normalizeComparableText(english)
  );
}

function normalizeHanziLinePinyin(hanzi: string, pinyin: string) {
  if (!HAN_RE.test(hanzi)) return '';

  const sourceLatinTokens = new Set(
    [...hanzi.matchAll(/[A-Za-z0-9'’]+/gu)]
      .map((match) => normalizeComparableText(match[0]))
      .filter(Boolean)
  );

  if (sourceLatinTokens.size === 0) return pinyin;

  return pinyin
    .split(/\s+/u)
    .filter((token) => {
      const asciiToken = /^[A-Za-z0-9'’.,!?;:()[\]{}"~_-]+$/u.test(token);
      return !asciiToken || !sourceLatinTokens.has(normalizeComparableText(token));
    })
    .join(' ');
}

function normalizeArtistCredit(value: string) {
  return normalizeSpace(value)
    .replace(/\s*(?:,|，|、)\s*/gu, ', ')
    .replace(/\s*&\s*/gu, ' & ')
    .replace(/\b(?:featuring|feat|ft|with)\.?(?=\s|$)/giu, ' feat. ')
    .replace(/\s*,\s*feat\.\s*/giu, ' feat. ')
    .replace(/\s*&\s*feat\.\s*/giu, ' feat. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeArtistPinyin(value: string) {
  return normalizeArtistCredit(value)
    .split(/(\s+feat\.\s+|\s+&\s+|,\s+)/iu)
    .map((part) =>
      /^(?:\s+feat\.\s+|\s+&\s+|,\s+)$/iu.test(part) ? part : normalizeTitlePinyin(part)
    )
    .join('');
}

export function normalizeSongSlug(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || `song-${Date.now()}`;
}

function normalizeSectionId(value: unknown, fallback: string) {
  const raw = normalizeSpace(value);
  if (!raw) return fallback;
  const id = normalizeSongSlug(raw);
  return id || fallback;
}

function pickString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function normalizeLine(value: unknown): LyricLine | null {
  if (typeof value === 'string') {
    const hanzi = normalizeSpace(value);
    if (!hanzi) return null;
    return { hanzi, pinyin: '', english: '' };
  }

  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  const hanzi = normalizeSpace(
    pickString(candidate, ['hanzi', 'chinese', 'simplified', 'simplifiedChinese', 'text', 'lyric'])
  );
  const pinyin = normalizeLinePinyin(normalizeSpace(pickString(candidate, ['pinyin', 'pinYin'])));
  const english = normalizeSpace(
    pickString(candidate, ['english', 'translation', 'englishTranslation', 'en'])
  );

  if (!hanzi) return null;
  return {
    hanzi,
    pinyin: normalizeHanziLinePinyin(hanzi, pinyin),
    english: duplicateLatinEnglish(hanzi, english) ? '' : english
  };
}

function normalizeLines(value: unknown): LyricLine[] {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((line) => (Array.isArray(line) ? line : [line]))
    .map(normalizeLine)
    .filter((line): line is LyricLine => Boolean(line));
}

function normalizeRepeatLabel(label: string) {
  return normalizeSpace(label)
    .replace(/\s+\d+\s*$/u, '')
    .replace(/\s+\d+\s*x\s*$/iu, '')
    .trim();
}

function collapseConsecutiveRepeats(sections: LyricSection[]) {
  const collapsed: LyricSection[] = [];

  for (const section of sections) {
    const previous = collapsed.at(-1);
    if (!section.repeatOf || !previous?.repeatOf || previous.repeatOf !== section.repeatOf) {
      collapsed.push(section);
      continue;
    }

    const previousCount = Number(previous.label.match(/\s+(\d+)x$/i)?.[1] ?? 1);
    const count = previousCount + 1;
    const baseLabel = normalizeRepeatLabel(previous.label) || normalizeRepeatLabel(section.label);
    const label = `${baseLabel || 'Repeat Section'} ${count}x`;

    collapsed[collapsed.length - 1] = {
      id: normalizeSectionId(label, `${previous.id}-${count}x`),
      label,
      repeatOf: section.repeatOf
    };
  }

  return collapsed;
}

export function normalizeLyricSong(value: unknown): LyricSong {
  if (!value || typeof value !== 'object') {
    throw new Error('DeepSeek returned an invalid song object.');
  }

  const candidate = value as Partial<LyricSong>;
  const titleHanzi = normalizeSpace(candidate.titleHanzi);
  const titlePinyin = normalizeTitlePinyin(normalizeSpace(candidate.titlePinyin));
  const titleEnglish = normalizeSpace(candidate.titleEnglish);
  const singer = normalizeArtistCredit(normalizeSpace(candidate.singer)) || 'Unknown Artist';
  const singerHanzi = normalizeArtistCredit(normalizeSpace(candidate.singerHanzi)) || singer;
  const singerPinyin = normalizeArtistPinyin(normalizeSpace(candidate.singerPinyin));
  const id = normalizeSongSlug(
    normalizeSpace(candidate.id) || titlePinyin || titleEnglish || titleHanzi
  );

  if (!titleHanzi || !titlePinyin || !titleEnglish) {
    throw new Error('DeepSeek returned an incomplete title.');
  }

  const sections: LyricSection[] = [];
  if (Array.isArray(candidate.sections)) {
    for (const [index, section] of candidate.sections.entries()) {
      if (!section || typeof section !== 'object') continue;
      const raw = section as Partial<LyricSection>;
      const fallbackId = `section-${index + 1}`;
      const sectionId = normalizeSectionId(raw.id, fallbackId);
      const label = normalizeSpace(raw.label) || `Section ${index + 1}`;
      const repeatOf = normalizeSectionId(raw.repeatOf, '');
      const rawRecord = raw as Record<string, unknown>;
      const lines = normalizeLines(
        raw.lines ?? rawRecord.lyrics ?? rawRecord.content ?? rawRecord.items
      );

      if (repeatOf) {
        sections.push({ id: sectionId, label, repeatOf });
      } else if (lines.length > 0) {
        sections.push({ id: sectionId, label, lines });
      }
    }
  }

  if (sections.length === 0 || sections.every((section) => section.repeatOf)) {
    throw new Error('DeepSeek returned no lyric sections.');
  }

  const sectionIds = new Set(sections.map((section) => section.id));
  const validSections = sections.filter(
    (section) => !section.repeatOf || sectionIds.has(section.repeatOf)
  );

  return {
    id,
    titlePinyin,
    titleHanzi,
    titleEnglish,
    singer,
    singerHanzi,
    singerPinyin,
    tags: Array.isArray(candidate.tags)
      ? candidate.tags.map(normalizeSpace).filter(Boolean).slice(0, 8)
      : ['mandopop'],
    sections: collapseConsecutiveRepeats(validSections)
  };
}

function buildStandardizePrompt(rawSong: string) {
  return `Standardize this pasted Chinese song into the Produck Chinese Song Lyrics JSON schema.

Input may contain a title, artist, section labels, Chinese lyrics, pinyin, translation, or messy copied text.

Return ONLY valid JSON with this exact shape:
{
  "id": "lowercase-url-slug",
  "titlePinyin": "Mandarin title pinyin with tone marks",
  "titleHanzi": "simplified Chinese title",
  "titleEnglish": "natural concise English title translation",
  "singer": "artist name in English or romanization",
  "singerHanzi": "artist name in simplified Chinese if known, otherwise same as singer",
  "singerPinyin": "artist Mandarin pinyin with tone marks if singerHanzi is Chinese, otherwise empty string",
  "tags": ["mandopop"],
  "sections": [
    {
      "id": "verse-1",
      "label": "Verse 1",
      "lines": [
        {
          "hanzi": "simplified Chinese lyric line",
          "pinyin": "Mandarin pinyin with tone marks, syllables separated by spaces",
          "english": "natural concise English translation"
        }
      ]
    },
    { "id": "repeat-chorus", "label": "Repeat Chorus", "repeatOf": "chorus" }
  ]
}

Rules:
- Use simplified Chinese for titleHanzi, singerHanzi, and every Chinese lyric line.
- Standardize artist credits: use "feat." for featured artists, ", " for multiple primary artists, and " & " only when the artist credit is commonly branded that way.
- Keep artist credit structure aligned across singer, singerHanzi, and singerPinyin, such as "Jay Chou feat. Cindy Yen", "周杰伦 feat. 袁咏琳", and "Zhōu Jié Lún feat. Yuán Yǒng Lín".
- Generate accurate Mandarin pinyin with tone marks for every Chinese lyric line.
- For mixed Chinese and Latin lyric lines, put only the Mandarin pinyin for Chinese characters in pinyin. Do not copy English words, Latin words, numbers, or punctuation into pinyin.
- Capitalize pinyin consistently: titlePinyin and singerPinyin use Title Case for each syllable; lyric line pinyin uses sentence case with only the first syllable capitalized, except proper nouns.
- Translate every Chinese lyric line into concise natural English.
- Preserve non-Chinese lyric lines in hanzi exactly and set pinyin to an empty string. If the English translation would be identical or nearly identical to the non-Chinese lyric line, set english to an empty string so the UI does not show the same Latin line twice.
- Infer sections such as Verse 1, Verse 2, Pre-Chorus, Chorus, Bridge, Outro, Rap, Intro, Instrumental, and Repeat Chorus where the song structure supports it.
- If a source marker such as @ contains multiple stanzas separated by blank lines, split those stanzas into separate sections such as Verse 1 and Verse 2 instead of merging them into one long verse.
- If the input says Repeat @ and @ was split into multiple stanza sections, create one repeatOf section for each repeated stanza section, in order.
- If a later section repeats an earlier section exactly or nearly exactly, prefer a repeatOf section instead of duplicating lines.
- If the same section is repeated consecutively, use one repeatOf section with a count in the label, such as "Repeat Chorus 2x", instead of separate "Repeat Chorus 1" and "Repeat Chorus 2" sections.
- Keep lyric line order exactly as in the pasted song.
- Do not add lyrics that are not present in the input.
- Do not include markdown fences, comments, or extra text.

Pasted song:
${rawSong}`;
}

function buildRepairPrompt(rawSong: string, previousText: string, error: unknown) {
  return `${buildStandardizePrompt(rawSong)}

The previous response could not be used.
Error: ${error instanceof Error ? error.message : 'Invalid song JSON'}

Previous response:
${previousText}

Repair requirements:
- Return the exact JSON shape requested above.
- The "sections" array must contain at least one real section with a non-empty "lines" array.
- Every line object must use the exact keys "hanzi", "pinyin", and "english".
- Do not put lyric lines under keys like text, lyrics, content, chinese, translation, or items.
- Do not return only repeatOf sections.`;
}

async function callDeepSeek(env: ChineseSongLyricsEnv, prompt: string) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL ?? CHINESE_SONG_LYRICS_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API ${response.status}: ${await response.text().catch(() => '')}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('DeepSeek returned empty content.');
    }

    return text.trim();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `DeepSeek timed out after ${Math.round(DEEPSEEK_TIMEOUT_MS / 1000)} seconds.`
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function standardizeChineseSongLyrics(env: ChineseSongLyricsEnv, rawSong: string) {
  const text = await callDeepSeek(env, buildStandardizePrompt(rawSong));
  try {
    return normalizeLyricSong(JSON.parse(extractJsonObject(text)));
  } catch (err) {
    const repairedText = await callDeepSeek(env, buildRepairPrompt(rawSong, text, err));
    return normalizeLyricSong(JSON.parse(extractJsonObject(repairedText)));
  }
}
