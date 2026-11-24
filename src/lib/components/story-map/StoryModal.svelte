<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { Story } from '$lib/types/story-map.js';
  import { PIC_COLORS, PIC_DEFAULT_HEX } from '$lib/constants/colors.js';
  import { normalizePrototypeImages, prototypeImageFrame } from '$lib/frameworks/prototypes.js';
  import PrototypeGallery from './PrototypeGallery.svelte';
  import Frown from '@lucide/svelte/icons/frown';

  let {
    open = $bindable(false),
    story,
    showPainPoints = true
  }: {
    open: boolean;
    story: Story | null;
    showPainPoints?: boolean;
  } = $props();

  let picHex = $derived(
    story ? (PIC_COLORS[story.picColor]?.hex ?? PIC_DEFAULT_HEX) : PIC_DEFAULT_HEX
  );
  let hasConnextra = $derived(story?.asA && story?.wantTo);
  let painNotes = $derived(
    (showPainPoints ? (story?.details ?? []) : [])
      .filter((detail) => detail.startsWith('Pain point:'))
      .map((detail) => detail.replace(/^Pain point:\s*/, ''))
  );
  const detailViews = [
    { id: 'story', label: 'Story' },
    { id: 'prototype', label: 'Screenshots' }
  ] as const;
  let activeView = $state<(typeof detailViews)[number]['id']>('story');
  let showingPrototype = $derived(activeView === 'prototype');
  let viewportHeight = $state(800);
  let headerHeight = $state(60);
  let galleryHeight = $derived(Math.max(48, viewportHeight - headerHeight - 192));
  let detailWidth = $derived.by(() => {
    if (!showingPrototype) return 420;
    const images = normalizePrototypeImages(story?.prototypeImages);
    if (!images.length) return 420;
    if (images.length > 1) return 1100;
    const frame = prototypeImageFrame(images[0]);
    const naturalWidth = Number.parseFloat(frame.maxWidth ?? '672');
    const ratio = frame.aspectRatio ?? (images[0].width ?? 16) / (images[0].height ?? 9);
    const imageWidth = Math.min(naturalWidth, Math.max(1, galleryHeight - 40) * ratio);
    return Math.min(1100, Math.max(420, imageWidth + 48));
  });
</script>

<svelte:window bind:innerHeight={viewportHeight} />

<Dialog.Root bind:open>
  <Dialog.Content
    class="flex max-h-[calc(100dvh-2rem)] flex-col gap-3 border-0 bg-transparent p-0 ring-0 sm:p-0"
    style="max-width: min(calc(100vw - 2rem), {detailWidth}px);"
    showCloseButton={false}
  >
    {#if story}
      <div
        class="flex min-h-0 flex-col gap-6 rounded-xl bg-gradient-to-br from-[#fdf6dc] to-[#f5e9a0] p-5 sm:p-6 {activeView ===
        'story'
          ? 'max-h-[calc(100dvh-8rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'overflow-hidden'}"
      >
        <div class="shrink-0" bind:clientHeight={headerHeight}>
          <Dialog.Header class="gap-1">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-cork-500">{story.id}</span>
              {#if story.pic}
                <Badge
                  class="text-[11px] font-semibold text-white"
                  style="background-color: {picHex};"
                >
                  {story.pic}
                </Badge>
              {:else}
                <Badge variant="secondary" class="bg-cork-200/70 text-[10px] text-cork-600">
                  No PIC
                </Badge>
              {/if}
            </div>
            <Dialog.Title class="text-lg font-bold text-cork-800">{story.title}</Dialog.Title>
          </Dialog.Header>
        </div>

        <Dialog.Description class="sr-only">
          {showingPrototype ? 'Screenshots' : 'Details'} for user story {story.id}.
        </Dialog.Description>

        <div class="flex min-h-0 flex-col justify-center gap-3">
          {#if showingPrototype}
            {#key story.id}
              <PrototypeGallery images={story.prototypeImages} maxHeight={galleryHeight} />
            {/key}
          {:else}
            {#if hasConnextra}
              <div class="rounded-sm bg-black/5 px-3.5 py-2.5 text-sm text-cork-700">
                <strong>As a</strong>
                {story.asA},
                <strong>I want to</strong>
                {story.wantTo}
                {#if story.soThat}
                  <strong>so that</strong> {story.soThat}
                {/if}
              </div>
            {/if}
            {#each painNotes as painNote, index (index)}
              <div
                class="flex items-start gap-2 rounded-sm bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700"
              >
                <Frown class="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
                <p>{painNote}</p>
              </div>
            {/each}
            {#if !hasConnextra && !painNotes.length}
              <p class="text-center text-xs text-cork-500">No details yet</p>
            {/if}
          {/if}
        </div>
      </div>
      <!-- Cancel the centered dialog's height to keep this switch at the viewport bottom. -->
      <div
        class="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-3 whitespace-nowrap"
        style="top: calc(50% + 50dvh - 3rem);"
        role="group"
        aria-label="Story view"
      >
        {#each detailViews as view, index (view.id)}
          {#if index > 0}
            <span class="text-xs text-cork-50/40" aria-hidden="true">|</span>
          {/if}
          <button
            type="button"
            class="cursor-pointer px-1 py-1 text-xs transition-colors outline-none hover:text-white {activeView ===
            view.id
              ? 'font-semibold text-white'
              : 'text-cork-50/60'}"
            aria-pressed={activeView === view.id}
            onclick={() => (activeView = view.id)}
          >
            {view.label}
          </button>
        {/each}
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
