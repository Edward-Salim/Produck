<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import {
    Briefcase,
    CheckCheck,
    RefreshCw,
    ExternalLink,
    MapPin,
    Globe,
    Building2
  } from '@lucide/svelte';
  import bytedanceLogo from '$lib/assets/company-logos/bytedance.png';
  import seaLogo from '$lib/assets/company-logos/sea.png';
  import grabLogo from '$lib/assets/company-logos/grab.png';
  import dbsLogo from '$lib/assets/company-logos/dbs.png';
  import uobLogo from '$lib/assets/company-logos/uob.png';
  import fundingSocietiesLogo from '$lib/assets/company-logos/funding-societies.png';
  import atomeLogo from '$lib/assets/company-logos/atome.png';
  import ocbcLogo from '$lib/assets/company-logos/ocbc.png';
  import gotoLogo from '$lib/assets/company-logos/goto.png';
  import gdpLabsLogo from '$lib/assets/company-logos/gdp-labs.png';
  import { SG, ID } from 'country-flag-icons/string/3x2';

  let { data } = $props();

  type JobRefreshStatus = {
    running: boolean;
    finishedAt: string | null;
    fetched: number | null;
    total: number | null;
    errors: { source: string; error: string }[];
    message: string;
  };

  let isRefreshing = $state(false);
  let refreshStatusMessage = $state<string | null>(null);
  let refreshWarnings = $state<{ source: string; error: string }[]>([]);
  let sourcesDialogOpen = $state(false);
  let detailJob = $state<any>(null);
  let expFilter = $state<number | null>(null); // null = all
  let mandarinOnly = $state(false);
  let countryFilter = $state<'all' | 'sg' | 'id'>('all');
  let typeFilter = $state<'all' | 'graduate' | 'intern'>('all');
  let newOnly = $state(false);
  let hideIntern = $state(false);
  let showSG = $derived(countryFilter === 'all' || countryFilter === 'sg');
  let showID = $derived(countryFilter === 'all' || countryFilter === 'id');

  let groupedSources = $derived.by(() => {
    const groups: {
      key: string;
      name: string;
      logo: typeof bytedanceLogo;
      urls: { name: string; url: string }[];
      listingCount: number;
    }[] = [];
    const seen: number[] = [];

    // SEA Group — merge sea + sea-sg + monee
    const seaSources = data.sources.filter((s: any) => s.type === 'sea' || s.type === 'sea-sg');
    if (seaSources.length > 0) {
      groups.push({
        key: 'sea',
        name: 'SEA Group',
        logo: seaLogo,
        urls: seaSources.map((s: any) => ({ name: s.name, url: s.url })),
        listingCount: seaSources.reduce((sum: number, s: any) => sum + (s.listingCount ?? 0), 0)
      });
      seaSources.forEach((s: any) => seen.push(s.id));
    }

    // OCBC Group — merge workday (SG) + oracle (ID)
    const ocbcSources = data.sources.filter((s: any) => /ocbc/i.test(s.name));
    if (ocbcSources.length > 0) {
      groups.push({
        key: 'ocbc',
        name: 'OCBC',
        logo: ocbcLogo,
        urls: ocbcSources.map((s: any) => ({ name: s.name, url: s.url })),
        listingCount: ocbcSources.reduce((sum: number, s: any) => sum + (s.listingCount ?? 0), 0)
      });
      ocbcSources.forEach((s: any) => seen.push(s.id));
    }

    // Other sources — each standalone
    for (const s of data.sources) {
      if (seen.includes(s.id)) continue;
      groups.push({
        key: s.name,
        name: s.name,
        logo:
          s.name === 'UOB'
            ? uobLogo
            : s.name === 'OCBC' || s.name === 'OCBC Indonesia'
              ? ocbcLogo
              : s.name === 'Atome'
                ? atomeLogo
                : s.name === 'GoTo'
                  ? gotoLogo
                  : s.name === 'GDP Labs'
                    ? gdpLabsLogo
                    : s.type === 'grab'
                      ? grabLogo
                      : s.type === 'workday'
                        ? dbsLogo
                        : s.type === 'workable'
                          ? fundingSocietiesLogo
                          : bytedanceLogo,
        urls: [{ name: s.name, url: s.url }],
        listingCount: s.listingCount ?? 0
      });
    }
    return groups;
  });

  async function markViewed(jobId: number) {
    try {
      const res = await fetch('/api/jobs/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      if (!res.ok) console.error('markViewed failed:', res.status);
    } catch (err) {
      console.error('markViewed error:', err);
    }
    await invalidateAll();
  }

  let markingAll = $state(false);
  async function markAllViewed() {
    markingAll = true;
    await fetch('/api/jobs/view-all', { method: 'POST' });
    await invalidateAll();
    markingAll = false;
  }

  // Sync detailJob with fresh data after invalidation so the dialog
  // always holds the current object reference (e.g. with up-to-date viewedAt)
  $effect(() => {
    if (!detailJob) return;
    const allJobs = [...data.sgJobs, ...data.idJobs];
    const fresh = allJobs.find((j: any) => j.id === detailJob.id);
    if (fresh && fresh.viewedAt !== detailJob.viewedAt) {
      detailJob = fresh;
    }
  });

  const EXP_LEVELS = [1, 3, 5, 7];

  let filteredSG = $derived(
    (expFilter === null
      ? data.sgJobs
      : data.sgJobs.filter((j: any) => j.experienceYears != null && j.experienceYears >= expFilter!)
    )
      .filter((j: any) => !mandarinOnly || j.requiresChinese)
      .filter((j: any) => typeFilter === 'all' || j.recruitType === typeFilter)
      .filter((j: any) => !newOnly || !j.viewedAt)
      .filter((j: any) => !hideIntern || j.recruitType !== 'intern')
  );
  let filteredID = $derived(
    (expFilter === null
      ? data.idJobs
      : data.idJobs.filter((j: any) => j.experienceYears != null && j.experienceYears >= expFilter!)
    )
      .filter((j: any) => !mandarinOnly || j.requiresChinese)
      .filter((j: any) => typeFilter === 'all' || j.recruitType === typeFilter)
      .filter((j: any) => !newOnly || !j.viewedAt)
      .filter((j: any) => !hideIntern || j.recruitType !== 'intern')
  );

  let refreshError = $state<string | null>(null);
  let refreshPollTimer: ReturnType<typeof setInterval> | null = null;

  function stopRefreshPolling() {
    if (refreshPollTimer) {
      clearInterval(refreshPollTimer);
      refreshPollTimer = null;
    }
  }

  async function readRefreshStatus(): Promise<JobRefreshStatus | null> {
    const res = await fetch('/api/jobs/fetch/status');
    if (!res.ok) return null;
    return res.json();
  }

  async function syncRefreshStatus(reloadOnDone = false) {
    const status = await readRefreshStatus();
    if (!status) return;

    isRefreshing = status.running;
    refreshWarnings = status.errors ?? [];

    if (status.running) {
      refreshStatusMessage = 'Fetching jobs…';
      return;
    }

    stopRefreshPolling();

    if (status.finishedAt && status.fetched !== null) {
      refreshStatusMessage = `Updated ${status.fetched} jobs`;
      if (reloadOnDone) await invalidateAll();
    } else {
      refreshStatusMessage = null;
    }
  }

  function startRefreshPolling() {
    stopRefreshPolling();
    refreshPollTimer = setInterval(() => {
      void syncRefreshStatus(true);
    }, 2000);
  }

  onMount(() => {
    void syncRefreshStatus().then(() => {
      if (isRefreshing) startRefreshPolling();
    });

    return stopRefreshPolling;
  });

  async function handleRefresh() {
    isRefreshing = true;
    refreshError = null;
    refreshWarnings = [];
    refreshStatusMessage = 'Fetching jobs…';
    try {
      const res = await fetch('/api/jobs/fetch', { method: 'POST' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      await res.json();
      startRefreshPolling();
      await syncRefreshStatus();
    } catch (err) {
      stopRefreshPolling();
      isRefreshing = false;
      refreshError = err instanceof Error ? err.message : 'Refresh failed';
      console.error('Refresh error:', err);
    }
  }

  function parseBody(body: string) {
    const lines = body.split('\n');
    const groups: {
      type: 'bullet' | 'number' | 'text';
      marker?: string;
      items: string[];
      isSub: boolean;
    }[] = [];
    let lastParent: 'bullet' | 'number' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const isBullet = /^[-•]/.test(trimmed);
      const isNumber = /^\d+[.)]/.test(trimmed);

      if (isBullet) {
        const isSub = lastParent === 'number';
        const last = groups[groups.length - 1];
        if (last && last.type === 'bullet' && last.isSub === isSub) {
          last.items.push(trimmed.replace(/^[-•]\s*/, ''));
        } else {
          groups.push({ type: 'bullet', items: [trimmed.replace(/^[-•]\s*/, '')], isSub });
        }
        if (!isSub) lastParent = 'bullet';
      } else if (isNumber) {
        const isSub = lastParent === 'bullet';
        groups.push({
          type: 'number',
          marker: trimmed.match(/^\d+[.)]/)?.[0],
          items: [trimmed.replace(/^\d+[.)]\s*/, '')],
          isSub
        });
        lastParent = 'number';
      } else {
        groups.push({ type: 'text', items: [trimmed], isSub: false });
        lastParent = null;
      }
    }
    return groups;
  }

  function svgDataUri(svg: string): string {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function timeAgo(iso: string | null): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<svelte:head>
  <title>PM Job Board - Produck</title>
</svelte:head>

<header class="mb-4 md:mb-6">
  <h1 class="font-display text-xl text-cork-800 md:text-4xl">PM Job Board</h1>
  <button
    type="button"
    class="mt-0.5 cursor-pointer bg-transparent p-0 text-left text-sm text-cork-500 hover:text-cork-600 hover:underline hover:decoration-dotted hover:underline-offset-2"
    onclick={() => (sourcesDialogOpen = true)}
  >
    Product management roles from {groupedSources.length} companies
  </button>
</header>

<div class="mb-4 flex items-center gap-3 md:mb-6">
  <div class="flex flex-wrap items-center gap-3">
    <button
      type="button"
      onclick={markAllViewed}
      disabled={markingAll}
      class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cork-300 bg-white px-4 py-2 text-sm font-medium text-cork-700 shadow-sm transition-colors hover:bg-cork-50 disabled:opacity-60"
    >
      <CheckCheck class="size-4" />
      {markingAll ? 'Marking…' : 'Mark all read'}
    </button>
    <button
      type="button"
      onclick={handleRefresh}
      disabled={isRefreshing}
      class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cork-300 bg-white px-4 py-2 text-sm font-medium text-cork-700 shadow-sm transition-colors hover:bg-cork-50 disabled:opacity-60"
    >
      <RefreshCw class="size-4 {isRefreshing ? 'animate-spin' : ''}" />
      {isRefreshing ? 'Refreshing…' : 'Refresh'}
    </button>
    {#if refreshError}
      <span class="text-xs text-red-500">{refreshError}</span>
    {:else if refreshWarnings.length > 0}
      <span class="text-xs text-amber-600">
        Updated with {refreshWarnings.length} source warning{refreshWarnings.length === 1
          ? ''
          : 's'}
      </span>
    {:else if refreshStatusMessage}
      <span class="text-xs text-cork-400">{refreshStatusMessage}</span>
    {/if}
    {#if data.lastFetched}
      <span class="text-xs text-cork-400">Last fetch: {timeAgo(data.lastFetched)}</span>
    {/if}
  </div>
</div>

<!-- Filter Pills -->
<div class="mb-4 flex flex-wrap items-center gap-1.5">
  <!-- Country filter -->
  <button
    type="button"
    onclick={() => (countryFilter = 'all')}
    class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {countryFilter ===
    'all'
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    All
  </button>
  <button
    type="button"
    onclick={() => (countryFilter = 'id')}
    class="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {countryFilter ===
    'id'
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    <img src={svgDataUri(ID)} alt="" class="inline-block w-3" />
    {data.totalID}
  </button>
  <button
    type="button"
    onclick={() => (countryFilter = 'sg')}
    class="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {countryFilter ===
    'sg'
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    <img src={svgDataUri(SG)} alt="" class="inline-block w-3" />
    {data.totalSG}
  </button>

  <span class="mx-0.5 text-cork-300">·</span>

  <!-- Experience filter -->
  <button
    type="button"
    onclick={() => (expFilter = null)}
    class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {expFilter ===
    null
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    All
  </button>
  {#each EXP_LEVELS as level (level)}
    <button
      type="button"
      onclick={() => (expFilter = level)}
      class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {expFilter ===
      level
        ? 'bg-cork-700 text-cork-50'
        : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
    >
      ≥{level} yrs
    </button>
  {/each}
  <span class="mx-0.5 text-cork-300">·</span>
  <button
    type="button"
    onclick={() => (mandarinOnly = !mandarinOnly)}
    class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {mandarinOnly
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    中文
  </button>
  <span class="mx-0.5 text-cork-300">·</span>
  <button
    type="button"
    onclick={() => (newOnly = !newOnly)}
    class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {newOnly
      ? 'bg-purple-600 text-purple-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    New
  </button>
  <span class="mx-0.5 text-cork-300">·</span>
  <button
    type="button"
    onclick={() => (hideIntern = !hideIntern)}
    class="cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {hideIntern
      ? 'bg-cork-700 text-cork-50'
      : 'border border-cork-200 bg-white text-cork-500 hover:bg-cork-50'}"
  >
    No Intern
  </button>
</div>

{#snippet jobCard(job: any)}
  {@const isNew = !job.viewedAt}
  <button
    type="button"
    onclick={() => {
      detailJob = job;
      if (isNew) markViewed(job.id);
    }}
    class="group block w-full cursor-pointer rounded-xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md {isNew
      ? 'shadow-purple-400/80'
      : ''}"
  >
    <div class="flex items-start gap-3">
      <img
        src={job.sourceName === 'UOB'
          ? uobLogo
          : job.sourceName === 'OCBC' || job.sourceName === 'OCBC Indonesia'
            ? ocbcLogo
            : job.sourceName === 'Funding Societies'
              ? fundingSocietiesLogo
              : job.sourceName === 'Atome'
                ? atomeLogo
                : job.sourceName === 'GoTo'
                  ? gotoLogo
                  : job.sourceName === 'GDP Labs'
                    ? gdpLabsLogo
                    : job.sourceType === 'sea' || job.sourceType === 'sea-sg'
                      ? seaLogo
                      : job.sourceType === 'grab'
                        ? grabLogo
                        : job.sourceType === 'workday'
                          ? dbsLogo
                          : bytedanceLogo}
        alt=""
        class="mt-0.5 h-10 w-10 shrink-0 rounded object-contain"
      />
      <div class="min-w-0 flex-1 space-y-2">
        <h3
          class="text-sm leading-snug font-semibold text-cork-800 transition-colors group-hover:text-amber-600"
        >
          {job.title}
        </h3>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cork-400">
          {#if job.department}
            <span class="flex items-center gap-1">
              <Building2 class="size-3" />{job.department}
            </span>
          {/if}
          {#if job.location}
            <span class="flex items-center gap-1">
              <MapPin class="size-3" />{job.location}
            </span>
          {/if}
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1 sm:shrink-0">
        {#if job.recruitType === 'graduate'}
          <span class="rounded-full bg-cork-100 px-2 py-0.5 text-[10px] font-medium text-cork-600"
            >Grad</span
          >
        {:else if job.recruitType === 'intern'}
          <span
            class="rounded-full px-2 py-0.5 text-[10px] font-medium {isNew
              ? 'bg-purple-100 text-purple-700'
              : 'bg-cork-100 text-cork-600'}">Intern</span
          >
        {/if}
        {#if job.recruitType !== 'intern'}
          <span
            class="rounded-full px-2 py-0.5 text-[10px] font-medium {isNew
              ? 'bg-purple-100 text-purple-700'
              : 'bg-cork-100 text-cork-600'}"
          >
            {job.experienceYears ? `${job.experienceYears}+ yr` : 'Any'}
          </span>
        {/if}
        {#if job.requiresChinese}
          <span class="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700"
            >中文</span
          >
        {/if}
      </div>
    </div>
  </button>
{/snippet}

<!-- Two-column PM Board -->
<section class="mb-8">
  <div class="grid grid-cols-1 gap-4 md:gap-6 {showSG && showID ? 'lg:grid-cols-2' : ''}">
    {#if showID}
      <!-- Indonesia -->
      <div class="rounded-2xl border border-cork-200 bg-white/60 p-4">
        <h2 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-cork-700">
          <img src={svgDataUri(ID)} alt="" class="inline-block w-4" /> Indonesia
          <span class="font-normal text-cork-400">({filteredID.length})</span>
        </h2>
        {#if filteredID.length === 0}
          <div class="flex flex-col items-center gap-2 rounded-xl py-12">
            <Briefcase class="size-8 text-cork-300" />
            <p class="text-xs text-cork-400">No roles found</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each filteredID as job (job.id)}
              {@render jobCard(job)}
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if showSG}
      <!-- Singapore -->
      <div class="rounded-2xl border border-cork-200 bg-white/60 p-4">
        <h2 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-cork-700">
          <img src={svgDataUri(SG)} alt="" class="inline-block w-4" /> Singapore
          <span class="font-normal text-cork-400">({filteredSG.length})</span>
        </h2>
        {#if filteredSG.length === 0}
          <div class="flex flex-col items-center gap-2 rounded-xl py-12">
            <Briefcase class="size-8 text-cork-300" />
            <p class="text-xs text-cork-400">No roles found</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each filteredSG as job (job.id)}
              {@render jobCard(job)}
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</section>

<!-- Job Detail Modal -->
<Dialog.Root
  open={detailJob != null}
  onOpenChange={(o) => {
    if (!o) detailJob = null;
  }}
>
  <Dialog.Content
    class="max-h-[calc(100vh-4rem)] max-w-[calc(100%-2rem)] overflow-y-auto border-cork-300 bg-cork-50 sm:max-w-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cork-300 [&::-webkit-scrollbar-track]:bg-transparent"
  >
    {#if detailJob}
      <Dialog.Header>
        <Dialog.Title class="text-cork-800">{detailJob.title}</Dialog.Title>
        <Dialog.Description class="text-cork-500">
          {detailJob.sourceName} · {detailJob.department} · {detailJob.location}
          {#if detailJob.experienceYears}
            · {detailJob.experienceYears}+ years experience{/if}
        </Dialog.Description>
      </Dialog.Header>

      <div class="space-y-5">
        {#if detailJob.description}
          {#each detailJob.description
            .split(/^### /m)
            .filter(Boolean) as section, sectionIndex (`${sectionIndex}-${section}`)}
            {@const newline = section.indexOf('\n')}
            {@const heading = newline > 0 ? section.slice(0, newline) : section}
            {@const body = newline > 0 ? section.slice(newline + 1).trim() : ''}
            <div>
              <h3 class="mb-2 text-sm font-bold text-cork-800">{heading}</h3>
              <div class="text-xs leading-relaxed text-cork-600">
                {#each parseBody(body) as group, gi (`${group.type}-${gi}`)}
                  {#if group.type === 'bullet'}
                    <div class="mb-2 space-y-0.5">
                      {#each group.items as item, itemIndex (`${item}-${itemIndex}`)}
                        <p class="flex gap-2 {group.isSub ? 'pl-6' : ''}">
                          <span class="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-cork-400"
                          ></span>
                          <span>{item}</span>
                        </p>
                      {/each}
                    </div>
                  {:else if group.type === 'number'}
                    <p class="flex gap-2 {group.isSub ? 'pl-6' : ''}">
                      <span class="shrink-0 font-medium text-cork-500">{group.marker}</span>
                      <span>{group.items[0]}</span>
                    </p>
                  {:else}
                    <p class={gi > 0 ? 'pt-2' : ''}>{group.items[0]}</p>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        {/if}

        <div class="flex flex-col gap-2">
          <a
            href={detailJob.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-400"
          >
            View on {detailJob.sourceName}
            <ExternalLink class="size-3.5" />
          </a>
          <span class="text-[10px] break-all text-cork-400 select-all">{detailJob.url}</span>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Sources Dialog (read-only) -->
<Dialog.Root bind:open={sourcesDialogOpen}>
  <Dialog.Content
    class="max-w-[calc(100%-3rem)] border-cork-300 bg-cork-50 sm:max-w-lg [&_[data-slot=button]]:cursor-pointer"
    onOpenAutoFocus={(e) => e.preventDefault()}
  >
    <Dialog.Header>
      <Dialog.Title class="text-cork-800">Career Pages</Dialog.Title>
      <Dialog.Description class="text-cork-500">
        {groupedSources.length} companies tracked for product management roles
      </Dialog.Description>
    </Dialog.Header>

    <div class="max-h-72 space-y-1.5 overflow-y-auto pr-1">
      {#each groupedSources as group (group.key)}
        <div
          class="flex items-center gap-3 rounded-lg border border-cork-200 bg-white/80 px-3 py-2.5"
        >
          <img src={group.logo} alt="" class="h-7 w-7 shrink-0 rounded object-contain" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-cork-800">{group.name}</p>
            {#each group.urls as link (link.url)}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-0.5 flex items-center gap-1 text-[10px] text-cork-400 hover:text-cork-600 hover:underline"
              >
                <Globe class="size-2.5 shrink-0" />
                <span class="truncate"
                  >{link.name === group.name ? link.url : link.name + ' · ' + link.url}</span
                >
              </a>
            {/each}
          </div>
          <span class="shrink-0 text-[10px] font-medium text-cork-400">
            {group.listingCount} roles
          </span>
        </div>
      {/each}

      {#if groupedSources.length === 0}
        <p class="py-8 text-center text-xs text-cork-400">No career pages configured.</p>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
