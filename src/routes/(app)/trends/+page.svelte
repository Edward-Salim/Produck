<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { SvelteMap } from 'svelte/reactivity';
  import {
    RefreshCw,
    LoaderCircle,
    Settings,
    Calendar,
    ExternalLink,
    Rss,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash2
  } from '@lucide/svelte';

  let { data } = $props();

  let sourcesDialogOpen = $state(false);
  let fetching = $state(false);
  let fetchResult = $state<{ fetched: number; errors: { source: string; error: string }[] } | null>(
    null
  );
  let newSourceName = $state('');
  let newSourceUrl = $state('');

  type Article = (typeof data.articles)[number];

  interface DayGroup {
    dateKey: string;
    label: string;
    articles: Article[];
    summary?: string | null;
  }

  let dayGroups: DayGroup[] = $derived.by(() => {
    const groups = new SvelteMap<string, Article[]>();
    for (const article of data.articles) {
      const d = article.publishedAt ? new Date(article.publishedAt) : new Date(article.fetchedAt);
      const key = d.toISOString().slice(0, 10);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(article);
    }

    const summaryMap = new Map(data.summaries.map((s) => [s.date, s.summary]));

    const result: DayGroup[] = [];
    for (const [dateKey, articles] of groups) {
      result.push({
        dateKey,
        label: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        articles,
        summary: summaryMap.get(dateKey)
      });
    }
    return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  });

  async function fetchFeeds() {
    fetching = true;
    fetchResult = null;
    try {
      const res = await fetch('/api/rss/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: data.workspaceId })
      });
      fetchResult = await res.json();
      await invalidateAll();
    } finally {
      fetching = false;
    }
  }

  async function addSource() {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    await fetch('/api/rss/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId: data.workspaceId,
        name: newSourceName.trim(),
        url: newSourceUrl.trim()
      })
    });
    newSourceName = '';
    newSourceUrl = '';
    await invalidateAll();
  }

  async function toggleSource(id: number, currentEnabled: boolean) {
    await fetch('/api/rss/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !currentEnabled })
    });
    await invalidateAll();
  }

  async function deleteSource(id: number) {
    await fetch(`/api/rss/sources?id=${id}`, { method: 'DELETE' });
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Trends - Produck</title>
</svelte:head>

<header class="mb-6">
  <h1 class="font-display text-4xl text-cork-800">Trends</h1>
  <p class="mt-0.5 text-sm text-cork-500">RSS feed digest — product news grouped by day</p>
</header>

<!-- Toolbar -->
<div class="mb-6 flex items-center justify-between">
  <button
    type="button"
    class="flex cursor-pointer items-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800"
    onclick={fetchFeeds}
    disabled={fetching}
  >
    {#if fetching}
      <LoaderCircle class="size-4 animate-spin" />
    {:else}
      <RefreshCw class="size-4" />
    {/if}
    Fetch Now
  </button>

  <button
    type="button"
    class="flex cursor-pointer items-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-600 transition-colors hover:bg-cork-200/50"
    onclick={() => (sourcesDialogOpen = true)}
  >
    <Settings class="size-4" />
    Manage Sources
    <span class="rounded-full bg-cork-200 px-2 py-0.5 text-[10px] font-semibold text-cork-600"
      >{data.sources.length} sources</span
    >
  </button>
</div>

{#if fetchResult}
  <div
    class="mb-4 flex items-center justify-between rounded-lg border border-cork-200 bg-white/80 px-4 py-2.5 text-sm text-cork-700"
  >
    <span
      >Fetched <strong>{fetchResult.fetched}</strong> new articles{#if fetchResult.errors.length > 0},
        <span class="text-red-600">{fetchResult.errors.length} feeds failed</span>{/if}</span
    >
    {#if fetchResult.errors.length > 0}
      <details class="text-xs text-cork-500">
        <summary class="cursor-pointer hover:text-cork-700">Show errors</summary>
        <ul class="mt-1 list-disc space-y-0.5 pl-4">
          {#each fetchResult.errors as err}
            <li><strong>{err.source}</strong>: {err.error}</li>
          {/each}
        </ul>
      </details>
    {/if}
  </div>
{/if}

<!-- Main content — Daily Article Feed -->
{#if dayGroups.length > 0}
  <div class="space-y-5">
    {#each dayGroups as group (group.dateKey)}
      <div class="overflow-hidden rounded-xl border border-cork-200 bg-white/80">
        <!-- Day header -->
        <div
          class="flex items-center justify-between border-b border-cork-200 bg-cork-50 px-5 py-3"
        >
          <div class="flex items-center gap-2">
            <Calendar class="size-4 text-cork-400" />
            <span class="text-sm font-semibold text-cork-700">{group.label}</span>
          </div>
          <span class="text-xs text-cork-400">{group.articles.length} articles</span>
        </div>

        <!-- Summary (if exists for this day) -->
        {#if group.summary}
          <div class="border-b border-cork-100 bg-cork-50/50 px-5 py-3 text-sm text-cork-700">
            <p class="mb-1 text-xs font-medium tracking-wider text-cork-600 uppercase">
              AI Summary
            </p>
            <p>{group.summary}</p>
          </div>
        {/if}

        <!-- Article list -->
        <div class="divide-y divide-cork-100">
          {#each group.articles as article (article.id)}
            <a
              href={article.url}
              target="_blank"
              rel="noopener"
              class="block px-5 py-3 transition-colors hover:bg-cork-50/50"
            >
              <div class="flex items-start gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm leading-snug font-medium text-cork-800">{article.title}</p>
                  {#if article.description}
                    <p class="mt-1 line-clamp-2 text-xs text-cork-500">{article.description}</p>
                  {/if}
                  <div class="mt-1.5 flex items-center gap-2">
                    <span
                      class="rounded bg-cork-100 px-1.5 py-0.5 text-[10px] font-medium text-cork-400"
                      >{article.sourceName}</span
                    >
                    {#if article.author}
                      <span class="text-[10px] text-cork-400">{article.author}</span>
                    {/if}
                  </div>
                </div>
                <ExternalLink class="mt-1 size-3.5 shrink-0 text-cork-300" />
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- Empty state -->
  <div
    class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-cork-300/50 text-center"
    style="height: calc(100vh - 220px)"
  >
    <Rss class="mb-3 size-10 text-cork-300" />
    <p class="mb-1 text-sm font-medium text-cork-600">No articles yet</p>
    <p class="mb-4 text-xs text-cork-400">Add some RSS sources and fetch to get started</p>
  </div>
{/if}

<!-- Manage Sources Dialog -->
<Dialog.Root bind:open={sourcesDialogOpen}>
  <Dialog.Content class="max-w-lg border-cork-300 bg-cork-50">
    <Dialog.Header>
      <Dialog.Title class="text-cork-800">Manage RSS Sources</Dialog.Title>
      <Dialog.Description class="text-cork-500"
        >Add, edit, or remove your RSS feeds</Dialog.Description
      >
    </Dialog.Header>

    <!-- Add new source form -->
    <div class="mb-4 space-y-2 rounded-lg border border-cork-200 bg-white p-3">
      <div class="flex gap-2">
        <input
          bind:value={newSourceName}
          placeholder="Source name"
          class="h-8 flex-1 rounded-md border border-cork-200 bg-cork-50/50 px-3 text-sm text-cork-800 placeholder:text-cork-400 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
        />
        <button
          type="button"
          class="flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-cork-700 px-3 text-xs font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-40"
          onclick={addSource}
          disabled={!newSourceName.trim() || !newSourceUrl.trim()}
        >
          <Plus class="size-3.5" />Add
        </button>
      </div>
      <input
        bind:value={newSourceUrl}
        placeholder="https://example.com/feed.xml"
        class="h-8 w-full rounded-md border border-cork-200 bg-cork-50/50 px-3 font-mono text-xs text-cork-700 placeholder:text-cork-400 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
      />
    </div>

    <!-- Source list -->
    <div class="max-h-72 space-y-2 overflow-y-auto">
      {#each data.sources as source (source.id)}
        <div class="flex items-center gap-3 rounded-lg border border-cork-200 bg-white px-3 py-2">
          <button
            type="button"
            onclick={() => toggleSource(source.id, source.enabled)}
            class="cursor-pointer"
          >
            {#if source.enabled}
              <ToggleRight class="size-5 text-green-600" />
            {:else}
              <ToggleLeft class="size-5 text-cork-300" />
            {/if}
          </button>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-cork-700">{source.name}</p>
            <p class="truncate text-[10px] text-cork-400">{source.url}</p>
          </div>
          <button
            type="button"
            class="cursor-pointer text-cork-300 transition-colors hover:text-red-500"
            onclick={() => deleteSource(source.id)}
          >
            <Trash2 class="size-4" />
          </button>
        </div>
      {/each}
      {#if data.sources.length === 0}
        <p class="py-4 text-center text-sm text-cork-400">No sources added yet</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
