import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { eq, sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { ensureChineseReadingStoryTable } from '$lib/server/chinese-reading-schema.js';
import { db } from '$lib/server/db/index.js';
import { chineseReadingStory } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

type HskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type ChineseReadingQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

type ChineseReading = {
  titleHanzi: string;
  titlePinyin: string;
  titleEnglish: string;
  storyHanzi: string[];
  storyPinyin: string[];
  storyEnglish: string[];
  questions: ChineseReadingQuestion[];
};

type ChineseReadingResult = {
  reading: ChineseReading;
  unknownWords: string[];
};

type VocabGuard = {
  allowed: Set<string>;
  words: string[];
  wordsByLength: Map<number, string[]>;
  maxLength: number;
  promptList: string;
};

const LEVELS = new Set([1, 2, 3, 4, 5, 6, 7]);
const MODEL = 'deepseek-v4-flash';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PLECO_DIR = resolve(__dirname, '../../../../static/pleco');
const PINYIN_SPLIT_RE = /[\s，。？、！；：,.?!;:]+/;
const HANZI_RE = /[\u3400-\u9fff]/u;
const PINYIN_INITIALS = [
  'zh',
  'ch',
  'sh',
  'b',
  'p',
  'm',
  'f',
  'd',
  't',
  'n',
  'l',
  'g',
  'k',
  'h',
  'j',
  'q',
  'x',
  'r',
  'z',
  'c',
  's',
  'y',
  'w'
];
const PINYIN_FINALS = new Set([
  'a',
  'ai',
  'an',
  'ang',
  'ao',
  'e',
  'ei',
  'en',
  'eng',
  'er',
  'i',
  'ia',
  'ian',
  'iang',
  'iao',
  'ie',
  'in',
  'ing',
  'iong',
  'iu',
  'o',
  'ong',
  'ou',
  'u',
  'ua',
  'uai',
  'uan',
  'uang',
  'ue',
  'ui',
  'un',
  'uo',
  'v',
  've'
]);
const PINYIN_FRONT_FINALS = new Set(['ia', 'ian', 'iang', 'iao', 'ie', 'in', 'ing', 'iong', 'iu']);
const PINYIN_RETROFLEX_INITIALS = new Set(['zh', 'ch', 'sh', 'r', 'z', 'c', 's']);
const PINYIN_TONE_MAP: Record<string, string> = {
  ā: 'a',
  á: 'a',
  ǎ: 'a',
  à: 'a',
  ē: 'e',
  é: 'e',
  ě: 'e',
  è: 'e',
  ī: 'i',
  í: 'i',
  ǐ: 'i',
  ì: 'i',
  ō: 'o',
  ó: 'o',
  ǒ: 'o',
  ò: 'o',
  ū: 'u',
  ú: 'u',
  ǔ: 'u',
  ù: 'u',
  ǖ: 'v',
  ǘ: 'v',
  ǚ: 'v',
  ǜ: 'v',
  ü: 'v'
};

const LEVEL_GUIDANCE: Record<HskLevel, string> = {
  1: 'HSK 1 only. Write 8-10 very simple sentences grouped into 3-4 real paragraphs. Use daily words like family, food, time, school, home, numbers, and simple verbs.',
  2: 'HSK 2. Write 10-12 simple sentences grouped into 4 real paragraphs. Use simple connectors, past/future time words, and daily situations.',
  3: 'HSK 3. Write 12-15 sentences grouped into 4-5 real paragraphs. Use a clear narrative with a problem, decision, and result.',
  4: 'HSK 4. Write 5-6 paragraphs. Include opinions, reasons, and everyday abstract words while keeping a clear story arc.',
  5: 'HSK 5. Write 6 paragraphs. Use richer description, character motivation, and implied details, but stay learner-friendly.',
  6: 'HSK 6. Write 6-7 paragraphs. Use mature syntax, nuanced motivations, and concrete scenes.',
  7: 'HSK 7-9. Write 7 paragraphs. Advanced prose with idioms only when context makes them clear.'
};

const LEVEL_1_PREFERRED_WORD_BANK = [
  '小明',
  '小丽',
  '王老师',
  '我',
  '你',
  '他',
  '她',
  '今天',
  '早上',
  '上午',
  '中午',
  '下午',
  '晚上',
  '学校',
  '老师',
  '同学',
  '朋友',
  '家',
  '家里',
  '去',
  '来',
  '回家',
  '在',
  '有',
  '看见',
  '看',
  '听',
  '说',
  '读',
  '写',
  '问',
  '回答',
  '教',
  '学习',
  '汉语',
  '汉字',
  '吃饭',
  '吃',
  '喝',
  '水',
  '茶',
  '米饭',
  '包子',
  '鸡蛋',
  '高兴',
  '喜欢',
  '好',
  '很',
  '也',
  '都',
  '和',
  '一起',
  '什么',
  '哪里',
  '谁',
  '吗',
  '的',
  '了',
  '一',
  '二',
  '三',
  '个'
];

const LEVEL_1_FORBIDDEN_NEAR_MISSES = ['作业', '故事', '因为', '但是', '然后', '运动'];

const LEVEL_2_PREFERRED_WORD_BANK = [
  '小明',
  '小丽',
  '王老师',
  '朋友',
  '同学',
  '家人',
  '爸爸',
  '妈妈',
  '哥哥',
  '姐姐',
  '弟弟',
  '妹妹',
  '今天',
  '昨天',
  '明天',
  '周末',
  '早上',
  '上午',
  '中午',
  '下午',
  '晚上',
  '时间',
  '小时',
  '分钟',
  '学校',
  '公司',
  '商店',
  '超市',
  '饭店',
  '车站',
  '地铁',
  '公共汽车',
  '自行车',
  '路上',
  '天气',
  '房间',
  '旁边',
  '左边',
  '右边',
  '学习',
  '上课',
  '下课',
  '考试',
  '作业',
  '工作',
  '旅游',
  '买',
  '卖',
  '找',
  '送',
  '准备',
  '帮助',
  '帮忙',
  '知道',
  '觉得',
  '可以',
  '应该',
  '可能',
  '因为',
  '所以',
  '但是',
  '然后',
  '已经',
  '以后',
  '以前',
  '事情',
  '问题',
  '办法',
  '意思',
  '故事',
  '音乐',
  '电影',
  '运动',
  '快乐',
  '高兴',
  '生气',
  '忙',
  '累',
  '饿',
  '远',
  '近',
  '快',
  '慢',
  '好吃',
  '好看'
];

const LEVEL_2_FORBIDDEN_NEAR_MISSES = ['苹果', '香蕉', '咖啡', '聊天', '聊', '期待', '店员'];

const LEVEL_3_FOCUS_WORDS = ['突然', '决定', '解决', '需要', '只好', '终于', '注意', '苹果'];

const LEVEL_3_FORBIDDEN_NEAR_MISSES = [
  '广州',
  '丢',
  '肚子',
  '遇到',
  '于是',
  '对于',
  '关于',
  '客服',
  '服务员',
  '服了'
];

const LEVEL_LABELS: Record<HskLevel, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7-9'
};

