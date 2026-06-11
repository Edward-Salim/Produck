import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { PageServerLoad } from './$types.js';
import { generateSentences } from './sentences.js';
import type { SentenceData } from './sentences.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLECO_DIR = resolve(__dirname, '../../../../../static/pleco');

export interface WordData {
  hanzi: string;
  pinyin: string;
  definitions: string[];
  level: number;
  alternatives: string[];
}

// Module-level cache — parsed once, reused across requests
let cached: {
  words: WordData[];
  levelNames: Record<number, string>;
  sentences: SentenceData[];
} | null = null;

const POS_TAGS =
  /\b(noun|verb|adjective|adverb|auxiliary|conjunction|preposition|pronoun|interjection|measure word|number|affix|suffix|prefix|particle|idiom|expression|classifier|determiner|modal|onomatopoeia|predicate|complement|coverb|localizer|numeral|colloquial|dated|literary|slang|dialect|euphemistic|figurative|courteous|auxiliary)\b/gi;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'to', 'in', 'of', 'for', 'on', 'and', 'or',
  'by', 'with', 'from', 'at', 'be', 'is', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could',
  'may', 'might', 'shall', 'should', 'get', 'got', 'make', 'made', 'used', 'use',
  'using', 'one', 'two', 'via', 'etc', 'something', 'some', 'someone', 'that',
  'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'not', 'no',
  'but', 'so', 'if', 'than', 'then', 'as', 'also', 'very', 'just', 'all', 'any',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'such', 'only', 'own',
  'same', 'too', 'well', 'what', 'which', 'who', 'whom', 'when', 'where', 'why',
  'how', 'much', 'many', 'into', 'out', 'up', 'down', 'off', 'over', 'under',
  'again', 'further', 'once', 'here', 'there', 'above', 'below', 'between',
  'through', 'during', 'before', 'after', 'about', 'against', 'without',
  'old', 'new', 'like', 'able', 'thing', 'things', 'way', 'side',
  'part', 'place', 'hand', 'eye', 'head', 'back', 'long', 'small', 'large',
  'high', 'low', 'good', 'bad', 'big', 'little', 'same', 'different',
  'past', 'present', 'future', 'kind', 'sort', 'type', 'form',
  'end', 'start', 'open', 'close', 'set', 'put', 'take', 'give', 'come', 'go',
  'see', 'look', 'find', 'keep', 'let', 'begin', 'seem', 'need', 'know', 'say',
  'think', 'want', 'show', 'try', 'ask', 'call', 'feel', 'help', 'hold', 'work',
  'play', 'move', 'live', 'mean', 'still', 'even', 'yet', 'already', 'always',
  'ever', 'never', 'often', 'sometimes', 'usually', 'maybe', 'perhaps', 'quite',
  'rather', 'enough', 'also', 'many', 'much', 'must', 'shall', 'without',
  'having', 'doing', 'being', 'going', 'become', 'became', 'within',
  'across', 'among', 'around', 'behind', 'below', 'beneath', 'beside',
  'beyond', 'inside', 'outside', 'onto', 'toward', 'towards', 'underneath',
  'upon', 'various', 'via', 'whereas', 'whether', 'while', 'whose',
  'after', 'again', 'against', 'because', 'before', 'came', 'come',
  'could', 'did', 'does', 'done', 'each', 'else', 'every', 'few',
  'former', 'get', 'going', 'got', 'had', 'has', 'have', 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'its', 'itself', 'just', 'least', 'less', 'let', 'latter',
  'may', 'me', 'might', 'mine', 'more', 'most', 'must',
  'myself', 'name', 'nearly', 'necessary', 'need', 'next',
  'nor', 'nothing', 'now', 'often', 'once', 'only', 'other',
  'our', 'ours', 'ourselves', 'own', 'per', 'quite',
  'rather', 'really', 'same', 'several', 'shall', 'should',
  'shown', 'shows', 'since', 'some', 'somehow', 'something',
  'sometimes', 'somewhere', 'still', 'such', 'than', 'that',
  'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'thereafter', 'thereby', 'therefore', 'therein', 'these',
  'they', 'this', 'those', 'through', 'throughout',
  'together', 'too', 'toward', 'under', 'unless', 'until',
  'upon', 'us', 'used', 'using', 'various', 'very', 'was',
  'we', 'were', 'what', 'whatever', 'when', 'whence',
  'whenever', 'where', 'whereafter', 'whereas', 'whereby',
  'wherein', 'whereupon', 'wherever', 'whether', 'which',
  'while', 'whither', 'who', 'whoever', 'whole', 'whom',
  'whose', 'why', 'will', 'with', 'within', 'without',
  'would', 'yet', 'yonder'
]);

