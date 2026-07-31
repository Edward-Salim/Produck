<script lang="ts">
  import { IDEA_SECTIONS } from '$lib/constants/colors.js';
  import type { IdeaCategory, IdeaItem } from '$lib/types/story-map.js';
  import { Plus, X } from '@lucide/svelte';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import type { FrameworkInstance } from './types.js';

  const IDEA_CATEGORIES: { key: IdeaCategory; label: string }[] = [
    { key: 'learning', label: 'Learning' },
    { key: 'catalog', label: 'Catalog' },
    { key: 'community', label: 'Community' },
    { key: 'growth', label: 'Growth' },
    { key: 'monetization', label: 'Monetization' }
  ];

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  let showAdd = $state(false);
  let addStatus = $state('triage');
  let newTitle = $state('');
  let newDescription = $state('');
  let expandedIdeaId = $state<string | null>(null);
  let ideas = $derived(parseIdeas(instance.values.ideas));
  const activeCategories = new SvelteSet<IdeaCategory>();
  const columnScrollRefs = new SvelteMap<string, HTMLElement>();
  let showColumnFade = $state<Record<string, boolean>>({});

  function parseIdeas(value: string | undefined): IdeaItem[] {
    try {
      return JSON.parse(value ?? '[]') as IdeaItem[];
    } catch {
      return [];
    }
  }

  function save() {
    onUpdate({ ...instance.values, ideas: JSON.stringify(ideas) });
  }

  function ideasForSection(status: string): IdeaItem[] {
    return ideas.filter(
      (i) =>
        i.status === status &&
        (activeCategories.size === 0 || (i.category && activeCategories.has(i.category)))
    );
  }

  function toggleCategory(category: IdeaCategory) {
    if (activeCategories.has(category)) activeCategories.delete(category);
    else activeCategories.add(category);
  }

  function checkColumnOverflow(sectionKey: string) {
    const column = columnScrollRefs.get(sectionKey);
    if (!column) return;
    const hasMoreBelow = column.scrollHeight - column.scrollTop - column.clientHeight > 4;
    if (showColumnFade[sectionKey] !== hasMoreBelow) {
      showColumnFade = { ...showColumnFade, [sectionKey]: hasMoreBelow };
    }
  }

  function scrollSpy(sectionKey: string) {
    return (node: HTMLElement) => {
      columnScrollRefs.set(sectionKey, node);
      const updateFade = () => requestAnimationFrame(() => checkColumnOverflow(sectionKey));
      const observer = new MutationObserver(updateFade);
      observer.observe(node, { childList: true, subtree: true });
      window.addEventListener('resize', updateFade);
      updateFade();

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', updateFade);
        columnScrollRefs.delete(sectionKey);
      };
    };
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function categoryLabel(category: IdeaCategory | undefined): string {
    return IDEA_CATEGORIES.find((item) => item.key === category)?.label ?? '';
  }

  function addIdea() {
    if (!newTitle.trim()) return;
    const idea: IdeaItem = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: addStatus,
      category: 'learning',
      proposer: 'AI',
      okrCode: '',
      createdAt: new Date().toISOString()
    };
    ideas = [idea, ...ideas];
    newTitle = '';
    newDescription = '';
    showAdd = false;
    save();
  }

  // ── Drag and drop ──
  let draggingId = $state<string | null>(null);
  let draggingFromSection = $state<string | null>(null);
  let dropTarget = $state<string | null>(null);
  let didDrag = $state(false);

  function onDragStart(e: DragEvent, ideaId: string, sectionKey: string) {
    didDrag = true;
    draggingId = ideaId;
    draggingFromSection = sectionKey;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ideaId);
    }
  }

  function onDragEnd() {
    draggingId = null;
    draggingFromSection = null;
    dropTarget = null;
  }

  function openIdeaFromCard(id: string) {
    if (didDrag) {
      didDrag = false;
      return;
    }
    expandedIdeaId = expandedIdeaId === id ? null : id;
  }

  function onDragOver(e: DragEvent, sectionKey: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    dropTarget = sectionKey;
  }

  function onDragLeave(_e: DragEvent, sectionKey: string) {
    if (dropTarget === sectionKey) dropTarget = null;
  }

  function onDrop(e: DragEvent, sectionKey: string) {
    e.preventDefault();
    dropTarget = null;
    if (!draggingId || draggingFromSection === sectionKey) {
      draggingId = null;
      draggingFromSection = null;
      return;
    }
    const idea = ideas.find((i) => i.id === draggingId);
    if (!idea) {
      draggingId = null;
      draggingFromSection = null;
      return;
    }
    ideas = ideas.map((i) => (i.id === draggingId ? { ...i, status: sectionKey } : i));
    draggingId = null;
    draggingFromSection = null;
    save();
  }
