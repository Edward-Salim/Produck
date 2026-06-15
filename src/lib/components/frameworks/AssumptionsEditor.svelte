<script lang="ts">
  import type { StaticAssumption } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { ASSUMPTION_STATUS, RISK_META } from '$lib/constants/colors.js';
  import {
    FlaskConical,
    Heart,
    Wrench,
    MousePointerClick,
    BriefcaseBusiness,
    Plus,
    X
  } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  let assumptions = $state<StaticAssumption[]>([]);
  let selectedId = $state<string | null>(null);
  let hoveredDot = $state<string | null>(null);
  let search = $state('');

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.assumptions ?? '[]');
      assumptions = Array.isArray(parsed) ? parsed : [];
    } catch {
      assumptions = [];
    }
  });

  function save() {
    onUpdate({ ...instance.values, assumptions: JSON.stringify(assumptions) });
  }

  const STATUS_COLORS = ASSUMPTION_STATUS;
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

  let sortedAssumptions = $derived.by(() => {
    const items = $state.snapshot(assumptions);
    items.sort((a, b) => {
      const typeCmp = (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
      if (typeCmp !== 0) return typeCmp;
      return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    });
    const typeIndex: Record<string, number> = {};
    for (const item of items) {
      typeIndex[item.type] = (typeIndex[item.type] ?? 0) + 1;
      const prefix = RISK_META[item.type]?.prefix ?? '?';
      item.label = `${prefix}${typeIndex[item.type]}`;
    }
    return items;
  });

  let filtered = $derived.by(() => {
    if (!search.trim()) return sortedAssumptions;
    const q = search.toLowerCase();
    return sortedAssumptions.filter(
      (a) =>
        (a.label ?? a.id).toLowerCase().includes(q) ||
        a.assumption.toLowerCase().includes(q) ||
        a.type.includes(q)
    );
  });

  let selected = $derived(assumptions.find((a) => a.id === selectedId) ?? null);

  function selectAssumption(a: StaticAssumption) {
    selectedId = a.id;
  }

  function addAssumption() {
    const a: StaticAssumption = {
      id: crypto.randomUUID(),
      type: 'desirability',
      assumption: '',
      rationale: '',
      testMethod: '',
      successCriteria: '',
      actualResults: '',
      status: 'untested',
      lastTested: null,
      importance: 5,
      evidence: 3
    };
    assumptions = [...assumptions, a];
    selectedId = a.id;
    save();
  }

  function removeAssumption(id: string) {
    assumptions = assumptions.filter((a) => a.id !== id);
    if (selectedId === id) selectedId = null;
    save();
  }

  function updateAssumption(id: string, field: keyof StaticAssumption, value: unknown) {
    assumptions = assumptions.map((a) => (a.id === id ? { ...a, [field]: value } : a));
    save();
  }
</script>

{#if assumptions.length === 0}
  <div class="space-y-4">
    <EmptyState
      icon={FlaskConical}
      title="No assumptions"
      description="Add assumptions to test in edit mode"
    />
    {#if draftMode === 'edit'}
      <div class="text-center">
        <button
          type="button"
          class="cursor-pointer rounded bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50 hover:bg-cork-800"
          onclick={addAssumption}
        >
          <Plus class="inline size-3.5" /> Add Assumption
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-3 md:flex-row" style="min-height: calc(100vh - 300px);">
    <!-- Sidebar -->
    <div
      class="hidden w-48 shrink-0 flex-col rounded-xl border border-cork-300/40 bg-cork-100 md:flex"
    >
      <div class="px-2 pt-2 pb-1">
        <input
          type="text"
          placeholder="Search..."
          bind:value={search}
          class="w-full rounded border border-cork-300/50 bg-white/50 px-2 py-1 text-xs text-cork-800 outline-none placeholder:text-cork-400"
        />
      </div>

      <div class="thin-scroll flex-1 overflow-y-auto p-2 pt-0">
        {#each filtered as a (a.id)}
          {@const sc = STATUS_COLORS[a.status]}
          <button
            type="button"
            id="assumption-{a.id}"
            class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-colors {selectedId ===
            a.id
              ? 'bg-cork-200/60'
              : 'hover:bg-cork-200/30'}"
            onclick={() => selectAssumption(a)}
          >
            <span class="size-4 shrink-0 text-cork-500">
              {#if a.type === 'desirability'}<Heart class="size-3.5" />
              {:else if a.type === 'feasibility'}<Wrench class="size-3.5" />
              {:else if a.type === 'usability'}<MousePointerClick class="size-3.5" />
              {:else}<BriefcaseBusiness class="size-3.5" />
              {/if}
            </span>
            <span class="flex-1 truncate text-xs text-cork-700">{a.label}</span>
            <span class="size-2 shrink-0 rounded-full" style="background: {sc.dot};"></span>
          </button>
        {/each}
      </div>

      {#if draftMode === 'edit'}
        <div class="border-t border-cork-300/40 p-2">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-xs text-cork-500 hover:bg-cork-200/30 hover:text-cork-700"
            onclick={addAssumption}
          >
            <Plus class="size-3" /> Add
          </button>
        </div>
      {/if}
    </div>

    <!-- Content -->
    <div class="thin-scroll flex-1 overflow-y-auto">
      {#if selected}
        {@const a = selected}
        {@const sc = STATUS_COLORS[a.status]}

        <div class="rounded-xl border border-cork-300/40 bg-cork-100 p-4 md:p-5">
          <div class="mb-1 flex items-center justify-between">
            <div class="flex items-center gap-2 text-cork-600">
              {#if a.type === 'desirability'}<Heart class="size-4" />
              {:else if a.type === 'feasibility'}<Wrench class="size-4" />
              {:else if a.type === 'usability'}<MousePointerClick class="size-4" />
              {:else}<BriefcaseBusiness class="size-4" />
              {/if}
              {#if draftMode === 'edit'}
                <select
                  value={a.type}
                  class="rounded border border-cork-300/50 bg-white px-1.5 py-0.5 text-xs font-bold text-cork-700 uppercase outline-none"
                  onchange={(e) => updateAssumption(a.id, 'type', e.currentTarget.value)}
                >
                  <option value="desirability">Desirability</option>
                  <option value="feasibility">Feasibility</option>
                  <option value="usability">Usability</option>
                  <option value="viability">Viability</option>
                </select>
              {:else}
                <span class="text-xs font-bold tracking-wider uppercase"
                  >{RISK_META[a.type]?.label ?? a.type}</span
                >
              {/if}
              <span class="font-mono text-xs text-cork-400">· {a.label}</span>
            </div>
            <div class="flex items-center gap-2">
              {#if draftMode === 'edit'}
                <select
                  value={a.status}
                  class="rounded border border-cork-300/50 px-1.5 py-0.5 text-xs font-medium outline-none"
                  style="background: {sc.bg}; color: {sc.text};"
                  onchange={(e) => updateAssumption(a.id, 'status', e.currentTarget.value)}
                >
                  <option value="untested">Untested</option>
                  <option value="validated">Validated</option>
                  <option value="revalidate">Revalidate</option>
                  <option value="invalidated">Invalidated</option>
                </select>
              {:else}
                <div
                  class="flex flex-col items-center rounded px-2 py-0.5"
                  style="background: {sc.bg}; color: {sc.text};"
                >
                  <span class="text-xs font-medium"
                    >{STATUS_COLORS[a.status]?.label ?? a.status}</span
                  >
                  {#if a.lastTested}<span class="text-[8px] opacity-70">{a.lastTested}</span>{/if}
                </div>
              {/if}
              {#if draftMode === 'edit'}
                <button
                  type="button"
                  class="cursor-pointer text-cork-300 hover:text-red-500"
                  onclick={() => removeAssumption(a.id)}><X class="size-3.5" /></button
                >
              {/if}
            </div>
          </div>

          <div class="mt-1 mb-4 flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-cork-400">Importance:</span>
              {#if draftMode === 'edit'}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={a.importance}
                  class="w-16"
                  oninput={(e) =>
                    updateAssumption(a.id, 'importance', Number(e.currentTarget.value))}
                />
              {:else}
                <span class="text-xs font-bold text-cork-700">{a.importance}/10</span>
              {/if}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-cork-400">Evidence:</span>
              {#if draftMode === 'edit'}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={a.evidence}
                  class="w-16"
                  oninput={(e) => updateAssumption(a.id, 'evidence', Number(e.currentTarget.value))}
                />
              {:else}
                <span class="text-xs font-bold text-cork-700">{a.evidence}/10</span>
              {/if}
            </div>
          </div>

          <div class="space-y-4">
            {#each [{ key: 'assumption' as const, label: 'Assumption' }, { key: 'rationale' as const, label: 'Rationale' }, { key: 'testMethod' as const, label: 'Test Method' }, { key: 'successCriteria' as const, label: 'Success Criteria' }, { key: 'actualResults' as const, label: 'Actual Results' }] as field (field.key)}
              <div class="border-t border-cork-400/20 pt-3">
                <p class="mb-1 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                  {field.label}
                </p>
                {#if draftMode === 'edit'}
                  <textarea
                    value={a[field.key] ?? ''}
                    class="min-h-16 w-full resize-y rounded border border-cork-300/50 bg-white/70 px-2 py-1 text-sm text-cork-700 outline-none focus:border-cork-500"
                    oninput={(e) => updateAssumption(a.id, field.key, e.currentTarget.value)}
                  ></textarea>
                {:else if a[field.key]}
                  <p class="text-sm text-cork-800">{a[field.key]}</p>
                {:else}
                  <p class="text-sm text-cork-400 italic">No {field.label.toLowerCase()} yet</p>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <!-- Quadrant -->
        <div class="flex flex-col rounded-xl border border-cork-300/40 bg-cork-100 p-3 md:p-4">
          <div class="mb-2 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
            <p class="text-xs font-bold tracking-wider text-cork-500 uppercase">
              Assumption Priority Map
            </p>
            <div class="flex flex-wrap items-center gap-2 md:gap-3">
              {#each Object.entries(STATUS_COLORS) as [key, s] (key)}
                <div class="flex items-center gap-1">
                  <span class="size-2 rounded-full" style="background: {s.dot};"></span>
                  <span class="text-[9px] text-cork-500">{s.label}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="relative aspect-square w-full max-w-150">
            <span class="absolute top-0 left-0 translate-x-1 text-[8px] font-medium text-cork-400"
              >Evidence</span
            >
            <span class="absolute right-0 -bottom-4 text-[8px] font-medium text-cork-400"
              >Importance</span
            >
            <svg
              class="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {#each Array(10) as _, i}
                {@const gx = 5 + ((i + 1) / 10) * 88}
                {@const gy = 95 - ((i + 1) / 10) * 88}
                <line x1={gx} y1="7" x2={gx} y2="95" stroke="#b0a48e" stroke-width="0.08" />
                <line x1="5" y1={gy} x2="93" y2={gy} stroke="#b0a48e" stroke-width="0.08" />
              {/each}
              <line x1="5" y1="95" x2="95" y2="95" stroke="#b0a48e" stroke-width="0.3" />
              <line x1="5" y1="5" x2="5" y2="95" stroke="#b0a48e" stroke-width="0.3" />
              {#each Array(10) as _, i}
                {@const tx = 5 + ((i + 1) / 10) * 88}
                {@const ty = 95 - ((i + 1) / 10) * 88}
                <line x1={tx} y1="95" x2={tx} y2="93.5" stroke="#b0a48e" stroke-width="0.2" />
                <text x={tx} y="98.5" text-anchor="middle" fill="#b0a48e" font-size="2.2"
                  >{i + 1}</text
                >
                <line x1="5" y1={ty} x2="6.5" y2={ty} stroke="#b0a48e" stroke-width="0.2" />
                <text x="3.5" y={ty + 0.7} text-anchor="end" fill="#b0a48e" font-size="2.2"
                  >{i + 1}</text
                >
              {/each}
            </svg>
            <svg
              class="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {#each sortedAssumptions as a, idx (a.id)}
                {@const hash =
                  ((a.id.charCodeAt(0) || 0) * 7 + (a.id.charCodeAt(1) || 0) * 13 + idx * 3) % 100}
                {@const jitterX = ((hash % 10) - 5) * 0.5}
                {@const jitterY = ((Math.floor(hash / 10) % 10) - 5) * 0.5}
                {@const x = 5 + (a.importance / 10) * 88 + jitterX}
                {@const y = 95 - (a.evidence / 10) * 88 + jitterY}
                {@const sc = STATUS_COLORS[a.status]}
                {@const isActive = selectedId === a.id || hoveredDot === a.id}
                <g
                  role="button"
                  tabindex="0"
                  class="cursor-pointer"
                  onclick={() => selectAssumption(a)}
                  onkeydown={(e) => {
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
            {#if hoveredDot && hoveredDot !== selectedId}
              {@const ha = sortedAssumptions.find((a) => a.id === hoveredDot)}
              {#if ha}
                {@const pctX = 5 + (ha.importance / 10) * 88}
                {@const pctY = 95 - (ha.evidence / 10) * 88}
                <div
                  class="pointer-events-none absolute z-20 w-44 rounded-lg bg-cork-800/95 px-3 py-2 text-cork-50 shadow-xl"
                  style="left: {pctX}%; top: {pctY}%; transform: translate({pctX > 60
                    ? '-105%'
                    : '8%'}, {pctY > 50 ? '-100%' : '0%'});"
                >
                  <p class="mb-0.5 text-[10px] font-bold">{ha.label}</p>
                  <p class="mb-0.5 text-[9px] opacity-70">
                    Imp: {ha.importance}/10 · Evi: {ha.evidence}/10
                  </p>
                  <p class="line-clamp-2 text-[9px] opacity-80">{ha.assumption}</p>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Mobile: add button -->
  {#if draftMode === 'edit'}
    <div class="fixed right-4 bottom-4 md:hidden">
      <button
        type="button"
        class="cursor-pointer rounded-full bg-cork-700 p-3 text-cork-50 shadow-lg hover:bg-cork-800"
        onclick={addAssumption}
      >
        <Plus class="size-5" />
      </button>
    </div>
  {/if}
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
