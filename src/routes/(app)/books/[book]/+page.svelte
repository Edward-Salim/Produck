<script lang="ts">
  import { ArrowLeft, BookOpen, Clock3, FileText } from '@lucide/svelte';
  import { Tabs } from 'bits-ui';
  import SummaryText from '$lib/components/books/SummaryText.svelte';
  import type { BookSummaryBlock } from '$lib/data/book-summaries.js';
  import type { PageData } from './$types.js';

  let { data }: { data: PageData } = $props();
  const book = $derived(data.book);
  const authorPortraits = $derived(
    book.authorPortraits?.length
      ? book.authorPortraits
      : book.authorImage
        ? [{ name: book.author, src: book.authorImage, credit: undefined }]
        : []
  );
  function estimateReadingMinutes(summary: BookSummaryBlock[]) {
    const text = summary
      .map((block) =>
        typeof block === 'string' ? block : block.type === 'image' ? '' : block.items.join(' ')
      )
      .join(' ');
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  const sections = $derived([
    ...(book.parts ?? []).map((part) => ({
      id: `part-${part.number}`,
      label: part.label,
      title: part.title,
      pages: part.pages,
      chapterRange: part.chapterRange,
      summary: part.summary,
      readingMinutes: estimateReadingMinutes(part.summary),
      sourceUrl: undefined
    })),
    ...book.chapters.map((chapter) => ({
      id: `chapter-${chapter.number}`,
      label: chapter.label ?? `Chapter ${chapter.number}`,
      title: chapter.title,
      pages: chapter.pages,
      chapterRange: undefined,
      summary: chapter.summary,
      readingMinutes: estimateReadingMinutes(chapter.summary),
      sourceUrl: book.source.chapterUrl
    }))
  ]);
</script>

<svelte:head>
  <title>{book.title} | Books | Produck</title>
  <meta name="description" content={`Book summaries of ${book.title} by ${book.author}.`} />
</svelte:head>

<div class="mx-auto max-w-2xl px-2 py-2 sm:py-6 md:px-0">
  <div class="flex items-center justify-between gap-4">
    <a
      href="/books"
      aria-label="Back to library"
      class="inline-flex shrink-0 text-cork-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cork-700"
    >
      <ArrowLeft class="size-5" aria-hidden="true" />
    </a>
    {#if authorPortraits.length}
      <div class="flex min-w-0 flex-wrap justify-end gap-2">
        {#each authorPortraits as portrait (portrait.name)}
          <img
            src={portrait.src}
            alt={portrait.credit
              ? `Portrait of ${portrait.name}. Photo: ${portrait.credit}`
              : `Portrait of ${portrait.name}`}
            title={portrait.credit ? `${portrait.name}. Photo: ${portrait.credit}` : portrait.name}
            width="64"
            height="80"
            class="h-20 w-16 shrink-0 object-cover object-top"
          />
        {/each}
      </div>
    {/if}
  </div>

  <header class="mt-6 mb-7">
    <h1 class="text-3xl font-semibold tracking-tight text-cork-800">{book.title}</h1>
    <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cork-500">
      <span>{book.author}</span>
      {#if book.edition}
        <span class="text-cork-400">{book.edition.replace(/\bedition\b/i, 'ed.')}</span>
      {/if}
    </p>
  </header>

  {#if sections.length}
    {#key book.id}
      <Tabs.Root value={sections[0].id}>
        <Tabs.List
          aria-label="Book summaries"
          class="mb-6 flex gap-5 overflow-x-auto border-b border-cork-300/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {#each sections as section (section.id)}
            <Tabs.Trigger
              value={section.id}
              class="shrink-0 cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm text-cork-500 transition-colors hover:text-cork-800 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cork-700 data-[state=active]:border-cork-700 data-[state=active]:text-cork-800"
              >{section.label}</Tabs.Trigger
            >
          {/each}
        </Tabs.List>

        {#each sections as section (section.id)}
          <Tabs.Content
            value={section.id}
            class="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cork-700"
          >
            <h2 class="text-xl font-medium text-cork-800">{section.title}</h2>
            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cork-500">
              {#if section.chapterRange}
                <span class="inline-flex items-center gap-1.5">
                  <BookOpen class="size-3.5" aria-hidden="true" />
                  <span>{section.chapterRange.replace(/^Chapters?\s+/i, 'Ch. ')}</span>
                </span>
              {/if}
              <span class="inline-flex items-center gap-1.5">
                <Clock3 class="size-3.5" aria-hidden="true" />
                <span>{section.readingMinutes} min</span>
              </span>
              {#if section.sourceUrl}
                <a
                  href={section.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Source"
                  class="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-cork-700"
                >
                  <FileText class="size-3.5" aria-hidden="true" />
                  <span>pp. {section.pages}</span>
                </a>
              {:else}
                <span class="inline-flex items-center gap-1.5" title="Source">
                  <FileText class="size-3.5" aria-hidden="true" />
                  <span>pp. {section.pages}</span>
                </span>
              {/if}
            </div>
            <div class="mt-5 space-y-4 text-justify text-sm leading-[25px] text-cork-700">
              {#each section.summary as block, blockIndex (blockIndex)}
                {#if typeof block === 'string'}
                  <p><SummaryText text={block} /></p>
                {:else if block.type === 'image'}
                  <figure class="py-2">
                    <img
                      src={block.src}
                      alt={block.alt}
                      width={block.width}
                      height={block.height}
                      loading="lazy"
                      class="mx-auto h-auto w-full max-w-md mix-blend-multiply"
                    />
                    <figcaption class="mt-2 text-center text-xs text-cork-500">
                      {block.caption}
                    </figcaption>
                  </figure>
                {:else}
                  <svelte:element
                    this={block.type === 'numbered' ? 'ol' : 'ul'}
                    role="list"
                    class={block.type === 'numbered'
                      ? 'list-none space-y-2 pl-0'
                      : 'list-none space-y-1.5 pl-0'}
                  >
                    {#each block.items as item, index (index)}
                      <li class="flex items-start gap-3">
                        {#if block.type === 'numbered'}
                          <span
                            aria-hidden="true"
                            class="mt-[2.5px] flex size-5 shrink-0 items-center justify-center rounded-full border border-cork-300/70 text-center text-[10px] leading-none font-medium text-cork-600"
                            >{index + 1}</span
                          >
                        {:else}
                          <span
                            aria-hidden="true"
                            class="flex h-[25px] w-5 shrink-0 items-center justify-center"
                          >
                            <span class="size-1 rounded-full bg-current"></span>
                          </span>
                        {/if}
                        <span class="min-w-0">
                          <SummaryText text={item} label />
                        </span>
                      </li>
                    {/each}
                  </svelte:element>
                {/if}
              {/each}
            </div>
          </Tabs.Content>
        {/each}
      </Tabs.Root>
    {/key}
  {:else}
    <p class="text-sm text-cork-500">No summaries yet.</p>
  {/if}
</div>
