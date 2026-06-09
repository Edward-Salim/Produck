<script lang="ts">
  import type { BacklogEpic, BacklogStory } from '$lib/types/story-map.js';
  import type { FrameworkInstance } from './types.js';
  import { KANO, KANO_ORDER } from '$lib/constants/colors.js';
  import {
    CircleCheck, Circle, ChevronRight, ChevronsDownUp, ChevronsUpDown,
    Square, SquareCheck, ClipboardList, Plus, X, Trash2
  } from '@lucide/svelte';
  import EmptyState from '$lib/components/ui/empty-state.svelte';
  import { SvelteSet } from 'svelte/reactivity';

  let { instance, draftMode, onUpdate }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  let epics = $state<BacklogEpic[]>([]);
  let prioritySortDir = $state<'asc' | 'desc'>('asc');

  $effect(() => {
    try {
      const parsed = JSON.parse(instance.values.backlog ?? '{"epics":[]}');
      epics = parsed.epics ?? [];
    } catch {
      epics = [];
    }
  });

  function save() {
    onUpdate({ ...instance.values, backlog: JSON.stringify({ epics }) });
  }

  function togglePrioritySort() {
    prioritySortDir = prioritySortDir === 'asc' ? 'desc' : 'asc';
  }

  let localEpics = $derived.by(() => {
    const dir = prioritySortDir === 'asc' ? 1 : -1;
    return epics.map((epic) => ({
      ...epic,
      stories: [...epic.stories].sort((a, b) => {
        const taskCmp = a.taskOrder - b.taskOrder;
        if (taskCmp !== 0) return taskCmp;
        return ((KANO_ORDER[a.kano] ?? 9) - (KANO_ORDER[b.kano] ?? 9)) * dir;
      })
    }));
  });

  let allPics = $derived.by(() => {
    const pics = new SvelteSet<string>();
    for (const epic of localEpics) {
      for (const story of epic.stories) {
        if (story.pic) pics.add(story.pic);
      }
    }
    return [...pics].sort();
  });

  let picDropdownOpen = $state<string | null>(null);

  function updatePic(story: BacklogStory, newPic: string) {
    story.pic = newPic;
    picDropdownOpen = null;
    save();
  }

  let expandedStories = new SvelteSet<string>();

  function toggleStory(id: string) {
    if (expandedStories.has(id)) expandedStories.delete(id);
    else expandedStories.add(id);
  }

  function expandAll() {
    for (const epic of localEpics) {
      for (const story of epic.stories) {
        if (story.acceptanceCriteria.length > 0) expandedStories.add(story.id);
      }
    }
  }

  function collapseAll() {
    expandedStories.clear();
  }

  let allExpanded = $derived.by(() => {
    const withAC = localEpics.flatMap((e) => e.stories).filter((s) => s.acceptanceCriteria.length > 0);
    return withAC.length > 0 && withAC.every((s) => expandedStories.has(s.id));
  });

  function isACChecked(story: BacklogStory, index: number): boolean {
    return story.checkedAcs.some((ac) => ac.index === index);
  }

  function getACTime(story: BacklogStory, index: number): string {
    const ac = story.checkedAcs.find((a) => a.index === index);
    if (!ac) return '';
    return new Date(ac.checkedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function isAllACDone(story: BacklogStory): boolean {
    if (story.acceptanceCriteria.length === 0) return false;
    return story.checkedAcs.length >= story.acceptanceCriteria.length;
  }

  function toggleAC(storyId: string, story: BacklogStory, index: number) {
    const current = [...story.checkedAcs];
    const existing = current.findIndex((a) => a.index === index);
    if (existing >= 0) {
      current.splice(existing, 1);
    } else {
      current.push({ index, checkedAt: new Date().toISOString() });
    }
    story.checkedAcs = current;
    const shouldBeDone = story.acceptanceCriteria.length > 0 && current.length >= story.acceptanceCriteria.length;
    story.done = shouldBeDone;
    save();
  }

  // ── Add/remove ──
  let newEpicCode = $state('');
  let newEpicTitle = $state('');

  function addEpic() {
    if (!newEpicCode.trim() || !newEpicTitle.trim()) return;
    epics = [...epics, { code: newEpicCode.trim(), title: newEpicTitle.trim(), actors: [], stories: [] }];
    newEpicCode = '';
    newEpicTitle = '';
    save();
  }

  function removeEpic(code: string) {
    epics = epics.filter((e) => e.code !== code);
    save();
  }

  function addStory(epicCode: string) {
    const story: BacklogStory = {
      id: `S${Date.now()}`,
      title: 'New Ticket',
      epic: epicCode,
      task: null,
      taskOrder: 0,
      kano: 'must-have',
      pic: '',
      picColor: '',
      done: false,
      acceptanceCriteria: [],
      checkedAcs: [],
      assumptions: []
    };
    epics = epics.map((e) => e.code === epicCode ? { ...e, stories: [...e.stories, story] } : e);
    save();
  }

  function removeStory(storyId: string) {
    epics = epics.map((e) => ({ ...e, stories: e.stories.filter((s) => s.id !== storyId) }));
    save();
  }

  function updateStoryField(storyId: string, field: keyof BacklogStory, value: unknown) {
    epics = epics.map((e) => ({
      ...e,
      stories: e.stories.map((s) => s.id === storyId ? { ...s, [field]: value } : s)
    }));
    save();
  }
</script>

<svelte:window onclick={() => (picDropdownOpen = null)} />

{#if draftMode === 'edit'}
  <div class="mb-3 flex items-center gap-2">
    <input bind:value={newEpicCode} placeholder="Epic code (e.g. A1)" class="w-16 rounded border border-cork-300/50 bg-white px-2 py-1 text-xs text-cork-800 outline-none" />
    <input bind:value={newEpicTitle} placeholder="Epic title" class="flex-1 rounded border border-cork-300/50 bg-white px-2 py-1 text-xs text-cork-800 outline-none" />
    <button type="button" class="cursor-pointer rounded bg-cork-700 px-2.5 py-1 text-xs font-medium text-cork-50 hover:bg-cork-800" onclick={addEpic}>
      <Plus class="size-3 inline" /> Epic
    </button>
  </div>
{/if}

{#if localEpics.length === 0}
  <EmptyState icon={ClipboardList} title="No tickets yet" description="Add epics and tickets via the database" />
{:else}
  <div class="overflow-hidden rounded-xl border border-cork-300/40 bg-cork-100">
    <div class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-300/40 bg-cork-200/30 px-3 py-2 text-[10px] font-bold tracking-widest text-cork-400 uppercase md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4">
      <div class="flex items-center gap-2">
        <button type="button" class="flex cursor-pointer items-center justify-center transition-colors hover:text-cork-700" onclick={() => (allExpanded ? collapseAll() : expandAll())} title={allExpanded ? 'Collapse all' : 'Expand all'}>
          {#if allExpanded}<ChevronsDownUp class="size-3.5" />{:else}<ChevronsUpDown class="size-3.5" />{/if}
        </button>
        <span>Ticket</span>
      </div>
      <button type="button" class="hidden cursor-pointer items-center gap-1 text-left transition-colors hover:text-cork-700 md:flex" onclick={togglePrioritySort}>
        Priority<span class="text-[8px]">{prioritySortDir === 'asc' ? '▼' : '▲'}</span>
      </button>
      <span class="hidden md:block">PIC</span>
      <span class="text-center">Status</span>
    </div>

    {#each localEpics as epic (epic.code)}
      <div class="flex items-center gap-2 border-b border-cork-400/15 bg-cork-400/10 px-3 py-2 md:px-4">
        <span class="font-display text-sm font-bold text-cork-700 md:text-base">{epic.code} — {epic.title}</span>
        <div class="flex-1"></div>
        {#if draftMode === 'edit'}
          <button type="button" class="cursor-pointer text-xs text-cork-500 hover:text-cork-700" onclick={() => addStory(epic.code)}><Plus class="size-3" /></button>
          <button type="button" class="cursor-pointer text-xs text-cork-300 hover:text-red-500" onclick={() => removeEpic(epic.code)}><Trash2 class="size-3" /></button>
        {/if}
      </div>

      {#each epic.stories as story (story.id)}
        {@const hasAC = story.acceptanceCriteria.length > 0}
        {@const isExpanded = expandedStories.has(story.id)}
        {@const allDone = isAllACDone(story)}
        {@const isDone = story.done || allDone}
        {@const kano = KANO[story.kano as keyof typeof KANO]}

        <div class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-400/10 px-3 py-2 transition-colors md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4 md:py-2.5 {hasAC ? 'cursor-pointer hover:bg-cork-200/40' : ''}"
          role={hasAC ? 'button' : undefined}
          tabindex={hasAC ? 0 : undefined}
          onclick={() => hasAC && toggleStory(story.id)}
          onkeydown={(e) => { if (hasAC && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleStory(story.id); } }}
        >
          <div class="flex min-w-0 items-center gap-1.5 md:gap-2">
            {#if hasAC}<ChevronRight class="size-3.5 shrink-0 text-cork-400 transition-transform {isExpanded ? 'rotate-90' : ''}" />{:else}<span class="w-3.5 shrink-0"></span>{/if}
            {#if draftMode === 'edit'}
              <input value={story.id} class="w-12 shrink-0 rounded border border-cork-300/50 bg-white px-1 py-0 text-[10px] font-mono text-cork-500 outline-none" oninput={(e) => updateStoryField(story.id, 'id', e.currentTarget.value)} />
              <input value={story.title} class="flex-1 min-w-0 rounded border border-cork-300/50 bg-white px-1 py-0 text-sm text-cork-800 outline-none" oninput={(e) => updateStoryField(story.id, 'title', e.currentTarget.value)} />
            {:else}
              <span class="shrink-0 font-mono text-xs text-cork-400">{story.id}</span>
              <span class="truncate text-sm font-medium {isDone ? 'text-cork-400 line-through' : 'text-cork-800'}">{story.title}</span>
            {/if}
            {#if story.task}<span class="shrink-0 text-[10px] text-cork-400">({story.task})</span>{/if}
          </div>

          <div class="hidden items-center gap-1.5 md:flex">
            <span class="size-2 shrink-0 rounded-full" style="background: {kano?.color ?? '#8a7e6b'};"></span>
            <span class="text-xs font-medium" style="color: {kano?.color ?? '#8a7e6b'};">{kano?.label ?? story.kano}</span>
          </div>

          <div class="relative hidden items-center md:flex" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
            <button type="button" class="cursor-pointer rounded-md border border-cork-300/50 bg-cork-200/40 px-2 py-1 text-xs font-medium text-cork-700 transition-colors hover:border-cork-400" onclick={() => (picDropdownOpen = picDropdownOpen === story.id ? null : story.id)}>
              {story.pic || '—'}
            </button>
            {#if picDropdownOpen === story.id}
              <div class="absolute top-full left-0 z-20 mt-1 min-w-24 overflow-hidden rounded-lg border border-cork-300 bg-cork-50 shadow-lg">
                {#each allPics as p (p)}
                  <button type="button" class="w-full cursor-pointer px-3 py-1.5 text-left text-xs text-cork-700 transition-colors hover:bg-cork-200/50 {p === story.pic ? 'bg-cork-200/60 font-medium' : ''}" onclick={() => updatePic(story, p)}>{p}</button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="flex items-center justify-center gap-1">
            {#if isDone}<CircleCheck class="size-5 text-cork-500" />{:else}<Circle class="size-5 text-cork-300" />{/if}
            {#if draftMode === 'edit'}
              <button type="button" class="cursor-pointer text-cork-300 hover:text-red-500" onclick={(e) => { e.stopPropagation(); removeStory(story.id); }}><X class="size-3.5" /></button>
            {/if}
          </div>
        </div>

        {#if isExpanded && hasAC}
          {#each story.acceptanceCriteria as ac, i (i)}
            {@const checked = isACChecked(story, i)}
            <div class="grid grid-cols-[1fr_40px] gap-1.5 border-b border-cork-400/8 bg-cork-100/30 px-3 py-1.5 md:grid-cols-[1fr_140px_120px_80px] md:gap-2 md:px-4">
              <div class="flex min-w-0 items-center gap-2 pl-5 md:pl-8">
                <button type="button" class="shrink-0 cursor-pointer" onclick={(e) => { e.stopPropagation(); toggleAC(story.id, story, i); }}>
                  {#if checked}<SquareCheck class="size-4 text-green-600" />{:else}<Square class="size-4 text-cork-400" />{/if}
                </button>
                <span class="text-xs {checked ? 'text-cork-400 line-through' : 'text-cork-600'}">{ac}</span>
              </div>
              <div class="hidden md:block"></div>
              <div class="hidden md:block"></div>
              <div class="flex items-center justify-end">
                {#if checked && getACTime(story, i)}<span class="text-[9px] text-cork-400">{getACTime(story, i)}</span>{/if}
              </div>
            </div>
          {/each}
        {/if}
      {/each}
    {/each}
  </div>
{/if}
