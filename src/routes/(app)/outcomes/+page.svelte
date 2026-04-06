<script lang="ts">
  import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Target } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import * as Select from '$lib/components/ui/select/index.js';
  import { invalidateAll } from '$app/navigation';
  import type { BORow, ObjectiveRow } from './+page.server.js';
  import { progressColor } from '$lib/constants/colors.js';

  let { data } = $props();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;

  let AVAILABLE_YEARS = $derived(data.availableYears as number[]);
  let selectedYear = $state(0);
  let selectedQuarter = $state<1 | 2 | 3 | 4 | null>(currentQuarter);

  $effect(() => {
    if (selectedYear === 0 && AVAILABLE_YEARS.length > 0) {
      selectedYear = AVAILABLE_YEARS.includes(currentYear)
        ? currentYear
        : AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
    }
  });

  let bo = $derived(
    (data.businessOutcomes as BORow[]).find((b) => b.year === selectedYear) ?? null
  );
  let objectives = $derived.by(() => {
    const all = data.objectives as ObjectiveRow[];
    return all.filter((o) => {
      if (o.year !== selectedYear) return false;
      if (selectedQuarter !== null && o.quarter !== selectedQuarter) return false;
      return true;
    });
  });

  let expandedObjectives = $state<Set<number>>(new Set());
  let editingKR = $state<number | null>(null);

  $effect(() => {
    expandedObjectives = new Set(objectives.map((o) => o.id));
  });

  function toggleObjective(id: number) {
    const next = new Set(expandedObjectives);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedObjectives = next;
  }

  function expandAll() {
    expandedObjectives = new Set(objectives.map((o) => o.id));
  }

  function collapseAll() {
    expandedObjectives = new Set();
  }

  let allExpanded = $derived(
    objectives.length > 0 && expandedObjectives.size === objectives.length
  );

  function krProgress(kr: { targetValue: number; currentValue: number; unit: string }): number {
    if (kr.targetValue === 0) return 0;
    if (kr.unit === 'min' || kr.unit === 'hrs')
      return Math.max(0, Math.min(100, (kr.targetValue / Math.max(kr.currentValue, 0.1)) * 100));
    return Math.max(0, Math.min(100, (kr.currentValue / kr.targetValue) * 100));
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function handleValueKeydown(e: KeyboardEvent, krId: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      editingKR = null;
    }
  }

  async function saveValue(e: Event, krId: number) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      await fetch('/api/key-result', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: krId, currentValue: val })
      });
      invalidateAll();
    }
    editingKR = null;
  }
</script>

<svelte:head><title>Outcomes - Produck</title></svelte:head>

