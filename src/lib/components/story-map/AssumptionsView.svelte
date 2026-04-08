<script lang="ts">
  import {
    FlaskConical,
    Heart,
    Wrench,
    MousePointerClick,
    BriefcaseBusiness
  } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import type { BacklogEpic } from '../../../routes/(app)/story-map/+page.server.js';
  import { ASSUMPTION_STATUS, RISK_META } from '$lib/constants/colors.js';

  let { sortedEpics }: { sortedEpics: BacklogEpic[] } = $props();

  interface StaticAssumption {
    id: string;
    label?: string;
    storyId: string;
    storyTitle: string;
    epicCode: string;
    type: 'desirability' | 'feasibility' | 'usability' | 'viability';
    assumption: string;
    rationale: string;
    testMethod: string;
    successCriteria: string;
    actualResults: string;
    status: 'untested' | 'validated' | 'revalidate' | 'invalidated';
    lastTested: string | null;
    importance: number;
    evidence: number;
  }

  const STATUS_COLORS = ASSUMPTION_STATUS;

  let selectedAssumption = $state<StaticAssumption | null>(null);
  let hoveredDot = $state<string | null>(null);
  let assumptionSearch = $state('');

  const TYPE_ORDER: Record<string, number> = {
    desirability: 0,
    feasibility: 1,
    usability: 2,
    viability: 3
  };
  const STATUS_ORDER: Record<string, number> = {
    invalidated: 0,
    revalidate: 1,
    untested: 2,
    validated: 3
  };

  let allAssumptions = $derived.by(() => {
    const result: StaticAssumption[] = [];
    for (const epic of sortedEpics) {
      for (const story of epic.stories) {
        if (!story.assumptions || story.assumptions.length === 0) continue;
        for (const a of story.assumptions) {
          result.push({
            ...a,
            storyId: story.id,
            storyTitle: story.title,
            epicCode: epic.code,
            importance: (a as any).importance ?? 5,
            evidence: (a as any).evidence ?? 1
          });
        }
      }
    }
    result.sort((a, b) => {
      const typeCmp = (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
      if (typeCmp !== 0) return typeCmp;
      return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    });
    const typeIndex: Record<string, number> = {};
    for (const a of result) {
      typeIndex[a.type] = (typeIndex[a.type] ?? 0) + 1;
      const prefix = RISK_META[a.type]?.prefix ?? '?';
      a.label = `${prefix}${typeIndex[a.type]}-${a.storyId}`;
    }
    return result;
  });

  let filteredAssumptions = $derived.by(() => {
    if (!assumptionSearch.trim()) return allAssumptions;
    const q = assumptionSearch.toLowerCase();
    return allAssumptions.filter(
      (a) =>
        (a.label ?? a.id).toLowerCase().includes(q) ||
        a.assumption.toLowerCase().includes(q) ||
        a.storyTitle.toLowerCase().includes(q) ||
        a.type.includes(q)
    );
  });

  function selectAssumption(a: StaticAssumption) {
    selectedAssumption = a;
    requestAnimationFrame(() => {
      const el = document.getElementById(`assumption-${a.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
</script>

{#if allAssumptions.length === 0}
  <EmptyState
    icon={FlaskConical}
    title="No assumptions to test"
    description="Add stories to the map first, then test assumptions here"
  />
{:else}
  <!-- Assumption Testing -->
  <div class="flex flex-col gap-3 md:flex-row" style="min-height: calc(100vh - 240px);">
    <!-- Mobile: horizontal assumption pills -->
    <div class="shrink-0 md:hidden">
      <div class="mb-1 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          bind:value={assumptionSearch}
          class="flex-1 rounded border border-cork-300/50 bg-cork-100 px-2 py-1 text-xs text-cork-800 outline-none placeholder:text-cork-400"
        />
      </div>
      <div class="flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        {#each filteredAssumptions as a (a.id)}
          {@const sc = STATUS_COLORS[a.status]}
          <button
            type="button"
            class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors {selectedAssumption?.id === a.id
              ? 'border-cork-500 bg-cork-200/60 text-cork-800'
              : 'border-cork-300/40 text-cork-600 hover:bg-cork-200/30'}"
            onclick={() => (selectedAssumption = selectedAssumption?.id === a.id ? null : a)}
          >
            <span class="size-2 shrink-0 rounded-full" style="background: {sc.dot};"></span>
            {a.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Desktop: sidebar assumption list -->
    <div
      class="hidden w-48 shrink-0 flex-col rounded-xl border border-cork-300/40 bg-cork-100 md:flex"
    >
      <div class="px-2 pt-2 pb-1">
        <input
          type="text"
          placeholder="Search..."
          bind:value={assumptionSearch}
          class="w-full rounded border border-cork-300/50 bg-white/50 px-2 py-1 text-xs text-cork-800 outline-none placeholder:text-cork-400"
        />
      </div>

      <div class="thin-scroll flex-1 overflow-y-auto p-2 pt-0">
        {#each sortedEpics as epic (epic.code)}
          {#if epic.stories.length > 0}
            <p class="mt-2 mb-1 font-display text-sm font-bold text-cork-700 first:mt-0">
              {epic.code} — {epic.title}
            </p>

            {#each epic.stories as story (story.id)}
              {@const storyAssumptions = filteredAssumptions.filter((a) => a.storyId === story.id)}
              <div class="mb-2">
                <p class="mb-0.5 font-mono text-[10px] text-cork-400">{story.id} — {story.title}</p>
                <div class="space-y-0.5 pl-2">
                  {#each storyAssumptions as a (a.id)}
                    {@const sc = STATUS_COLORS[a.status]}
                    <button
                      type="button"
                      id="assumption-{a.id}"
                      class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-colors {selectedAssumption?.id ===
                      a.id
                        ? 'bg-cork-200/60'
                        : 'hover:bg-cork-200/30'}"
                      onclick={() =>
                        (selectedAssumption = selectedAssumption?.id === a.id ? null : a)}
                    >
                      <span class="size-4 shrink-0 text-cork-500">
                        {#if a.type === 'desirability'}<Heart class="size-3.5" />
                        {:else if a.type === 'feasibility'}<Wrench class="size-3.5" />
                        {:else if a.type === 'usability'}<MousePointerClick class="size-3.5" />
                        {:else}<BriefcaseBusiness class="size-3.5" />
                        {/if}
                      </span>
                      <span class="flex-1 truncate text-xs text-cork-700">{a.label}</span>
                      <span class="size-2 shrink-0 rounded-full" style="background: {sc.dot};"
                      ></span>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          {/if}
        {/each}
      </div>
    </div>

    <!-- Detail card or priority quadrant -->
    <div class="thin-scroll flex-1 overflow-y-auto">
      {#if selectedAssumption}
        {@const a = selectedAssumption}
        {@const sc = STATUS_COLORS[a.status]}

        <div
          class="rounded-xl border border-cork-300/40 bg-cork-100 p-4 md:p-5"
        >
          <!-- Header -->
          <div class="mb-1 flex items-center justify-between">
            <div class="flex items-center gap-2 text-cork-600">
              {#if a.type === 'desirability'}<Heart class="size-4" />
              {:else if a.type === 'feasibility'}<Wrench class="size-4" />
              {:else if a.type === 'usability'}<MousePointerClick class="size-4" />
              {:else}<BriefcaseBusiness class="size-4" />
              {/if}
              <span class="text-xs font-bold tracking-wider uppercase"
                >{RISK_META[a.type]?.label ?? a.type}</span
              >
              <span class="font-mono text-xs text-cork-400">· {a.storyId}</span>
            </div>
            <div
              class="flex flex-col items-center rounded px-2 py-0.5"
              style="background: {sc.bg}; color: {sc.text};"
            >
              <span class="text-xs font-medium">{STATUS_COLORS[a.status]?.label ?? a.status}</span>
              {#if a.lastTested}
                <span class="text-[8px] opacity-70">{a.lastTested}</span>
              {/if}
            </div>
          </div>
          <div class="mt-1 mb-4 flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-cork-400">Importance:</span>
              <span class="text-xs font-bold text-cork-700">{a.importance}/10</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-cork-400">Evidence:</span>
              <span class="text-xs font-bold text-cork-700">{a.evidence}/10</span>
            </div>
          </div>

          <!-- Card fields -->
          <div class="space-y-4">
            <div>
              <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                Assumption
              </p>
              <p class="text-sm text-cork-800">{a.assumption}</p>
            </div>

            <div class="border-t border-cork-400/20 pt-3">
              <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                Rationale
              </p>
              <p class="text-sm text-cork-800">{a.rationale}</p>
            </div>

            <div class="border-t border-cork-400/20 pt-3">
              <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                Test Method
              </p>
              <p class="text-sm text-cork-800">{a.testMethod}</p>
            </div>

            <div class="border-t border-cork-400/20 pt-3">
              <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                Success Criteria
              </p>
              <p class="text-sm text-cork-800">{a.successCriteria}</p>
            </div>

            <div class="border-t border-cork-400/20 pt-3">
              <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                Actual Results
              </p>
              {#if a.actualResults}
                <p class="text-sm text-cork-800">{a.actualResults}</p>
              {:else}
                <p class="text-sm text-cork-400 italic">No results yet</p>
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <!-- Prioritization Quadrant -->
        <div
          class="flex flex-col rounded-xl border border-cork-300/40 bg-cork-100 p-3 md:p-4"
        >
          <div class="mb-2 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
            <p class="text-xs font-bold tracking-wider text-cork-500 uppercase">
              Assumption Priority Map
            </p>
            <div class="flex flex-wrap items-center gap-2 md:gap-3 md:rounded md:border md:border-cork-300/40 md:px-3 md:py-1">
              {#each Object.entries(STATUS_COLORS) as [key, sc] (key)}
                <div class="flex items-center gap-1">
                  <span class="size-2 rounded-full" style="background: {sc.dot};"></span>
                  <span class="text-[9px] text-cork-500">{sc.label}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="relative aspect-square w-full max-w-150">
            <!-- Y-axis label (top of Y axis) -->
            <span class="absolute top-0 left-0 translate-x-1 text-[8px] font-medium text-cork-400"
              >Evidence</span
            >
            <!-- X-axis label (end of X axis) -->
            <span class="absolute right-0 -bottom-4 text-[8px] font-medium text-cork-400"
              >Importance</span
            >

            <!-- Axes, gridlines + ticks -->
            <svg
              class="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Faint gridlines -->
              {#each Array(10) as _, i}
                {@const gx = 5 + ((i + 1) / 10) * 88}
                {@const gy = 95 - ((i + 1) / 10) * 88}
                <line x1={gx} y1="7" x2={gx} y2="95" stroke="#b0a48e" stroke-width="0.08" />
                <line x1="5" y1={gy} x2="93" y2={gy} stroke="#b0a48e" stroke-width="0.08" />
              {/each}
              <!-- X axis -->
              <line x1="5" y1="95" x2="95" y2="95" stroke="#b0a48e" stroke-width="0.3" />
              <!-- Y axis -->
              <line x1="5" y1="5" x2="5" y2="95" stroke="#b0a48e" stroke-width="0.3" />
              <!-- X ticks -->
              {#each Array(10) as _, i}
                {@const tx = 5 + ((i + 1) / 10) * 88}
                <line x1={tx} y1="95" x2={tx} y2="93.5" stroke="#b0a48e" stroke-width="0.2" />
                <text x={tx} y="98.5" text-anchor="middle" fill="#b0a48e" font-size="2.2"
                  >{i + 1}</text
                >
              {/each}
              <!-- Y ticks -->
              {#each Array(10) as _, i}
                {@const ty = 95 - ((i + 1) / 10) * 88}
                <line x1="5" y1={ty} x2="6.5" y2={ty} stroke="#b0a48e" stroke-width="0.2" />
                <text x="3.5" y={ty + 0.7} text-anchor="end" fill="#b0a48e" font-size="2.2"
                  >{i + 1}</text
                >
              {/each}
            </svg>

            <!-- Assumption dots -->
            <svg
              class="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {#each allAssumptions as a, idx (a.id)}
                {@const hash = (a.id.charCodeAt(0) * 7 + a.id.charCodeAt(1) * 13 + idx * 3) % 100}
                {@const jitterX = ((hash % 10) - 5) * 0.5}
                {@const jitterY = ((Math.floor(hash / 10) % 10) - 5) * 0.5}
                {@const x = 5 + (a.importance / 10) * 88 + jitterX}
                {@const y = 95 - (a.evidence / 10) * 88 + jitterY}
                {@const sc = STATUS_COLORS[a.status]}
                {@const isSelected = (selectedAssumption as StaticAssumption | null)?.id === a.id}
                {@const isHovered = hoveredDot === a.id}
                {@const isActive = isSelected || isHovered}
                <g
                  role="button"
                  tabindex="0"
                  class="cursor-pointer"
                  onclick={() => selectAssumption(a)}
                  onkeydown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectAssumption(a);
                    }
                  }}
                  onmouseenter={() => (hoveredDot = a.id)}
                  onmouseleave={() => (hoveredDot = null)}
                >
                  {#if isActive}
                    <circle
                      cx={x}
                      cy={y}
                      r="2.8"
                      fill="none"
                      stroke={sc.dot}
                      stroke-width="0.3"
                      opacity="0.4"
                    />
                  {/if}
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 1.8 : 1.3}
                    fill={sc.dot}
                    stroke="white"
                    stroke-width="0.2"
                  />
                  <text
                    x={x + 2}
                    y={y + 0.5}
                    font-size="1.4"
                    fill={isActive ? '#3d3529' : '#b0a48e'}
                    font-weight={isActive ? 'bold' : 'normal'}
                    class="pointer-events-none">{a.label ?? a.id}</text
                  >
                </g>
              {/each}
            </svg>

            <!-- Hover tooltip -->
            {#if hoveredDot && hoveredDot !== (selectedAssumption as StaticAssumption | null)?.id}
              {@const ha = allAssumptions.find((a) => a.id === hoveredDot)}
              {#if ha}
                {@const pctX = 5 + (ha.importance / 10) * 88}
                {@const pctY = 95 - (ha.evidence / 10) * 88}
                {@const tx = pctX > 60 ? '-105%' : '8%'}
                {@const ty = pctY > 50 ? '-100%' : '0%'}
                {@const tooltipStyle = `left: ${pctX}%; top: ${pctY}%; transform: translate(${tx}, ${ty})`}
                <div
                  class="pointer-events-none absolute z-20 w-44 rounded-lg bg-cork-800/95 px-3 py-2 text-cork-50 shadow-xl"
                  style={tooltipStyle}
                >
                  <p class="mb-0.5 text-[10px] font-bold">{ha.label}</p>
                  <p class="mb-0.5 text-[9px] opacity-70">
                    Imp: {ha.importance}/10 · Evi: {ha.evidence}/10
                  </p>
                  <p class="line-clamp-2 text-[9px] opacity-80">{ha.assumption}</p>
                  {#if ha.actualResults}
                    <p class="mt-0.5 text-[8px] italic opacity-60">{ha.actualResults}</p>
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .thin-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .thin-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .thin-scroll::-webkit-scrollbar-thumb {
    background: rgba(92, 75, 58, 0.2);
    border-radius: 2px;
  }
  .thin-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(92, 75, 58, 0.35);
  }
  .thin-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(92, 75, 58, 0.2) transparent;
  }
</style>
