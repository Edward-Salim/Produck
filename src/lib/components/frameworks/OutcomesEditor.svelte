<script lang="ts">
  import type { FrameworkInstance } from './types.js';
  import { Target, ChevronRight, ChevronsDownUp, ChevronsUpDown } from '@lucide/svelte';
  import { progressColor } from '$lib/constants/colors.js';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  type KR = {
    id: string;
    code: string;
    description: string;
    target: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    carriedFrom: string;
    lastUpdated: string;
  };
  type Objective = {
    id: string;
    code: string;
    title: string;
    year: number;
    quarter: number;
    keyResults: KR[];
  };
  type BO = {
    id: string;
    code: string;
    title: string;
    description: string;
    metrics: string;
    year: number;
  };
  type OutcomesDraft = { businessOutcomes: BO[]; objectives: Objective[] };

  let data = $state<OutcomesDraft>({ businessOutcomes: [], objectives: [] });

  $effect(() => {
    try {
      const parsed = JSON.parse(
        instance.values.outcomes ?? '{"businessOutcomes":[],"objectives":[]}'
      );
      data = parsed;
    } catch {
      data = { businessOutcomes: [], objectives: [] };
    }
  });

  function save() {
    onUpdate({ ...instance.values, outcomes: JSON.stringify(data) });
  }

  let selectedOutcomeYear = $state(0);
  let selectedOutcomeQuarter = $state<number | null>(Math.floor(new Date().getMonth() / 3) + 1);
  let expandedObjectives = $state<Set<string>>(new Set());

  let outcomeYears = $derived(
    [
      ...new Set([
        ...data.businessOutcomes.map((bo) => bo.year),
        ...data.objectives.map((o) => o.year)
      ])
    ].sort()
  );

  $effect(() => {
    if (outcomeYears.length === 0) return;
    if (selectedOutcomeYear === 0 || !outcomeYears.includes(selectedOutcomeYear)) {
      const cy = new Date().getFullYear();
      selectedOutcomeYear = outcomeYears.includes(cy) ? cy : outcomeYears[outcomeYears.length - 1];
    }
  });

  let selectedBO = $derived(data.businessOutcomes.find((bo) => bo.year === selectedOutcomeYear));
  let selectedObjectives = $derived(
    data.objectives.filter(
      (o) =>
        o.year === selectedOutcomeYear &&
        (selectedOutcomeQuarter === null || o.quarter === selectedOutcomeQuarter)
    )
  );

  $effect(() => {
    expandedObjectives = new Set(selectedObjectives.map((o) => o.id));
  });

  function krProgress(kr: KR): number {
    if (kr.targetValue === 0) return 0;
    if (kr.unit === 'min' || kr.unit === 'hrs')
      return Math.max(0, Math.min(100, (kr.targetValue / Math.max(kr.currentValue, 0.1)) * 100));
    return Math.max(0, Math.min(100, (kr.currentValue / kr.targetValue) * 100));
  }

  function toggleObjective(id: string) {
    const next = new Set(expandedObjectives);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedObjectives = next;
  }

  function updateKR(objectiveId: string, krId: string, currentValue: number) {
    const objectives = data.objectives.map((o) =>
      o.id === objectiveId
        ? {
            ...o,
            keyResults: o.keyResults.map((kr) =>
              kr.id === krId ? { ...kr, currentValue, lastUpdated: new Date().toISOString() } : kr
            )
          }
        : o
    );
    data = { ...data, objectives };
    save();
  }

  let allExpanded = $derived(
    selectedObjectives.length > 0 && expandedObjectives.size === selectedObjectives.length
  );

  function formatFullDate(v: string) {
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function lines(v: string): string[] {
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
</script>

<div class="rounded-xl border border-cork-300/50 bg-cork-50/50 p-4">
  <div class="mb-4">
    <p class="mt-2 px-2 text-xs text-cork-400">
      Track business outcomes, product objectives, and key results by year and quarter.
    </p>
  </div>

  <div class="mb-4 flex flex-wrap items-center gap-2">
    <div class="flex h-9 overflow-hidden rounded-lg border border-cork-300 bg-cork-50/60">
      {#each outcomeYears as year (year)}
        <button
          type="button"
          class="h-9 cursor-pointer px-3 text-xs font-medium transition-colors {selectedOutcomeYear ===
          year
            ? 'bg-cork-700 text-cork-50'
            : 'text-cork-600 hover:bg-cork-200/60'}"
          onclick={() => (selectedOutcomeYear = year)}>FY{year}</button
        >
      {/each}
    </div>
    <div class="flex h-9 overflow-hidden rounded-lg border border-cork-300 bg-cork-50/60">
      {#each [1, 2, 3, 4] as q (q)}
        <button
          type="button"
          class="h-9 cursor-pointer px-3 text-xs font-medium transition-colors {selectedOutcomeQuarter ===
          q
            ? 'bg-cork-700 text-cork-50'
            : 'text-cork-600 hover:bg-cork-200/60'}"
          onclick={() => (selectedOutcomeQuarter = q)}>Q{q}</button
        >
      {/each}
      <button
        type="button"
        class="h-9 cursor-pointer px-3 text-xs font-medium transition-colors {selectedOutcomeQuarter ===
        null
          ? 'bg-cork-700 text-cork-50'
          : 'text-cork-600 hover:bg-cork-200/60'}"
        onclick={() => (selectedOutcomeQuarter = null)}>Year</button
      >
    </div>
  </div>

  {#if selectedBO}
    <section class="mb-5">
      <h3 class="mb-2 text-xs font-bold tracking-wider text-cork-500 uppercase">
        Business Outcome - FY{selectedOutcomeYear}
      </h3>
      <div class="rounded-xl border border-cork-300/40 bg-cork-100 p-4 md:p-5">
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 shrink-0 rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50"
            >{selectedBO.code}</span
          >
          <div>
            <h4 class="mb-1 font-display text-base text-cork-800 md:text-xl">{selectedBO.title}</h4>
            <p class="mb-3 text-xs text-cork-600 md:text-sm">{selectedBO.description}</p>
            <div class="flex flex-wrap gap-1.5">
              {#each lines(selectedBO.metrics) as m, i (i)}
                <span
                  class="rounded-full bg-cork-50 px-2.5 py-0.5 text-xs font-medium text-cork-700 shadow-sm"
                  >{m}</span
                >
              {/each}
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <section>
    <div class="mb-2 flex items-center gap-2">
      <h3 class="text-xs font-bold tracking-wider text-cork-500 uppercase">
        Product Outcomes{selectedOutcomeQuarter ? ` - Q${selectedOutcomeQuarter}` : ''}
      </h3>
      {#if selectedObjectives.length > 0}
        <button
          type="button"
          class="cursor-pointer text-cork-400 transition-colors hover:text-cork-700"
          onclick={() =>
            allExpanded
              ? (expandedObjectives = new Set())
              : (expandedObjectives = new Set(selectedObjectives.map((o) => o.id)))}
          title={allExpanded ? 'Collapse all' : 'Expand all'}
        >
          {#if allExpanded}<ChevronsDownUp class="size-3.5" />{:else}<ChevronsUpDown
              class="size-3.5"
            />{/if}
        </button>
      {/if}
    </div>

    {#if selectedObjectives.length === 0}
      <div class="rounded-xl border border-cork-300/40 bg-cork-100 px-4 py-12 text-center">
        <Target class="mx-auto mb-2 size-8 text-cork-300" />
        <p class="text-sm text-cork-500">No objectives for this period</p>
      </div>
    {:else}
      <div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-100">
        <div
          class="hidden grid-cols-[1fr_100px_100px_80px_90px] gap-2 border-b border-cork-300/40 bg-cork-200/30 px-4 py-2 text-[10px] font-bold tracking-widest text-cork-400 uppercase md:grid"
        >
          <span>Key Result</span><span>Target</span><span>Current</span><span class="text-center"
            >Progress</span
          ><span class="text-right">Updated</span>
        </div>
        {#each selectedObjectives as obj (obj.id)}
          {@const isExpanded = expandedObjectives.has(obj.id)}
          {@const carriedFrom = obj.keyResults.find((kr) => kr.carriedFrom)?.carriedFrom}
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 border-b border-cork-400/15 bg-cork-400/10 px-3 py-2 transition-colors hover:bg-cork-400/15 md:gap-3 md:px-4 md:py-2.5"
            onclick={() => toggleObjective(obj.id)}
          >
            <ChevronRight
              class="size-3.5 shrink-0 text-cork-500 transition-transform md:size-4 {isExpanded
                ? 'rotate-90'
                : ''}"
            />
            <span
              class="shrink-0 rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50"
              >{obj.code}</span
            >
            <span class="flex-1 text-left font-display text-sm font-bold text-cork-800 md:text-base"
              >{obj.title}</span
            >
            {#if carriedFrom}<span
                class="shrink-0 rounded-full bg-cork-500 px-2 py-0.5 text-[9px] font-bold text-cork-50"
                >From {carriedFrom}</span
              >{/if}
          </button>
          {#if isExpanded}
            {#each obj.keyResults as kr (kr.id)}
              {@const pct = Math.round(krProgress(kr))}
              <div
                class="hidden grid-cols-[1fr_100px_100px_80px_90px] items-center gap-2 border-b border-cork-400/10 px-4 py-2 md:grid"
              >
                <div class="flex items-center gap-2 pl-8">
                  <span class="shrink-0 font-mono text-xs text-cork-400">{kr.code}</span>
                  <span class="text-sm text-cork-700">{kr.description}</span>
                </div>
                <span class="text-xs text-cork-500">{kr.target}</span>
                <div>
                  {#if draftMode === 'edit'}
                    <input
                      type="number"
                      value={kr.currentValue}
                      class="w-20 rounded border border-cork-300 bg-cork-50 px-2 py-0.5 text-xs text-cork-800 outline-none focus:border-cork-500"
                      onblur={(e) => updateKR(obj.id, kr.id, Number(e.currentTarget.value))}
                    />
                  {:else}
                    <span class="text-xs font-medium text-cork-700">{kr.currentValue}{kr.unit}</span
                    >
                  {/if}
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-cork-300/50">
                    <div
                      class="h-full rounded-full transition-all"
                      style="width: {pct}%; background: {progressColor(pct)};"
                    ></div>
                  </div>
                  <span class="w-7 text-right text-[10px] font-medium text-cork-500">{pct}%</span>
                </div>
                <span class="text-right text-[10px] text-cork-400"
                  >{formatFullDate(kr.lastUpdated)}</span
                >
              </div>
              <!-- Mobile row -->
              <div class="border-b border-cork-400/10 px-3 py-2.5 pl-9 md:hidden">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono text-[10px] text-cork-400">{kr.code}</span>
                  <span class="flex-1 text-xs font-medium text-cork-700">{kr.description}</span>
                </div>
                <div class="mt-1.5 flex items-center gap-3">
                  <div class="flex h-1.5 flex-1 overflow-hidden rounded-full bg-cork-300/50">
                    <div
                      class="h-full rounded-full transition-all"
                      style="width: {pct}%; background: {progressColor(pct)};"
                    ></div>
                  </div>
                  <span class="w-8 text-right text-[10px] font-medium text-cork-500">{pct}%</span>
                </div>
                <div class="mt-1 flex items-center gap-3 text-[10px] text-cork-400">
                  <span>Target: {kr.target}</span><span aria-hidden="true">.</span>
                  {#if draftMode === 'edit'}
                    <label class="flex items-center gap-1 font-medium text-cork-600"
                      >Current<input
                        type="number"
                        value={kr.currentValue}
                        class="h-6 w-16 rounded border border-cork-300 bg-cork-50 px-1.5 text-[10px] text-cork-800 outline-none focus:border-cork-500"
                        onblur={(e) => updateKR(obj.id, kr.id, Number(e.currentTarget.value))}
                      />{kr.unit}</label
                    >
                  {:else}
                    <span>Current: {kr.currentValue}{kr.unit}</span>
                  {/if}
                  <span aria-hidden="true">.</span><span>{formatFullDate(kr.lastUpdated)}</span>
                </div>
              </div>
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </section>
</div>
