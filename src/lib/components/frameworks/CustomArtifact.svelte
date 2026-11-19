<script lang="ts">
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Info from '@lucide/svelte/icons/info';
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
  import PrototypeGallery from '$lib/components/story-map/PrototypeGallery.svelte';
  import {
    artifactLinkHref,
    parseCustomArtifact,
    type ArtifactBlock,
    type ArtifactLink,
    type ArtifactText
  } from '$lib/frameworks/custom-artifacts.js';
  import { normalizePrototypeImages } from '$lib/frameworks/prototypes.js';
  import type { FrameworkInstance } from './types.js';

  let { instance, projectId }: { instance: FrameworkInstance; projectId: string } = $props();
  let document = $derived(parseCustomArtifact(instance.values.document));
  let outline = $derived(
    document?.blocks.filter((block) => block.type !== 'callout' && block.title?.trim()) ?? []
  );

  const badgeClass = {
    neutral: 'bg-cork-200 text-cork-800',
    success: 'bg-[#e1ecd9] text-[#385338]',
    warning: 'bg-[#f3e5ca] text-[#694918]'
  };
  const surfaceClass = 'rounded-xl shadow-[0_1px_3px_rgba(57,45,27,0.045)]';
  const paperSurfaceClass = `${surfaceClass} bg-[#fffcf6]`;
  const linkClass =
    'font-medium break-words text-[#36533c] underline decoration-[#749178]/60 underline-offset-3 hover:decoration-current focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3';
  const calloutStyles = {
    neutral: { Icon: Info, background: 'bg-[#eaf1f5]', icon: 'bg-[#d7e6ef] text-[#315372]' },
    success: { Icon: CircleCheck, background: 'bg-[#eaf3e7]', icon: 'bg-[#d8e9d3] text-[#365e39]' },
    warning: {
      Icon: TriangleAlert,
      background: 'bg-[#fcf1dc]',
      icon: 'bg-[#f3e1ba] text-[#80561d]'
    }
  };
</script>

