import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { normalizeFieldNotes } from '../../src/lib/frameworks/fields.ts';

test('simple field names and value labels need no explanation metadata', () => {
  const notes = [{ name: 'Email' }, { name: 'Status', values: [{ label: 'Approved' }] }];
  assert.deepEqual(normalizeFieldNotes(notes), notes);
});

const require = createRequire(import.meta.url);
const fieldsSource = await readFile(
  new URL('../../src/lib/components/story-map/StoryFields.svelte', import.meta.url),
  'utf8'
);
const fieldsModule = compile(fieldsSource, { filename: 'StoryFields.svelte', generate: 'server' })
  .js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, _quote, specifier) =>
    JSON.stringify(pathToFileURL(require.resolve(specifier)).href)
  )
  .replace(/(['"])\$lib\/frameworks\/fields\.js\1/g, () =>
    JSON.stringify(new URL('../../src/lib/frameworks/fields.ts', import.meta.url).href)
  );
const { default: StoryFields } = await import(
  `data:text/javascript;base64,${Buffer.from(fieldsModule).toString('base64')}`
);

test('generic fields show names, values and examples without explanation paragraphs', () => {
  const body = render(StoryFields, {
    props: {
      notes: [
        {
          name: 'Status',
          meaning: 'HIDDEN_MEANING',
          needed: 'HIDDEN_REQUIREMENT',
          values: [{ label: 'Approved', meaning: 'HIDDEN_VALUE_MEANING' }],
          example: 'Example value'
        },
        { name: 'Email' }
      ]
    }
  }).body;
  for (const text of ['Status', 'Approved', 'Example value', 'Email'])
    assert.ok(body.includes(text));
  assert.ok(!body.includes('HIDDEN_'));
});

test('CheckDAQ-specific fields can explain their value labels', () => {
  const body = render(StoryFields, {
    props: {
      notes: [
        {
          name: 'Account class',
          explain: true,
          meaning: 'HIDDEN_FIELD_DESCRIPTION',
          values: [
            { label: 'Direct', meaning: 'Onboarded directly' },
            { label: 'Partnership', meaning: 'Onboarded under a partner' }
          ],
          needed: 'HIDDEN_REQUIREMENT'
        }
      ]
    }
  }).body;
  for (const text of [
    'Account class',
    'Direct',
    'Onboarded directly',
    'Partnership',
    'Onboarded under a partner'
  ])
    assert.ok(body.includes(text));
  assert.ok(!body.includes('HIDDEN_'));
});

test('field notes retain contextual meanings, conditions, values and examples', () => {
  const notes = [
    {
      name: ' Source of funds ',
      meaning: ' Income funding the transactions. ',
      needed: ' When requested by the questionnaire. ',
      example: ' Sales revenue. ',
      values: [{ label: 'Sales', meaning: 'Business income' }]
    }
  ];
  assert.deepEqual(normalizeFieldNotes(notes), [
    {
      name: 'Source of funds',
      meaning: 'Income funding the transactions.',
      needed: 'When requested by the questionnaire.',
      example: 'Sales revenue.',
      values: [{ label: 'Sales', meaning: 'Business income' }]
    }
  ]);
});

test('legacy stories and malformed notes do not generate invented requiredness', () => {
  for (const value of [undefined, null, {}, 'field'])
    assert.deepEqual(normalizeFieldNotes(value), []);
  const normalized = normalizeFieldNotes([
    null,
    {},
    { name: ' ', meaning: 'Missing name' },
    { name: 1, meaning: 'Invalid name' },
    {
      name: 'Valid',
      meaning: 'A known meaning',
      needed: true,
      example: 123,
      values: [null, {}, { label: 1, meaning: 'Invalid label' }]
    }
  ]);
  assert.deepEqual(normalized, [{ name: 'Valid', meaning: 'A known meaning' }]);
});

test('an unconfirmed requirement stays absent while valid value definitions survive', () => {
  const [note] = normalizeFieldNotes([
    {
      name: 'Status',
      meaning: 'Review outcome',
      values: [
        { label: 'False', meaning: 'Different subject' },
        { label: 2, meaning: 'Invalid' }
      ]
    }
  ]);
  assert.equal(Object.hasOwn(note, 'needed'), false);
  assert.deepEqual(note.values, [{ label: 'False', meaning: 'Different subject' }]);
});
