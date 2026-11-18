import type { Actor } from '../types/story-map.js';

function roleName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^(?:a|an)\s+/, '')
    .replace(/^administrator\b/, 'admin');
}

export function resolveStoryActor(role: string | undefined, actors: Actor[]): Actor | undefined {
  if (!role) return undefined;
  const name = roleName(role);
  const candidates = actors.filter((actor) => {
    const label = roleName(actor.label);
    return label && (name === label || name.startsWith(`${label} `));
  });
  return candidates.sort((a, b) => roleName(b.label).length - roleName(a.label).length)[0];
}