function extractDefinitions(text: string): string[] {
  // Remove garbled encoding artifacts
  let clean = text.replace(/[-]/g, '').trim();

  // Remove part-of-speech tags
  clean = clean.replace(POS_TAGS, '');

  // Split by number prefixes (the numbered definition format) and semicolons
  const parts = clean.split(/\b\d+\s*|;/).map((s) => s.trim()).filter(Boolean);

  // Clean each part
  const seen = new Set<string>();
  const defs: string[] = [];
  for (const part of parts) {
    const p = part.replace(/\s+/g, ' ').trim();
    // Remove encoding artifacts that survived
    const cleaned = p.replace(/[-]/g, '').trim();
    if (cleaned && cleaned.length > 1 && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      defs.push(cleaned);
    }
  }

  return defs;
}

function extractKeywords(definitions: string[]): string[] {
  const keywords = new Set<string>();
  for (const def of definitions) {
    const words = def.toLowerCase().split(/[\s,;()]+/);
    for (const w of words) {
      const clean = w.replace(/[^a-z]/g, '');
      if (clean.length >= 4 && !STOP_WORDS.has(clean)) {
        keywords.add(clean);
      }
    }
  }
  return [...keywords];
}

function parseHskFile(text: string, level: number): WordData[] {
  const words: WordData[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const parts = trimmed.split('\t');
    if (parts.length < 3) continue;

    const hanzi = parts[0].trim();
    const pinyin = parts[1].trim();
    const defText = parts.slice(2).join(' ').trim();

    const definitions = extractDefinitions(defText);
    if (definitions.length === 0 || !hanzi) continue;

    words.push({ hanzi, pinyin, definitions, level, alternatives: [] });
  }

  return words;
}

function computeVariations(words: WordData[]): void {
  // Build keyword -> word indices map
  const keywordMap = new Map<string, number[]>();

  for (let i = 0; i < words.length; i++) {
    const keywords = extractKeywords(words[i].definitions);
    for (const kw of keywords) {
      if (!keywordMap.has(kw)) keywordMap.set(kw, []);
      keywordMap.get(kw)!.push(i);
    }
  }

  // Pre-compute keyword sets for every word (avoids re-parsing)
  const allKeywordSets = words.map((w) => new Set(extractKeywords(w.definitions)));

  // Build hanzi -> word index map for O(1) lookup
  const hanziIndex = new Map<string, number>();
  for (let i = 0; i < words.length; i++) {
    hanziIndex.set(words[i].hanzi, i);
  }

  // For each word, find words that share at least one keyword
  for (let i = 0; i < words.length; i++) {
    const keywords = [...allKeywordSets[i]];
    const candidateSet = new Set<string>();

    for (const kw of keywords) {
      const others = keywordMap.get(kw) || [];
      for (const j of others) {
        if (i !== j) {
          candidateSet.add(words[j].hanzi);
        }
      }
    }

    // Score alternatives by shared keyword count using pre-computed sets
    const scored = [...candidateSet]
      .map((hanzi) => {
        const idx = hanziIndex.get(hanzi);
        if (idx === undefined) return { hanzi, score: 0 };
        const shared = [...allKeywordSets[i]].filter((k) => allKeywordSets[idx].has(k)).length;
        return { hanzi, score: shared };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.hanzi);

    words[i].alternatives = scored;
  }
}

const LEVEL_LABELS: Record<number, string> = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7-9'
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'HSK 1', 2: 'HSK 2', 3: 'HSK 3', 4: 'HSK 4',
  5: 'HSK 5', 6: 'HSK 6', 7: 'HSK 7-9'
};

function loadAllWords(): WordData[] {
  const allWords: WordData[] = [];

  for (let level = 1; level <= 7; level++) {
    const label = LEVEL_LABELS[level];
    const filePath = resolve(PLECO_DIR, `hsk3.0-level${label}.txt`);
    try {
      const text = readFileSync(filePath, 'utf-8');
      const words = parseHskFile(text, level);
      allWords.push(...words);
    } catch (err) {
      console.error(`Failed to read HSK level ${level}:`, err);
    }
  }

  computeVariations(allWords);
  return allWords;
}

export const load: PageServerLoad = async () => {
  if (!cached) {
    const words = loadAllWords();
    const level1Words = words.filter((w) => w.level === 1);
    const sentences = generateSentences(level1Words);
    cached = { words, levelNames: LEVEL_NAMES, sentences };
  }
  return cached;
};
