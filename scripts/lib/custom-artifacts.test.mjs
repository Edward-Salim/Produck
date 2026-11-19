import assert from 'node:assert/strict';
import test from 'node:test';
import {
  artifactLinkHref,
  parseCustomArtifact
} from '../../src/lib/frameworks/custom-artifacts.ts';
import {
  dedupeFrameworkInstances,
  findFrameworkInstance,
  frameworkSelectionKey,
  isReadOnlyFramework,
  PROJECT_BRIEF_TEMPLATE_ID
} from '../../src/lib/frameworks/instances.ts';

test('published project briefs coexist and have unique framework links', () => {
  const first = { id: 'db-31', templateId: PROJECT_BRIEF_TEMPLATE_ID };
  const second = { id: 'db-32', templateId: PROJECT_BRIEF_TEMPLATE_ID };
  const storyMap = { id: 'story-map-db-project-24', templateId: 'story-map' };
  const instances = dedupeFrameworkInstances([first, storyMap, second]);

  assert.deepEqual(instances, [first, storyMap, second]);
  assert.equal(findFrameworkInstance(instances, frameworkSelectionKey(first)), first);
  assert.equal(findFrameworkInstance(instances, frameworkSelectionKey(second)), second);
  assert.equal(isReadOnlyFramework(second.templateId), true);
  assert.equal(isReadOnlyFramework(storyMap.templateId), false);
  assert.equal(isReadOnlyFramework('stakeholder-map'), true);
});

test('custom artifact parsing preserves valid blocks and skips bad or duplicate blocks', () => {
  const link = { type: 'link', label: 'Review', href: '/frameworks?project=24' };
  const table = {
    id: 'findings',
    type: 'table',
    columns: ['Story', 'State'],
    rows: [[link, { type: 'status', label: 'Partial', tone: 'warning' }]]
  };
  const expand = { id: 'notes', type: 'expand', title: 'Notes', text: 'Evidence scope.' };
  const source = JSON.stringify({
    summary: 'UAT review.',
    blocks: [table, { ...table, id: 'bad', rows: [[link]] }, expand, { ...table }]
  });

  assert.deepEqual(parseCustomArtifact(source), {
    summary: 'UAT review.',
    blocks: [table, expand]
  });
  assert.equal(parseCustomArtifact('{'), null);
  assert.equal(parseCustomArtifact('{"blocks":{}}'), null);
});

test('artifact links allow project paths and ordinary web URLs', () => {
  const story = '/frameworks?project=24&framework=story-map-db-project-24&story=CDQ-069';
  assert.equal(artifactLinkHref(story), story);
  assert.equal(artifactLinkHref('https://example.com/guide'), 'https://example.com/guide');
  for (const href of [
    'javascript:alert(1)',
    'data:text/html,hello',
    '//example.com',
    '/x/..//example.com'
  ]) {
    assert.equal(artifactLinkHref(href), undefined);
  }
});

test('project briefs support subheadings and lists with inline formatting', () => {
  const link = {
    type: 'link',
    label: 'Story Map',
    href: '/frameworks?project=24&framework=story-map'
  };
  const richText = ['See the ', link, ' for ', { type: 'strong', text: 'capture priorities' }, '.'];
  const blocks = [
    { id: 'plan', type: 'heading', level: 2, title: 'Capture plan' },
    { id: 'intro', type: 'text', text: richText },
    { id: 'setup', type: 'heading', level: 3, title: 'Customer setup' },
    { id: 'order', type: 'list', ordered: true, items: ['Capture invitation', richText] },
    { id: 'notes', type: 'list', items: ['Use a matching case'] }
  ];
  const invalid = [
    { id: 'invalid-heading', type: 'heading', level: 1, title: 'Secondary page title' },
    { id: 'empty-list', type: 'list', items: [] },
    { id: 'invalid-order', type: 'list', ordered: 'true', items: ['Capture invitation'] },
    { id: 'invalid-inline', type: 'list', items: [[{ type: 'strong', text: 12 }]] }
  ];

  assert.deepEqual(
    parseCustomArtifact(JSON.stringify({ summary: richText, blocks: [...blocks, ...invalid] })),
    { summary: richText, blocks }
  );
});

test('expandable sections preserve valid child blocks and reserve unique anchors across the brief', () => {
  const overview = { id: 'overview', type: 'heading', level: 2, title: 'Overview' };
  const steps = { id: 'steps', type: 'list', items: ['Review the screenshot evidence'] };
  const gallery = { id: 'gallery', type: 'gallery', images: [] };
  const nested = { id: 'examples', type: 'expand', title: 'Examples', blocks: [gallery] };
  const section = {
    id: 'evidence',
    type: 'expand',
    title: 'Supporting evidence',
    text: 'Open the relevant example.',
    blocks: [steps, nested]
  };
  const source = JSON.stringify({
    blocks: [
      overview,
      { ...section, blocks: [overview, steps, { id: 'bad', type: 'table' }, nested] },
      { ...overview, id: gallery.id },
      { id: 'empty', type: 'expand', title: 'Empty', blocks: [{ id: 'bad', type: 'text' }] }
    ]
  });

  assert.deepEqual(parseCustomArtifact(source)?.blocks, [overview, section]);
});
