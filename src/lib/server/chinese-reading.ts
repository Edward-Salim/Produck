import { readPlecoLevelFile } from './pleco.js';

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ChineseReadingQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type ChineseReading = {
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

export type ChineseReadingAvoidance = {
  titleHanzi: string;
  titleEnglish: string;
  openingHanzi: string;
}[];

type ChineseReadingGenerationOptions = {
  avoidReadings?: ChineseReadingAvoidance;
};

export type ChineseReadingEnv = {
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
};

type VocabGuard = {
  allowed: Set<string>;
  words: string[];
  wordsByLength: Map<number, string[]>;
  maxLength: number;
  promptList: string;
};

export const CHINESE_READING_LEVELS = new Set([1, 2, 3, 4, 5, 6, 7]);
export const CHINESE_READING_MODEL = 'deepseek-v4-flash';
const DEEPSEEK_PROVIDER_TIMEOUT_MS = 75 * 1000;
const CHINESE_READING_GENERATION_TEMPERATURE = 0.6;
const CHINESE_READING_REPAIR_TEMPERATURE = 0.2;
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
  1: 'HSK 1 only. Write 8-10 very simple sentences grouped into exactly 3 real paragraphs. Use daily words like family, food, time, school, home, numbers, and simple verbs.',
  2: 'HSK 2. Write 10-12 simple sentences grouped into exactly 4 real paragraphs. Use simple connectors, past/future time words, and daily situations.',
  3: 'HSK 3. Write 12-15 sentences grouped into exactly 4 real paragraphs. Use a clear narrative with a problem, decision, and result.',
  4: 'HSK 4. Write exactly 5 paragraphs. Include opinions, reasons, and everyday abstract words while keeping a clear story arc.',
  5: 'HSK 5. Write exactly 6 paragraphs. Use richer description, character motivation, and implied details, but stay learner-friendly.',
  6: 'HSK 6. Write exactly 6 paragraphs. Use mature syntax, nuanced motivations, and concrete scenes.',
  7: 'HSK 7-9. Write exactly 7 paragraphs. Advanced prose with idioms only when context makes them clear.'
};