const NAME_WHITELIST = [
  '小明',
  '小丽',
  '小红',
  '小刚',
  '小华',
  '李明',
  '王明',
  '张明',
  '陈明',
  '王老师',
  '李老师',
  '张老师'
];

let vocabCache: Partial<Record<HskLevel, string[]>> = {};
let guardCache: Partial<Record<HskLevel, VocabGuard>> = {};

class VocabGuardError extends Error {
  unknownWords: string[];

  constructor(level: HskLevel, unknownWords: string[]) {
    super(
      `Generated reading used words outside HSK ${level}: ${unknownWords.slice(0, 12).join(', ')}`
    );
    this.name = 'VocabGuardError';
    this.unknownWords = unknownWords;
  }
}

function parsePlecoWords(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .map((line) => line.split('\t')[0]?.trim() ?? '')
    .filter((word) => word && [...word].some((char) => HANZI_RE.test(char)));
}

function loadLevelWords(level: HskLevel) {
  if (vocabCache[level]) return vocabCache[level];

  const label = LEVEL_LABELS[level];
  const filePath = resolve(PLECO_DIR, `hsk3.0-level${label}.txt`);
  const words = parsePlecoWords(readFileSync(filePath, 'utf-8'));
  vocabCache[level] = words;
  return words;
}

