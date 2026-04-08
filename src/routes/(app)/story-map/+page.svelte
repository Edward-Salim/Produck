<script lang="ts">
  import StoryMapBoard from '$lib/components/story-map/StoryMapBoard.svelte';
  import BacklogView from '$lib/components/story-map/BacklogView.svelte';
  import AssumptionsView from '$lib/components/story-map/AssumptionsView.svelte';
  import {
    MapPinned,
    ClipboardList,
    FlaskConical,
    CircleDot,
    User,
    Target
  } from '@lucide/svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import type { BacklogEpic } from './+page.server.js';

  let { data } = $props();

  let storyMap = $derived(data.storyMap);
  let view = $state<'map' | 'backlog' | 'assumptions'>('map');

  function switchView(v: 'map' | 'backlog' | 'assumptions') {
    if (v === view) return;
    view = v;
    invalidateAll();
  }

  let mainName = $derived(() => {
    const name = storyMap?.product ?? '';
    const match = name.match(/^([^(]+?)(?:\s*\((.+)\))?$/);
    return { primary: match?.[1]?.trim() ?? name, subtitle: match?.[2]?.trim() ?? '' };
  });

  let epics = $derived(data.epics as BacklogEpic[]);
</script>

<svelte:head
  ><title
    >{storyMap
      ? `${view === 'map' ? 'Story Map' : view === 'backlog' ? 'Backlog' : 'Assumptions'}: ${storyMap.product}`
      : 'Story Map'}</title
  ></svelte:head
>

{#if storyMap}
  <div class="flex flex-col" style="min-height: calc(100vh - 140px);">
    <header class="mb-4 md:mb-6">
      {#if page.url.searchParams.has('idea')}
        <a
          href="/ideas"
          class="mb-2 inline-flex items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-600"
        >
          <ArrowLeft class="size-3" />Idea Bank
        </a>
      {/if}
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h1 class="font-display text-2xl text-cork-800 md:text-4xl">{mainName().primary}</h1>
          {#if mainName().subtitle}
            <p class="mt-0.5 text-sm text-cork-500">{mainName().subtitle}</p>
          {:else if data.ideaMeta?.description}
            <p class="mt-0.5 text-xs text-cork-400 md:text-sm">{data.ideaMeta.description}</p>
          {/if}
        </div>

        <!-- View toggle -->
        <div class="flex shrink-0 overflow-hidden rounded border border-cork-300">
          <button
            type="button"
            class="px-2 py-1 transition-colors {view === 'map'
              ? 'bg-cork-700 text-cork-50'
              : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
            onclick={() => switchView('map')}
            title="Story Map"
          >
            <MapPinned class="size-3.5" />
          </button>
          <button
            type="button"
            class="px-2 py-1 transition-colors {view === 'backlog'
              ? 'bg-cork-700 text-cork-50'
              : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
            onclick={() => switchView('backlog')}
            title="Backlog"
          >
            <ClipboardList class="size-3.5" />
          </button>
          <button
            type="button"
            class="px-2 py-1 transition-colors {view === 'assumptions'
              ? 'bg-cork-700 text-cork-50'
              : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
            onclick={() => switchView('assumptions')}
            title="Assumptions"
          >
            <FlaskConical class="size-3.5" />
          </button>
        </div>
      </div>
      {#if data.ideaMeta}
        <div class="mt-2 flex flex-wrap items-center gap-1.5">
          {#if data.ideaMeta.status}
            <span
              class="inline-flex items-center gap-1 rounded-full bg-cork-200/60 px-2 py-0.5 text-[10px] font-medium text-cork-500"
            >
              <CircleDot class="size-2.5" />
              {data.ideaMeta.status
                .split('-')
                .map((/** @type {string} */ w: string) => w[0].toUpperCase() + w.slice(1))
                .join(' ')}
            </span>
          {/if}
          {#if data.ideaMeta.proposer}
            <span
              class="inline-flex items-center gap-1 rounded-full bg-cork-200/60 px-2 py-0.5 text-[10px] font-medium text-cork-500"
            >
              <User class="size-2.5" />
              {data.ideaMeta.proposer.replace(/^@/, '')}
            </span>
          {/if}
          {#if data.ideaMeta.okrCode}
            <span
              class="inline-flex items-center gap-1 rounded-full bg-cork-200/60 px-2 py-0.5 text-[10px] font-medium text-cork-500"
            >
              <Target class="size-2.5" />
              {data.ideaMeta.okrCode}
            </span>
          {/if}
        </div>
      {/if}
    </header>

    {#if view === 'map'}
      {#if storyMap.activities.length === 0}
        <EmptyState
          icon={MapPinned}
          title="Empty story map"
          description="Add activities and stories to build your map"
        />
      {:else}
        <StoryMapBoard data={storyMap} />
      {/if}
    {:else if view === 'backlog'}
      <BacklogView sortedEpics={epics} {storyMap} onInvalidate={() => invalidateAll()} />
    {:else if view === 'assumptions'}
      <AssumptionsView sortedEpics={epics} />
    {/if}
  </div>
{:else}
  <div class="flex flex-col" style="min-height: calc(100vh - 140px);">
    <EmptyState
      icon={MapPinned}
      title="No idea selected"
      description="Open an idea from the Idea Bank to see its story map"
    />
  </div>
{/if}