{#snippet link(item: ArtifactLink, showArrow = true)}
  {@const href = artifactLinkHref(item.href)}
  {#if href}
    <a {href} class={linkClass}>
      {item.label}{#if showArrow}<ArrowUpRight
          class="ml-0.5 inline size-3 align-baseline"
          aria-hidden="true"
        />{/if}
    </a>
  {:else}
    {item.label}
  {/if}
{/snippet}

{#snippet inlineText(content: ArtifactText)}
  {#if typeof content === 'string'}
    {content}
  {:else}
    {#each content as part, index (index)}
      {#if typeof part === 'string'}
        {part}
      {:else if part.type === 'strong'}
        <strong class="font-semibold text-cork-900">{part.text}</strong>
      {:else}
        {@render link(part, false)}
      {/if}
    {/each}
  {/if}
{/snippet}

{#snippet links(items: ArtifactLink[])}
  <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
    {#each items as item, index (index)}
      <li>{@render link(item)}</li>
    {/each}
  </ul>
{/snippet}

{#snippet contentBlocks(blocks: ArtifactBlock[], spacing = '')}
  <div class="space-y-6 sm:space-y-8 [&>[data-brief-heading]]:mb-2 {spacing}">
    {#each blocks as block (block.id)}
      {#if block.type === 'expand'}
        <details
          id={block.id}
          class="scroll-mt-24 [&[open]>summary>svg]:rotate-180 {paperSurfaceClass}"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium hover:bg-cork-100/65 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"
          >
            {block.title}
            <ChevronDown
              class="size-4 shrink-0 text-cork-600 transition-transform"
              aria-hidden="true"
            />
          </summary>
          <div class="px-4 pt-1 pb-4">
            {#if block.text !== undefined}
              <p class="text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
                {@render inlineText(block.text)}
              </p>
            {/if}
            {#if block.blocks?.length}
              {@render contentBlocks(block.blocks, block.text !== undefined ? 'mt-4' : '')}
            {/if}
            {#if block.links?.length}{@render links(block.links)}{/if}
          </div>
        </details>
      {:else if block.type === 'callout'}
        {@const callout = calloutStyles[block.tone]}
        <aside
          class="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5 {surfaceClass} {callout.background}"
          aria-labelledby={block.title ? block.id : undefined}
        >
          <span class="grid size-8 shrink-0 place-items-center rounded-lg {callout.icon}">
            <callout.Icon class="size-[18px]" aria-hidden="true" />
          </span>
          <div class="min-w-0 py-0.5">
            {#if block.title}
              <h2 id={block.id} class="mb-1 text-sm font-semibold text-cork-900 sm:text-base">
                {block.title}
              </h2>
            {/if}
            <p class="max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
              {@render inlineText(block.text)}
            </p>
            {#if block.links?.length}{@render links(block.links)}{/if}
          </div>
        </aside>
      {:else}
        <section class="min-w-0" data-brief-heading={block.type === 'heading' ? '' : undefined}>
          {#if block.title}
            {@const isSubheading = block.type === 'heading' && block.level === 3}
            <svelte:element
              this={isSubheading ? 'h3' : 'h2'}
              id={block.id}
              class="scroll-mt-24 font-sans leading-tight font-semibold text-cork-800 {isSubheading
                ? 'text-base sm:text-lg'
                : 'text-xl sm:text-2xl'} {block.type === 'heading' ? '' : 'mb-3'}"
            >
              {block.title}
            </svelte:element>
          {/if}

          {#if block.type === 'table'}
            <div class="overflow-x-auto {paperSurfaceClass}">
              <table
                class="w-full min-w-[26rem] text-left text-sm"
                aria-labelledby={block.title ? block.id : undefined}
              >
                <thead class="bg-cork-200">
                  <tr>
                    {#each block.columns as column, index (index)}
                      <th scope="col" class="px-3 py-2.5 font-semibold sm:px-4">{column}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody class="divide-y divide-cork-300/30 text-cork-700">
                  {#each block.rows as row, rowIndex (rowIndex)}
                    <tr>
                      {#each row as cell, index (index)}
                        <td class="px-3 py-2.5 align-top sm:px-4">
                          {#if typeof cell === 'string'}
                            {cell}
                          {:else if cell.type === 'link'}
                            {@render link(cell)}
                          {:else}
                            <span
                              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {badgeClass[
                                cell.tone
                              ]}">{cell.label}</span
                            >
                          {/if}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else if block.type === 'gallery'}
            <div class="{paperSurfaceClass} p-3 sm:p-4">
              <PrototypeGallery
                images={normalizePrototypeImages(block.images).filter((image) =>
                  image.src.startsWith(`/api/story-prototypes/${projectId}/`)
                )}
                maxHeight={null}
              />
            </div>
          {:else if block.type === 'list'}
            <svelte:element
              this={block.ordered ? 'ol' : 'ul'}
              class="max-w-3xl space-y-1.5 ps-6 text-sm leading-relaxed text-cork-700 marker:font-semibold marker:text-cork-600 {block.ordered
                ? 'list-decimal'
                : 'list-disc'}"
              aria-labelledby={block.title ? block.id : undefined}
            >
              {#each block.items as item, index (index)}
                <li class="ps-1 whitespace-pre-wrap">{@render inlineText(item)}</li>
              {/each}
            </svelte:element>
          {:else if block.type === 'text'}
            <p class="max-w-3xl text-sm leading-relaxed whitespace-pre-wrap text-cork-700">
              {@render inlineText(block.text)}
            </p>
          {/if}
          {#if block.links?.length}{@render links(block.links)}{/if}
        </section>
      {/if}
    {/each}
  </div>
{/snippet}

<article class="min-w-0 px-1 py-2 text-cork-800 sm:px-2 sm:py-4">
  <header>
    <h1 class="font-sans text-3xl leading-tight font-semibold text-cork-900 sm:text-4xl">
      {instance.title}
    </h1>
    {#if document?.summary}
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-cork-700 sm:text-base">
        {@render inlineText(document.summary)}
      </p>
    {/if}
  </header>

  {#if outline.length > 1}
    <nav aria-label="On this page" class="mt-5 max-w-sm">
      <p class="text-sm font-semibold text-cork-900">On this page</p>
      <ul class="mt-1 space-y-0.5 text-sm">
        {#each outline as block (block.id)}
          <li class={{ 'ps-4': block.type === 'heading' && block.level === 3 }}>
            <a href={`#${encodeURIComponent(block.id)}`} class="inline-block py-0.5 {linkClass}">
              {block.title}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}

  {#if document?.blocks.length}
    {@render contentBlocks(document.blocks, 'mt-6 sm:mt-8')}
  {:else}
    <p class="px-2 py-8 text-sm text-cork-600">No content available.</p>
  {/if}
</article>