function getVocabGuard(level: HskLevel): VocabGuard {
  if (guardCache[level]) return guardCache[level];

  const allowed = new Set<string>();
  for (let nextLevel = 1; nextLevel <= level; nextLevel += 1) {
    for (const word of loadLevelWords(nextLevel as HskLevel) ?? []) {
      allowed.add(word);
    }
  }
  for (const name of NAME_WHITELIST) allowed.add(name);

  const words = [...allowed].sort((a, b) => b.length - a.length || a.localeCompare(b, 'zh-CN'));
  const wordsByLength = new Map<number, string[]>();
  for (const word of words) {
    const length = [...word].length;
    const group = wordsByLength.get(length) ?? [];
    group.push(word);
    wordsByLength.set(length, group);
  }

  const maxLength = Math.max(...words.map((word) => [...word].length), 1);
  const promptList = words.join('、');
  const guard = { allowed, words, wordsByLength, maxLength, promptList };
  guardCache[level] = guard;
  return guard;
}

function collectChineseFields(reading: ChineseReading) {
  return [
    reading.titleHanzi,
    ...reading.storyHanzi,
    ...reading.questions.flatMap((question) => [
      question.question,
      ...question.options,
      question.explanation
    ])
  ];
}

function findOutOfVocabulary(value: string, guard: VocabGuard) {
  const chars = [...value];
  const unknown = new Set<string>();
  let index = 0;

  while (index < chars.length) {
    if (!HANZI_RE.test(chars[index])) {
      index += 1;
      continue;
    }

    let matched = '';
    const maxTake = Math.min(guard.maxLength, chars.length - index);
    for (let length = maxTake; length >= 1; length -= 1) {
      const candidate = chars.slice(index, index + length).join('');
      if (guard.allowed.has(candidate)) {
        matched = candidate;
        break;
      }
    }

    if (matched) {
      index += [...matched].length;
    } else {
      unknown.add(chars[index]);
      index += 1;
    }
  }

  return [...unknown];
}

