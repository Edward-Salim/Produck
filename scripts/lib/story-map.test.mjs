import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { resolveStoryActor } from '../../src/lib/frameworks/actors.ts';
import {
  dedupeFrameworkInstances,
  findFrameworkInstance,
  frameworkSelectionKey,
  isRepeatableFramework
} from '../../src/lib/frameworks/instances.ts';

function instance(id, templateId, title) {
  return Object.freeze({ id, templateId, title, values: { content: title } });
}

test('story roles resolve to their map actor, including concise CheckDAQ labels', () => {
  const actors = [
    { label: 'Customer', emoji: '🧑' },
    { label: 'CX', emoji: '🤝' },
    { label: 'Onboarding', emoji: '🔎' },
    { label: 'Compliance', emoji: '🛡️' },
    { label: 'PR', emoji: '🔄' },
    { label: 'Admin', emoji: '⚙️' }
  ];
  for (const [index, role] of [
    'Customer representative',
    'CX agent',
    'Onboarding reviewer',
    'Compliance reviewer',
    'PR analyst',
    'Administrator'
  ].entries()) {
    assert.equal(resolveStoryActor(role, actors), actors[index]);
  }
  assert.equal(resolveStoryActor(undefined, actors), undefined);
  assert.equal(resolveStoryActor('Unknown reviewer', actors), undefined);
});

test('actor matching prefers the specific role over a broader actor label', () => {
  const actors = [
    { label: 'Customer', emoji: '🧑' },
    { label: 'Customer support', emoji: '🤝' }
  ];
  assert.equal(resolveStoryActor('a Customer support agent', actors), actors[1]);
});

test('native and saved story maps coexist without replacing their contents', () => {
  const maps = [
    instance('story-map-db-project-24', 'story-map', 'Current workflow'),
    instance('db-100', 'story-map', 'Direct onboarding'),
    instance('db-101', 'story-map', 'Partner onboarding')
  ];

  assert.deepEqual(dedupeFrameworkInstances(maps), maps);
  assert.equal(dedupeFrameworkInstances(maps)[0].values.content, 'Current workflow');
});

test('other framework types retain their latest single overview', () => {
  const native = instance('outcomes-db-project-24', 'outcomes', 'Original outcomes');
  const older = instance('db-102', 'outcomes', 'Older outcomes');
  const latest = instance('db-103', 'outcomes', 'Latest outcomes');
  const map = instance('db-104', 'story-map', 'Another map');

  assert.deepEqual(dedupeFrameworkInstances([native, older, map, latest]), [latest, map]);
  assert.equal(isRepeatableFramework('story-map'), true);
  assert.equal(isRepeatableFramework('outcomes'), false);
});

test('updating one map keeps the other maps and removes duplicate copies of its ID', () => {
  const first = instance('db-100', 'story-map', 'First');
  const second = instance('db-101', 'story-map', 'Second');
  const updated = instance('db-100', 'story-map', 'First revised');

  assert.deepEqual(dedupeFrameworkInstances([first, second, updated]), [updated, second]);
});

test('map links select the exact instance after a reload', () => {
  const maps = [
    instance('story-map-db-project-24', 'story-map', 'Current'),
    instance('db-100', 'story-map', 'Second')
  ];
  const selection = frameworkSelectionKey(maps[1]);

  assert.equal(selection, 'db-100');
  assert.equal(findFrameworkInstance(maps, selection), maps[1]);
  assert.equal(findFrameworkInstance(maps, 'story-map'), maps[0]);
  assert.equal(frameworkSelectionKey(instance('db-102', 'outcomes', 'Outcomes')), 'outcomes');
  assert.equal(findFrameworkInstance(maps, 'db-missing'), undefined);
  assert.equal(findFrameworkInstance(maps, null), undefined);
});

const require = createRequire(import.meta.url);
const noteSource = await readFile(
  new URL('../../src/lib/components/story-map/StickyNote.svelte', import.meta.url),
  'utf8'
);
const noteModule = compile(noteSource, { filename: 'StickyNote.svelte', generate: 'server' })
  .js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, _quote, specifier) =>
    JSON.stringify(pathToFileURL(require.resolve(specifier)).href)
  )
  .replace(/(['"])\$lib\/constants\/colors\.js\1/g, () =>
    JSON.stringify(new URL('../../src/lib/constants/colors.ts', import.meta.url).href)
  );
const { default: StickyNote } = await import(
  `data:text/javascript;base64,${Buffer.from(noteModule).toString('base64')}`
);

for (const variant of ['activity', 'task', 'story']) {
  test(`IDs can be hidden and restored on ${variant} cards without hiding their content`, () => {
    const props = {
      variant,
      colorIndex: 0,
      id: 'TEST-ID-123',
      title: 'Review company',
      pic: 'Ed',
      actor: { emoji: '🔎', label: 'Onboarding' }
    };
    const shown = render(StickyNote, { props: { ...props, showId: true } }).body;
    const hidden = render(StickyNote, { props: { ...props, showId: false } }).body;
    const restored = render(StickyNote, { props: { ...props, showId: true } }).body;

    assert.ok(shown.includes(props.id));
    assert.ok(!hidden.includes(props.id));
    assert.ok(hidden.includes(props.title));
    assert.ok(restored.includes(props.id));
    if (variant === 'story') {
      assert.ok(hidden.includes(props.pic));
      assert.ok(hidden.includes(props.actor.emoji));
      assert.ok(shown.indexOf(props.actor.emoji) < shown.indexOf(props.id));
    } else assert.ok(!hidden.includes(props.actor.emoji));
  });
}
