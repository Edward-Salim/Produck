<script lang="ts">
  import StickyNote from './StickyNote.svelte';
  import StoryModal from './StoryModal.svelte';
  import type { StoryMapData, Story } from '$lib/types/story-map.js';
  import { KANO } from '$lib/constants/colors.js';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  let { data }: { data: StoryMapData } = $props();

  let selectedStory: Story | null = $state(null);
  let modalOpen: boolean = $state(false);

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
    class="rounded-xl p-4 shadow-[inset_0_1px_4px_rgba(255,255,255,.15),inset_0_-2px_6px_rgba(0,0,0,.06),0_6px_24px_rgba(0,0,0,.12)] md:p-8"
    style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;"
  >
    <div
      class="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <!-- CSS Grid -->
      <div
        class="grid min-w-max items-start gap-2 md:gap-3"
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

      {#each activityOrder as { act, startCol, span: _span } (act.id)}
        <!-- Actor emojis: placed in first column only -->
        <div
          class="flex items-end justify-center py-1.5"
          style="grid-column: {startCol + 2}; grid-row: 1;"
        >
          {#if act.actors}
            <div class="flex w-35 items-center justify-center gap-1">
              {#each act.actors as actorEmoji (actorEmoji)}
                {@const actor = data.actors.find((a) => a.emoji === actorEmoji)}
                <span class="group relative cursor-default text-2xl drop-shadow-sm">
                  {actorEmoji}
                  {#if actor?.label}
                    <span
                      class="pointer-events-none absolute top-full left-1/2 z-20 mt-1 -translate-x-1/2 rounded bg-cork-800 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-cork-50 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                    >
                      {actor.label}
                    </span>
                  {/if}
                </span>
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
            <StickyNote variant="activity" colorIndex={0} title={act.title} id={act.id} />
          </div>
        {:else}
          <div
            class="flex items-center justify-center pb-3"
            style="grid-column: {startCol + 2} / span {span}; grid-row: 2;"
          >
            <StickyNote variant="activity" colorIndex={0} title={act.title} id={act.id} />
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
              <StickyNote variant="task" colorIndex={i} title={col.task.title} id={col.task.id} />
            {/if}
          </div>
        {/each}
      {/if}

      <!-- ====== Narrative flow label (overlaid, not a grid row) ====== -->

      <!-- ====== ROWS 5+: Kano sections ====== -->
      {#each kanoSections as section, sIdx (section.key)}
        {@const baseRow = kanoStartRow + 1 + sIdx * 2}

        <!-- Separator row -->
        <div
          class="flex items-center gap-3 py-1.5"
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
        {@const grouped = groupByColumn(data.stories[section.key])}
        {#each [...grouped.entries()] as [colIndex, stories] (colIndex)}
          <div
            class="flex flex-col items-center gap-3"
            style="grid-column: {colIndex + 2}; grid-row: {baseRow + 1};"
          >
            {#each stories as story, storyIdx (story.id)}
              <StickyNote
                variant="story"
                colorIndex={sIdx * 100 + colIndex * 10 + storyIdx}
                title={story.title}
                id={story.id}
                done={story.done}
                pic={story.pic}
                picColor={story.picColor}
                onclick={() => openStory(story)}
              />
            {/each}
          </div>
        {/each}
      {/each}
    </div>
    </div>
  </div>

<!-- Story detail modal -->
<StoryModal bind:open={modalOpen} story={selectedStory} />
