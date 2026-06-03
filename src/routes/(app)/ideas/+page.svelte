<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import type { IdeaItem } from './+page.server.js';
  import { IDEA_SECTIONS } from '$lib/constants/colors.js';

  let { data } = $props();

  const ideas = $derived(data.ideas as IdeaItem[]);

  const SECTIONS = IDEA_SECTIONS;

  function ideasForSection(status: string): IdeaItem[] {
    return ideas.filter((i) => i.status === status);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function openIdea(idea: IdeaItem) {
    goto(`/story-map?idea=${idea.id}`);
  }

  // ── Drag and drop ──
  let draggingId = $state<number | null>(null);
  let dropTarget = $state<string | null>(null);

  function onDragStart(e: DragEvent, ideaId: number) {
    draggingId = ideaId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(ideaId));
      // Use the card itself as drag image — offset to center under cursor
      const el = e.currentTarget as HTMLElement;
      e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
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

  function onDragLeave(e: DragEvent, sectionKey: string) {
    if (dropTarget === sectionKey) dropTarget = null;
  }

  async function onDrop(e: DragEvent, sectionKey: string) {
    e.preventDefault();
    dropTarget = null;
    if (draggingId === null) return;

    const idea = ideas.find((i) => i.id === draggingId);
    if (!idea || idea.status === sectionKey) {
      draggingId = null;
      return;
    }

    draggingId = null;
    await fetch('/api/idea', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idea.id, status: sectionKey })
    });
    invalidateAll();
  }
</script>

<svelte:head><title>Idea Bank - Produck</title></svelte:head>

<div>
  <header class="mb-5">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Idea Bank</h1>
    <p class="mt-0.5 text-sm text-cork-500">Product ideas from triage to release</p>
  </header>

  <div
    class="flex gap-3 overflow-x-auto [scrollbar-width:none]"
    style="height: calc(100vh - 180px);"
  >
    {#each SECTIONS as section (section.key)}
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
        <!-- Column header -->
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

        <!-- Column body -->
        <div class="flex-1 space-y-2 overflow-y-auto p-2 [scrollbar-width:none]">
          {#each sectionIdeas as idea (idea.id)}
            <button
              type="button"
              class="group w-full cursor-grab rounded-lg bg-white/60 p-3 text-left transition-all duration-200 hover:shadow-md active:cursor-grabbing {draggingId ===
              idea.id
                ? 'z-10 scale-105 rotate-2 shadow-xl ring-2 ring-cork-500/30'
                : ''}"
              style="box-shadow: 0 1px 3px rgba(0,0,0,.06);"
              onclick={() => openIdea(idea)}
              draggable="true"
              ondragstart={(e) => onDragStart(e, idea.id)}
              ondragend={onDragEnd}
            >
              <div class="mb-0.5 flex items-center justify-between">
                <span class="font-mono text-[9px] text-cork-400"
                  >I-{String(idea.id).padStart(3, '0')}</span
                >
              </div>
              <h3
                class="font-display text-sm leading-tight text-cork-800 group-hover:text-cork-900"
              >
                {idea.title}
              </h3>
              {#if idea.description}
                <p class="mt-1 line-clamp-2 text-[10px] text-cork-500">{idea.description}</p>
              {/if}

              <div class="mt-2 flex items-center justify-between gap-1 text-[9px] text-cork-400">
                <span>{formatDate(idea.createdAt)}</span>
                <div class="flex items-center gap-1">
                  {#if idea.proposer}
                    <span class="rounded bg-cork-200/80 px-1 py-0.5 font-medium"
                      >{idea.proposer.replace(/^@/, '')}</span
                    >
                  {/if}
                  {#if idea.okrCode}
                    <span class="rounded bg-cork-200/80 px-1 py-0.5 font-medium"
                      >{idea.okrCode}</span
                    >
                  {/if}
                </div>
              </div>
            </button>
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
