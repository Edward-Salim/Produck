<script lang="ts">
  import { IDEA_SECTIONS } from '$lib/constants/colors.js';
  import type { IdeaItem } from '$lib/types/story-map.js';
  import { Plus, X } from '@lucide/svelte';
  import type { FrameworkInstance } from './types.js';

  let {
    instance,
    draftMode,
    onUpdate
  }: {
    instance: FrameworkInstance;
    draftMode: 'edit' | 'view';
    onUpdate: (values: Record<string, string>, title?: string) => void;
  } = $props();

  let ideas = $state<IdeaItem[]>([]);
  let showAdd = $state(false);
  let addStatus = $state('triage');
  let newTitle = $state('');
  let newDescription = $state('');

  $effect(() => {
    try {
      ideas = JSON.parse(instance.values.ideas ?? '[]') as IdeaItem[];
    } catch {
      ideas = [];
    }
  });

  function save() {
    onUpdate({ ...instance.values, ideas: JSON.stringify(ideas) });
  }

  function ideasForSection(status: string): IdeaItem[] {
    return ideas.filter((i) => i.status === status);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function addIdea() {
    if (!newTitle.trim()) return;
    const idea: IdeaItem = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: addStatus,
      proposer: '',
      okrCode: '',
      createdAt: new Date().toISOString()
    };
    ideas = [idea, ...ideas];
    newTitle = '';
    newDescription = '';
    showAdd = false;
    save();
  }

  function updateIdeaField(id: string, field: keyof IdeaItem, value: string) {
    ideas = ideas.map((i) => (i.id === id ? { ...i, [field]: value } : i));
    save();
  }

  function deleteIdea(id: string) {
    ideas = ideas.filter((i) => i.id !== id);
    save();
  }

  // ── Drag and drop ──
  let draggingId = $state<string | null>(null);
  let dropTarget = $state<string | null>(null);

  function onDragStart(e: DragEvent, ideaId: string) {
    draggingId = ideaId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ideaId);
    }
  }

  function onDragEnd() {
    draggingId = null;
    dropTarget = null;
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
    if (!draggingId) return;
    const idea = ideas.find((i) => i.id === draggingId);
    if (!idea || idea.status === sectionKey) {
      draggingId = null;
      return;
    }
    ideas = ideas.map((i) => (i.id === draggingId ? { ...i, status: sectionKey } : i));
    draggingId = null;
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

  <div
    class="flex gap-3 overflow-x-auto [scrollbar-width:none]"
    style="min-height: calc(100vh - 300px);"
  >
    {#each IDEA_SECTIONS as section (section.key)}
      {@const sectionIdeas = ideasForSection(section.key)}
      {@const isDropping = dropTarget === section.key && draggingId !== null}

      <div
        class="flex w-56 shrink-0 flex-col rounded-xl transition-all {isDropping
          ? 'scale-[1.01] ring-2 ring-cork-500/50'
          : ''}"
        style="background: {section.bg};"
        ondragover={(e) => onDragOver(e, section.key)}
        ondragleave={(e) => onDragLeave(e, section.key)}
        ondrop={(e) => onDrop(e, section.key)}
        role="list"
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
          <p class="mt-0.5 text-[9px] {section.dark ? 'text-white/40' : 'text-cork-400'}">
            {section.desc}
          </p>
        </div>

        <div class="flex-1 space-y-2 overflow-y-auto p-2 [scrollbar-width:none]">
          {#each sectionIdeas as idea (idea.id)}
            <div
              class="group rounded-lg bg-white/60 p-3 text-left transition-all duration-200 hover:shadow-md {draggingId ===
              idea.id
                ? 'z-10 scale-105 rotate-2 shadow-xl ring-2 ring-cork-500/30'
                : ''}"
              style="box-shadow: 0 1px 3px rgba(0,0,0,.06);"
              draggable={draftMode === 'edit'}
              ondragstart={(e) => onDragStart(e, idea.id)}
              ondragend={onDragEnd}
            >
              <div class="mb-0.5 flex items-center justify-between">
                <span class="font-mono text-[9px] text-cork-400">{idea.id.slice(0, 8)}</span>
                {#if draftMode === 'edit'}
                  <button
                    type="button"
                    class="cursor-pointer text-cork-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                    onclick={() => deleteIdea(idea.id)}
                  >
                    <X class="size-3" />
                  </button>
                {/if}
              </div>
              {#if draftMode === 'edit'}
                <input
                  value={idea.title}
                  class="w-full rounded border border-transparent bg-transparent p-0 font-display text-sm leading-tight text-cork-800 transition-colors outline-none hover:border-cork-300/50 focus:border-cork-500/60 focus:bg-white/50 focus:px-1 focus:py-0.5"
                  oninput={(e) => updateIdeaField(idea.id, 'title', e.currentTarget.value)}
                />
                <textarea
                  value={idea.description}
                  placeholder="Description..."
                  rows="1"
                  class="mt-1 w-full resize-none rounded border border-transparent bg-transparent p-0 text-[10px] text-cork-500 transition-colors outline-none hover:border-cork-300/50 focus:border-cork-500/60 focus:bg-white/50 focus:px-1 focus:py-0.5"
                  oninput={(e) => updateIdeaField(idea.id, 'description', e.currentTarget.value)}
                ></textarea>
              {:else}
                <h3 class="font-display text-sm leading-tight text-cork-800">{idea.title}</h3>
                {#if idea.description}
                  <p class="mt-1 line-clamp-2 text-[10px] text-cork-500">{idea.description}</p>
                {/if}
              {/if}

              <div class="mt-2 flex items-center justify-between gap-1 text-[9px] text-cork-400">
                <span>{formatDate(idea.createdAt)}</span>
                <div class="flex items-center gap-1">
                  {#if idea.proposer}
                    <span class="rounded bg-cork-200/80 px-1 py-0.5 font-medium"
                      >{idea.proposer}</span
                    >
                  {/if}
                  {#if idea.okrCode}
                    <span class="rounded bg-cork-200/80 px-1 py-0.5 font-medium"
                      >{idea.okrCode}</span
                    >
                  {/if}
                </div>
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
      </div>
    {/each}
  </div>
</div>