</script>

<div class="space-y-4">
  {#if draftMode === 'edit' && !showAdd}
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50 transition-colors hover:bg-cork-800"
      onclick={() => (showAdd = true)}
    >
      <Plus class="size-3.5" />
      Add Idea
    </button>
  {/if}

  {#if showAdd && draftMode === 'edit'}
    <div class="rounded-xl border border-cork-300/50 bg-white/60 p-3">
      <div class="mb-2 flex items-center gap-2">
        <select
          bind:value={addStatus}
          class="rounded border border-cork-300/50 bg-cork-100 px-2 py-1 text-xs text-cork-700 outline-none"
        >
          {#each IDEA_SECTIONS as s (s.key)}
            <option value={s.key}>{s.label}</option>
          {/each}
        </select>
        <div class="flex-1"></div>
        <button
          type="button"
          class="cursor-pointer text-cork-400 hover:text-cork-600"
          onclick={() => (showAdd = false)}
        >
          <X class="size-4" />
        </button>
      </div>
      <input
        bind:value={newTitle}
        placeholder="Idea title"
        class="mb-2 w-full rounded border border-cork-300/50 bg-cork-100 px-2 py-1.5 text-sm text-cork-800 outline-none placeholder:text-cork-400"
        onkeydown={(e) => {
          if (e.key === 'Enter') addIdea();
        }}
      />
      <textarea
        bind:value={newDescription}
        placeholder="Description (optional)"
        rows="2"
        class="mb-2 w-full resize-none rounded border border-cork-300/50 bg-cork-100 px-2 py-1.5 text-xs text-cork-700 outline-none placeholder:text-cork-400"
      ></textarea>
      <button
        type="button"
        class="cursor-pointer rounded bg-cork-700 px-3 py-1 text-xs font-medium text-cork-50 hover:bg-cork-800"
        onclick={addIdea}
      >
        Save
      </button>
    </div>
  {/if}

  <div class="flex flex-wrap items-center gap-1.5 px-1">
    <span class="mr-1 text-[10px] font-semibold tracking-wide text-cork-500 uppercase">Type</span>
    {#each IDEA_CATEGORIES as category (category.key)}
      <button
        type="button"
        class="cursor-pointer rounded-md border px-2 py-1 text-[10px] font-medium transition-colors {activeCategories.has(
          category.key
        )
          ? 'border-cork-700 bg-cork-700 text-white'
          : 'border-cork-300/70 bg-white/50 text-cork-600 hover:border-cork-500 hover:bg-white/80'}"
        aria-pressed={activeCategories.has(category.key)}
        onclick={() => toggleCategory(category.key)}
      >
        {category.label}
      </button>
    {/each}
    {#if activeCategories.size > 0}
      <button
        type="button"
        class="cursor-pointer px-1.5 py-1 text-[10px] font-medium text-cork-500 hover:text-cork-800"
        onclick={() => activeCategories.clear()}
      >
        Clear
      </button>
    {/if}
  </div>

  <div
    class="flex gap-3 overflow-x-auto [scrollbar-width:none]"
    style="height: max(24rem, calc(100vh - 340px));"
  >
    {#each IDEA_SECTIONS as section (section.key)}
      {@const sectionIdeas = ideasForSection(section.key)}
      {@const isDropping = dropTarget === section.key && draggingId !== null}

      <div
        class="flex w-56 shrink-0 flex-col rounded-xl transition-all {isDropping
          ? 'scale-[1.01]'
          : ''}"
        style="background: {section.bg};"
        ondragover={(e) => onDragOver(e, section.key)}
        ondragleave={(e) => onDragLeave(e, section.key)}
        ondrop={(e) => onDrop(e, section.key)}
        role="region"
        aria-label={section.label}
      >
        <div class="border-b px-3 py-2.5 {section.dark ? 'border-white/10' : 'border-cork-300/30'}">
          <div class="flex items-center gap-2">
            <h2 class="text-xs font-bold {section.dark ? 'text-white/90' : 'text-cork-700'}">
              {section.label}
            </h2>
            <span class="text-[10px] {section.dark ? 'text-white/50' : 'text-cork-400'}"
              >({sectionIdeas.length})</span
            >
          </div>
          <p class="mt-0.5 text-[9px] {section.dark ? 'text-white/75' : 'text-cork-600'}">
            {section.desc}
          </p>
        </div>

        <div class="relative min-h-0 flex-1">
          <div
            class="h-full space-y-2 overflow-y-auto p-2 [scrollbar-width:none]"
            {@attach scrollSpy(section.key)}
            onscroll={() => checkColumnOverflow(section.key)}
          >
            {#each sectionIdeas as idea (idea.id)}
              <div
                class="group cursor-pointer rounded-lg bg-white/60 p-3 text-left transition-all duration-200 hover:shadow-md {draggingId ===
                idea.id
                  ? 'z-10 scale-105 rotate-1 shadow-xl'
                  : ''}"
                style="box-shadow: 0 1px 3px rgba(0,0,0,.06);"
                draggable="true"
                role="button"
                tabindex="0"
                aria-expanded={expandedIdeaId === idea.id}
                ondragstart={(e) => onDragStart(e, idea.id, section.key)}
                ondragend={onDragEnd}
                onclick={() => openIdeaFromCard(idea.id)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openIdeaFromCard(idea.id);
                  }
                }}
              >
                <div class="mb-1 flex items-center justify-between gap-2 text-[9px] text-cork-400">
                  <span class="font-mono">{idea.id.slice(0, 8)}</span>
                  {#if idea.category}
                    <span class="font-semibold tracking-wide uppercase">
                      {categoryLabel(idea.category)}
                    </span>
                  {/if}
                </div>
                <h3 class="font-sans text-sm leading-snug font-semibold text-cork-800">
                  {idea.title}
                </h3>
                {#if idea.description && expandedIdeaId === idea.id}
                  <p class="mt-2 text-xs leading-relaxed whitespace-pre-wrap text-cork-600">
                    {idea.description}
                  </p>
                {/if}
                <div class="mt-2 flex items-center justify-between gap-1 text-[9px] text-cork-400">
                  <span>{formatDate(idea.createdAt)}</span>
                  {#if idea.proposer}
                    <span class="rounded bg-cork-200/80 px-1.5 py-0.5 font-medium">
                      {idea.proposer}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}

            {#if sectionIdeas.length === 0}
              <p
                class="py-4 text-center text-[10px] italic {section.dark
                  ? 'text-white/40'
                  : 'text-cork-400'}"
              >
                No ideas
              </p>
            {/if}
          </div>

          {#if showColumnFade[section.key]}
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-gradient-to-t {section.dark
                ? 'from-black/30 to-transparent'
                : 'from-black/15 to-transparent'}"
              aria-hidden="true"
            ></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
