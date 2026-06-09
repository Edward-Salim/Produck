<script lang="ts">
  import {
    CircleCheck,
    Circle,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    Square,
    SquareCheck,
    ClipboardList
  } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import type { BacklogEpic, BacklogStory } from '$lib/types/story-map.js';
  import type { StoryMapData } from '$lib/types/story-map.js';
  import { KANO, KANO_ORDER } from '$lib/constants/colors.js';

  let {
    sortedEpics,
    storyMap,
    onInvalidate
  }: {
    sortedEpics: BacklogEpic[];
    storyMap: StoryMapData;
    onInvalidate: () => void;
  } = $props();

  let prioritySortDir = $state<'asc' | 'desc'>('asc');

  function togglePrioritySort() {
    prioritySortDir = prioritySortDir === 'asc' ? 'desc' : 'asc';
  }

  let localEpics = $derived.by(() => {
    const dir = prioritySortDir === 'asc' ? 1 : -1;
    return sortedEpics.map((epic) => ({
      ...epic,
      stories: [...epic.stories].sort((a, b) => {
        const taskCmp = a.taskOrder - b.taskOrder;
        if (taskCmp !== 0) return taskCmp;
        return ((KANO_ORDER[a.kano] ?? 9) - (KANO_ORDER[b.kano] ?? 9)) * dir;
      })
    }));
  });

  let allPics = $derived.by(() => {
    const pics = new SvelteSet<string>();
    for (const epic of localEpics) {
      for (const story of epic.stories) {
        if (story.pic) pics.add(story.pic);
      }
    }
    return [...pics].sort();
  });

  let picDropdownOpen = $state<string | null>(null);

  function updatePic(story: BacklogStory, newPic: string) {
    story.pic = newPic;
    picDropdownOpen = null;
    fetch('/api/story', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: story.id, pic: newPic })
    }).then(() => onInvalidate());
  }

  let expandedStories = new SvelteSet<string>();

  function toggleStory(id: string) {
    if (expandedStories.has(id)) expandedStories.delete(id);
    else expandedStories.add(id);
  }

  function expandAll() {
    expandedStories.clear();
    for (const epic of localEpics) {
      for (const story of epic.stories) {
        if (story.acceptanceCriteria.length > 0) expandedStories.add(story.id);
      }
    }
  }

  function collapseAll() {
    expandedStories.clear();
  }

  let allExpanded = $derived.by(() => {
    const withAC = localEpics
      .flatMap((e) => e.stories)
      .filter((s) => s.acceptanceCriteria.length > 0);
    return withAC.length > 0 && withAC.every((s) => expandedStories.has(s.id));
  });

  function isACChecked(story: BacklogStory, index: number): boolean {
    return story.checkedAcs.some((ac: { index: number }) => ac.index === index);
  }

  function getACTime(story: BacklogStory, index: number): string {
    const ac = story.checkedAcs.find(
      (a: { index: number; checkedAt: string }) => a.index === index
    );
    if (!ac) return '';
    return new Date(ac.checkedAt).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function isAllACDone(story: BacklogStory): boolean {
    if (story.acceptanceCriteria.length === 0) return false;
    return story.checkedAcs.length >= story.acceptanceCriteria.length;
  }

  let syncTimer: ReturnType<typeof setTimeout> | null = null;

  function toggleAC(storyId: string, story: BacklogStory, index: number) {
    const current = [...story.checkedAcs];
    const existing = current.findIndex((a) => a.index === index);
    if (existing >= 0) {
      current.splice(existing, 1);
    } else {
      current.push({ index, checkedAt: new Date().toISOString() });
    }
    story.checkedAcs = current;
    const shouldBeDone =
      story.acceptanceCriteria.length > 0 && current.length >= story.acceptanceCriteria.length;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      fetch('/api/story', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: storyId, checkedAcs: current, done: shouldBeDone })
      }).then(() => onInvalidate());
    }, 500);
  }
</script>

<svelte:window onclick={() => (picDropdownOpen = null)} />