function validateReadingVocabulary(reading: ChineseReading, level: HskLevel, guard: VocabGuard) {
  const unknown = new Set<string>();
  for (const field of collectChineseFields(reading)) {
    for (const word of findOutOfVocabulary(field, guard)) {
      unknown.add(word);
    }
  }

  if (unknown.size > 0) {
    throw new VocabGuardError(level, [...unknown]);
  }
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

async function generateWithDeepSeek(prompt: string) {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No DeepSeek API key configured');

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API ${response.status}: ${await response.text().catch(() => '')}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('DeepSeek returned empty content');
  return text.trim();
}

function extractJsonObject(text: string): string {
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

function asStringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeChineseText(value: string) {
  return value
    .trim()
    .replace(/\s+([，。？！、；：])/g, '$1')
    .replace(/([，。？！、；：])\s+/g, '$1')
    .replace(/([\u3400-\u9fff])\s+([\u3400-\u9fff])/g, '$1$2');
}

function normalizePinyinChar(char: string) {
  const lower = char.toLowerCase();
  return PINYIN_TONE_MAP[lower] ?? lower;
}

function isPinyinLetter(char: string) {
  return /^[a-zv]$/.test(normalizePinyinChar(char));
}

function isPinyinSyllable(value: string) {
  if (PINYIN_FINALS.has(value)) return true;

  const initial = PINYIN_INITIALS.find((item) => value.startsWith(item));
  if (!initial) return false;

  const final = value.slice(initial.length);
  if (!PINYIN_FINALS.has(final)) return false;
  if (PINYIN_RETROFLEX_INITIALS.has(initial) && PINYIN_FRONT_FINALS.has(final)) return false;
  return true;
}

function nextPinyinSyllableLength(value: string, start: number) {
  const maxEnd = Math.min(value.length, start + 6);
  for (let end = maxEnd; end > start; end--) {
    if (isPinyinSyllable(value.slice(start, end))) {
      return end - start;
    }
  }
  return value.length - start;
}

function splitPinyinWord(word: string) {
  const letters = [...word].filter(isPinyinLetter);
  const normalized = letters.map(normalizePinyinChar).join('');
  const syllables: string[] = [];
  let index = 0;

  while (index < normalized.length) {
    const length = nextPinyinSyllableLength(normalized, index);
    syllables.push(letters.slice(index, index + length).join(''));
    index += length;
  }

  return syllables;
}

function pinyinSyllables(pinyin: string) {
  return pinyin
    .split(PINYIN_SPLIT_RE)
    .flatMap((part) => splitPinyinWord(part.trim()))
    .filter(Boolean);
}

function countHanzi(value: string) {
  return [...value].filter((char) => /[\u3400-\u9fff]/.test(char)).length;
}

function alignPinyinParagraphs(storyHanzi: string[], storyPinyin: string[]) {
  if (storyHanzi.length === storyPinyin.length) return storyPinyin;

  const syllables = storyPinyin.flatMap(pinyinSyllables);
  if (syllables.length === 0) return storyHanzi.map(() => '');

  let offset = 0;
  return storyHanzi.map((paragraph, index) => {
    if (index === storyHanzi.length - 1) {
      return syllables.slice(offset).join(' ');
    }

    const remainingParagraphs = storyHanzi.length - index - 1;
    const maxTake = Math.max(0, syllables.length - offset - remainingParagraphs);
    const take = Math.max(1, Math.min(countHanzi(paragraph), maxTake));
    const chunk = syllables.slice(offset, offset + take).join(' ');
    offset += take;
    return chunk;
  });
}

function alignTextParagraphs(storyHanzi: string[], paragraphs: string[]) {
  if (storyHanzi.length === paragraphs.length) return paragraphs;
  if (paragraphs.length === 0) return storyHanzi.map(() => '');

  let offset = 0;
  return storyHanzi.map((_, index) => {
    if (index === storyHanzi.length - 1) {
      return paragraphs.slice(offset).join(' ');
    }

    const remainingParagraphs = storyHanzi.length - index - 1;
    const maxTake = Math.max(0, paragraphs.length - offset - remainingParagraphs);
    const take = Math.max(1, Math.min(Math.ceil(paragraphs.length / storyHanzi.length), maxTake));
    const chunk = paragraphs.slice(offset, offset + take).join(' ');
    offset += take;
    return chunk;
  });
}

function normalizeQuestionOptions(options: string[], answerIndex: number) {
  if (options.length < 3 || answerIndex < 0 || answerIndex >= options.length) {
    return null;
  }

  if (answerIndex <= 2) {
    return { options: options.slice(0, 3), answerIndex };
  }

  const answer = options[answerIndex];
  const distractors = options.filter((_, index) => index !== answerIndex).slice(0, 2);
  if (!answer || distractors.length !== 2) return null;

  return { options: [answer, ...distractors], answerIndex: 0 };
}

function normalizeReading(value: unknown): ChineseReading {
  if (!value || typeof value !== 'object') {
    throw new Error('AI returned an invalid reading');
  }

  const candidate = value as Partial<ChineseReading>;
  const titleHanzi =
    typeof candidate.titleHanzi === 'string' ? normalizeChineseText(candidate.titleHanzi) : '';
  const titlePinyin = typeof candidate.titlePinyin === 'string' ? candidate.titlePinyin.trim() : '';
  const titleEnglish =
    typeof candidate.titleEnglish === 'string' ? candidate.titleEnglish.trim() : '';
  const storyHanzi = asStringArray(candidate.storyHanzi, 8).map(normalizeChineseText);
  const rawStoryPinyin = asStringArray(candidate.storyPinyin, 40);
  const rawStoryEnglish = asStringArray(candidate.storyEnglish, 40);
  const storyPinyin = alignPinyinParagraphs(storyHanzi, rawStoryPinyin);
  const storyEnglish = alignTextParagraphs(storyHanzi, rawStoryEnglish);

  if (!titleHanzi || !titlePinyin || !titleEnglish) {
    throw new Error('AI returned an incomplete title');
  }
  if (storyHanzi.length < 3 || storyHanzi.length !== storyPinyin.length) {
    throw new Error('AI returned mismatched Chinese and pinyin paragraphs');
  }
  if (storyHanzi.length !== storyEnglish.length) {
    throw new Error('AI returned mismatched Chinese and English paragraphs');
  }

  const questions = Array.isArray(candidate.questions)
    ? candidate.questions
        .map((question) => {
          if (!question || typeof question !== 'object') return null;
          const q = question as Partial<ChineseReadingQuestion>;
          const rawOptions = asStringArray(q.options, 4);
          const answerIndex = Number(q.answerIndex);
          const normalizedOptions = Number.isInteger(answerIndex)
            ? normalizeQuestionOptions(rawOptions, answerIndex)
            : null;
          const normalized = {
            question: typeof q.question === 'string' ? normalizeChineseText(q.question) : '',
            options: normalizedOptions?.options.map(normalizeChineseText) ?? [],
            answerIndex: normalizedOptions?.answerIndex ?? -1,
            explanation:
              typeof q.explanation === 'string' ? normalizeChineseText(q.explanation) : ''
          };
          if (
            !normalized.question ||
            normalized.options.length !== 3 ||
            normalized.answerIndex < 0 ||
            normalized.answerIndex > 2
          ) {
            return null;
          }
          return normalized;
        })
        .filter((question): question is ChineseReadingQuestion => Boolean(question))
        .slice(0, 2)
    : [];

  if (questions.length !== 2) {
    throw new Error('AI returned the wrong number of questions');
  }

  return {
    titleHanzi,
    titlePinyin,
    titleEnglish,
    storyHanzi,
    storyPinyin,
    storyEnglish,
    questions
  };
}

function buildLevelGenerationHelp(level: HskLevel) {
  if (level === 1) {
    return `
HSK 1 generation optimization:
- Prefer this small safe word bank: ${LEVEL_1_PREFERRED_WORD_BANK.join('、')}.
- Avoid these common out-of-level near misses: ${LEVEL_1_FORBIDDEN_NEAR_MISSES.join('、')}.
- For school stories, use 学习、读、写、问、回答 instead of 作业; use 一天、书, or 汉字 instead of 故事.`;
  }

  if (level === 2) {
    return `
HSK 2 quality guide:
- Prefer this natural HSK 1-2 word bank: ${LEVEL_2_PREFERRED_WORD_BANK.join('、')}.
- Avoid these common out-of-level near misses: ${LEVEL_2_FORBIDDEN_NEAR_MISSES.join('、')}.
- Choose one grounded scene: school and homework, buying something at a store, going somewhere by bus/subway, weekend weather, work, a birthday, music, movie, or travel.
- Give the story a simple arc: setting, small problem, action, result.
- Use 因为、所以、但是、然后 only when they make the story clearer.
- In store scenes, use 商店里的人 instead of 店员.
- Use 然后 at the beginning of a sentence, not after 他 or 她.`;
  }

  if (level === 3) {
    return `
HSK 3 quality guide:
- Use 4-6 of these HSK 3 focus words naturally: ${LEVEL_3_FOCUS_WORDS.join('、')}.
- Avoid these common out-of-level near misses: ${LEVEL_3_FORBIDDEN_NEAR_MISSES.join('、')}.
- The story should feel like HSK 3, not HSK 2 with one advanced noun.
- Use a clear arc: ordinary situation, sudden problem, decision, action to solve it, final result.
- Avoid repeating the same place, object, or connector too often; do not use 但是 or 然后 more than twice each.
- End with a concrete result or lesson, not only 非常高兴.`;
  }

  return '';
}

function buildPrompt(level: HskLevel, guard: VocabGuard) {
  const levelGenerationHelp = buildLevelGenerationHelp(level);

  return `Create one Chinese reading-comprehension mini game for a Mandarin learner.

Difficulty:
${LEVEL_GUIDANCE[level]}
${levelGenerationHelp}

Vocabulary guardrail:
- Use ONLY words from this cumulative HSK ${level} allowed vocabulary list for titleHanzi, storyHanzi, questions, options, and explanations.
- You may combine allowed words naturally, but every Chinese word must be segmentable into this allowed vocabulary.
- Allowed names: ${NAME_WHITELIST.join('、')}.
- Allowed vocabulary: ${guard.promptList}

Return ONLY valid JSON with this exact shape:
{
  "titleHanzi": "Chinese title",
  "titlePinyin": "pinyin with tone marks",
  "titleEnglish": "English title",
  "storyHanzi": ["Chinese paragraph 1", "Chinese paragraph 2"],
  "storyPinyin": ["Pinyin paragraph 1", "Pinyin paragraph 2"],
  "storyEnglish": ["English translation paragraph 1", "English translation paragraph 2"],
  "questions": [
    {
      "question": "中文问题",
      "options": ["中文选项一", "中文选项二", "中文选项三"],
      "answerIndex": 0,
      "explanation": "中文解释"
    }
  ]
}

Rules:
- Make exactly 2 questions.
- The questions, options, and explanations must be written only in simplified Chinese.
- Each question must have exactly 3 answer options.
- Options must be plausible and based only on the story.
- Make one question about a concrete fact and one question about a reason, sequence, or result.
- Do not introduce new people, places, or objects in the questions or options.
- Explanations must briefly restate the story fact that proves the answer.
- Do not invent emotions, reasons, or facts in questions or explanations; the evidence must appear directly in storyHanzi.
- Do not use city names, country names, brand names, or personal names except the allowed names above.
- Do not use any Chinese word outside the allowed vocabulary list.
- Each item in storyHanzi must be a paragraph with multiple related sentences, not a single isolated sentence.
- Make the story feel like a complete story, not a vocabulary list or disconnected sentence drill.
- Use simplified Chinese.
- Do not add spaces between Chinese words or before Chinese punctuation.
- Pinyin must align paragraph-by-paragraph with storyHanzi.
- English translation must be natural but close to the Chinese.
- Do not include markdown fences, comments, or extra text.`;
}

function buildRepairHints(error: VocabGuardError) {
  const hints: string[] = [];
  const unknown = new Set(error.unknownWords);

  if (unknown.has('服')) {
    hints.push(
      'If 服 appears as a single character or in an unlisted word like 客服、服了、服务员, replace the whole word. Use only allowed full words such as 衣服、服务、舒服、服装、克服 when they fit the context.'
    );
  }

  if (unknown.has('于')) {
    hints.push(
      'If 于 appears in an unlisted word like 于是、对于、关于, replace the whole word. Use allowed alternatives such as 所以、因为、对、说, or remove the phrase.'
    );
  }

  if (unknown.has('员')) {
    hints.push('Replace 店员 or 服务员 with 商店里的人 or 那个人.');
  }

  return hints.length > 0 ? `\nRepair hints:\n- ${hints.join('\n- ')}\n` : '';
}

function buildRepairPrompt(
  level: HskLevel,
  guard: VocabGuard,
  reading: ChineseReading,
  error: VocabGuardError
) {
  const repairHints = buildRepairHints(error);

  return `Repair this Chinese reading-comprehension mini game for a Mandarin learner.

Goal:
- Keep the same story idea, characters, setting, order of events, and question meanings.
- Replace only Chinese words that are outside the allowed HSK ${level} vocabulary.
- Update pinyin and English only where the Chinese changed.
- Do not rewrite from scratch.

Out-of-level words or characters found by validation:
${error.unknownWords.join('、')}
${repairHints}

Vocabulary guardrail:
- Use ONLY words from this cumulative HSK ${level} allowed vocabulary list for titleHanzi, storyHanzi, questions, options, and explanations.
- Every Chinese word must be segmentable into this allowed vocabulary.
- Allowed names: ${NAME_WHITELIST.join('、')}.
- Allowed vocabulary: ${guard.promptList}

Original JSON to repair:
${JSON.stringify(reading)}

Return ONLY valid JSON with the same exact shape.

Rules:
- Make the smallest changes needed to pass vocabulary validation.
- Keep exactly 2 questions and exactly 3 options per question.
- The questions, options, and explanations must be written only in simplified Chinese.
- Do not invent emotions, reasons, or facts in questions or explanations; the evidence must appear directly in storyHanzi.
- Do not use city names, country names, brand names, or personal names except the allowed names above.
- Do not add spaces between Chinese words or before Chinese punctuation.
- Do not include markdown fences, comments, or extra text.`;
}

async function generateValidatedReading(level: HskLevel, guard: VocabGuard) {
  const text = await generateWithDeepSeek(buildPrompt(level, guard));
  const parsed = JSON.parse(extractJsonObject(text));
  const reading = normalizeReading(parsed);

  try {
    validateReadingVocabulary(reading, level, guard);
    return { reading, unknownWords: [] };
  } catch (err) {
    if (!(err instanceof VocabGuardError)) {
      throw err;
    }

    const repairText = await generateWithDeepSeek(buildRepairPrompt(level, guard, reading, err));
    const repairParsed = JSON.parse(extractJsonObject(repairText));
    const repairedReading = normalizeReading(repairParsed);

    try {
      validateReadingVocabulary(repairedReading, level, guard);
      console.warn(`Repaired Chinese reading after vocabulary validation failed: ${err.message}`);
      return { reading: repairedReading, unknownWords: [] };
    } catch (repairErr) {
      if (!(repairErr instanceof VocabGuardError)) {
        throw repairErr;
      }

      console.warn(
        `Using repaired Chinese reading with highlighted out-of-level words: ${repairErr.message}`
      );
      return { reading: repairedReading, unknownWords: repairErr.unknownWords };
    }
  }
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.user) {
    return json({ error: 'Sign in to generate AI readings.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { level?: unknown; force?: unknown };
  const requestedLevel = Number(body.level);
  const level = (LEVELS.has(requestedLevel) ? requestedLevel : 1) as HskLevel;
  const force = body.force === true;

  try {
    await ensureChineseReadingStoryTable(db);
    const guard = getVocabGuard(level);

    if (!force) {
      const cachedStories = await db
        .select()
        .from(chineseReadingStory)
        .where(eq(chineseReadingStory.level, level))
        .orderBy(sql`random()`)
        .limit(8);

      for (const cached of cachedStories) {
        try {
          const reading = normalizeReading(cached.reading);
          validateReadingVocabulary(reading, level, guard);

          await db
            .update(chineseReadingStory)
            .set({ usedAt: new Date() })
            .where(eq(chineseReadingStory.id, cached.id))
            .catch((err) => console.warn('Could not update Chinese reading cache usage:', err));

          return json({ reading, level, cached: true });
        } catch (err) {
          if (err instanceof VocabGuardError) {
            console.warn(
              `Deleting invalid cached Chinese reading ${cached.id} for HSK ${level}; unknown words: ${err.unknownWords.join('、')}`
            );
            await db
              .delete(chineseReadingStory)
              .where(eq(chineseReadingStory.id, cached.id))
              .catch((deleteErr) =>
                console.warn('Could not delete invalid Chinese reading cache entry:', deleteErr)
              );
          } else {
            console.warn('Skipping cached Chinese reading that failed validation:', err);
          }
        }
      }
    }

    const result = await generateValidatedReading(level, guard);

    if (result.unknownWords.length === 0) {
      await db
        .insert(chineseReadingStory)
        .values({ level, reading: result.reading, model: MODEL })
        .catch((err) => console.warn('Could not save Chinese reading cache:', err));
    }

    return json({
      reading: result.reading,
      level,
      cached: false,
      unknownWords: result.unknownWords
    });
  } catch (err) {
    console.error('Chinese reading generation failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Could not generate a reading.' },
      { status: 500 }
    );
  }
};
