const EXACT_NOISE_LINES = new Set([
  'Apply',
  'Save',
  'Share',
  'Show more options',
  'Show match details',
  'Show all',
  'BETA',
  'Yes',
  'No',
  'Undo',
  'Get started',
  'Is this information helpful?',
  'Did you apply?',
  'People you can reach out to'
]);

const NOISE_PATTERNS = [
  /\blogo$/i,
  /^Save .+ at .+$/i,
  /^Your profile\b/i,
  /^Undo shared profile\b/i,
  /^Let us know\b/i,
  /^Matches your job preferences\b/i,
  /^Promoted by hirer\b/i,
  /^Responses managed\b/i,
  /^Over \d+ people clicked apply$/i,
  /^See curated AI tools\b/i,
  /^Get hired faster\b/i,
  /^Your profile is missing\b/i,
  /^Following$/i
];

const HEADING_SUFFIX_PATTERN =
  /\s*\(heading\)\s*\/\s*(Description Du Poste|Compétences Particulières|Compétences|Responsabilités)\s*\(titre\)$/i;

function normalizeLine(line: string): string {
  return line
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+·\s+/g, ' · ')
    .replace(/\s*·\s*Over \d+ people clicked apply\b/i, '')
    .replace(HEADING_SUFFIX_PATTERN, '')
    .trim();
}

function isNoiseLine(line: string): boolean {
  if (!line) return true;
  if (EXACT_NOISE_LINES.has(line)) return true;
  return NOISE_PATTERNS.some((pattern) => pattern.test(line));
}

export function cleanApplicationDump(input: string): string {
  const lines = input.replace(/\r\n?/g, '\n').split('\n').map(normalizeLine);

  const cleaned: string[] = [];
  let previous = '';
  let skipAiToolsBlock = false;

  for (const line of lines) {
    if (line.startsWith('See curated AI tools')) {
      skipAiToolsBlock = true;
      continue;
    }

    if (skipAiToolsBlock) {
      if (line === 'About the company') skipAiToolsBlock = false;
      else continue;
    }

    if (isNoiseLine(line)) continue;
    if (line === previous) continue;
    if (line.replace(/:$/, '') === previous.replace(/:$/, '')) continue;

    cleaned.push(line);
    previous = line;
  }

  return cleaned
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