{#if localEpics.length === 0}
  <EmptyState
    icon={ClipboardList}
    title="No stories yet"
    description="Add stories to the story map to see them here"
  />
{:else}
  <div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-100">
    <div
      class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-300/40 bg-cork-200/30 px-3 py-2 text-[10px] font-bold tracking-widest text-cork-400 uppercase md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center transition-colors hover:text-cork-700"
          onclick={() => (allExpanded ? collapseAll() : expandAll())}
          title={allExpanded ? 'Collapse all' : 'Expand all'}
        >
          {#if allExpanded}
            <ChevronsDownUp class="size-3.5" />
          {:else}
            <ChevronsUpDown class="size-3.5" />
          {/if}
        </button>
        <span>Story</span>
      </div>
      <button
        type="button"
        class="hidden cursor-pointer items-center gap-1 text-left transition-colors hover:text-cork-700 md:flex"
        onclick={togglePrioritySort}
      >
        Priority
        <span class="text-[8px]">{prioritySortDir === 'asc' ? '▼' : '▲'}</span>
      </button>
      <span class="hidden md:block">PIC</span>
      <span class="text-center">Status</span>
    </div>

    {#each localEpics as epic (epic.code)}
      {#if epic.stories.length > 0}
        <div
          class="flex items-center gap-2 border-b border-cork-400/15 bg-cork-400/10 px-3 py-2 md:px-4"
        >
          <div class="flex items-center gap-0.5">
            {#each epic.actors as actorEmoji (actorEmoji)}
              {@const actor = storyMap?.actors.find((a) => a.emoji === actorEmoji)}
              <span class="group relative cursor-default text-sm">
                {actorEmoji}
                {#if actor?.label}
                  <span
                    class="pointer-events-none absolute top-1/2 left-full z-10 ml-1.5 -translate-y-1/2 rounded bg-cork-800 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-cork-50 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
                  >
                    {actor.label}
                  </span>
                {/if}
              </span>
            {/each}
          </div>
          <span class="font-display text-sm font-bold text-cork-700 md:text-base"
            >{epic.code} — {epic.title}</span
          >
        </div>

        {#each epic.stories as story (story.id)}
          {@const hasAC = story.acceptanceCriteria.length > 0}
          {@const isExpanded = expandedStories.has(story.id)}
          {@const allDone = isAllACDone(story)}
          {@const isDone = story.done || allDone}
          {@const kano = KANO[story.kano as keyof typeof KANO]}

          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-400/10 px-3 py-2 transition-colors md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4 md:py-2.5 {hasAC
              ? 'cursor-pointer hover:bg-cork-200/40'
              : ''}"
            role={hasAC ? 'button' : undefined}
            tabindex={hasAC ? 0 : undefined}
            onclick={() => hasAC && toggleStory(story.id)}
            onkeydown={(e) => {
              if (hasAC && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                toggleStory(story.id);
              }
            }}
          >
            <div class="flex min-w-0 items-center gap-1.5 md:gap-2">
              {#if hasAC}
                <ChevronRight
                  class="size-3.5 shrink-0 text-cork-400 transition-transform {isExpanded
                    ? 'rotate-90'
                    : ''}"
                />
              {:else}
                <span class="w-3.5 shrink-0"></span>
              {/if}
              <span class="shrink-0 font-mono text-xs text-cork-400">{story.id}</span>
              <span
                class="truncate text-sm font-medium {isDone
                  ? 'text-cork-400 line-through'
                  : 'text-cork-800'}">{story.title}</span
              >
              {#if story.task}
                <span class="shrink-0 text-[10px] text-cork-400">({story.task})</span>
              {/if}
            </div>

            <div class="hidden items-center gap-1.5 md:flex">
              <span
                class="size-2 shrink-0 rounded-full"
                style="background: {kano?.color ?? '#8a7e6b'};"
              ></span>
              <span class="text-xs font-medium" style="color: {kano?.color ?? '#8a7e6b'};"
                >{kano?.label ?? story.kano}</span
              >
            </div>

            <div
              class="relative hidden items-center md:flex"
              role="presentation"
              onclick={(e) => e.stopPropagation()}
              onkeydown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                class="cursor-pointer rounded-md border border-cork-300/50 bg-cork-200/40 px-2 py-1 text-xs font-medium text-cork-700 transition-colors hover:border-cork-400"
                onclick={() => (picDropdownOpen = picDropdownOpen === story.id ? null : story.id)}
              >
                {story.pic || '—'}
              </button>
              {#if picDropdownOpen === story.id}
                <div
                  class="absolute top-full left-0 z-20 mt-1 min-w-24 overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-lg"
                >
                  {#each allPics as p (p)}
                    <button
                      type="button"
                      class="w-full cursor-pointer px-3 py-1.5 text-left text-xs text-cork-700 transition-colors hover:bg-cork-200/50 {p ===
                      story.pic
                        ? 'bg-cork-200/60 font-medium'
                        : ''}"
                      onclick={() => updatePic(story, p)}
                    >
                      {p}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <div class="flex items-center justify-center">
              {#if isDone}
                <CircleCheck class="size-5 text-cork-500" />
              {:else}
                <Circle class="size-5 text-cork-300" />
              {/if}
            </div>
          </div>

          {#if isExpanded}
            <!-- Mobile-only: show priority + PIC inline -->
            <div
              class="flex items-center gap-3 border-b border-cork-400/8 bg-cork-100/30 px-3 py-1.5 pl-8 md:hidden"
              role="presentation"
              onclick={(e) => e.stopPropagation()}
              onkeydown={(e) => e.stopPropagation()}
            >
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style="color: {kano?.color ?? '#8a7e6b'}; background: {(kano?.color ?? '#8a7e6b') +
                  '15'};"
              >
                <span class="size-1.5 rounded-full" style="background: {kano?.color ?? '#8a7e6b'};"
                ></span>
                {kano?.label ?? story.kano}
              </span>
              <div class="relative">
                <button
                  type="button"
                  class="cursor-pointer rounded-md border border-cork-300/50 bg-cork-200/40 px-2 py-0.5 text-[10px] font-medium text-cork-700 transition-colors hover:border-cork-400"
                  onclick={() => (picDropdownOpen = picDropdownOpen === story.id ? null : story.id)}
                >
                  {story.pic || '— PIC'}
                </button>
                {#if picDropdownOpen === story.id}
                  <div
                    class="absolute top-full left-0 z-20 mt-1 min-w-24 overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-lg"
                  >
                    {#each allPics as p (p)}
                      <button
                        type="button"
                        class="w-full cursor-pointer px-3 py-1.5 text-left text-xs text-cork-700 transition-colors hover:bg-cork-200/50 {p ===
                        story.pic
                          ? 'bg-cork-200/60 font-medium'
                          : ''}"
                        onclick={() => updatePic(story, p)}
                      >
                        {p}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/if}
          {#if isExpanded && hasAC}
            {#each story.acceptanceCriteria as ac, i (i)}
              {@const checked = isACChecked(story, i)}
              <div
                class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-400/8 bg-cork-100/30 px-3 py-1.5 md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4"
              >
                <div class="flex min-w-0 items-center gap-2 pl-5 md:pl-8">
                  <button
                    type="button"
                    class="shrink-0 cursor-pointer"
                    onclick={(e) => {
                      e.stopPropagation();
                      toggleAC(story.id, story, i);
                    }}
                  >
                    {#if checked}
                      <SquareCheck class="size-4 text-green-600" />
                    {:else}
                      <Square class="size-4 text-cork-400" />
                    {/if}
                  </button>
                  <span class="text-xs {checked ? 'text-cork-400 line-through' : 'text-cork-600'}"
                    >{ac}</span
                  >
                </div>
                <div class="hidden md:block"></div>
                <div class="hidden md:block"></div>
                <div class="flex items-center justify-end">
                  {#if checked && getACTime(story, i)}
                    <span class="text-[9px] text-cork-400">{getACTime(story, i)}</span>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        {/each}
      {/if}
    {/each}
  </div>
{/if}
