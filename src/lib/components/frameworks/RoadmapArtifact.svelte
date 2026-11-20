<script lang="ts">
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import CalendarX from '@lucide/svelte/icons/calendar-x';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Clock from '@lucide/svelte/icons/clock';
  import Hourglass from '@lucide/svelte/icons/hourglass';
  import Milestone from '@lucide/svelte/icons/milestone';
  import Rocket from '@lucide/svelte/icons/rocket';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import {
    buildRoadmapTimeline,
    formatRoadmapQuarter,
    groupRoadmapByQuarter,
    parseRoadmap,
    sortRoadmapCards,
    type RoadmapCard,
    type RoadmapView
  } from '$lib/frameworks/roadmap.js';
  import type { FrameworkInstance } from './types.js';

  let { instance, view = 'horizons' }: { instance: FrameworkInstance; view?: RoadmapView } =
    $props();
  const titleId = $props.id();
  const completedLaneId = `${titleId}-completed`;
  let roadmap = $derived(parseRoadmap(instance.values.roadmap));
  let closedCards = $derived.by(() => {
    const completed: RoadmapCard[] = [];
    const archived: RoadmapCard[] = [];
    for (const card of roadmap?.closed ?? []) {
      if (view !== 'timeline' && card.status?.trim().toLowerCase() === 'completed')
        completed.push(card);
      else archived.push(card);
    }
    return { completed, archived };
  });
  let phases = $derived.by(() => {
    if (!roadmap || view === 'timeline') return [];
    const lanes =
      view === 'quarters'
        ? groupRoadmapByQuarter(roadmap.phases)
        : roadmap.phases.map((phase) => ({ ...phase, cards: sortRoadmapCards(phase.cards) }));
    if (closedCards.completed.length)
      lanes.push({
        id: completedLaneId,
        title: 'Completed',
        cards: sortRoadmapCards(closedCards.completed)
      });
    return lanes;
  });
  let timeline = $derived(
    roadmap && view === 'timeline' ? buildRoadmapTimeline(roadmap.phases) : null
  );
  const currentDate = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'numeric',
    timeZone: 'Asia/Bangkok'
  }).formatToParts();
  const currentYear = Number(currentDate.find((part) => part.type === 'year')?.value);
  const currentQuarter = Math.ceil(
    Number(currentDate.find((part) => part.type === 'month')?.value) / 3
  );
  const nextQuarterYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
  const laneTones = new Map([
    ['now', 'current'],
    ['next', 'next'],
    ['unscheduled', 'unscheduled'],
    ['quarter-unscheduled', 'unscheduled'],
    [`quarter-${currentYear}-Q${currentQuarter}`, 'current'],
    [`quarter-${nextQuarterYear}-Q${(currentQuarter % 4) + 1}`, 'next']
  ]);
  const horizonIcons = new Map([
    ['now', Rocket],
    ['next', Clock],
    ['later', Hourglass]
  ]);
</script>

