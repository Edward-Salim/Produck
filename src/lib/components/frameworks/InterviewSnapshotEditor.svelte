<script lang="ts">
  import type { FrameworkInstance } from './types.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Check, FileText, SlidersHorizontal } from '@lucide/svelte';
  import personaMan1 from '$lib/assets/personas/man-1.png';
  import personaMan2 from '$lib/assets/personas/man-2.png';
  import personaWoman1 from '$lib/assets/personas/woman-1.png';
  import personaWoman2 from '$lib/assets/personas/woman-2.png';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  type Snapshot = {
    id: string;
    personName: string;
    personRole: string;
    personPhoto: string;
    interviewDate: string;
    quote: string;
    quickFacts: string;
    insights: string;
    opportunities: string;
    transcript: string;
  };

  let snapshots = $state<Snapshot[]>([]);
  let selectedPersons = $state<Set<string>>(new Set());
  let selectedRoles = $state<Set<string>>(new Set());
  let filterOpen = $state(false);
  let filterEl = $state<HTMLElement | null>(null);
  let transcriptSnapshot = $state<Snapshot | null>(null);

  const FALLBACK_AVATARS = [personaWoman1, personaMan1, personaWoman2, personaMan2];

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.snapshots ?? '[]');
      snapshots = Array.isArray(parsed) ? parsed : [];
    } catch {
      snapshots = [];
    }
  });

  function save() {
    onUpdate({ ...instance.values, snapshots: JSON.stringify(snapshots) });
  }

  function getAvatar(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return FALLBACK_AVATARS[Math.abs(hash) % FALLBACK_AVATARS.length];
  }

  function formatDate(v: string) {
    const ts = Number(v);
    const d = Number.isFinite(ts) && v.length <= 10 ? new Date(ts * 1000) : new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function lines(v: string): string[] {
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let uniquePersons = $derived([...new Set(snapshots.map((s) => s.personName).filter(Boolean))]);
  let uniqueRoles = $derived([...new Set(snapshots.map((s) => s.personRole).filter(Boolean))]);
  let hasFilter = $derived(selectedPersons.size > 0 || selectedRoles.size > 0);
  let activeFilterCount = $derived(selectedPersons.size + selectedRoles.size);

  let availableRoles = $derived.by(() => {
    const pool =
      selectedPersons.size > 0
        ? snapshots.filter((s) => selectedPersons.has(s.personName))
        : snapshots;
    return new Set(pool.map((s) => s.personRole).filter(Boolean));
  });
  let availablePersons = $derived.by(() => {
    const pool =
      selectedRoles.size > 0 ? snapshots.filter((s) => selectedRoles.has(s.personRole)) : snapshots;
    return new Set(pool.map((s) => s.personName).filter(Boolean));
  });

  let filtered = $derived(
    snapshots.filter((s) => {
      if (selectedPersons.size > 0 && !selectedPersons.has(s.personName)) return false;
      if (selectedRoles.size > 0 && !selectedRoles.has(s.personRole)) return false;
      return true;
    })
  );

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
  function clearFilters() {
    selectedPersons = new Set();
    selectedRoles = new Set();
  }

  function updateField(id: string, field: keyof Snapshot, value: string) {
    snapshots = snapshots.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    save();
  }

  function handleWindowClick(e: MouseEvent) {
    if (filterOpen && filterEl && !filterEl.contains(e.target as Node)) filterOpen = false;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="rounded-xl border border-cork-300/50 bg-cork-50/50 p-4">
  <div class="mb-4 flex items-center gap-2">
    <div class="relative" bind:this={filterEl}>
      <button
        type="button"
        class="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-sm transition-colors {hasFilter
          ? 'border-cork-700 bg-cork-700 text-cork-50'
          : 'border-cork-300 bg-cork-200/50 text-cork-700 hover:bg-cork-300/50'}"
        onclick={() => (filterOpen = !filterOpen)}
      >
        <SlidersHorizontal class="size-3" />
        {#if activeFilterCount > 0}<span class="text-xs">{activeFilterCount}</span>{/if}
      </button>
      {#if filterOpen}
        <div
          class="absolute top-9 right-0 z-50 w-56 rounded-lg border border-cork-300 bg-cork-50 p-2 shadow-lg"
        >
          <div class="mb-1 flex items-center justify-between px-1">
            <span class="text-[10px] font-bold tracking-widest text-cork-400 uppercase">People</span
            >
            {#if hasFilter}<button
                type="button"
                class="text-[10px] text-cork-400 hover:text-cork-600"
                onclick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}>Clear</button
              >{/if}
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

  <div class="space-y-4">
    {#each filtered as snapshot, idx (snapshot.id)}
      {@const previous = idx > 0 ? filtered[idx - 1] : null}
      {@const isNewDate = !previous || snapshot.interviewDate !== previous.interviewDate}

      {#if isNewDate}
        <div class="flex items-center gap-2 {idx > 0 ? 'pt-2' : ''}">
          <span class="text-xs font-medium text-cork-600">{formatDate(snapshot.interviewDate)}</span
          >
          {#if idx === 0}<span
              class="rounded bg-cork-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cork-50 uppercase"
              >Latest</span
            >{/if}
          <div class="flex-1 border-t border-cork-300/40"></div>
        </div>
      {/if}

      <div
        class="overflow-hidden rounded-xl bg-cork-200"
        style="box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.08);"
      >
        <div class="p-4 md:p-5">
          <div class="mb-3 flex items-start justify-between gap-2">
            {#if draftMode === 'edit'}
              <input
                value={snapshot.personName}
                aria-label="Interview person"
                placeholder="Person name"
                class="min-w-0 flex-1 rounded border border-transparent bg-transparent p-0 font-display text-base text-cork-800 transition-colors outline-none placeholder:text-cork-400 hover:border-cork-300/50 hover:bg-cork-100/40 focus:border-cork-500/60 focus:bg-cork-100/60 focus:px-2 focus:py-1 focus:ring-0 md:text-lg"
                oninput={(e) => updateField(snapshot.id, 'personName', e.currentTarget.value)}
              />
            {:else}
              <h2 class="min-w-0 flex-1 font-display text-base text-cork-800 md:text-lg">
                {snapshot.personName || 'Untitled interview'}
              </h2>
            {/if}
            <button
              type="button"
              class="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-cork-400 transition-colors hover:text-cork-700"
              title="Transcript"
              onclick={() => (transcriptSnapshot = snapshot)}
            >
              <FileText class="size-3.5" />
            </button>
          </div>

          <div class="flex gap-3 md:gap-4">
            <img
              src={snapshot.personPhoto || getAvatar(snapshot.personName)}
              alt={snapshot.personName || 'Interviewee'}
              class="size-12 shrink-0 rounded-lg object-cover md:size-16"
            />
            <div class="min-w-0 flex-1">
              {#if draftMode === 'edit'}
                <textarea
                  value={snapshot.quote}
                  aria-label="Interview quote"
                  placeholder="A quote that captures the interview"
                  class="min-h-16 w-full resize-y rounded-lg border border-cork-300/50 bg-cork-100/60 text-sm text-cork-700 italic placeholder:text-cork-400 focus:border-cork-500 focus:ring-cork-500/20"
                  oninput={(e) => updateField(snapshot.id, 'quote', e.currentTarget.value)}
                ></textarea>
                <input
                  value={snapshot.personRole}
                  aria-label="Interview role"
                  placeholder="Role, segment, context"
                  class="mt-1 w-full rounded border border-transparent bg-transparent px-0 py-0 text-xs text-cork-500 transition-colors outline-none placeholder:text-cork-400 hover:border-cork-300/50 hover:bg-cork-100/40 focus:border-cork-500/60 focus:bg-cork-100/60 focus:px-2 focus:py-1 focus:ring-0"
                  oninput={(e) => updateField(snapshot.id, 'personRole', e.currentTarget.value)}
                />
              {:else}
                <p class="text-sm text-cork-700 italic">
                  {snapshot.quote ? `"${snapshot.quote}"` : 'No quote recorded'}
                </p>
                {#if snapshot.personRole}<p class="mt-1 text-xs text-cork-500">
                    {snapshot.personRole}
                  </p>{/if}
              {/if}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-0 border-t border-cork-300/30 md:grid-cols-3">
          {#each [{ id: 'quickFacts' as const, title: 'Quick Facts', hint: 'Who they are, context, habits', placeholder: 'One fact per line' }, { id: 'insights' as const, title: 'Insights', hint: 'Patterns, surprises, learnings', placeholder: 'One insight per line' }, { id: 'opportunities' as const, title: 'Opportunities', hint: 'Quotes hinting at unmet needs', placeholder: 'One opportunity per line' }] as section, i (section.id)}
            <div
              class="border-b border-cork-300/30 p-3 md:border-b-0 md:p-4 {i < 2
                ? 'md:border-r'
                : ''}"
            >
              <h3 class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">
                {section.title}
              </h3>
              <p class="mb-2 text-[9px] text-cork-400">{section.hint}</p>
              {#if draftMode === 'edit'}
                <textarea
                  value={snapshot[section.id]}
                  aria-label={section.title}
                  placeholder={section.placeholder}
                  class="min-h-36 w-full resize-y rounded border border-cork-300/50 bg-cork-100/60 px-2 py-1 text-xs text-cork-700 placeholder:text-cork-400 focus:border-cork-500 focus:ring-cork-500/20"
                  oninput={(e) => updateField(snapshot.id, section.id, e.currentTarget.value)}
                ></textarea>
              {:else}
                {@const items = lines(snapshot[section.id])}
                {#if items.length > 0}
                  <div class="space-y-1.5">
                    {#each items as item, j (`${section.id}-${j}`)}<p
                        class="rounded bg-cork-100/60 px-2 py-1 text-xs text-cork-700"
                      >
                        {item}
                      </p>{/each}
                  </div>
                {:else}
                  <p class="text-xs text-cork-400 italic">None yet</p>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<Dialog.Root
  open={!!transcriptSnapshot}
  onOpenChange={(open) => {
    if (!open) transcriptSnapshot = null;
  }}
>
  <Dialog.Content class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-2xl">
    {#if transcriptSnapshot}
      <Dialog.Header class="flex-row items-start gap-4">
        <img
          src={transcriptSnapshot.personPhoto || getAvatar(transcriptSnapshot.personName)}
          alt={transcriptSnapshot.personName || 'Interviewee'}
          class="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div class="min-w-0">
          <Dialog.Title class="font-display text-lg text-cork-800"
            >{transcriptSnapshot.personName || 'Untitled interview'}</Dialog.Title
          >
          <p class="text-xs text-cork-500">
            {formatDate(transcriptSnapshot.interviewDate)}{#if transcriptSnapshot.personRole}
              &middot; {transcriptSnapshot.personRole}{/if}
          </p>
        </div>
      </Dialog.Header>
      <Dialog.Description class="sr-only">Interview transcript</Dialog.Description>
      <div class="max-h-[60vh] overflow-y-auto">
        {#if draftMode === 'edit'}
          <textarea
            value={transcriptSnapshot.transcript}
            aria-label="Transcript notes"
            placeholder="Paste transcript notes or key excerpts"
            class="min-h-80 w-full resize-y rounded-lg border border-cork-300/60 bg-cork-100/60 px-3 py-2 text-sm leading-relaxed text-cork-700 placeholder:text-cork-400 focus:border-cork-500 focus:ring-cork-500/20"
            oninput={(e) => {
              if (!transcriptSnapshot) return;
              updateField(transcriptSnapshot.id, 'transcript', e.currentTarget.value);
              transcriptSnapshot = { ...transcriptSnapshot, transcript: e.currentTarget.value };
            }}
          ></textarea>
        {:else if transcriptSnapshot.transcript}
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
