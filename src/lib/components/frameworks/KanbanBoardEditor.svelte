<script lang="ts">
  import type { KanbanCard, KanbanColumn } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { Bug, Columns3, Sparkles, Wrench } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';

  let { instance, draftMode, onUpdate }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  // Kanban is always read-only — draftMode / onUpdate are accepted only for
  // compatibility with the framework editor contract.
  $effect(() => { draftMode; onUpdate; });

  const PRIORITY = [
    { key: 'none', label: 'None', dot: 'transparent' },
    { key: 'low', label: 'Low', dot: '#3b82f6' },
    { key: 'medium', label: 'Medium', dot: '#f59e0b' },
    { key: 'high', label: 'High', dot: '#f97316' },
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

  function isColumnDark(color: string): boolean {
    const hex = color.replace('#', '');
    if (hex.length < 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }

  function formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function isOverdue(iso: string): boolean {
    if (!iso) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(iso);
    if (isNaN(due.getTime())) return false;
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  function isDueToday(iso: string): boolean {
    if (!iso) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(iso);
    if (isNaN(due.getTime())) return false;
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  }

  function priorityInfo(key: string) {
    return PRIORITY.find((p) => p.key === key) ?? PRIORITY[0];
  }

  const TYPE_ICONS: Record<string, typeof Bug> = {
    bug: Bug,
    feature: Sparkles,
    improvement: Wrench,
    task: null as any
  };

  function typeIcon(type: string) {
    return TYPE_ICONS[type] ?? null;
  }

  // ── Drag and drop ──
  let draggingCardId = $state<string | null>(null);
  let draggingFromColId = $state<string | null>(null);
  let dropTargetColId = $state<string | null>(null);

  function onDragStart(e: DragEvent, cardId: string, colId: string) {
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

    // Optimistic local move with priority re-sort in target column
    const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    columns = columns.map((c) => {
      if (c.id === draggingFromColId) return { ...c, cards: c.cards.filter((card) => card.id !== draggingCardId) };
      if (c.id === toColId) {
        const merged = [...c.cards, card].sort(
          (a, b) => (priorityRank[a.priority] ?? 4) - (priorityRank[b.priority] ?? 4)
        );
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
  <div style="height: calc(100vh - 96px);" class="overflow-x-auto [scrollbar-width:none]">
    <div class="flex gap-4 px-1 pt-1 pb-2 h-full">
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
        <div class="flex-1 space-y-1 overflow-y-auto p-2.5 [scrollbar-width:none]" role="list">
          {#each col.cards as card (card.id)}
            {@const pri = priorityInfo(card.priority)}

            <div
              class="relative cursor-grab rounded-r-lg bg-white px-2.5 py-2 transition-all duration-200 hover:shadow-md active:cursor-grabbing {draggingCardId === card.id ? 'z-10 scale-105 rotate-1 shadow-xl' : ''}"
              style="box-shadow: 0 1px 3px rgba(0,0,0,.06);{card.priority !== 'none' ? `border-left: 3px solid ${pri.dot}` : ''}"
              draggable="true"
              role="listitem"
              ondragstart={(e) => onDragStart(e, card.id, col.id)}
              ondragend={onDragEnd}
            >
              <!-- Title -->
              <h3 class="font-display text-sm leading-tight text-cork-800">{card.title}</h3>

              <!-- Description: only in Blocked column -->
              {#if card.description && col.id === 'col-blocked'}
                <p class="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-gray-500">{card.description}</p>
              {/if}

              <!-- Footer: type icon + ID (left), due date, assignee (right) -->
              <div class="mt-1 flex items-center gap-1.5 text-[9px]">
                {#if typeIcon(card.type)}
                  <span class="shrink-0 text-gray-400" title={card.type}>
                    <svelte:component this={typeIcon(card.type)} class="size-3" />
                  </span>
                {/if}
                <span class="font-mono text-gray-400">{card.id}</span>
                {#if card.dueDate}
                  <span class="rounded-full px-1.5 py-0.5 font-medium {isOverdue(card.dueDate) ? 'bg-red-100 text-red-700' : isDueToday(card.dueDate) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}">
                    {isOverdue(card.dueDate) ? '⚠ ' : ''}{formatDate(card.dueDate)}
                  </span>
                {/if}
                <div class="flex-1"></div>
                {#if card.assignee}
                  <span class="rounded-full bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">{card.assignee}</span>
                {/if}
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
