import type { StoryFieldNote } from '../types/story-map.js';

export function normalizeFieldNotes(value: unknown): StoryFieldNote[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((note) => {
    if (!note || typeof note !== 'object' || typeof note.name !== 'string' || !note.name.trim())
      return [];
    const values = Array.isArray(note.values)
      ? note.values
          .filter(
            (value: unknown): value is { label: string; meaning?: string } =>
              !!value &&
              typeof value === 'object' &&
              'label' in value &&
              typeof value.label === 'string' &&
              !!value.label.trim()
          )
          .map((value: { label: string; meaning?: unknown }) => ({
            label: value.label.trim(),
            ...(typeof value.meaning === 'string' && value.meaning.trim()
              ? { meaning: value.meaning.trim() }
              : {})
          }))
      : [];
    return [
      {
        name: note.name.trim(),
        ...(note.explain === true ? { explain: true } : {}),
        ...(typeof note.meaning === 'string' && note.meaning.trim()
          ? { meaning: note.meaning.trim() }
          : {}),
        ...(typeof note.needed === 'string' && note.needed.trim()
          ? { needed: note.needed.trim() }
          : {}),
        ...(typeof note.example === 'string' && note.example.trim()
          ? { example: note.example.trim() }
          : {}),
        ...(values.length ? { values } : {})
      }
    ];
  });
}