const STORY_BRIEFS: Record<HskLevel, string[]> = {
  1: [
    'Scene: at home before school. Tiny problem: someone cannot find a book. Ending: a simple helpful action.',
    'Scene: a classroom in the morning. Tiny problem: a student does not understand one character. Ending: the teacher and friend help.',
    'Scene: lunch with classmates. Tiny problem: someone wants water or rice. Ending: everyone eats together.',
    'Scene: after school. Tiny problem: deciding whether to read or write first. Ending: the work feels easy.',
    'Scene: visiting a friend at home. Tiny problem: asking who is in the room. Ending: a warm greeting.'
  ],
  2: [
    'Scene: going to a store. Problem: the thing to buy is not easy to find. Ending: a practical choice.',
    'Scene: a rainy weekend. Problem: plans need to change. Ending: the new plan is still good.',
    'Scene: riding a bus or subway. Problem: time is tight. Ending: someone arrives and learns a small lesson.',
    'Scene: preparing for a birthday. Problem: one person is busy. Ending: friends divide the work.',
    'Scene: after an exam or class. Problem: someone feels tired or worried. Ending: a clear next step.'
  ],
  3: [
    'Scene: a normal work or study day. Problem: a sudden mistake changes the plan. Ending: the character solves it calmly.',
    'Scene: a family or friend appointment. Problem: someone notices an important detail late. Ending: the decision works.',
    'Scene: buying or returning something. Problem: the first solution fails. Ending: the final result is concrete.',
    'Scene: a short trip across town. Problem: weather or time creates pressure. Ending: the character explains what changed.',
    'Scene: helping another person. Problem: the helper has limited time. Ending: both people understand the result.'
  ],
  4: [
    'Scene: a community, school, or workplace choice. Problem: two reasonable opinions conflict. Ending: a balanced decision.',
    'Scene: planning a small event. Problem: resources are limited. Ending: the group changes priorities.',
    'Scene: learning a practical skill. Problem: progress is slower than expected. Ending: reflection plus action.',
    'Scene: a misunderstanding between friends or coworkers. Problem: unclear communication. Ending: direct explanation improves things.',
    'Scene: changing a habit. Problem: convenience conflicts with long-term benefit. Ending: the character makes a measured choice.'
  ],
  5: [
    'Scene: a personal project. Problem: motivation fades after the first difficulty. Ending: a specific compromise keeps it moving.',
    'Scene: a workplace or school responsibility. Problem: hidden assumptions cause tension. Ending: the character adjusts their approach.',
    'Scene: an old place revisited. Problem: memory differs from reality. Ending: the character understands the change.',
    'Scene: helping a younger person. Problem: advice is not immediately accepted. Ending: example works better than argument.',
    'Scene: preparing for a public moment. Problem: confidence and preparation do not match. Ending: the character finds a steadier method.'
  ],
  6: [
    'Scene: an important but ordinary decision. Problem: short-term efficiency conflicts with trust. Ending: a nuanced tradeoff.',
    'Scene: a team under pressure. Problem: people agree on goals but differ on method. Ending: an imperfect but workable path.',
    'Scene: a change in a familiar neighborhood. Problem: development brings both convenience and loss. Ending: concrete observation, not moralizing.',
    'Scene: recovering from a mistake. Problem: apology alone is not enough. Ending: responsibility is shown through action.',
    'Scene: mentoring or being mentored. Problem: experience becomes a burden if repeated mechanically. Ending: adaptation matters.'
  ],
  7: [
    'Scene: a professional or civic dilemma. Problem: incentives distort a sensible plan. Ending: the character accepts ambiguity.',
    'Scene: a family memory crossing generations. Problem: silence protects and harms at the same time. Ending: a restrained revelation.',
    'Scene: an institutional change. Problem: procedure and human judgment collide. Ending: a pragmatic settlement.',
    'Scene: a creative or research failure. Problem: evidence undermines a cherished idea. Ending: intellectual humility.',
    'Scene: a city or workplace transition. Problem: speed erodes attention. Ending: one concrete detail carries the theme.'
  ]
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

const LEVEL_PARAGRAPH_COUNTS: Record<HskLevel, number> = {
  1: 3,
  2: 4,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
  7: 7
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

const vocabCache: Partial<Record<HskLevel, string[]>> = {};
const guardCache: Partial<Record<HskLevel, VocabGuard>> = {};

export class VocabGuardError extends Error {
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
  const words = parsePlecoWords(readPlecoLevelFile(label));
  vocabCache[level] = words;
  return words;
}

export function getVocabGuard(level: HskLevel): VocabGuard {
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

export function validateReadingVocabulary(
  reading: ChineseReading,
  level: HskLevel,
  guard: VocabGuard
) {
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

async function generateWithDeepSeek(env: ChineseReadingEnv, prompt: string, temperature = 0.4) {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('No DeepSeek API key configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEEPSEEK_PROVIDER_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL ?? CHINESE_READING_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        response_format: { type: 'json_object' }
      })
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `DeepSeek generation timed out after ${Math.round(DEEPSEEK_PROVIDER_TIMEOUT_MS / 1000)} seconds`,
        { cause: err }
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

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

export function normalizeReading(value: unknown): ChineseReading {
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

function pickStoryBrief(level: HskLevel) {
  const briefs = STORY_BRIEFS[level];
  return briefs[Math.floor(Math.random() * briefs.length)] ?? briefs[0];
}

function formatAvoidReadings(avoidReadings: ChineseReadingAvoidance = []) {
  const rows = avoidReadings
    .filter((reading) => reading.titleHanzi || reading.titleEnglish || reading.openingHanzi)
    .slice(0, 6)
    .map((reading, index) => {
      const title = reading.titleHanzi || reading.titleEnglish || 'Untitled';
      const opening = reading.openingHanzi ? ` Opening: ${reading.openingHanzi}` : '';
      return `${index + 1}. ${title}.${opening}`;
    });

  if (rows.length === 0) return '';

  return `
Recent readings to avoid repeating:
${rows.join('\n')}

Variety requirements:
- Do not reuse the same title, opening sentence, main setting, main problem, or ending as the recent readings above.
- Use a different situation and story arc even if the HSK vocabulary is simple.`;
}

function buildJsonShapeExample(level: HskLevel) {
  const paragraphs = Array.from({ length: LEVEL_PARAGRAPH_COUNTS[level] }, (_, index) => index + 1);

  return JSON.stringify(
    {
      titleHanzi: 'Chinese title',
      titlePinyin: 'pinyin with tone marks',
      titleEnglish: 'English title',
      storyHanzi: paragraphs.map((index) => `Chinese paragraph ${index}`),
      storyPinyin: paragraphs.map((index) => `Pinyin paragraph ${index}`),
      storyEnglish: paragraphs.map((index) => `English translation paragraph ${index}`),
      questions: [
        {
          question: '中文问题一',
          options: ['中文选项一', '中文选项二', '中文选项三'],
          answerIndex: 0,
          explanation: '中文解释一'
        },
        {
          question: '中文问题二',
          options: ['中文选项一', '中文选项二', '中文选项三'],
          answerIndex: 1,
          explanation: '中文解释二'
        }
      ]
    },
    null,
    2
  );
}

function buildPrompt(
  level: HskLevel,
  guard: VocabGuard,
  options: ChineseReadingGenerationOptions = {}
) {
  const levelGenerationHelp = buildLevelGenerationHelp(level);
  const storyBrief = pickStoryBrief(level);
  const avoidReadings = formatAvoidReadings(options.avoidReadings);
  const paragraphCount = LEVEL_PARAGRAPH_COUNTS[level];

  return `Create one Chinese reading-comprehension mini game for a Mandarin learner.

Difficulty:
${LEVEL_GUIDANCE[level]}
${levelGenerationHelp}

Story variety brief:
${storyBrief}
${avoidReadings}

Vocabulary guardrail:
- Use ONLY words from this cumulative HSK ${level} allowed vocabulary list for titleHanzi, storyHanzi, questions, options, and explanations.
- You may combine allowed words naturally, but every Chinese word must be segmentable into this allowed vocabulary.
- Allowed names: ${NAME_WHITELIST.join('、')}.
- Allowed vocabulary: ${guard.promptList}

Return ONLY valid JSON with this exact shape, replacing placeholder strings with generated content:
${buildJsonShapeExample(level)}

Rules:
- storyHanzi, storyPinyin, and storyEnglish must each contain exactly ${paragraphCount} items.
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
- Before returning, silently check every Chinese field against the allowed vocabulary and replace any out-of-list word.
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
  const paragraphCount = reading.storyHanzi.length || LEVEL_PARAGRAPH_COUNTS[level];
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
${JSON.stringify(reading, null, 2)}

Return ONLY valid JSON with the same exact shape.

Rules:
- Make the smallest changes needed to pass vocabulary validation.
- storyHanzi, storyPinyin, and storyEnglish must each contain exactly ${paragraphCount} items.
- Keep exactly 2 questions and exactly 3 options per question.
- The questions, options, and explanations must be written only in simplified Chinese.
- Do not invent emotions, reasons, or facts in questions or explanations; the evidence must appear directly in storyHanzi.
- Do not use city names, country names, brand names, or personal names except the allowed names above.
- Do not add spaces between Chinese words or before Chinese punctuation.
- Pinyin must align paragraph-by-paragraph with storyHanzi.
- English translation must be natural but close to the Chinese.
- Do not include markdown fences, comments, or extra text.`;
}

async function repairReadingAfterVocabularyError(
  env: ChineseReadingEnv,
  level: HskLevel,
  guard: VocabGuard,
  reading: ChineseReading,
  error: VocabGuardError
): Promise<ChineseReadingResult> {
  try {
    const repairText = await generateWithDeepSeek(
      env,
      buildRepairPrompt(level, guard, reading, error),
      CHINESE_READING_REPAIR_TEMPERATURE
    );
    const repairParsed = JSON.parse(extractJsonObject(repairText));
    const repairedReading = normalizeReading(repairParsed);

    try {
      validateReadingVocabulary(repairedReading, level, guard);
      console.warn(`Repaired Chinese reading after vocabulary validation failed: ${error.message}`);
      return { reading: repairedReading, unknownWords: [] };
    } catch (repairErr) {
      if (!(repairErr instanceof VocabGuardError)) {
        throw repairErr;
      }

      if (repairErr.unknownWords.length <= error.unknownWords.length) {
        console.warn(
          `Using repaired Chinese reading with highlighted out-of-level words: ${repairErr.message}`
        );
        return { reading: repairedReading, unknownWords: repairErr.unknownWords };
      }
    }
  } catch (repairErr) {
    console.warn('Chinese reading repair failed, using original generated reading:', repairErr);
  }

  console.warn(`Using Chinese reading with highlighted out-of-level words: ${error.message}`);
  return { reading, unknownWords: error.unknownWords };
}

export async function generateValidatedReading(
  env: ChineseReadingEnv,
  level: HskLevel,
  guard: VocabGuard,
  options: ChineseReadingGenerationOptions = {}
): Promise<ChineseReadingResult> {
  const text = await generateWithDeepSeek(
    env,
    buildPrompt(level, guard, options),
    CHINESE_READING_GENERATION_TEMPERATURE
  );
  const parsed = JSON.parse(extractJsonObject(text));
  const reading = normalizeReading(parsed);

  try {
    validateReadingVocabulary(reading, level, guard);
    return { reading, unknownWords: [] };
  } catch (err) {
    if (!(err instanceof VocabGuardError)) {
      throw err;
    }

    return repairReadingAfterVocabularyError(env, level, guard, reading, err);
  }
}
