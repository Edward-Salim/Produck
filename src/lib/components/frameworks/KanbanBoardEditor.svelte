<script lang="ts">
  import type { KanbanCard, KanbanColumn } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { browser } from '$app/environment';
  import { Ban, Bug, ClipboardList, Clock, Columns3, Search, Sparkles, Wrench, X } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import { SvelteSet } from 'svelte/reactivity';

  let { instance, draftMode, onUpdate, projectId, showHistory = $bindable(false) }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
    projectId?: string;
    showHistory?: boolean;
  } = $props();

  // Kanban fetches from DB directly — localStorage is not involved.
  $effect(() => { draftMode; });

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

  // ── Scroll indicator per column ──
  let columnScrollRefs = new Map<string, HTMLElement>();
  let showColumnFade = $state<Record<string, boolean>>({});

  function checkColumnOverflow(colId: string) {
    const el = columnScrollRefs.get(colId);
    if (!el) return;
    const canScroll = el.scrollHeight > el.clientHeight;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 4;
    showColumnFade = { ...showColumnFade, [colId]: canScroll && !atBottom };
  }

  function scrollSpy(node: HTMLElement, colId: string) {
    columnScrollRefs.set(colId, node);
    requestAnimationFrame(() => checkColumnOverflow(colId));
    return {
      update(newId: string) {
        if (newId !== colId) {
          columnScrollRefs.delete(colId);
          columnScrollRefs.set(newId, node);
          colId = newId;
          requestAnimationFrame(() => checkColumnOverflow(colId));
        }
      },
      destroy() {
        columnScrollRefs.delete(colId);
        const next = { ...showColumnFade };
        delete next[colId];
        showColumnFade = next;
      }
    };
  }

  $effect(() => {
    // Re-check overflow whenever rendered cards change
    columns.forEach((c) => c.cards.length);
    void activeTypes.size;
    void sortMode;
    requestAnimationFrame(() => {
      columns.forEach((c) => checkColumnOverflow(c.id));
    });
  });

  let loading = $state(true);

  async function loadKanban() {
    loading = true;
    try {
      const res = await fetch(`/api/kanban?projectId=${projectId}`);
      const data = await res.json();
      if (data.columns && Array.isArray(data.columns) && data.columns.length > 0) {
        columns = data.columns;
      } else {
        columns = DEFAULT_COLUMNS.map((c) => ({ ...c, cards: [] }));
      }
    } catch {
      columns = DEFAULT_COLUMNS.map((c) => ({ ...c, cards: [] }));
    }
    loading = false;
  }

  $effect(() => {
    if (projectId) loadKanban();
  });

  // ── History ──
  let history: Array<{ id: number; cardId: string; cardTitle: string; action: string; fromValue: string; toValue: string; actor: string; createdAt: string }> = $state([]);
  let historyLoading = $state(false);

  async function loadHistory() {
    historyLoading = true;
    try {
      const res = await fetch(`/api/kanban/activity?projectId=${projectId}`);
      const data = await res.json();
      history = data.activities ?? [];
    } catch {
      history = [];
    }
    historyLoading = false;
  }

  $effect(() => {
    if (showHistory) loadHistory();
  });

  function openHistory() {
    showHistory = true;
  }

  function actorInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  function formatHistoryTime(iso: string) {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  }

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
    onUpdate({});

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

  // ── Block modal ──
  let blockModalCardId = $state<string | null>(null);
  let blockReasonInput = $state('');
  let blockedByInput = $state('');
  let blockSearch = $state('');
  let blockDropdownOpen = $state(false);

  // Cards eligible to block this one: from To Do, In Progress, Review (not Blocked or Done)
  let blockableCards = $derived(
    columns
      .filter((c) => c.id !== 'col-blocked' && c.id !== 'col-done')
      .flatMap((c) => c.cards)
      .filter((c) => c.id !== blockModalCardId)
  );

  let filteredBlockableCards = $derived(
    blockSearch.trim()
      ? blockableCards.filter((c) =>
          `${c.id} ${c.title}`.toLowerCase().includes(blockSearch.toLowerCase().trim())
        )
      : blockableCards
  );

  function openBlockModal(card: KanbanCard) {
    blockModalCardId = card.id;
    blockReasonInput = card.blockReason ?? '';
    blockedByInput = card.blockedBy ?? '';
    blockSearch = '';
    blockDropdownOpen = false;
  }

  function closeBlockModal() {
    blockModalCardId = null;
    blockReasonInput = '';
    blockedByInput = '';
    blockSearch = '';
    blockDropdownOpen = false;
  }

  function selectBlockedBy(card: KanbanCard) {
    blockedByInput = card.id;
    blockDropdownOpen = false;
  }

  async function saveBlock() {
    if (!blockModalCardId) return;
    const cardId = blockModalCardId;
    const reason = blockReasonInput.trim();
    const by = blockedByInput.trim();

    // Optimistic local update
    columns = columns.map((c) => ({
      ...c,
      cards: c.cards.map((card) =>
        card.id === cardId ? { ...card, blockReason: reason, blockedBy: by } : card
      )
    }));
    closeBlockModal();
    onUpdate({});

    const numericId = cardId.replace('KC-', '');
    try {
      await fetch(`/api/kanban/${numericId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockReason: reason || null, blockedBy: by || null })
      });
    } catch { /* best-effort */ }
  }

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
    onUpdate({});

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

{#if loading}
  <div style="height: calc(100vh - 96px);" class="flex flex-col overflow-hidden">
    <div class="flex gap-4 px-1 pb-2 flex-1 overflow-x-auto [scrollbar-width:none]">
      {#each DEFAULT_COLUMNS as col}
        <div class="flex w-60 shrink-0 flex-col rounded-xl" style="background: {col.color};">
          <div class="px-2.5 py-2 rounded-t-xl bg-black/5">
            <div class="h-5 w-20 animate-pulse rounded bg-black/10"></div>
          </div>
          <div class="flex-1 space-y-1.5 p-2.5">
            {#each Array(col.id === 'col-todo' ? 4 : col.id === 'col-progress' ? 2 : col.id === 'col-done' ? 3 : 1) as _}
              <div class="rounded-r-lg bg-white px-2.5 py-1.5 animate-pulse" style="box-shadow: 0 1px 3px rgba(0,0,0,.06);border-left: 3px solid {col.id === 'col-blocked' ? '#fca5a5' : col.id === 'col-done' ? '#86efac' : '#cbd5e1'};">
                <div class="mb-1 h-3 w-12 rounded bg-gray-200"></div>
                <div class="h-4 w-full rounded bg-gray-100"></div>
                <div class="mt-1.5 flex items-center gap-1.5">
                  <div class="h-3 w-3 rounded bg-gray-200"></div>
                  <div class="h-3 w-6 rounded bg-gray-200"></div>
                  <div class="flex-1"></div>
                  <div class="h-4 w-10 rounded-full bg-gray-200"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else if columns.length === 0}
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
        <div class="relative flex-1 min-h-0">
          <div
            class="h-full space-y-1.5 overflow-y-auto p-2.5 [scrollbar-width:none]"
            role="list"
            use:scrollSpy={col.id}
            onscroll={() => checkColumnOverflow(col.id)}
          >
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

                <!-- Footer: blocked icon + type (left), assignee badge (right) -->
                <div class="mt-1 flex items-center gap-1.5 text-[9px]">
                  {#if col.id === 'col-blocked'}
                    <button
                      type="button"
                      class="shrink-0 cursor-pointer rounded p-0.5 {card.blockReason ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-400'}"
                      title={card.blockReason ? `Blocked by ${card.blockedBy || '?'}: ${card.blockReason}` : 'Add block reason'}
                      onclick={(e) => { e.stopPropagation(); openBlockModal(card); }}
                    >
                      <Ban class="size-3" />
                    </button>
                  {/if}
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
          {#if showColumnFade[col.id]}
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-xl {dark ? '' : 'bg-gradient-to-t from-black/15 to-transparent'}" style={dark ? 'background: linear-gradient(to top, rgba(255,255,255,0.2), transparent)' : ''}></div>
          {/if}
        </div>
      </div>
    {/each}
    </div>
  </div>
{/if}

<!-- Block reason modal -->
{#if blockModalCardId}
  {@const blockedCard = columns.flatMap(c => c.cards).find(c => c.id === blockModalCardId)}
  {@const selectedBlocker = blockableCards.find(c => c.id === blockedByInput)}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <span
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
    role="button"
    tabindex="-1"
    onclick={() => { if (blockDropdownOpen) { blockDropdownOpen = false; } else { closeBlockModal(); } }}
  ></span>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div class="pointer-events-auto w-full max-w-sm rounded-xl border border-cork-300 bg-white p-5 shadow-xl">
      {#if blockedCard}
        <span class="font-mono text-[10px] text-cork-400">{blockedCard.id}</span>
        <h3 class="font-display text-sm font-semibold text-cork-800">{blockedCard.title}</h3>
      {:else}
        <h3 class="font-display text-sm font-semibold text-cork-800">Block reason</h3>
      {/if}
      <div class="mt-3 space-y-3">
        <label class="block">
          <span class="text-[10px] font-medium text-cork-500">Blocked by</span>
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div class="relative mt-1">
            <button
              type="button"
              class="block w-full cursor-pointer rounded-lg border border-cork-300 bg-cork-50/50 px-3 py-1.5 text-left text-sm {selectedBlocker ? 'text-cork-800' : 'text-cork-400'}"
              onclick={() => { blockDropdownOpen = !blockDropdownOpen; blockSearch = ''; }}
            >
              {#if selectedBlocker}
                <span class="font-mono text-[10px] text-cork-400">{selectedBlocker.id}</span> {selectedBlocker.title}
              {:else}
                Select card...
              {/if}
            </button>
            {#if blockDropdownOpen}
              <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
              <span class="fixed inset-0 z-[60]" role="button" tabindex="-1" onclick={() => { blockDropdownOpen = false; }}></span>
              <div class="absolute left-0 top-full z-[70] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                <div class="flex items-center gap-1.5 border-b border-gray-100 px-2 py-1.5">
                  <Search class="size-3 shrink-0 text-cork-400" />
                  <input
                    type="text"
                    class="block w-full bg-transparent py-0.5 text-xs text-cork-800 outline-none focus:outline-none focus:ring-0 border-0"
                    placeholder="Find card..."
                    bind:value={blockSearch}
                    oninput={() => {}}
                  />
                </div>
                <div class="max-h-36 overflow-y-auto py-1">
                  {#each filteredBlockableCards as c}
                    <button
                      type="button"
                      class="block w-full cursor-pointer px-3 py-1.5 text-left text-xs {blockedByInput === c.id ? 'bg-cork-100 font-medium text-cork-800' : 'text-cork-600 hover:bg-cork-50'}"
                      onclick={() => selectBlockedBy(c)}
                    >
                      <span class="font-mono text-[10px] text-cork-400">{c.id}</span>
                      <span class="ml-1.5">{c.title}</span>
                    </button>
                  {/each}
                  {#if filteredBlockableCards.length === 0}
                    <p class="px-3 py-2 text-[10px] text-cork-400">No matching cards</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </label>
        <label class="block">
          <span class="text-[10px] font-medium text-cork-500">Reason</span>
          <textarea
            class="mt-1 block w-full rounded-lg border border-cork-300 bg-cork-50/50 px-3 py-1.5 text-sm text-cork-800 outline-none focus:border-cork-500 focus:ring-0"
            rows="3"
            placeholder="Why is this blocked?"
            bind:value={blockReasonInput}
          ></textarea>
        </label>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-cork-300 px-3 py-1.5 text-xs text-cork-500 hover:bg-cork-100"
          onclick={closeBlockModal}
        >Cancel</button>
        <button
          type="button"
          class="cursor-pointer rounded-lg bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50 hover:bg-cork-800"
          onclick={saveBlock}
        >Save</button>
      </div>
    </div>
  </div>
{/if}

<!-- History modal -->
{#if showHistory}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <span
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
    role="button"
    tabindex="-1"
    onclick={() => { showHistory = false; }}
  ></span>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
    <div class="pointer-events-auto w-full max-w-md rounded-xl border border-cork-300 bg-white p-5 shadow-xl">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-sm font-semibold text-cork-800">Activity</h3>
        <button type="button" class="cursor-pointer rounded p-0.5 text-cork-400 hover:text-cork-600" onclick={() => { showHistory = false; }}><X class="size-4" /></button>
      </div>
      <div class="mt-3 max-h-80 overflow-y-auto">
        {#if historyLoading}
          <p class="py-8 text-center text-xs text-cork-400">Loading...</p>
        {:else if history.length === 0}
          <p class="py-8 text-center text-xs text-cork-400">No activity yet</p>
        {:else}
          <div class="space-y-2">
            {#each history as entry}
              <div class="flex gap-2 rounded-lg bg-cork-50/60 px-3 py-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-cork-800">
                    <span class="font-mono text-[10px] text-cork-400">{entry.cardId}</span>
                    <span class="ml-1 font-medium">{entry.cardTitle}</span>
                  </p>
                  <p class="mt-0.5 text-[10px] text-cork-500">
                    {#if entry.action === 'move'}
                      Moved from <span class="font-medium text-cork-600">{entry.fromValue}</span> to <span class="font-medium text-cork-600">{entry.toValue}</span>
                    {:else if entry.action === 'assign'}
                      {#if entry.fromValue === 'unassigned'}
                        Assigned to <span class="font-medium text-cork-600">{entry.toValue}</span>
                      {:else if entry.toValue === 'unassigned'}
                        Unassigned (was <span class="font-medium text-cork-600">{entry.fromValue}</span>)
                      {:else}
                        Reassigned from <span class="font-medium text-cork-600">{entry.fromValue}</span> to <span class="font-medium text-cork-600">{entry.toValue}</span>
                      {/if}
                    {/if}
                  </p>
                  <p class="mt-0.5 flex items-center gap-1 text-[9px] text-cork-400">
                    <span class="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[7px] font-semibold text-white" style="background: {assigneeColor(entry.actor)};">{actorInitial(entry.actor)}</span>
                    {entry.actor} &middot; {formatHistoryTime(entry.createdAt)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
