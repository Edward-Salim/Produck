<script lang="ts">
  import { LayoutGrid, Columns3, Bookmark } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import { invalidateAll } from '$app/navigation';
  import {
    COMPANIES,
    ALL_FINTECH_CATEGORIES,
    ALL_REGIONS,
    MY_PROJECT,
    type Company,
    type FintechCategory,
    type Region
  } from './landscape-data.js';
  import { STAR_COLOR } from '$lib/constants/colors.js';

  let { data } = $props();

  // ── Views & filters ──
  let view = $state<'landscape' | 'compare'>('landscape');
  let selectedCategory = $state<FintechCategory | 'all'>('all');
  let selectedRegion = $state<Region | 'all'>('all');

  // ── Picks ──
  let pickSet = $derived(new Set(data.picks.map((p: { companyId: string }) => p.companyId)));

  function isPicked(companyId: string): boolean {
    return pickSet.has(companyId);
  }

  async function togglePick(companyId: string) {
    await fetch('/api/fintech-pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId })
    });
    invalidateAll();
  }

  // ── Filtered & grouped data ──
  let filteredCompanies = $derived(
    COMPANIES.filter(
      (c) =>
        (selectedCategory === 'all' || c.category === selectedCategory) &&
        (selectedRegion === 'all' || c.region === selectedRegion)
    )
  );

  let groupedCompanies = $derived.by(() => {
    const groups: { category: FintechCategory; companies: Company[] }[] = [];
    for (const cat of ALL_FINTECH_CATEGORIES) {
      if (selectedCategory !== 'all' && selectedCategory !== cat) continue;
      const companies = filteredCompanies.filter((c) => c.category === cat);
      if (companies.length > 0) groups.push({ category: cat, companies });
    }
    return groups;
  });

  let pickedCompanies = $derived(COMPANIES.filter((c) => isPicked(c.id)));
</script>

<svelte:head>
  <title>Fintech Landscape | Produck</title>
</svelte:head>

