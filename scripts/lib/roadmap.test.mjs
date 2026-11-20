import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dedupeFrameworkInstances,
  findFrameworkInstance,
  frameworkSelectionKey,
  isReadOnlyFramework,
  PROJECT_BRIEF_TEMPLATE_ID,
  ROADMAP_TEMPLATE_ID
} from '../../src/lib/frameworks/instances.ts';
import {
  buildRoadmapTimeline,
  formatRoadmapQuarter,
  groupRoadmapByQuarter,
  parseRoadmap,
  sortRoadmapCards
} from '../../src/lib/frameworks/roadmap.ts';

test('roadmaps coexist with project briefs and open by their own instance IDs', () => {
  const brief = { id: 'db-30', templateId: PROJECT_BRIEF_TEMPLATE_ID };
  const roadmap = { id: 'db-31', templateId: ROADMAP_TEMPLATE_ID };
  const anotherRoadmap = { id: 'db-32', templateId: ROADMAP_TEMPLATE_ID };
  const instances = dedupeFrameworkInstances([brief, roadmap, anotherRoadmap]);

  assert.deepEqual(instances, [brief, roadmap, anotherRoadmap]);
  assert.equal(findFrameworkInstance(instances, frameworkSelectionKey(roadmap)), roadmap);
  assert.equal(
    findFrameworkInstance(instances, frameworkSelectionKey(anotherRoadmap)),
    anotherRoadmap
  );
  assert.equal(isReadOnlyFramework(ROADMAP_TEMPLATE_ID), true);
});

test('roadmaps preserve phased cards and validate evidence progress and unique IDs', () => {
  const card = {
    id: 'capture-invite',
    title: 'Capture the account invitation',
    description: 'Attach the customer acceptance screen.',
    priority: 'high',
    goal: 'Customer setup coverage',
    goalEmoji: '🪪',
    progress: { label: 'Evidence', completed: 1, total: 2 },
    links: [{ label: 'CDQ-017', href: '/frameworks?story=CDQ-017' }]
  };
  const phases = [
    { id: 'now', title: 'Now', cards: [card] },
    { id: 'next', title: 'Next', cards: [] }
  ];
  const roadmap = { summary: 'Proposed UAT priorities', phases, links: card.links };
  assert.deepEqual(parseRoadmap(JSON.stringify(roadmap)), { phases });

  phases[1].cards.push(card);
  assert.equal(parseRoadmap(JSON.stringify(roadmap)), null);
  phases[1].cards.pop();
  card.progress.completed = 3;
  assert.equal(parseRoadmap(JSON.stringify(roadmap)), null);
});

test('quarterly roadmaps group cards across horizons and keep unscheduled work visible', () => {
  const later = { id: 'a', title: 'Later work', quarter: '2027-Q1' };
  const sooner = { id: 'b', title: 'Sooner work', quarter: '2026-Q4' };
  const unscheduled = { id: 'c', title: 'Unscheduled work' };
  const moreLater = { id: 'd', title: 'More later work', quarter: later.quarter };
  const phases = [
    { id: 'now', title: 'Now', cards: [later, sooner] },
    { id: 'next', title: 'Next', cards: [unscheduled, moreLater] }
  ];
  const roadmap = parseRoadmap(JSON.stringify({ phases }));

  assert.deepEqual(
    groupRoadmapByQuarter(roadmap.phases).map(({ title, cards }) => [title, cards]),
    [
      ['Q4 2026', [sooner]],
      ['Q1 2027', [later, moreLater]],
      ['Unscheduled', [unscheduled]]
    ]
  );

  sooner.quarter = '2026-Q5';
  assert.equal(parseRoadmap(JSON.stringify({ phases })), null);
});

test('timelines span scheduled months and keep cards without dates visible', () => {
  const singleMonth = {
    id: 'one',
    title: 'Single month',
    schedule: { start: '2027-02-01', end: '2027-02-01' }
  };
  const crossYear = {
    id: 'cross',
    title: 'Cross-year work',
    schedule: { start: '2026-12-20', end: '2027-01-05' }
  };
  const unscheduled = { id: 'open', title: 'Undated work' };
  const phases = [{ id: 'now', title: 'Now', cards: [singleMonth, crossYear, unscheduled] }];
  const roadmap = parseRoadmap(JSON.stringify({ phases }));

  assert.deepEqual(buildRoadmapTimeline(roadmap.phases), {
    years: [
      { year: 2026, startColumn: 1, endColumn: 2 },
      { year: 2027, startColumn: 2, endColumn: 4 }
    ],
    months: ['Dec 2026', 'Jan 2027', 'Feb 2027'],
    cards: [
      { card: crossYear, startColumn: 1, endColumn: 3 },
      { card: singleMonth, startColumn: 3, endColumn: 4 }
    ],
    unscheduled: [unscheduled]
  });

  singleMonth.schedule.end = '2027-02-30';
  assert.equal(parseRoadmap(JSON.stringify({ phases })), null);
  singleMonth.schedule.end = '2027-01-31';
  assert.equal(parseRoadmap(JSON.stringify({ phases })), null);
});

