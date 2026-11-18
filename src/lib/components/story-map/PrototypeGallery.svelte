<script lang="ts">
  import Image from '@lucide/svelte/icons/image';
  import { SvelteSet } from 'svelte/reactivity';
  import { prototypeImageGroups, prototypeImageOverview } from '$lib/frameworks/prototypes.js';

  let { images, maxHeight = 600 }: { images: unknown; maxHeight?: number } = $props();
  let groups = $derived(prototypeImageGroups(images));
  const loaded = new SvelteSet<string>();
  const failed = new SvelteSet<string>();
</script>

<div
  class="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  style:max-height="{maxHeight}px"
>
  {#if groups.length}
    <div class="space-y-6">
      {#each groups as group, groupIndex (group.key)}
        <section aria-label={group.label || 'Screenshots'}>
          {#if groups.length > 1}
            <p class="mb-3 text-xs font-medium text-cork-700">Example {groupIndex + 1}</p>
          {/if}
          <div
            class="grid min-w-0 grid-cols-1 items-start gap-4 {group.images.length > 1
              ? 'sm:grid-cols-4'
              : ''}"
          >
            {#each group.images as image, imageIndex (image.id)}
              {@const frame = prototypeImageOverview(image)}
              <figure
                class="mx-auto w-full min-w-0 {group.images.length > 1
                  ? 'sm:col-span-2'
                  : ''} {group.images.length > 1 &&
                group.images.length % 2 === 1 &&
                imageIndex === group.images.length - 1
                  ? 'sm:col-start-2'
                  : ''}"
                style:max-width={frame.maxWidth}
              >
                <div class="relative overflow-hidden rounded-sm bg-black/5">
                  {#if failed.has(image.id)}
                    <p class="p-6 text-center text-xs text-cork-600">Image unavailable</p>
                  {:else}
                    {#if !loaded.has(image.id)}
                      <div
                        class="absolute inset-0 animate-pulse bg-black/5 motion-reduce:animate-none"
                        aria-hidden="true"
                      ></div>
                    {/if}
                    <img
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      class="relative block h-auto w-full"
                      loading="lazy"
                      onload={() => loaded.add(image.id)}
                      onerror={() => failed.add(image.id)}
                    />
                    {#if loaded.has(image.id)}
                      {#each frame.highlights as highlight, index (index)}
                        <div
                          class="pointer-events-none absolute rounded-[2px] border-2 border-red-400"
                          style:left="{highlight.x}%"
                          style:top="{highlight.y}%"
                          style:width="{highlight.width}%"
                          style:height="{highlight.height}%"
                          aria-hidden="true"
                        >
                          {#if highlight.step}
                            <span
                              class="absolute -top-2.5 -left-2.5 flex size-5 items-center justify-center rounded-full bg-red-400 text-[10px] font-bold text-white"
                              >{highlight.step}</span
                            >
                          {/if}
                        </div>
                      {/each}
                    {/if}
                  {/if}
                </div>
                <figcaption class="mt-2 text-xs text-cork-600">
                  {image.caption}
                  {#if frame.highlights.length}
                    <span class="sr-only"
                      >Highlighted: {frame.highlights
                        .map((highlight) =>
                          highlight.step
                            ? `Step ${highlight.step}: ${highlight.label}`
                            : highlight.label
                        )
                        .join(', ')}.</span
                    >
                  {/if}
                </figcaption>
              </figure>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <div
      class="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-sm bg-black/5 text-cork-500"
    >
      <Image class="size-8 opacity-60" />
      <span class="text-xs">Prototype or screenshot</span>
    </div>
  {/if}
</div>
