#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [deckPath, ...priorPaths] = process.argv.slice(2);
if (!deckPath) {
  console.error('Usage: node audit-hsk-anki.mjs DECK [PRIOR_DECK ...]');
  process.exit(2);
}

const readLines = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/u).filter(Boolean);
const parse = (file) => readLines(file).map((line, index) => ({ file, line, number: index + 1, fields: line.split(';') }));
const cleanHanzi = (value) => value.replace(/[^\p{Script=Han}]/gu, '');
const rows = parse(deckPath);
const priorRows = priorPaths.flatMap(parse);
const errors = [];

for (const row of rows) {
  if (row.fields.length !== 5) errors.push(`${row.file}:${row.number}: expected 5 fields, found ${row.fields.length}`);
}

const validRows = rows.filter((row) => row.fields.length === 5);
const vocabulary = new Set([...priorRows, ...validRows].filter((row) => row.fields.length === 5).map((row) => cleanHanzi(row.fields[0])).filter(Boolean));
const wordsByFirst = new Map();
for (const word of vocabulary) {
  const first = [...word][0];
  if (!wordsByFirst.has(first)) wordsByFirst.set(first, []);
  wordsByFirst.get(first).push(word);
}
for (const words of wordsByFirst.values()) words.sort((a, b) => [...b].length - [...a].length);

function canSegment(value) {
  const characters = [...cleanHanzi(value)];
  const reachable = Array(characters.length + 1).fill(false);
  reachable[0] = true;
  for (let start = 0; start < characters.length; start += 1) {
    if (!reachable[start]) continue;
    for (const word of wordsByFirst.get(characters[start]) ?? []) {
      const length = [...word].length;
      if (characters.slice(start, start + length).join('') === word) reachable[start + length] = true;
    }
  }
  return reachable[characters.length];
}

const seen = new Map();
for (const row of validRows) {
  const [hanzi, pinyin, meaning, radicals, example] = row.fields;
  const target = cleanHanzi(hanzi);
  const key = `${hanzi};${pinyin}`;
  if (seen.has(key)) errors.push(`${deckPath}:${row.number}: duplicate card also found on row ${seen.get(key)}`);
  else seen.set(key, row.number);

  if (!/^[A-Za-züÜvV:]+[1-5](?:[A-Za-züÜvV:]+[1-5])*$/u.test(pinyin)) errors.push(`${deckPath}:${row.number}: invalid numbered pinyin "${pinyin}"`);
  if (!meaning.trim() || meaning.includes('/')) errors.push(`${deckPath}:${row.number}: meaning must be one non-empty gloss`);

  const characterRuns = [...target].filter((character, index, all) => index === 0 || character !== all[index - 1]);
  const radicalItems = radicals.split(/,\s*/u);
  if (radicalItems.length !== characterRuns.length) errors.push(`${deckPath}:${row.number}: expected ${characterRuns.length} radical items, found ${radicalItems.length}`);
  if (radicalItems.some((item) => !/^.+\s*\([^)]+\)$/u.test(item) || item.includes('×') || item.includes('?'))) errors.push(`${deckPath}:${row.number}: invalid radical format`);

  const sentenceMatch = example.match(/^(.*?[。？！])\s+(.+)$/u);
  if (!sentenceMatch) {
    errors.push(`${deckPath}:${row.number}: example must contain Chinese sentence punctuation followed by an English translation`);
    continue;
  }
  const chinese = sentenceMatch[1];
  if (!cleanHanzi(chinese).includes(target)) errors.push(`${deckPath}:${row.number}: Chinese example omits target "${hanzi}"`);
  if (!canSegment(chinese)) errors.push(`${deckPath}:${row.number}: Chinese example exceeds cumulative deck vocabulary`);
}

const result = {
  deck: path.resolve(deckPath),
  records: rows.length,
  priorRecords: priorRows.length,
  cumulativeVocabulary: vocabulary.size,
  errors: errors.length
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
