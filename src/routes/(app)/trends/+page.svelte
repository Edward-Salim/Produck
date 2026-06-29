<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { pushState, invalidateAll } from '$app/navigation';
  import {
    Rss,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    ImageOff
  } from '@lucide/svelte';

  let { data } = $props();

  let sourcesDialogOpen = $state(false);
  let detailArticle = $state<(typeof data.articles)[number] | null>(null);
  let detailInHistory = $state(false);
  let searchQuery = $state('');
  const DAYS_PER_WEEK = 7;

  // Realtime screening indicator: polls API, colors count while screening,
  // auto-refreshes page data when screening finishes
  let wasScreening = $state(false);

  $effect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/rss/screening-status');
        if (res.ok) {
          const { unscreened } = await res.json();
          const active = unscreened > 0;
          // Toggle amber/pulse on the article count pill (server-rendered HTML)
          for (const el of document.querySelectorAll('[data-screening-count]')) {
            const span = el as HTMLElement;
            if (active) {
              span.classList.add('text-amber-600', 'animate-pulse');
              span.classList.remove('text-emerald-600');
            } else {
              span.classList.add('text-emerald-600');
              span.classList.remove('text-amber-600', 'animate-pulse');
            }
          }
          if (wasScreening && !active) invalidateAll();
          wasScreening = active;
        }
      } catch {
        /* ignore network errors */
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  });

  // Briefing generation poller: while skeleton is showing, check if done
  $effect(() => {
    if (!briefingGenerating) return;
    const date = activeFilter;
    const check = async () => {
      try {
        const res = await fetch(`/api/rss/briefing-status?date=${date}`);
        if (res.ok) {
          const { hasAny } = await res.json();
          if (hasAny) invalidateAll();
        }
      } catch {
        /* ignore */
      }
    };
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  });

  // Compute Monday of any week relative to today
  function weekMonday(offset: number): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  const todayKey = (() => {
    const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 10);
  })();
  const blockDateKeys = $derived(
    new Set(data.dayBlocks.map((b: (typeof data.dayBlocks)[number]) => b.dateKey))
  );

  let weekOffset = $state(0); // 0 = this week, -1 = last week
  let activeFilterOverride = $state<string | null>(null);

  function firstAvailableFilter(): string {
    return data.dayBlocks.some((b) => b.dateKey === todayKey)
      ? todayKey
      : (data.dayBlocks[0]?.dateKey ?? todayKey);
  }

  const activeFilter = $derived(
    activeFilterOverride &&
      (blockDateKeys.has(activeFilterOverride) || activeFilterOverride === todayKey)
      ? activeFilterOverride
      : firstAvailableFilter()
  );

  // Scroll the active date filter button into view (mobile)
  $effect(() => {
    const key = activeFilter;
    queueMicrotask(() => {
      const el = document.querySelector(`[data-date-key="${key}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  function switchWeek(dir: number) {
    weekOffset += dir;
    const mon = weekMonday(weekOffset);
    // Forward: pick the latest available day. Backward: pick the earliest.
    const start = dir > 0 ? DAYS_PER_WEEK - 1 : 0;
    const end = dir > 0 ? -1 : DAYS_PER_WEEK;
    const step = dir > 0 ? -1 : 1;
    for (let i = start; i !== end; i += step) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      if (blockDateKeys.has(key)) {
        activeFilterOverride = key;
        return;
      }
    }
    activeFilterOverride = mon.toISOString().slice(0, 10);
  }

  const weekDates = $derived(
    Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
      const d = new Date(weekMonday(weekOffset));
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        key: `${y}-${m}-${day}`,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      };
    })
  );

  const visibleBlocks = $derived(
    data.dayBlocks.filter((b: (typeof data.dayBlocks)[number]) => {
      const d = new Date(b.dateKey + 'T00:00:00');
      const mon = weekMonday(weekOffset);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return d >= mon && d <= sun;
    })
  );

  const filteredBlocks = $derived(
    visibleBlocks.filter((b: (typeof data.dayBlocks)[number]) => b.dateKey === activeFilter)
  );
  const normalizedSearch = $derived(searchQuery.trim().toLowerCase());
  const searchResults = $derived(
    normalizedSearch
      ? data.articles.filter(
          (article: (typeof data.articles)[number]) =>
            articleDateKey(article) === activeFilter &&
            articleMatchesSearch(article, normalizedSearch)
        )
      : []
  );

  const briefing = $derived(data.briefings[activeFilter] ?? null);
  const briefingGenerating = $derived(
    !briefing && (data.dayBlocks.find((b) => b.dateKey === activeFilter)?.generating ?? false)
  );

  const generatingLabel = $derived.by(() => {
    if (!briefingGenerating) return '';
    const nowWibHour = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCHours();
    if (activeFilter === todayKey) {
      return nowWibHour >= 18 ? 'Evening' : 'Morning';
    }
    return new Date(activeFilter + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  });

  function handleFeedClick(e: MouseEvent | KeyboardEvent) {
    const target = (e.target as HTMLElement).closest('[data-article-id]') as HTMLElement | null;
    if (!target) return;
    const id = Number(target.dataset.articleId);
    const article = data.articles.find((a: (typeof data.articles)[number]) => a.id === id);
    if (article) openDetail(article);
  }

  function articleMatchesSearch(article: (typeof data.articles)[number], query: string) {
    return [
      article.title,
      article.description,
      article.sourceName,
      article.sourceCategory,
      article.sourceRegion
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }

  function articleDateKey(article: (typeof data.articles)[number]) {
    const d = new Date(article.publishedAt ?? article.fetchedAt);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 10);
  }

  function formatArticleTime(iso: string | null) {
    if (!iso) return '';
    const [hh, mm] = iso.slice(11, 16).split(':').map(Number);
    return `${String((hh + 7) % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  // Detail modal: push history state so browser back closes the modal
  function openDetail(article: (typeof data.articles)[number]) {
    detailArticle = article;
    if (!detailInHistory && typeof window !== 'undefined') {
      pushState('', { articleDetail: true });
      detailInHistory = true;
    }
  }

  function closeDetail() {
    if (detailInHistory) {
      history.back();
    } else {
      detailArticle = null;
    }
  }

  function handleDetailPopState() {
    if (detailInHistory && detailArticle) {
      detailArticle = null;
      detailInHistory = false;
    }
  }

  $effect(() => {
    window.addEventListener('popstate', handleDetailPopState);
    return () => window.removeEventListener('popstate', handleDetailPopState);
  });
</script>

<svelte:head>
  <title>Trends - Produck</title>
</svelte:head>

<header class="mb-4 md:mb-6">
  <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Trends</h1>
  <button
    type="button"
    class="mt-0.5 cursor-pointer bg-transparent p-0 text-left text-sm text-cork-500 hover:text-cork-600 hover:underline hover:decoration-dotted hover:underline-offset-2"
    onclick={() => (sourcesDialogOpen = true)}
  >
    Product news from {data.sources.length} sources, curated by AI with daily briefings
  </button>
</header>

<!-- Date filter buttons -->
{#if data.dayBlocks.length > 0}
  <div class="mb-4">
    <p class="mb-1.5 text-[10px] font-semibold tracking-wide text-cork-400 uppercase">
      {weekOffset === 0
        ? 'This week'
        : weekOffset === -1
          ? 'Last week'
          : weekMonday(weekOffset).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </p>
    <div class="relative md:static">
      <div
        class="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0"
      >
        {#each weekDates as d (d.key)}
          {@const hasArticles = blockDateKeys.has(d.key)}
          <button
            type="button"
            disabled={!hasArticles && d.key !== todayKey}
            data-date-key={d.key}
            class="shrink-0 rounded-lg px-2 py-1.5 text-center text-xs font-medium transition-colors md:flex-1 {!hasArticles &&
            d.key !== todayKey
              ? 'border border-cork-200 text-cork-400/40'
              : 'cursor-pointer ' +
                (activeFilter === d.key
                  ? 'bg-cork-700 text-cork-50'
                  : 'border border-cork-300 text-cork-500 hover:bg-cork-100')}"
            onclick={() => (activeFilterOverride = d.key)}
          >
            <span class="font-semibold">{d.dayName}</span>
            <span class="ml-1 opacity-70">{d.month} {d.dateNum}</span>
          </button>
        {/each}
        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-lg px-1.5 py-1.5 text-cork-500 transition-colors hover:bg-cork-100 disabled:cursor-default disabled:opacity-30"
          onclick={() => switchWeek(-1)}
          disabled={weekOffset <= -1}
          title="Last week"
        >
          <ChevronLeft class="size-3.5" />
        </button>
        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-lg px-1.5 py-1.5 text-cork-500 transition-colors hover:bg-cork-100 disabled:cursor-default disabled:opacity-30"
          onclick={() => switchWeek(1)}
          disabled={weekOffset >= 0}
          title="This week"
        >
          <ChevronRight class="size-3.5" />
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Daily Briefing -->
{#if briefing}
  <div class="mb-5 overflow-hidden rounded-xl border border-cork-200 bg-white/80">
    <div class="flex items-start gap-3 px-3 py-3 md:px-5 md:py-4">
      <img
        src="/assets/produck-news.png"
        alt=""
        class="mt-0.5 h-20 w-24 shrink-0 rounded-lg object-cover"
      />
      <div class="min-w-0">
        <p class="text-[10px] font-semibold tracking-wide text-cork-400 uppercase">
          Daily Briefing · {briefing.label}
        </p>
        <p class="mt-1 text-xs leading-relaxed text-cork-700 sm:text-sm">
          {@html briefing.summary}
        </p>
      </div>
    </div>
  </div>
{:else if briefingGenerating}
  <div class="mb-5 overflow-hidden rounded-xl border border-cork-200 bg-white/80">
    <div class="flex items-start gap-3 px-3 py-3 md:px-5 md:py-4">
      <img
        src="/assets/produck-news.png"
        alt=""
        class="mt-0.5 h-20 w-24 shrink-0 rounded-lg object-cover"
      />
      <div class="min-w-0 flex-1 space-y-2">
        <p class="text-[10px] font-semibold tracking-wide text-cork-400 uppercase">
          Daily Briefing · {generatingLabel}
        </p>
        <div class="h-3 w-full animate-pulse rounded bg-cork-200/50"></div>
        <div class="h-3 w-5/6 animate-pulse rounded bg-cork-200/50"></div>
        <div class="h-3 w-2/3 animate-pulse rounded bg-cork-200/50"></div>
      </div>
    </div>
  </div>
{/if}

<div class="mb-4">
  <label for="news-search" class="sr-only">Search news</label>
  <div class="relative">
    <Search
      class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cork-400"
    />
    <input
      id="news-search"
      type="text"
      role="searchbox"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      bind:value={searchQuery}
      placeholder="Search news"
      class="h-10 w-full rounded-lg border border-cork-300 bg-white/80 pr-10 pl-9 text-sm text-cork-800 placeholder:text-cork-400 focus:border-cork-500 focus:ring-2 focus:ring-cork-300/50 focus:outline-none"
    />
    {#if searchQuery}
      <button
        type="button"
        class="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-cork-400 transition-colors hover:bg-cork-100 hover:text-cork-700"
        onclick={() => (searchQuery = '')}
        aria-label="Clear search"
      >
        <X class="size-4" />
      </button>
    {/if}
  </div>
</div>

<!-- Feed -->
{#if normalizedSearch}
  <div class="mb-5 overflow-hidden rounded-xl border border-cork-200 bg-white/80">
    <div
      class="flex items-center justify-between border-b border-cork-200 bg-cork-50 px-3 py-2 md:px-5 md:py-3"
    >
      <span class="text-xs font-semibold text-cork-700 md:text-sm">Search results</span>
      <span class="text-[10px] font-medium text-cork-400">
        {searchResults.length} article{searchResults.length === 1 ? '' : 's'}
      </span>
    </div>

    {#if searchResults.length > 0}
      <div class="divide-y divide-cork-100">
        {#each searchResults as article (article.id)}
          <button
            type="button"
            class="block w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-cork-50/50 md:px-5 md:py-2.5"
            onclick={() => openDetail(article)}
          >
            <div class="flex items-start gap-3">
              {#if article.imageUrl}
                <img
                  src={article.imageUrl}
                  alt=""
                  class="mt-0.5 h-16 w-24 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
              {:else}
                <div
                  class="mt-0.5 flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-cork-100/50"
                >
                  <ImageOff class="size-5 text-cork-300" />
                </div>
              {/if}
              <div class="min-w-0 flex-1">
                <p class="line-clamp-3 text-sm leading-snug font-medium text-cork-800">
                  {article.title}
                </p>
                <div class="mt-1.5 flex items-center gap-1">
                  {#if article.sourceDomain}
                    <img
                      src="https://www.google.com/s2/favicons?domain={article.sourceDomain}&sz=32"
                      alt=""
                      class="size-3.5 rounded-sm"
                      onerror={(e) => (e.target as HTMLImageElement).remove()}
                    />
                  {/if}
                  <span class="text-[10px] font-medium text-cork-400">
                    {article.sourceName} / {article.sourceCategory}
                  </span>
                  {#if article.publishedAt}
                    <span class="text-[10px] text-cork-300"
                      >· {formatArticleTime(article.publishedAt)}</span
                    >
                  {/if}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center gap-1 py-10">
        <p class="text-xs text-cork-400">No news matches "{searchQuery.trim()}"</p>
      </div>
    {/if}
  </div>
{:else if filteredBlocks.length > 0}
  <div
    role="button"
    tabindex="0"
    onclick={handleFeedClick}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFeedClick(e);
      }
    }}
  >
    {#each filteredBlocks as block (block.dateKey)}
      {@html block.html}
    {/each}
  </div>
{:else if data.dayBlocks.length > 0}
  <!-- Empty day container for dates with no articles -->
  <div class="mb-5 overflow-hidden rounded-xl border border-cork-200 bg-white/80">
    <div
      class="flex items-center justify-between border-b border-cork-200 bg-cork-50 px-3 py-2 md:px-5 md:py-3"
    >
      <div class="flex items-center gap-1.5 md:gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3.5 text-cork-400 md:size-4"
          ><path d="M8 2v4" /><path d="M16 2v4" /><rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
          /><path d="M3 10h18" /></svg
        >
        <span class="text-xs font-semibold text-cork-700 md:text-sm">
          {new Date(activeFilter + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>
      <span class="text-[10px] font-medium text-cork-400">0 articles</span>
    </div>
    <div class="flex flex-col items-center justify-center gap-1 py-10">
      <p class="text-xs text-cork-400">
        {activeFilter === todayKey
          ? 'Nothing yet today, check back later'
          : 'No articles for this day'}
      </p>
    </div>
  </div>
{:else}
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
  <Dialog.Content class="max-w-[calc(100%-3rem)] border-cork-300 bg-cork-50 sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title class="text-cork-800">RSS Sources</Dialog.Title>
      <Dialog.Description class="text-cork-500"
        >Ranked by category match accuracy</Dialog.Description
      >
    </Dialog.Header>

    <div class="custom-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
      {#each data.sources as source (source.id)}
        <div class="flex items-center gap-3 rounded-lg border border-cork-200 bg-white px-3 py-2">
          {#if source.domain}
            <img
              src="https://www.google.com/s2/favicons?domain={source.domain}&sz=32"
              alt=""
              class="size-5 shrink-0 rounded-sm"
              onerror={(e) => (e.target as HTMLImageElement).remove()}
            />
          {/if}
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-cork-700">{source.name}</p>
            <p class="truncate text-[10px] text-cork-400">{source.category} / {source.region}</p>
          </div>
          <span
            class="shrink-0 text-[10px] font-semibold {source.accuracy >= 90
              ? 'text-emerald-600'
              : source.accuracy >= 70
                ? 'text-amber-600'
                : 'text-red-500'}">{source.accuracy}%</span
          >
        </div>
      {/each}
      {#if data.sources.length === 0}
        <p class="py-4 text-center text-sm text-cork-400">No sources added yet</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<!-- Article Detail Modal -->
<Dialog.Root
  open={detailArticle != null}
  onOpenChange={(o) => {
    if (!o) closeDetail();
  }}
>
  <Dialog.Content
    class="max-h-[calc(100vh-3rem)] max-w-[calc(100%-2rem)] overflow-y-auto border-cork-300 bg-cork-50 sm:max-w-xl"
  >
    {#if detailArticle}
      <Dialog.Header>
        <Dialog.Title class="break-words text-cork-800">{detailArticle.title}</Dialog.Title>
        <Dialog.Description class="text-cork-500">
          {detailArticle.sourceName}{#if detailArticle.author}
            — {detailArticle.author}{/if}
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-4">
        {#if detailArticle.imageUrl}
          <img
            src={detailArticle.imageUrl}
            alt=""
            class="max-h-64 w-full rounded-lg object-cover"
          />
        {/if}

        {#if detailArticle.description}
          <p class="text-sm leading-relaxed break-words whitespace-pre-line text-cork-700">
            {detailArticle.description}
          </p>
        {/if}

        <a
          href={detailArticle.url}
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-lg bg-cork-700 px-4 py-2 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800"
        >
          <ExternalLink class="size-4" />
          Read full article
        </a>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<style>
  .hide-scrollbar {
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: hsl(33 22% 80%) transparent;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(33 22% 80%);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(33 22% 65%);
  }
</style>
