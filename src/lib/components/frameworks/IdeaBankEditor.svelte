<script lang="ts">
  import { IDEA_SECTIONS } from '$lib/constants/colors.js';
  import type { IdeaItem } from '$lib/types/story-map.js';
  import { Plus, Trash2, X } from '@lucide/svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
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

  let showAdd = $state(false);
  let addStatus = $state('triage');
  let newTitle = $state('');
  let newDescription = $state('');
  let selectedIdeaId = $state<string | null>(null);
  let detailsOpen = $state(false);
  let ideas = $derived(parseIdeas(instance.values.ideas));
  let selectedIdea = $derived(ideas.find((idea) => idea.id === selectedIdeaId) ?? null);

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

  function updateIdeaField(id: string, field: keyof IdeaItem, value: string) {
    ideas = ideas.map((i) => (i.id === id ? { ...i, [field]: value } : i));
    save();
  }

  function openIdea(id: string) {
    selectedIdeaId = id;
    detailsOpen = true;
  }

  function closeIdea() {
    detailsOpen = false;
  }

  function deleteIdea(id: string) {
    ideas = ideas.filter((i) => i.id !== id);
    if (selectedIdeaId === id) {
      detailsOpen = false;
      selectedIdeaId = null;
    }
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
    openIdea(id);
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

  <div
    class="flex gap-3 overflow-x-auto [scrollbar-width:none]"
    style="min-height: calc(100vh - 300px);"
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
          <p class="mt-0.5 text-[9px] {section.dark ? 'text-white/40' : 'text-cork-400'}">
            {section.desc}
          </p>
        </div>

        <div class="flex-1 space-y-2 overflow-y-auto p-2 [scrollbar-width:none]">
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
              <span class="mb-1 block font-mono text-[9px] text-cork-400">
                {idea.id.slice(0, 8)}
              </span>
              <h3 class="font-sans text-sm leading-snug font-semibold text-cork-800">
                {idea.title}
              </h3>
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
      </div>
    {/each}
  </div>
</div>

<Dialog.Root
  bind:open={detailsOpen}
  onOpenChange={(open) => {
    if (!open) selectedIdeaId = null;
  }}
>
  <Dialog.Content
    class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-lg"
    showCloseButton={false}
  >
    {#if selectedIdea}
      <button
        type="button"
        class="absolute top-4 right-4 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-cork-500 transition-colors hover:bg-cork-100 hover:text-cork-800"
        onclick={closeIdea}
        aria-label="Close"
      >
        <X class="size-4" />
      </button>
      <Dialog.Header>
        <Dialog.Title class="pr-8 font-display text-2xl text-cork-800">
          {selectedIdea.title}
        </Dialog.Title>
        <Dialog.Description class="sr-only">Details for {selectedIdea.title}</Dialog.Description>
      </Dialog.Header>

      {#if draftMode === 'edit'}
        <div class="space-y-3">
          <label class="block">
            <span class="text-xs font-medium text-cork-600">Title</span>
            <input
              value={selectedIdea.title}
              class="mt-1 w-full rounded-lg border border-cork-300 bg-white/60 px-3 py-2 text-sm outline-none focus:border-cork-500"
              oninput={(e) => updateIdeaField(selectedIdea.id, 'title', e.currentTarget.value)}
            />
          </label>
          <label class="block">
            <span class="sr-only">Description</span>
            <textarea
              value={selectedIdea.description}
              placeholder="Description"
              rows="5"
              class="w-full resize-y rounded-lg border border-cork-300 bg-white/60 px-3 py-2 text-sm outline-none placeholder:text-cork-400 focus:border-cork-500"
              oninput={(e) =>
                updateIdeaField(selectedIdea.id, 'description', e.currentTarget.value)}
            ></textarea>
          </label>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs font-medium text-cork-600">Status</span>
              <select
                value={selectedIdea.status}
                class="mt-1 w-full rounded-lg border border-cork-300 bg-white/60 px-3 py-2 text-sm outline-none focus:border-cork-500"
                onchange={(e) => updateIdeaField(selectedIdea.id, 'status', e.currentTarget.value)}
              >
                {#each IDEA_SECTIONS as section (section.key)}
                  <option value={section.key}>{section.label}</option>
                {/each}
              </select>
            </label>
            <label class="block">
              <span class="text-xs font-medium text-cork-600">Proposer</span>
              <input
                value={selectedIdea.proposer}
                class="mt-1 w-full rounded-lg border border-cork-300 bg-white/60 px-3 py-2 text-sm outline-none focus:border-cork-500"
                oninput={(e) => updateIdeaField(selectedIdea.id, 'proposer', e.currentTarget.value)}
              />
            </label>
          </div>
          <label class="block">
            <span class="text-xs font-medium text-cork-600">OKR code</span>
            <input
              value={selectedIdea.okrCode}
              class="mt-1 w-full rounded-lg border border-cork-300 bg-white/60 px-3 py-2 text-sm outline-none focus:border-cork-500"
              oninput={(e) => updateIdeaField(selectedIdea.id, 'okrCode', e.currentTarget.value)}
            />
          </label>
        </div>
      {:else}
        <div class="space-y-5">
          <p class="text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
            {selectedIdea.description || 'No description provided.'}
          </p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="rounded-lg bg-cork-100/80 p-3">
              <p class="text-[9px] font-semibold tracking-wider text-cork-400 uppercase">
                Proposer
              </p>
              <p class="mt-1 font-medium text-cork-700">{selectedIdea.proposer || 'AI'}</p>
            </div>
            <div class="rounded-lg bg-cork-100/80 p-3">
              <p class="text-[9px] font-semibold tracking-wider text-cork-400 uppercase">Created</p>
              <p class="mt-1 font-medium text-cork-700">{formatDate(selectedIdea.createdAt)}</p>
            </div>
            {#if selectedIdea.okrCode}
              <div class="col-span-2 rounded-lg bg-cork-100/80 p-3">
                <p class="text-[9px] font-semibold tracking-wider text-cork-400 uppercase">
                  OKR code
                </p>
                <p class="mt-1 font-medium text-cork-700">{selectedIdea.okrCode}</p>
              </div>
            {/if}
          </div>
        </div>
      {/if}

      {#if draftMode === 'edit'}
        <Dialog.Footer class="flex-row justify-between gap-2">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            onclick={() => deleteIdea(selectedIdea.id)}
          >
            <Trash2 class="size-3.5" />
            Delete
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-lg bg-cork-700 px-4 py-2 text-xs font-medium text-cork-50 hover:bg-cork-800"
            onclick={closeIdea}
          >
            Done
          </button>
        </Dialog.Footer>
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>
