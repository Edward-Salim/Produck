<script lang="ts">
  import StickyNote from './StickyNote.svelte';
  import StoryModal from './StoryModal.svelte';
  import type { StoryMapData, Story } from '$lib/types/story-map.js';
  import { KANO } from '$lib/constants/colors.js';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import { resolveStoryActor } from '$lib/frameworks/actors.js';

  let {
    data,
    showIds = true,
    linkedStoryId = null
  }: { data: StoryMapData; showIds?: boolean; linkedStoryId?: string | null } = $props();

  let selectedStory: Story | null = $state(null);
  let modalOpen: boolean = $state(false);
  let activeActorTooltip = $state<string | null>(null);
  let dismissedLinkedStory = $state.raw<Story>();
  let linkedStory = $derived(
    linkedStoryId
      ? Object.values(data.stories)
          .flat()
          .find((story) => story.id === linkedStoryId)
      : undefined
  );
  let visibleLinkedStory = $derived(linkedStory === dismissedLinkedStory ? undefined : linkedStory);

  function setActorTooltipOpen(id: string, open: boolean) {
    if (open) activeActorTooltip = id;
    else if (activeActorTooltip === id) activeActorTooltip = null;
  }

  /* ---- Derived grid structure ---- */

  let is3Level = $derived(data.levels === 3);

  interface Column {
    actId: string;
    taskId: string | null;
    task: { id: string; title: string } | null;
    act: (typeof data.activities)[number];
  }

  let columns = $derived.by<Column[]>(() => {
    const cols: Column[] = [];
    for (const act of data.activities) {
      if (is3Level && act.tasks && act.tasks.length > 0) {
        for (const task of act.tasks) {
          cols.push({ actId: act.id, taskId: task.id, task, act });
        }
      } else {
        cols.push({ actId: act.id, taskId: null, task: null, act });
      }
    }
    return cols;
  });

  let activitySpans = $derived.by<Map<string, number>>(() => {
    const spans = new SvelteMap<string, number>();
    for (const col of columns) {
      spans.set(col.actId, (spans.get(col.actId) ?? 0) + 1);
    }
    return spans;
  });

  let totalCols = $derived(columns.length);

  let gridCols = $derived(`36px repeat(${totalCols}, minmax(125px, 1fr))`);

  /* ---- Kano section config ---- */

  const kanoSections = (Object.entries(KANO) as [string, (typeof KANO)[keyof typeof KANO]][]).map(
    ([key, v]) => ({
      key: key as 'must-have' | 'performance' | 'delighter',
      label: v.label,
      textColor: v.textClass,
      lineColor: v.lineClass
    })
  );

  /* ---- Helpers ---- */

  function findColumnIndex(story: Story): number {
    if (is3Level && story.task) {
      const idx = columns.findIndex((c) => c.taskId === story.task);
      if (idx >= 0) return idx;
    }
    if (story.activity) {
      const idx = columns.findIndex((c) => c.actId === story.activity);
      if (idx >= 0) return idx;
    }
    return 0;
  }

  /** Group stories by column index so multiple stories in the same cell stack vertically */
  function groupByColumn(stories: Story[]): Map<number, Story[]> {
    const groups = new SvelteMap<number, Story[]>();
    for (const story of stories) {
      const col = findColumnIndex(story);
      const arr = groups.get(col);
      if (arr) arr.push(story);
      else groups.set(col, [story]);
    }
    return groups;
  }

  function openStory(story: Story) {
    selectedStory = story;
    modalOpen = true;
  }

  function setModalOpen(open: boolean) {
    modalOpen = open;
    if (!open && visibleLinkedStory) dismissedLinkedStory = visibleLinkedStory;
  }

  function scrollToCategory(
    event: MouseEvent,
    category: keyof StoryMapData['stories'],
    column: number
  ) {
    const board = (event.currentTarget as HTMLElement).closest('[data-story-map]');
    const target = board?.querySelector<HTMLElement>(
      `[data-story-category="${category}"][data-story-column="${column}"]`
    );
    target?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  /* ---- Build unique activity order for spanning rows ---- */

  let kanoStartRow = $derived(is3Level ? 4 : 3); // row after actors + backbone + tasks (if 3-level)

  let activityOrder = $derived.by(() => {
    const seen = new SvelteSet<string>();
    const order: { act: (typeof data.activities)[number]; startCol: number; span: number }[] = [];
    let colIdx = 0;
    for (const act of data.activities) {
      if (!seen.has(act.id)) {
        seen.add(act.id);
        const span = activitySpans.get(act.id) ?? 1;
        order.push({ act, startCol: colIdx, span });
        colIdx += span;
      }
    }
    return order;
  });
</script>

<!-- Board container -->
<div
  data-story-map=""
  class="rounded-xl p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,.15),inset_0_-2px_6px_rgba(0,0,0,.06),0_6px_24px_rgba(0,0,0,.12)] md:p-8"
  style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;"
>
  <div
    class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    <!-- CSS Grid -->
    <div
      class="grid min-w-max items-start gap-2 pr-2 md:gap-3 md:pr-4"
      style="grid-template-columns: {gridCols};"
    >
      <!-- ====== ROW 1: Actor row ====== -->
      <!-- Gutter cell for actors -->
      <div class="flex h-full items-center justify-center" style="grid-column: 1; grid-row: 1;">
        <span
          class="text-[9px] font-semibold tracking-widest text-cork-500 uppercase"
          style="writing-mode: vertical-rl; text-orientation: mixed;">Actors</span
        >
      </div>

      {#each activityOrder as { act, startCol }, index (act.id)}
        {@const actors = act.actors ?? []}
        {@const previousActors = activityOrder[index - 1]?.act.actors ?? []}
        {@const sameActors =
          actors.length === previousActors.length &&
          actors.every((emoji) => previousActors.includes(emoji))}
        <div
          class="flex items-end justify-center py-1.5"
          style="grid-column: {startCol + 2}; grid-row: 1;"
        >
          {#if actors.length && !sameActors}
            <div class="flex w-35 items-center justify-center gap-1">
              {#each actors as actorEmoji (actorEmoji)}
                {@const actor = data.actors.find((a) => a.emoji === actorEmoji)}
                {@const tooltipId = `${act.id}:${actorEmoji}`}
                <Tooltip.Root
                  open={activeActorTooltip === tooltipId}
                  onOpenChange={(open) => setActorTooltipOpen(tooltipId, open)}
                  delayDuration={0}
                  disableHoverableContent
                >
                  <Tooltip.Trigger
                    class="cursor-pointer text-2xl drop-shadow-sm outline-none"
                    aria-label={actor?.label ?? actorEmoji}
                  >
                    {actorEmoji}
                  </Tooltip.Trigger>
                  {#if actor?.label}
                    <Tooltip.Content
                      side="top"
                      sideOffset={4}
                      class="pointer-events-none data-[state=closed]:hidden data-[state=closed]:animate-none"
                    >
                      {actor.label}
                    </Tooltip.Content>
                  {/if}
                </Tooltip.Root>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- ====== ROW 2: Backbone row ====== -->
      <!-- Gutter cell -->
      <div class="flex h-full items-center justify-center" style="grid-column: 1; grid-row: 2;">
        <span
          class="text-[9px] font-semibold tracking-widest text-cork-500 uppercase"
          style="writing-mode: vertical-rl; text-orientation: mixed;">Backbone</span
        >
      </div>

      {#each activityOrder as { act, startCol, span } (act.id)}
        {#if is3Level}
          <div
            class="flex items-center justify-center pb-3"
            style="grid-column: {startCol + 2}; grid-row: 2;"
          >
            <StickyNote
              variant="activity"
              colorIndex={0}
              title={act.title}
              id={act.id}
              showId={showIds}
            />
          </div>
        {:else}
          <div
            class="flex items-center justify-center pb-3"
            style="grid-column: {startCol + 2} / span {span}; grid-row: 2;"
          >
            <StickyNote
              variant="activity"
              colorIndex={0}
              title={act.title}
              id={act.id}
              showId={showIds}
            />
          </div>
        {/if}
      {/each}

      <!-- ====== ROW 3: Task row (only 3-level) ====== -->
      {#if is3Level}
        <!-- Gutter cell -->
        <div class="flex h-full items-center justify-center" style="grid-column: 1; grid-row: 3;">
          <span
            class="text-[9px] font-semibold tracking-widest text-cork-500 uppercase"
            style="writing-mode: vertical-rl; text-orientation: mixed;">Tasks</span
          >
        </div>

        {#each columns as col, i (col.taskId ?? col.actId + '-' + i)}
          <div
            class="flex items-center justify-center pb-3"
            style="grid-column: {i + 2}; grid-row: 3;"
          >
            {#if col.task}
              <StickyNote
                variant="task"
                colorIndex={i}
                title={col.task.title}
                id={col.task.id}
                showId={showIds}
              />
            {/if}
          </div>
        {/each}
      {/if}

      <!-- ====== Narrative flow label (overlaid, not a grid row) ====== -->

      <!-- ====== ROWS 5+: Kano sections ====== -->
      {#each kanoSections as section, sIdx (section.key)}
        {@const baseRow = kanoStartRow + 1 + sIdx * 2}
        {@const grouped = groupByColumn(data.stories[section.key])}

        <!-- Separator row -->
        <div
          data-story-category={section.key}
          class="flex scroll-mt-24 items-center gap-3 py-1.5"
          style="grid-column: 1 / -1; grid-row: {baseRow};"
        >
          <span
            class="text-[10px] font-bold tracking-widest whitespace-nowrap uppercase {section.textColor}"
          >
            {section.label}
          </span>
          <div class="h-0.5 flex-1 rounded-full {section.lineColor}"></div>
        </div>

        <!-- Group stories by column so multiple stories stack vertically -->
        {#each columns as col, colIndex (col.taskId ?? col.actId + '-' + colIndex)}
          {@const stories = grouped.get(colIndex) ?? []}
          {@const nextSection = kanoSections
            .slice(sIdx + 1)
            .find((next) =>
              data.stories[next.key].some((story) => findColumnIndex(story) === colIndex)
            )}
          {#if stories.length > 0 || nextSection}
            <div
              data-story-category={section.key}
              data-story-column={colIndex}
              class="flex scroll-mt-24 flex-col items-center gap-3"
              style="grid-column: {colIndex + 2}; grid-row: {baseRow + 1};"
            >
              {#each stories as story, storyIdx (story.id)}
                <StickyNote
                  variant="story"
                  colorIndex={sIdx * 100 + colIndex * 10 + storyIdx}
                  title={story.title}
                  id={story.id}
                  showId={showIds}
                  done={story.done}
                  pic={story.pic}
                  picColor={story.picColor}
                  actor={resolveStoryActor(story.asA, data.actors)}
                  onclick={() => openStory(story)}
                />
              {/each}
              {#if nextSection}
                <button
                  type="button"
                  class="flex size-8 cursor-pointer items-center justify-center text-cork-600 transition-colors outline-none hover:text-cork-900"
                  aria-label={`Scroll to ${nextSection.label}`}
                  title={`Scroll to ${nextSection.label}`}
                  onclick={(event) => scrollToCategory(event, nextSection.key, colIndex)}
                >
                  <ArrowDown class="size-4" />
                </button>
              {/if}
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  </div>
</div>

<!-- Story detail modal -->
<StoryModal
  bind:open={() => modalOpen || !!visibleLinkedStory, setModalOpen}
  story={modalOpen ? selectedStory : (visibleLinkedStory ?? selectedStory)}
/>