test('quarter targets use complete quarter windows and keep closed work outside the timeline', () => {
  const first = { id: 'first', title: 'Q4 work', quarter: '2026-Q4' };
  const range = {
    id: 'range',
    title: 'Two-quarter work',
    quarter: '2027-Q1',
    endQuarter: '2027-Q2'
  };
  const closed = [{ id: 'closed-work', title: 'Completed work', status: 'Completed' }];
  const phases = [{ id: 'now', title: 'Now', cards: [first, range] }];
  const roadmap = parseRoadmap(JSON.stringify({ phases, closed }));

  assert.deepEqual(roadmap.closed, closed);
  assert.deepEqual(buildRoadmapTimeline(roadmap.phases).cards, [
    { card: first, startColumn: 1, endColumn: 4 },
    { card: range, startColumn: 4, endColumn: 10 }
  ]);
  assert.equal(formatRoadmapQuarter(range.quarter, range.endQuarter), 'Q1–Q2 2027');
  assert.equal(formatRoadmapQuarter(first.quarter, range.quarter), 'Q4 2026 – Q1 2027');
  assert.equal(parseRoadmap(JSON.stringify({ phases, closed: [first] })), null);

  range.endQuarter = '2026-Q4';
  assert.equal(parseRoadmap(JSON.stringify({ phases, closed })), null);
});

test('roadmap lanes sort by priority and earlier targets while preserving source-order ties', () => {
  const long = {
    id: 'long',
    title: 'Long window',
    quarter: '2027-Q1',
    endQuarter: '2027-Q2',
    priority: 'high'
  };
  const medium = { id: 'medium', title: 'Medium', quarter: '2027-Q1', priority: 'medium' };
  const low = { id: 'low', title: 'Low', quarter: '2027-Q1', priority: 'low' };
  const short = { id: 'short', title: 'Short window', quarter: '2027-Q1', priority: 'high' };
  const sameTarget = {
    id: 'same-target',
    title: 'Same target',
    quarter: '2027-Q1',
    priority: 'high'
  };
  const idea = { id: 'idea', title: 'Idea' };
  const unplanned = { id: 'unplanned', title: 'Undated high priority', priority: 'high' };
  const cards = [long, idea, medium, low, unplanned, short, sameTarget];
  const phases = [{ id: 'now', title: 'Now', cards }];

  assert.deepEqual(sortRoadmapCards(cards), [
    short,
    sameTarget,
    long,
    unplanned,
    medium,
    low,
    idea
  ]);
  assert.deepEqual(cards, [long, idea, medium, low, unplanned, short, sameTarget]);
  assert.deepEqual(
    groupRoadmapByQuarter(phases).map((phase) => phase.cards),
    [
      [short, sameTarget, long, medium, low],
      [unplanned, idea]
    ]
  );
});

test('timeline start dates sort ahead of priorities and same-start cards use priority', () => {
  const medium = { id: 'medium', title: 'Medium', quarter: '2027-Q1', priority: 'medium' };
  const high = { id: 'high', title: 'High', quarter: '2027-Q1', priority: 'high' };
  const previous = {
    id: 'previous',
    title: 'Previous quarter',
    quarter: '2026-Q4',
    priority: 'low'
  };
  const later = {
    id: 'later',
    title: 'A later start',
    schedule: { start: '2027-01-02', end: '2027-01-10' },
    priority: 'high'
  };
  const idea = { id: 'idea', title: 'Idea' };
  const unplanned = { id: 'unplanned', title: 'Undated medium priority', priority: 'medium' };
  const phases = [
    { id: 'now', title: 'Now', cards: [medium, idea, later, previous, high, unplanned] }
  ];
  const timeline = buildRoadmapTimeline(phases);

  assert.deepEqual(
    timeline.cards.map(({ card }) => card),
    [previous, high, medium, later]
  );
  assert.deepEqual(timeline.unscheduled, [unplanned, idea]);
});