<div>
  <header class="mb-4">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Outcomes</h1>
    <p class="mt-0.5 text-sm text-cork-500">Business & Product Outcomes</p>
  </header>

  <!-- Timeframe selector -->
  <div class="mb-5 flex flex-wrap items-center gap-4">
    <Select.Root
      type="single"
      value={String(selectedYear)}
      onValueChange={(v) => {
        if (v) selectedYear = Number(v);
      }}
    >
      <Select.Trigger
        class="h-8 w-28 border-cork-300 bg-cork-200/50 text-sm font-medium text-cork-700"
      >
        <span>FY{selectedYear}</span>
      </Select.Trigger>
      <Select.Content class="border-cork-300 bg-cork-50" preventScroll={false}>
        {#each [...AVAILABLE_YEARS].reverse() as year (year)}
          <Select.Item value={String(year)} class="text-cork-700 focus:bg-cork-200/50">
            FY{year}
            {year === currentYear ? '•' : ''}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    <div class="h-5 w-px bg-cork-400/30"></div>

    <div class="flex items-center gap-1">
      {#each [1, 2, 3, 4] as q}
        <button
          type="button"
          class="relative h-8 rounded-md px-3 text-sm font-medium transition-colors {selectedQuarter ===
          q
            ? 'bg-cork-700 text-cork-50'
            : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
          onclick={() => (selectedQuarter = q as 1 | 2 | 3 | 4)}
        >
          Q{q}
          {#if q === currentQuarter && selectedYear === currentYear}
            <span
              class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-cork-800 ring-2 ring-cork-100"
            ></span>
          {/if}
        </button>
      {/each}
      <button
        type="button"
        class="h-8 rounded-md px-3 text-sm font-medium transition-colors {selectedQuarter === null
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (selectedQuarter = null)}
      >
        Year
      </button>
    </div>
  </div>

  <!-- Business Outcome (1 per year) -->
  {#if bo}
    <section class="mb-5">
      <h2 class="mb-2 text-xs font-bold tracking-wider text-cork-500 uppercase">
        Business Outcome — FY{selectedYear}
      </h2>
      <div
        class="rounded-xl p-5"
        style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2;
					box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 shrink-0 rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50"
            >{bo.code}</span
          >
          <div>
            <h3 class="mb-1 font-display text-xl text-cork-800">{bo.title}</h3>
            <p class="mb-3 text-sm text-cork-600">{bo.description}</p>
            <div class="flex flex-wrap gap-1.5">
              {#each bo.metrics as metric, i (i)}
                <span
                  class="rounded-full bg-cork-50 px-2.5 py-0.5 text-xs font-medium text-cork-700 shadow-sm"
                  >{metric}</span
                >
              {/each}
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- Product Outcomes / OKRs -->
  <section>
    <div class="mb-2 flex items-center gap-2">
      <h2 class="text-xs font-bold tracking-wider text-cork-500 uppercase">
        Product Outcomes (OKRs){selectedQuarter ? ` — Q${selectedQuarter}` : ''}
      </h2>
      {#if objectives.length > 0}
        <button
          type="button"
          class="cursor-pointer text-cork-400 transition-colors hover:text-cork-700"
          onclick={() => (allExpanded ? collapseAll() : expandAll())}
          title={allExpanded ? 'Collapse all' : 'Expand all'}
        >
          {#if allExpanded}
            <ChevronsDownUp class="size-3.5" />
          {:else}
            <ChevronsUpDown class="size-3.5" />
          {/if}
        </button>
      {/if}
    </div>

    {#if objectives.length === 0}
      <EmptyState
        icon={Target}
        title="No objectives for this period"
        description="Select a different quarter or year"
      />
    {:else}
      <div
        class="overflow-hidden rounded-xl"
        style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ddd4c2;
					box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);"
      >
        <!-- Header -->
        <div
          class="grid grid-cols-[1fr_100px_100px_80px_90px] gap-2 border-b border-cork-600/25 px-4 py-2 text-[10px] font-bold tracking-widest text-cork-500 uppercase"
        >
          <span>Key Result</span>
          <span>Target</span>
          <span>Current</span>
          <span class="text-center">Progress</span>
          <span class="text-right">Updated</span>
        </div>

        {#each objectives as obj (obj.id)}
          {@const isExpanded = expandedObjectives.has(obj.id)}
          {@const carriedFrom = obj.keyResults.find((k) => k.carriedFrom)?.carriedFrom}

          <!-- Objective header -->
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-3 border-b border-cork-600/20 bg-cork-400/10 px-4 py-2.5 transition-colors hover:bg-cork-400/15"
            onclick={() => toggleObjective(obj.id)}
          >
            <ChevronRight
              class="size-4 shrink-0 text-cork-500 transition-transform {isExpanded
                ? 'rotate-90'
                : ''}"
            />
            <span
              class="shrink-0 rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50"
              >{obj.code}</span
            >
            <span class="flex-1 text-left font-display text-base font-bold text-cork-800"
              >{obj.title}</span
            >
            {#if carriedFrom}
              <span
                class="shrink-0 rounded-full bg-cork-500 px-2 py-0.5 text-[9px] font-bold text-cork-50"
                >From {carriedFrom}</span
              >
            {/if}
          </button>

          <!-- Key Results -->
          {#if isExpanded}
            {#each obj.keyResults as kr (kr.id)}
              {@const pct = Math.round(krProgress(kr))}
              <div
                class="grid grid-cols-[1fr_100px_100px_80px_90px] items-center gap-2 border-b border-cork-600/10 px-4 py-2"
              >
                <!-- Description -->
                <div class="flex items-center gap-2 pl-8">
                  <span class="shrink-0 font-mono text-xs text-cork-400">{kr.code}</span>
                  <span class="text-sm text-cork-700">{kr.description}</span>
                </div>

                <!-- Target -->
                <div>
                  <span class="text-xs text-cork-500">{kr.target}</span>
                </div>

                <!-- Current (editable) -->
                <div>
                  {#if editingKR === kr.id}
                    <input
                      type="text"
                      inputmode="decimal"
                      value={kr.currentValue}
                      class="w-20 appearance-none rounded border border-cork-400 bg-cork-50 px-2 py-0.5 text-xs text-cork-800 outline-none"
                      onkeydown={(e) => handleValueKeydown(e, kr.id)}
                      onblur={(e) => saveValue(e, kr.id)}
                      onfocus={(e) => (e.target as HTMLInputElement).select()}
                    />
                  {:else}
                    <button
                      type="button"
                      class="cursor-pointer text-xs font-medium text-cork-700 transition-colors hover:text-cork-900"
                      onclick={() => (editingKR = kr.id)}
                      title="Click to edit"
                    >
                      {kr.currentValue}
                      {kr.unit}
                    </button>
                  {/if}
                </div>

                <!-- Progress bar -->
                <div class="flex items-center gap-1.5">
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-cork-300/50">
                    <div
                      class="h-full rounded-full transition-all"
                      style="width: {pct}%; background: {progressColor(pct)};"
                    ></div>
                  </div>
                  <span class="w-7 text-right text-[10px] font-medium text-cork-500">{pct}%</span>
                </div>

                <!-- Last updated -->
                <div class="text-right">
                  <span class="text-[10px] text-cork-400">{formatDate(kr.lastUpdated)}</span>
                </div>
              </div>
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </section>
</div>
