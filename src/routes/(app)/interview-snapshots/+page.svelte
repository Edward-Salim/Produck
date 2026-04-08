<script lang="ts">
  import { MessageSquare, Calendar, SlidersHorizontal, Check, FileText, X } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import type { SnapshotRow } from './+page.server.js';

  import personaMan1 from '$lib/assets/personas/man-1.png';
  import personaMan2 from '$lib/assets/personas/man-2.png';
  import personaWoman1 from '$lib/assets/personas/woman-1.png';
  import personaWoman2 from '$lib/assets/personas/woman-2.png';

  const FALLBACK_AVATARS = [personaWoman1, personaMan1, personaWoman2, personaMan2];

  function getAvatar(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return FALLBACK_AVATARS[Math.abs(hash) % FALLBACK_AVATARS.length];
  }

  let { data } = $props();

  let selectedPersons = $state<Set<string>>(new Set());
  let selectedRoles = $state<Set<string>>(new Set());
  let filterOpen = $state(false);

  let uniquePersons = $derived([...new Set(data.snapshots.map((s: SnapshotRow) => s.personName))]);
  let uniqueRoles = $derived([
    ...new Set(data.snapshots.map((s: SnapshotRow) => s.personRole).filter(Boolean))
  ] as string[]);

  function togglePerson(name: string) {
    const next = new Set(selectedPersons);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    selectedPersons = next;
  }

  function toggleRole(role: string) {
    const next = new Set(selectedRoles);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    selectedRoles = next;
  }

  let hasFilter = $derived(selectedPersons.size > 0 || selectedRoles.size > 0);
  let activeFilterCount = $derived(selectedPersons.size + selectedRoles.size);

  // Roles that have at least one snapshot matching currently selected people
  let availableRoles = $derived.by(() => {
    const pool =
      selectedPersons.size > 0
        ? data.snapshots.filter((s: SnapshotRow) => selectedPersons.has(s.personName))
        : data.snapshots;
    return new Set(pool.map((s: SnapshotRow) => s.personRole).filter(Boolean));
  });

  // People that have at least one snapshot matching currently selected roles
  let availablePersons = $derived.by(() => {
    const pool =
      selectedRoles.size > 0
        ? data.snapshots.filter((s: SnapshotRow) => s.personRole && selectedRoles.has(s.personRole))
        : data.snapshots;
    return new Set(pool.map((s: SnapshotRow) => s.personName));
  });

  let filteredSnapshots = $derived(
    data.snapshots.filter((s: SnapshotRow) => {
      if (selectedPersons.size > 0 && !selectedPersons.has(s.personName)) return false;
      if (selectedRoles.size > 0 && s.personRole && !selectedRoles.has(s.personRole)) return false;
      return true;
    })
  );

  function clearFilters() {
    selectedPersons = new Set();
    selectedRoles = new Set();
  }

  let filterEl = $state<HTMLElement | null>(null);

  function handleWindowClick(e: MouseEvent) {
    if (filterOpen && filterEl && !filterEl.contains(e.target as Node)) {
      filterOpen = false;
    }
  }

  let transcriptSnapshot = $state<SnapshotRow | null>(null);
  async function removeEntry(
    snapshotId: number,
    field: 'quickFacts' | 'insights' | 'opportunities',
    index: number
  ) {
    const snapshot = data.snapshots.find((s: SnapshotRow) => s.id === snapshotId);
    if (!snapshot) return;
    const updated = [...snapshot[field]];
    updated.splice(index, 1);
    await fetch('/api/interview-snapshot', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: snapshotId, [field]: updated })
    });
    invalidateAll();
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:window onclick={handleWindowClick} />

<svelte:head>
  <title>Interview Snapshots | Produck</title>
</svelte:head>

