const plecoFiles = import.meta.glob('../../../static/pleco/*.txt', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

export function readPlecoLevelFile(label: string) {
  const suffix = `/hsk3.0-level${label}.txt`;
  const text = Object.entries(plecoFiles).find(([path]) => path.endsWith(suffix))?.[1];

  if (!text) {
    const availableFiles = Object.keys(plecoFiles)
      .map((path) => path.split('/').pop())
      .filter(Boolean)
      .join(', ');

    throw new Error(`Missing Pleco HSK file hsk3.0-level${label}.txt. Available: ${availableFiles}`);
  }

  return text;
}