<div class="flex flex-col" style="min-height: calc(100vh - 140px);">
  <!-- Header -->
  <header class="mb-4">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Fintech Landscape</h1>
    <p class="mt-0.5 text-sm text-cork-500">
      {filteredCompanies.length} companies{selectedRegion !== 'all'
        ? ` in ${selectedRegion}`
        : ''}{selectedCategory !== 'all' ? ` · ${selectedCategory}` : ''}
    </p>
  </header>

  <!-- Controls bar -->
  <div class="mb-5 flex items-center gap-3">
    <!-- Region pills -->
    <div class="flex-1 overflow-x-auto [scrollbar-width:none]">
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="shrink-0 rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors {selectedRegion ===
          'all'
            ? 'bg-cork-700 text-cork-50'
            : 'bg-cork-200/50 text-cork-500 hover:bg-cork-300/50'}"
          onclick={() => (selectedRegion = 'all')}
        >
          All Regions
        </button>
        {#each ALL_REGIONS as region (region)}
          <button
            type="button"
            class="shrink-0 rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors {selectedRegion ===
            region
              ? 'bg-cork-700 text-cork-50'
              : 'bg-cork-200/50 text-cork-500 hover:bg-cork-300/50'}"
            onclick={() => (selectedRegion = region)}
          >
            {region}
          </button>
        {/each}
      </div>
    </div>

    <!-- Category dropdown -->
    <select
      class="h-7 shrink-0 cursor-pointer rounded border border-cork-300 bg-cork-200/50 px-2 text-xs text-cork-700 outline-none"
      value={selectedCategory}
      onchange={(e) =>
        (selectedCategory = (e.target as HTMLSelectElement).value as FintechCategory | 'all')}
    >
      <option value="all">All Categories</option>
      {#each ALL_FINTECH_CATEGORIES as cat (cat)}
        <option value={cat}>{cat}</option>
      {/each}
    </select>

    <!-- View toggle -->
    <div class="flex shrink-0 overflow-hidden rounded border border-cork-300">
      <button
        type="button"
        class="px-2 py-1 transition-colors {view === 'landscape'
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (view = 'landscape')}
        title="Landscape view"
      >
        <LayoutGrid class="size-3.5" />
      </button>
      <button
        type="button"
        class="px-2 py-1 transition-colors {view === 'compare'
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (view = 'compare')}
        title="Compare view"
      >
        <Columns3 class="size-3.5" />
      </button>
    </div>
  </div>

  <!-- Landscape View -->
  {#if view === 'landscape'}
    {#if groupedCompanies.length === 0}
      <EmptyState
        icon={LayoutGrid}
        title="No companies found"
        description="Try changing the region or category filter"
      />
    {:else}
      <div class="space-y-6">
        {#each groupedCompanies as group (group.category)}
          <section>
            <!-- Category header -->
            <div class="mb-3 flex items-center gap-2">
              <span class="text-sm font-bold text-cork-700">{group.category}</span>
              <span class="text-[10px] text-cork-400">{group.companies.length}</span>
            </div>

            <!-- Company grid -->
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {#each group.companies as company (company.id)}
                {@const picked = isPicked(company.id)}
                <button
                  type="button"
                  class="relative cursor-pointer rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
                  style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.1);"
                  onclick={() => togglePick(company.id)}
                >
                  <!-- Bookmark icon -->
                  <span class="absolute top-2 right-2">
                    <Bookmark
                      class="size-4 {picked
                        ? 'text-cork-700'
                        : 'text-cork-300 hover:text-cork-500'}"
                      fill={picked ? 'currentColor' : 'none'}
                    />
                  </span>

                  <!-- Logo -->
                  <div class="flex justify-center">
                    <img
                      src={company.logo}
                      alt={company.name}
                      class="size-10 rounded-lg bg-white object-contain p-1"
                    />
                  </div>

                  <!-- Name -->
                  <p class="mt-1.5 truncate text-center text-[11px] font-medium text-cork-800">
                    {company.name}
                  </p>

                  <!-- Focus -->
                  <p class="truncate text-center text-[9px] text-cork-500">{company.focus}</p>
                </button>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    {/if}

    <!-- Compare View (Competitive Analysis Framework) -->
  {:else if pickedCompanies.length === 0}
    <EmptyState
      icon={Columns3}
      title="No companies to compare"
      description="Bookmark companies from the landscape view to start comparing"
    >
      <button
        type="button"
        class="cursor-pointer rounded bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50 transition-colors hover:bg-cork-800"
        onclick={() => (view = 'landscape')}
      >
        Browse Landscape
      </button>
    </EmptyState>
  {:else}
    {@const allCols = [MY_PROJECT, ...pickedCompanies]}
    {@const ROWS = [
      { key: 'focus', label: 'Product / Service' },
      { key: 'marketShare', label: 'Market Share' },
      { key: 'growth', label: 'Growth' },
      { key: 'targetAudience', label: 'Target Audience' },
      { key: 'priceStructure', label: 'Price Structure' },
      { key: 'marketingStrategies', label: 'Marketing Strategies' },
      { key: 'customerSatisfaction', label: 'Customer Satisfaction', isStars: true },
      { key: 'strengths', label: 'Strengths' },
      { key: 'weaknesses', label: 'Weaknesses' },
      { key: 'keyAdvantage', label: 'Key Advantage' }
    ]}

    <div
      class="overflow-x-auto rounded-xl [scrollbar-color:rgba(92,75,58,0.2)_transparent] [scrollbar-width:thin]"
      style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2;
					box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);
					min-height: calc(100vh - 200px);"
    >
      <div>
        <!-- Header row: company names + logos -->
        <div
          class="grid border-b border-cork-600/20"
          style="grid-template-columns: 150px repeat({allCols.length}, 1fr);"
        >
          <div></div>
          {#each allCols as company, i (company.id)}
            <div
              class="border-l border-cork-600/15 px-3 py-4 text-center {i === 0
                ? 'bg-cork-500/15'
                : ''}"
            >
              <div class="mb-2 flex justify-center">
                {#if company.logo}
                  <img
                    src={company.logo}
                    alt={company.name}
                    class="size-10 rounded-lg bg-white object-contain p-1"
                  />
                {:else}
                  <div
                    class="flex size-10 items-center justify-center rounded-lg bg-cork-700 text-lg font-bold text-cork-50"
                  >
                    {company.name.charAt(0)}
                  </div>
                {/if}
              </div>
              <p class="text-sm font-bold text-cork-800">{company.name}</p>
              {#if i === 0}
                <p class="mt-0.5 text-[9px] text-cork-500">Your Project</p>
              {:else}
                <button
                  type="button"
                  class="mt-0.5 cursor-pointer text-[9px] text-cork-400 hover:text-cork-600"
                  onclick={() => togglePick(company.id)}>Remove</button
                >
              {/if}
            </div>
          {/each}
        </div>

        <!-- Attribute rows -->
        {#each ROWS as row, ri (row.key)}
          <div
            class="grid border-b border-cork-600/10 {ri % 2 === 0 ? '' : 'bg-cork-400/5'}"
            style="grid-template-columns: 150px repeat({allCols.length}, 1fr);"
          >
            <div class="flex items-center px-4 py-3">
              <span class="text-xs font-bold text-cork-700">{row.label}</span>
            </div>
            {#each allCols as company, i (company.id)}
              {@const val = (company as any)[row.key]}
              <div
                class="flex items-center justify-center border-l border-cork-600/10 px-3 py-3 {i ===
                0
                  ? 'bg-cork-500/15'
                  : ''}"
              >
                {#if (row as any).isStars}
                  <span class="text-sm tracking-wider"
                    >{#each Array(5) as _, si}{#if si < (val ?? 0)}<span
                          style="color: {STAR_COLOR};">&#x2605;</span
                        >{:else}<span class="text-cork-300">&#x2605;</span>{/if}{/each}</span
                  >
                {:else}
                  <span class="text-center text-xs text-cork-700 {i === 0 ? 'font-medium' : ''}"
                    >{val}</span
                  >
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