<div>
  <header class="mb-5">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Interview Snapshots</h1>
    <div class="mt-0.5 flex items-center gap-3">
      <p class="text-sm text-cork-500">One-page synthesis per interview</p>
      <div class="flex-1"></div>
      <div class="relative" bind:this={filterEl}>
        <button
          type="button"
          class="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors {hasFilter
            ? 'border-cork-700 bg-cork-700 text-cork-50'
            : 'border-cork-300 bg-cork-200/50 text-cork-700 hover:bg-cork-300/50'}"
          onclick={() => (filterOpen = !filterOpen)}
        >
          <SlidersHorizontal class="size-3" />
          {#if activeFilterCount > 0}
            <span class="text-xs">{activeFilterCount}</span>
          {/if}
        </button>

        {#if filterOpen}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="absolute top-9 right-0 z-50 w-56 rounded-lg border border-cork-300 bg-cork-50 p-2 shadow-lg"
            onmousedown={(e) => e.stopPropagation()}
          >
            <div class="mb-1 flex items-center justify-between px-1">
              <span class="text-[10px] font-bold tracking-widest text-cork-400 uppercase"
                >People</span
              >
              {#if hasFilter}
                <button
                  type="button"
                  class="text-[10px] text-cork-400 hover:text-cork-600"
                  onclick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}>Clear</button
                >
              {/if}
            </div>
            {#each uniquePersons as person (person)}
              {@const enabled = availablePersons.has(person) || selectedPersons.has(person)}
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs {enabled
                  ? 'cursor-pointer text-cork-700 hover:bg-cork-200/50'
                  : 'cursor-not-allowed text-cork-400 opacity-50'}"
                onclick={() => enabled && togglePerson(person)}
                disabled={!enabled}
              >
                <span
                  class="flex size-3.5 shrink-0 items-center justify-center rounded border {selectedPersons.has(
                    person
                  )
                    ? 'border-cork-700 bg-cork-700'
                    : 'border-cork-400'}"
                >
                  {#if selectedPersons.has(person)}<Check class="size-2.5 text-cork-50" />{/if}
                </span>
                <span class="flex-1">{person}</span>
                <span class="text-[10px] text-cork-400"
                  >{data.snapshots.filter((s) => s.personName === person).length}</span
                >
              </button>
            {/each}

            {#if uniqueRoles.length > 0}
              <div class="my-1.5 border-t border-cork-300/40"></div>
              <span
                class="mb-1 block px-1 text-[10px] font-bold tracking-widest text-cork-400 uppercase"
                >Roles</span
              >
              {#each uniqueRoles as role (role)}
                {@const enabled = availableRoles.has(role) || selectedRoles.has(role)}
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs {enabled
                    ? 'cursor-pointer text-cork-700 hover:bg-cork-200/50'
                    : 'cursor-not-allowed text-cork-400 opacity-50'}"
                  onclick={() => enabled && toggleRole(role)}
                  disabled={!enabled}
                >
                  <span
                    class="flex size-3.5 shrink-0 items-center justify-center rounded border {selectedRoles.has(
                      role
                    )
                      ? 'border-cork-700 bg-cork-700'
                      : 'border-cork-400'}"
                  >
                    {#if selectedRoles.has(role)}<Check class="size-2.5 text-cork-50" />{/if}
                  </span>
                  <span class="truncate">{role}</span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </header>

  {#if filteredSnapshots.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare class="mb-3 size-8 text-cork-300" />
      <p class="text-sm text-cork-500">No interview snapshots yet.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each filteredSnapshots as snapshot, idx (snapshot.id)}
        {@const isLatest = idx === 0}
        {@const prevDate = idx > 0 ? filteredSnapshots[idx - 1].interviewDate : null}
        {@const isNewDate = snapshot.interviewDate !== prevDate}

        {#if isNewDate}
          <div class="flex items-center gap-2 {idx > 0 ? 'mt-4' : ''}">
            <Calendar class="size-3.5 {isLatest ? 'text-cork-600' : 'text-cork-400'}" />
            <span class="text-xs font-medium {isLatest ? 'text-cork-700' : 'text-cork-500'}"
              >{formatDate(snapshot.interviewDate)}</span
            >
            {#if isLatest}
              <span
                class="rounded bg-cork-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cork-50 uppercase"
                >Latest</span
              >
            {/if}
            <div class="flex-1 border-t border-cork-300/40"></div>
          </div>
        {/if}

        <div
          class="overflow-hidden rounded-xl bg-cork-200"
          style="box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.08);"
        >
          <!-- Top section -->
          <div class="p-4 md:p-5">
            <div class="mb-3 flex items-start justify-between">
              <h2 class="font-display text-base text-cork-800 md:text-lg">{snapshot.personName}</h2>
              <button
                type="button"
                class="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-700"
                onclick={() => (transcriptSnapshot = snapshot)}
              >
                <FileText class="size-3.5" />
              </button>
            </div>

            <div class="flex gap-3 md:gap-4">
              <img
                src={snapshot.personPhoto || getAvatar(snapshot.personName)}
                alt={snapshot.personName}
                class="size-12 shrink-0 rounded-lg object-cover md:size-16"
              />

              <div class="min-w-0 flex-1">
                {#if snapshot.quote}
                  <p class="text-sm text-cork-700 italic">"{snapshot.quote}"</p>
                {:else}
                  <p class="text-sm text-cork-400 italic">No quote recorded</p>
                {/if}
                {#if snapshot.personRole}
                  <p class="mt-1 text-xs text-cork-500">{snapshot.personRole}</p>
                {/if}
              </div>
            </div>
          </div>

          <!-- Bottom section: three columns (stacked on mobile) -->
          <div class="grid grid-cols-1 gap-0 border-t border-cork-300/30 md:grid-cols-3">
            <div class="border-b border-cork-300/30 p-3 md:border-r md:border-b-0 md:p-4">
              <h3 class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">
                Quick Facts
              </h3>
              <p class="mb-2 text-[9px] text-cork-400">Who they are, context, habits</p>
              {#if snapshot.quickFacts.length > 0}
                <div class="space-y-1.5">
                  {#each snapshot.quickFacts as fact, i (i)}
                    <div class="group/entry relative">
                      <p
                        class="rounded bg-cork-100/60 px-2 py-1 pr-6 text-xs text-cork-700 transition-colors hover:bg-cork-300/30"
                      >
                        {fact}
                      </p>
                      <button
                        type="button"
                        class="absolute top-1/2 right-1 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-400 opacity-0 transition-opacity group-hover/entry:opacity-100 hover:bg-red-100/50 hover:text-red-500"
                        onclick={() => removeEntry(snapshot.id, 'quickFacts', i)}
                        ><X class="size-2.5" /></button
                      >
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs text-cork-400 italic">None yet</p>
              {/if}
            </div>

            <div class="border-b border-cork-300/30 p-3 md:border-r md:border-b-0 md:p-4">
              <h3 class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">
                Insights
              </h3>
              <p class="mb-2 text-[9px] text-cork-400">Patterns, surprises, learnings</p>
              {#if snapshot.insights.length > 0}
                <div class="space-y-1.5">
                  {#each snapshot.insights as insight, i (i)}
                    <div class="group/entry relative">
                      <p
                        class="rounded bg-cork-100/60 px-2 py-1 pr-6 text-xs text-cork-700 transition-colors hover:bg-cork-300/30"
                      >
                        {insight}
                      </p>
                      <button
                        type="button"
                        class="absolute top-1/2 right-1 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-400 opacity-0 transition-opacity group-hover/entry:opacity-100 hover:bg-red-100/50 hover:text-red-500"
                        onclick={() => removeEntry(snapshot.id, 'insights', i)}
                        ><X class="size-2.5" /></button
                      >
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs text-cork-400 italic">None yet</p>
              {/if}
            </div>

            <div class="p-3 md:p-4">
              <h3 class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">
                Opportunities
              </h3>
              <p class="mb-2 text-[9px] text-cork-400">Quotes hinting at unmet needs</p>
              {#if snapshot.opportunities.length > 0}
                <div class="space-y-1.5">
                  {#each snapshot.opportunities as opp, i (i)}
                    <div class="group/entry relative">
                      <p
                        class="rounded bg-cork-100/60 px-2 py-1 pr-6 text-xs text-cork-700 transition-colors hover:bg-cork-300/30"
                      >
                        {opp}
                      </p>
                      <button
                        type="button"
                        class="absolute top-1/2 right-1 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-cork-400 opacity-0 transition-opacity group-hover/entry:opacity-100 hover:bg-red-100/50 hover:text-red-500"
                        onclick={() => removeEntry(snapshot.id, 'opportunities', i)}
                        ><X class="size-2.5" /></button
                      >
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-xs text-cork-400 italic">None yet</p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Transcript Dialog -->
  <Dialog.Root
    open={!!transcriptSnapshot}
    onOpenChange={(o) => {
      if (!o) transcriptSnapshot = null;
    }}
  >
    <Dialog.Content class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-2xl">
      {#if transcriptSnapshot}
        <Dialog.Header class="flex-row items-start gap-4">
          <img
            src={transcriptSnapshot.personPhoto || getAvatar(transcriptSnapshot.personName)}
            alt={transcriptSnapshot.personName}
            class="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <div class="min-w-0">
            <Dialog.Title class="font-display text-lg text-cork-800"
              >{transcriptSnapshot.personName}</Dialog.Title
            >
            <p class="text-xs text-cork-500">
              {formatDate(transcriptSnapshot.interviewDate)}{#if transcriptSnapshot.personRole}
                &middot; {transcriptSnapshot.personRole}{/if}
            </p>
          </div>
        </Dialog.Header>
        <Dialog.Description class="sr-only">Interview transcript</Dialog.Description>

        <div
          class="max-h-[60vh] overflow-y-auto [scrollbar-color:theme(--color-cork-300)_transparent] [scrollbar-width:thin]"
        >
          {#if transcriptSnapshot.transcript}
            <div class="text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
              {transcriptSnapshot.transcript}
            </div>
          {:else}
            <p class="py-12 text-center text-xs text-cork-400 italic">
              Transcript not yet available for this interview.
            </p>
          {/if}
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>