{#snippet cardContent(card: RoadmapCard)}
  {@const target =
    view !== 'timeline' && card.quarter
      ? formatRoadmapQuarter(card.quarter, card.endQuarter)
      : undefined}
  <h3
    id={card.id}
    data-priority={card.priority}
    class="card-title text-sm leading-snug font-bold break-words text-cork-900"
  >
    {card.title}
  </h3>
  {#if target || card.status || card.goal || card.progress}
    <dl class="card-details">
      {#if target}
        <dt>Target</dt>
        <dd class="py-0.5 text-cork-700">{target}</dd>
      {/if}
      {#if card.status}
        <dt>Status</dt>
        <dd class="py-0.5 font-medium text-cork-700">{card.status}</dd>
      {/if}
      {#if card.goal}
        <dt>Goal</dt>
        <dd>
          <span class="goal">
            {#if card.goalEmoji}
              <span class="shrink-0" aria-hidden="true">{card.goalEmoji}</span>
            {/if}
            {card.goal}
          </span>
        </dd>
      {/if}
      {#if card.progress}
        <dt>{card.progress.label}</dt>
        <dd class="flex items-center gap-2">
          <progress
            class="min-w-0 flex-1"
            value={card.progress.completed}
            max={card.progress.total}
            aria-label={`${card.title} ${card.progress.label.toLowerCase()}`}
          ></progress>
          <span class="text-cork-600 tabular-nums"
            >{card.progress.completed}/{card.progress.total}</span
          >
        </dd>
      {/if}
    </dl>
  {/if}
  <Dialog.Root>
    <Dialog.Trigger
      type="button"
      aria-label={`Details for ${card.title}${card.priority ? `, ${card.priority} priority` : ''}`}
      class="absolute inset-0 size-full cursor-pointer rounded-[inherit] focus-visible:ring-2 focus-visible:ring-[#49637d] focus-visible:ring-inset"
    />
    <Dialog.Content
      class="w-[calc(100%-2rem)] max-w-sm gap-2.5 bg-[#fffcf6] pr-12 sm:max-w-sm sm:pr-12"
    >
      <Dialog.Title class="text-base leading-snug break-words text-cork-900"
        >{card.title}</Dialog.Title
      >
      <Dialog.Description
        class="max-h-[min(50dvh,22rem)] overflow-y-auto overscroll-contain leading-relaxed whitespace-pre-line text-cork-800"
      >
        {card.description?.trim() || 'No description provided in the roadmap.'}
      </Dialog.Description>
    </Dialog.Content>
  </Dialog.Root>
{/snippet}

<article class="roadmap min-w-0 px-1 pb-2 text-cork-800 sm:px-2 sm:pb-4">
  <h1 id={titleId} class="sr-only">{instance.title}</h1>

  {#if timeline}
    {#if timeline.months.length}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus the horizontal scroll region.) -->
      <div class="timeline-scroll" role="region" aria-label="Roadmap timeline" tabindex="0">
        <div class="timeline" style:--months={timeline.months.length}>
          {#each timeline.years as year (year.year)}
            {@const label =
              year.year === currentYear
                ? 'This year'
                : year.year === currentYear + 1
                  ? 'Next year'
                  : ''}
            <div
              class="timeline-year"
              style:grid-column={`${year.startColumn} / ${year.endColumn}`}
            >
              <span class="timeline-year-label">
                {#if label}
                  {label} <span class="text-cork-600 tabular-nums">{year.year}</span>
                {:else}
                  {year.year}
                {/if}
              </span>
            </div>
          {/each}
          {#each timeline.months as month, index (month)}
            <div class="timeline-month" style:grid-column={index + 1}>
              <span class="timeline-month-label">{month}</span>
            </div>
          {/each}
          <ol class="timeline-cards" role="list" aria-label="Scheduled work">
            {#each timeline.cards as entry (entry.card.id)}
              <li
                class="card timeline-card"
                style:grid-column={`${entry.startColumn} / ${entry.endColumn}`}
              >
                {@render cardContent(entry.card)}
              </li>
            {/each}
          </ol>
        </div>
      </div>
    {/if}
    {#if timeline.unscheduled.length}
      <section
        class={{ 'mt-4': timeline.months.length > 0 }}
        aria-labelledby={`${titleId}-unscheduled`}
      >
        <h2 id={`${titleId}-unscheduled`} class="mb-2 text-sm font-semibold text-cork-800">
          Unscheduled
        </h2>
        <ul class="unscheduled-cards" role="list">
          {#each timeline.unscheduled as card (card.id)}
            <li class="card">{@render cardContent(card)}</li>
          {/each}
        </ul>
      </section>
    {:else if !timeline.cards.length}
      <p class="py-8 text-sm text-cork-600">No work items.</p>
    {/if}
  {:else if roadmap}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus the horizontal scroll region.) -->
    <ol class="phases" role="list" aria-labelledby={titleId} tabindex="0">
      {#each phases as phase (phase.id)}
        {@const horizon = phase.title.trim().toLowerCase()}
        {@const tone =
          phase.id === completedLaneId
            ? 'completed'
            : laneTones.get(view === 'quarters' ? phase.id : horizon)}
        {@const Icon =
          tone === 'completed'
            ? CircleCheck
            : tone === 'unscheduled'
              ? CalendarX
              : view === 'quarters'
                ? CalendarDays
                : (horizonIcons.get(horizon) ?? Milestone)}
        <li class="phase" data-tone={tone}>
          <header class="flex items-center justify-between gap-2">
            <h2 id={phase.id} class="phase-title">
              <Icon class="size-3.5 shrink-0" aria-hidden="true" />
              {phase.title}
            </h2>
            <span class="text-xs font-medium text-cork-600 tabular-nums">
              {phase.cards.length}<span class="sr-only"> work items</span>
            </span>
          </header>

          <ul class="cards" role="list" aria-labelledby={phase.id}>
            {#each phase.cards as card (card.id)}
              <li class="card">{@render cardContent(card)}</li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
    {#if !phases.length}
      <p class="py-8 text-sm text-cork-600">No work items.</p>
    {/if}
  {:else}
    <p class="py-8 text-sm text-cork-600">No roadmap available.</p>
  {/if}

  {#if closedCards.archived.length}
    <details class="mt-4">
      <summary class="cursor-pointer py-2 text-sm font-semibold text-cork-800">
        {view === 'timeline' ? 'Completed and cancelled' : 'Archived work'} ({closedCards.archived
          .length})
      </summary>
      <ul class="unscheduled-cards mt-2" role="list" aria-label="Archived work">
        {#each closedCards.archived as card (card.id)}
          <li class="card">{@render cardContent(card)}</li>
        {/each}
      </ul>
    </details>
  {/if}
</article>

<style>
  .roadmap {
    --accent: #49637d;
  }

  .timeline-scroll,
  .phases {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .timeline-scroll::-webkit-scrollbar,
  .phases::-webkit-scrollbar {
    display: none;
  }

  .timeline-scroll:focus-visible,
  .phases:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }

  .timeline-scroll {
    border-radius: 0.875rem;
    background: var(--color-cork-50);
  }

  .timeline {
    display: grid;
    grid-template-columns: repeat(var(--months), minmax(13rem, 1fr));
    grid-template-rows: auto auto 1fr;
    min-width: calc(var(--months) * 13rem);
  }

  .timeline-year {
    grid-row: 1;
    border-bottom: 1px solid var(--color-cork-300);
    background: var(--color-cork-200);
  }

  .timeline-year + .timeline-year {
    border-inline-start: 1px solid var(--color-cork-300);
  }

  .timeline-year-label {
    position: sticky;
    inset-inline-start: 0;
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    background: var(--color-cork-200);
    padding: 0.625rem 0.75rem;
    color: var(--color-cork-900);
    font-size: 0.875rem;
    font-weight: 700;
  }

  .timeline-month {
    display: grid;
    grid-row: 2 / -1;
    grid-template-rows: subgrid;
  }

  .timeline-month + .timeline-month {
    border-inline-start: 1px solid var(--color-cork-300);
  }

  .timeline-month-label {
    border-bottom: 1px solid var(--color-cork-300);
    background: var(--color-cork-100);
    padding: 0.625rem 0.75rem;
    color: var(--color-cork-700);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .timeline-cards {
    display: grid;
    grid-column: 1 / -1;
    grid-row: 3;
    grid-template-columns: subgrid;
    grid-auto-flow: dense;
  }

  .timeline-card {
    align-self: start;
    margin: 0.25rem;
  }

  .unscheduled-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr));
    gap: 0.5rem;
  }

  .phases {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-auto-columns: minmax(13.5rem, 1fr);
    grid-auto-flow: column;
    gap: 0.75rem;
  }

  .phase {
    --lane: #f2ece3;
    --lane-ink: var(--color-cork-800);
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 2;
    gap: 0.75rem;
    min-width: 0;
    border-radius: 0.875rem;
    background: var(--lane);
    padding: 0.625rem;
    overflow-wrap: anywhere;
  }

  .phase[data-tone='current'] {
    --lane: #e3edf4;
    --lane-ink: #314f69;
  }

  .phase[data-tone='next'] {
    --lane: #eee9f4;
    --lane-ink: #594965;
  }

  .phase[data-tone='unscheduled'] {
    --lane: #e9e7e4;
    --lane-ink: #575550;
  }

  .phase[data-tone='completed'] {
    --lane: #e5e9eb;
    --lane-ink: #43545d;
  }

  h2,
  h3 {
    scroll-margin-top: 6rem;
  }

  .phase-title {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--lane-ink);
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .cards {
    display: grid;
    align-content: start;
    gap: 0.5rem;
  }

  .card {
    position: relative;
    min-width: 0;
    border: 1px solid var(--color-cork-200);
    border-radius: 0.625rem;
    background: #fffcf6;
    padding: 0.75rem;
    box-shadow: 0 1px 2px #392d1b0b;
  }

  .card:hover {
    border-color: var(--color-cork-300);
  }

  .card-title[data-priority='high'] {
    color: #a12c40;
  }

  .card-title[data-priority='medium'] {
    color: #986200;
  }

  .card-title[data-priority='low'] {
    color: #12634c;
  }

  .card-details {
    display: grid;
    grid-template-columns: minmax(2.6rem, auto) minmax(0, 1fr);
    align-items: start;
    gap: 0.375rem 0.5rem;
    margin-top: 0.625rem;
    font-size: 0.6875rem;
  }

  dt {
    padding-block: 0.125rem;
    color: var(--color-cork-600);
    font-weight: 600;
  }

  .goal {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    border-radius: 0.25rem;
    background: #eeeae3;
    padding: 0.125rem 0.375rem;
    color: #4e473a;
    font-weight: 600;
  }

  progress {
    appearance: none;
    height: 0.375rem;
    overflow: hidden;
    border-radius: 99px;
    background: var(--color-cork-200);
    accent-color: var(--accent);
  }

  progress::-webkit-progress-bar {
    background: var(--color-cork-200);
  }

  progress::-webkit-progress-value {
    background: var(--accent);
  }

  progress::-moz-progress-bar {
    background: var(--accent);
  }
</style>
