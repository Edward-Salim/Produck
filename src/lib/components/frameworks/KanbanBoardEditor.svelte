<script lang="ts">
  import type { KanbanCard, KanbanColumn } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { browser } from '$app/environment';
  import { Bug, ClipboardList, Columns3, Sparkles, Wrench } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import { SvelteSet } from 'svelte/reactivity';

  let { instance, draftMode, onUpdate }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  // Kanban is always read-only — draftMode / onUpdate are accepted only for
  // compatibility with the framework editor contract.
  $effect(() => { draftMode; onUpdate; });

  const PRIORITY = [
    { key: 'none', label: 'None', dot: '#9ca3af' },
    { key: 'low', label: 'Low', dot: '#3b82f6' },
    { key: 'medium', label: 'Medium', dot: '#fbbf24' },
    { key: 'high', label: 'High', dot: '#f59e0b' },
    { key: 'critical', label: 'Critical', dot: '#ef4444' }
  ] as const;

  const DEFAULT_COLUMNS: KanbanColumn[] = [
    { id: 'col-todo', title: 'To Do', color: '#dbeafe', wipLimit: null, cards: [] },
    { id: 'col-progress', title: 'In Progress', color: '#fef3c7', wipLimit: null, cards: [] },
    { id: 'col-review', title: 'Review', color: '#f3e8ff', wipLimit: null, cards: [] },
    { id: 'col-blocked', title: 'Blocked', color: '#fee2e2', wipLimit: null, cards: [] },
    { id: 'col-done', title: 'Done', color: '#d1fae5', wipLimit: null, cards: [] }
  ];

  let columns = $state<KanbanColumn[]>([]);

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.kanban ?? '[]');
      columns = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_COLUMNS.map((c) => ({ ...c, cards: [] }));
    } catch {
      columns = DEFAULT_COLUMNS.map((c) => ({ ...c, cards: [] }));
    }
  });

  // ── Assignee badge colors ──
  const ASSIGNEE_MAP: Record<string, string> = {
    Kelvin: '#2563eb',
    Edward: '#059669'
  };
  const ASSIGNEE_PALETTE = [
    '#2563eb', '#dc2626', '#059669', '#d97706',
    '#7c3aed', '#db2777', '#0891b2', '#ea580c'
  ];

  function assigneeColor(name: string): string {
    if (ASSIGNEE_MAP[name]) return ASSIGNEE_MAP[name];
    if (!name) return '#9ca3af';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return ASSIGNEE_PALETTE[Math.abs(hash) % ASSIGNEE_PALETTE.length];
  }

  // ── Click-to-toggle description ──
  let expandedCards = $state(new SvelteSet<string>());
  let didDrag = $state(false);

  function toggleDescription(cardId: string) {
    if (didDrag) { didDrag = false; return; }
    if (expandedCards.has(cardId)) {
      expandedCards.delete(cardId);
    } else {
      expandedCards.add(cardId);
    }
    expandedCards = new SvelteSet(expandedCards);
  }

  // ── Assignee picker ──
  let pickerCardId = $state<string | null>(null);
  const ASSIGNEE_OPTIONS = ['Kelvin', 'Edward', ''];

  async function setAssignee(cardId: string, colId: string, name: string) {
    columns = columns.map((c) => {
      if (c.id !== colId) return c;
      return {
        ...c,
        cards: c.cards.map((card) =>
          card.id === cardId ? { ...card, assignee: name } : card
        )
      };
    });
    pickerCardId = null;
    onUpdate({ kanban: JSON.stringify(columns) });

    // Persist to DB
    const numericId = cardId.replace('KC-', '');
    try {
      await fetch(`/api/kanban/${numericId}/assignee`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee: name })
      });
    } catch { /* best-effort */ }
  }

  function closePicker() { pickerCardId = null; }

  // ── Sort mode (persisted to localStorage) ──
  let sortMode = $state<'none' | 'priority' | 'type' | 'sp' | 'assignee'>(
    (browser && (localStorage.getItem('kb_sort') as any)) || 'none'
  );
  const SORT_OPTIONS = [
    { key: 'none', label: 'Default' },
    { key: 'priority', label: 'Priority' },
    { key: 'type', label: 'Type' },
    { key: 'sp', label: 'SP' },
    { key: 'assignee', label: 'Assignee' }
  ] as const;
  let sortOpen = $state(false);

  $effect(() => {
    if (browser) localStorage.setItem('kb_sort', sortMode);
  });

  function sortCards(cards: KanbanCard[]) {
    const mode = sortMode;
    if (mode === 'none') return cards;
    return [...cards].sort((a, b) => {
      if (mode === 'priority') {
        const rank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
        return (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4);
      }
      if (mode === 'type') {
        const rank: Record<string, number> = { bug: 0, feature: 1, improvement: 2, task: 3 };
        return (rank[a.type] ?? 9) - (rank[b.type] ?? 9);
      }
      if (mode === 'sp') return (b.storyPoints ?? 0) - (a.storyPoints ?? 0);
      if (mode === 'assignee') return (a.assignee || '').localeCompare(b.assignee || '');
      return 0;
    });
  }

  // ── Type filter (persisted to localStorage) ──
  let activeTypes = $state(new SvelteSet<string>(
    browser ? JSON.parse(localStorage.getItem('kb_types') || '[]') : []
  ));

  $effect(() => {
    if (browser) localStorage.setItem('kb_types', JSON.stringify([...activeTypes]));
  });
  const TYPE_KEYS = ['bug', 'feature', 'improvement', 'task'] as const;

  function toggleType(key: string) {
    if (activeTypes.has(key)) activeTypes.delete(key);
    else activeTypes.add(key);
    activeTypes = new SvelteSet(activeTypes);
  }

  function typeLabel(key: string): string {
    return { bug: 'Bug', feature: 'Feature', improvement: 'Improvement', task: 'Chore' }[key] ?? key;
  }

  function isColumnDark(color: string): boolean {
    const hex = color.replace('#', '');
    if (hex.length < 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }

  function priorityInfo(key: string) {
    return PRIORITY.find((p) => p.key === key) ?? PRIORITY[0];
  }

  const TYPE_ICONS: Record<string, typeof Bug> = {
    bug: Bug,
    feature: Sparkles,
    improvement: Wrench,
    task: ClipboardList
  };

  function typeIcon(type: string) {
    return TYPE_ICONS[type] ?? null;
  }

  // ── Drag and drop ──
  let draggingCardId = $state<string | null>(null);
  let draggingFromColId = $state<string | null>(null);
  let dropTargetColId = $state<string | null>(null);

  function onDragStart(e: DragEvent, cardId: string, colId: string) {
    didDrag = true;
    draggingCardId = cardId;
    draggingFromColId = colId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', cardId);
    }
  }

  function onDragEnd() {
    draggingCardId = null;
    draggingFromColId = null;
    dropTargetColId = null;
  }

  function onDragOver(e: DragEvent, colId: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dropTargetColId = colId;
  }

  function onDragLeave(_e: DragEvent, colId: string) {
    if (dropTargetColId === colId) dropTargetColId = null;
  }

  async function onDrop(e: DragEvent, toColId: string) {
    e.preventDefault();
    dropTargetColId = null;
    if (!draggingCardId || !draggingFromColId || draggingFromColId === toColId) {
      draggingCardId = null;
      draggingFromColId = null;
      return;
    }

    const numericId = draggingCardId.replace('KC-', '');
    const card = columns
      .find((c) => c.id === draggingFromColId)
      ?.cards.find((c) => c.id === draggingCardId);

    if (!card) { draggingCardId = null; draggingFromColId = null; return; }

    // Optimistic local move — sort target column by current sort mode
    columns = columns.map((c) => {
      if (c.id === draggingFromColId) return { ...c, cards: c.cards.filter((card) => card.id !== draggingCardId) };
      if (c.id === toColId) {
        const merged = sortCards([...c.cards, card]);
        return { ...c, cards: merged };
      }
      return c;
    });

    draggingCardId = null;
    draggingFromColId = null;

    // Notify parent so sidebar timestamp / updater refreshes
    onUpdate({ kanban: JSON.stringify(columns) });

    // Persist to DB
    try {
      await fetch(`/api/kanban/${numericId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId: toColId })
      });
    } catch { /* best-effort */ }
  }
</script>

{#if columns.length === 0}
  <EmptyState icon={Columns3} title="No columns" description="Add cards via the database to populate this board" />
{:else}
  <div style="height: calc(100vh - 96px);" class="flex flex-col overflow-hidden">
    <!-- Type filter -->
    <div class="flex shrink-0 items-center gap-1.5 px-1 pt-1 pb-1.5">
      <span class="text-[9px] font-semibold tracking-wider text-cork-400 uppercase">Type:</span>
      {#each TYPE_KEYS as key}
        {@const active = activeTypes.has(key)}
        <button
          class="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium transition-all {active ? 'bg-cork-700 text-cork-50 shadow-sm' : 'bg-cork-200/60 text-cork-500 hover:bg-cork-300/60 hover:text-cork-700'}"
          onclick={() => toggleType(key)}
        >
          {#if typeIcon(key)}
            <svelte:component this={typeIcon(key)} class="size-2.5" />
          {/if}
          {typeLabel(key)}
        </button>
      {/each}
      {#if activeTypes.size > 0}
        <button
          class="cursor-pointer rounded-full px-2 py-0.5 text-[9px] font-medium text-cork-400 hover:text-cork-600"
          onclick={() => { activeTypes = new SvelteSet(); }}
        >Clear</button>
      {/if}
      <div class="flex-1"></div>
      <!-- Sort dropdown -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="relative" role="listbox">
        <button
          class="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium text-cork-500 hover:bg-cork-200/60 hover:text-cork-700"
          onclick={() => { sortOpen = !sortOpen; }}
        >Sort: {SORT_OPTIONS.find((o) => o.key === sortMode)?.label}</button>
        {#if sortOpen}
          <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
          <span
            class="fixed inset-0 z-10"
            role="button"
            tabindex="-1"
            onclick={() => { sortOpen = false; }}
          ></span>
          <div
            class="absolute right-0 top-full z-20 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            role="listbox"
            tabindex="-1"
            onclick={() => { sortOpen = false; }}
          >
            {#each SORT_OPTIONS as opt}
              <button
                class="block w-full cursor-pointer whitespace-nowrap px-3 py-1 text-left text-[10px] {sortMode === opt.key ? 'bg-cork-100 font-medium text-cork-800' : 'text-cork-600 hover:bg-cork-50'}"
                onclick={() => { sortMode = opt.key; sortOpen = false; }}
              >{opt.label}</button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="flex gap-4 px-1 pb-2 flex-1 overflow-x-auto [scrollbar-width:none]">
    {#each columns as col (col.id)}
      {@const dark = isColumnDark(col.color)}
      {@const wipExceeded = col.wipLimit !== null && col.cards.length > col.wipLimit}

      <div
        class="flex w-60 shrink-0 flex-col rounded-xl transition-all {dropTargetColId === col.id && draggingCardId !== null ? 'scale-[1.01]' : ''}"
        style="background: {col.color};"
        role="region"
        aria-label={col.title}
        ondragover={(e) => onDragOver(e, col.id)}
        ondragleave={(e) => onDragLeave(e, col.id)}
        ondrop={(e) => onDrop(e, col.id)}
      >
        <!-- Column header -->
        <div class="px-2.5 py-2 rounded-t-xl {dark ? 'bg-white/10' : 'bg-black/5'}">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold {dark ? 'text-white/90' : 'text-gray-700'}">{col.title}</h2>
            <span class="shrink-0 text-[10px] {dark ? 'text-white/50' : 'text-gray-500'}">
              {col.cards.length}{#if col.wipLimit !== null}/{col.wipLimit}{/if}
            </span>
            {#if wipExceeded}
              <span class="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold text-white" title="WIP limit exceeded">!</span>
            {/if}
          </div>
        </div>

        <!-- Cards -->
        <div class="flex-1 space-y-1.5 overflow-y-auto p-2.5 [scrollbar-width:none]" role="list">
          {#each sortCards(activeTypes.size > 0 ? col.cards.filter((c) => activeTypes.has(c.type)) : col.cards) as card (card.id)}
            {@const pri = priorityInfo(card.priority)}

            <div
              class="relative cursor-pointer rounded-r-lg bg-white px-2.5 py-1.5 transition-all duration-200 hover:shadow-md {draggingCardId === card.id ? 'z-10 scale-105 rotate-1 shadow-xl' : ''}"
              style="box-shadow: 0 1px 3px rgba(0,0,0,.06);border-left: 3px solid {pri.dot}"
              draggable="true"
              role="listitem"
              ondragstart={(e) => onDragStart(e, card.id, col.id)}
              ondragend={onDragEnd}
              onclick={() => toggleDescription(card.id)}
            >
              <!-- Title + ID -->
              <span class="font-mono text-[10px] text-gray-400">{card.id}</span>
              <h3 class="font-display text-sm leading-tight text-cork-800">{card.title}</h3>

              <!-- Description: hidden by default, click toggles full -->
              {#if card.description && expandedCards.has(card.id)}
                <p class="mt-0.5 text-[10px] leading-relaxed text-gray-500">{card.description}</p>
              {/if}

              <!-- Footer: type icon (left), colored assignee badge (right) -->
              <div class="mt-1 flex items-center gap-1.5 text-[9px]">
                {#if typeIcon(card.type)}
                  <span class="shrink-0 text-gray-400" title={card.type}>
                    <svelte:component this={typeIcon(card.type)} class="size-3" />
                  </span>
                {/if}
                {#if card.storyPoints}
                  <span class="text-gray-400">{card.storyPoints} SP</span>
                {/if}
                <div class="flex-1"></div>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span
                  class="relative cursor-pointer rounded-full px-1.5 py-0.5 font-medium"
                  style="background: {card.assignee ? assigneeColor(card.assignee) + '22' : '#e5e7eb'}; color: {card.assignee ? assigneeColor(card.assignee) : '#9ca3af'};"
                  onclick={(e) => { e.stopPropagation(); pickerCardId = pickerCardId === card.id ? null : card.id; }}
                  role="button"
                  tabindex="-1"
                >
                  {card.assignee || 'Assign'}
                  {#if pickerCardId === card.id}
                    <!-- backdrop -->
                    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
                    <span
                      class="fixed inset-0 z-10"
                      role="button"
                      tabindex="-1"
                      onclick={(e) => { e.stopPropagation(); closePicker(); }}
                    ></span>
                    <div
                      class="absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                      role="listbox"
                      tabindex="-1"
                      onclick={(e) => e.stopPropagation()}
                    >
                      {#each ['Kelvin', 'Edward'] as opt}
                        <button
                          class="block w-full cursor-pointer whitespace-nowrap px-3 py-1 text-left text-[10px] text-cork-700 hover:bg-cork-100"
                          onclick={(e) => { e.stopPropagation(); setAssignee(card.id, col.id, opt); }}
                        >
                          {opt}
                        </button>
                      {/each}
                      <button
                        class="block w-full cursor-pointer whitespace-nowrap px-3 py-1 text-left text-[10px] text-cork-400 hover:bg-cork-100"
                        onclick={(e) => { e.stopPropagation(); setAssignee(card.id, col.id, ''); }}
                      >
                        Unassign
                      </button>
                    </div>
                  {/if}
                </span>
              </div>
            </div>
          {/each}

          {#if col.cards.length === 0}
            <p class="py-4 text-center text-[10px] italic {dark ? 'text-white/40' : 'text-gray-400'}">
              No cards
            </p>
          {/if}
        </div>
      </div>
    {/each}
    </div>
  </div>
{/if}
