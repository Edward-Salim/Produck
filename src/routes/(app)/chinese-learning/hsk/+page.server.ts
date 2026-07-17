import { generateSentences } from '../sentences.js';
import type { PageServerLoad } from './$types.js';

const typingSectionHanzi: Record<number, Record<string, string[]>> = {};

for (const sentence of generateSentences([])) {
  if (sentence.level > 3 || !sentence.section) continue;
  const section = sentence.section.split(' · ')[0];
  typingSectionHanzi[sentence.level] ??= {};
  typingSectionHanzi[sentence.level][section] ??= [];
  typingSectionHanzi[sentence.level][section].push(sentence.hanzi);
}

export const load: PageServerLoad = () => ({ typingSectionHanzi });
