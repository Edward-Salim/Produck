<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Clock3 from '@lucide/svelte/icons/clock-3';
  import FileText from '@lucide/svelte/icons/file-text';
  import List from '@lucide/svelte/icons/list';
  import { Popover } from 'bits-ui';
  import { tick } from 'svelte';
  import { page } from '$app/state';
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

  function sectionMenuTitle(title: string, number: number, chapterRange = '') {
    const chapterNumber = chapterRange.match(/\bChapter (\d+)\b/i)?.[1];
    const unnumbered = /^(Introduction|Conclusion|Postscript|Endnote|Appendix|Checklists)\b/i.test(
      chapterRange
    );
    const prefix = chapterNumber ?? (!unnumbered && number > 0 ? number : undefined);
    return prefix === undefined ? title : `${prefix}. ${title}`;
  }

  const sections = $derived([
    ...(book.parts ?? []).map((part) => ({
      id: `part-${part.number}`,
      title: part.title,
      menuTitle: sectionMenuTitle(part.title, part.number, part.chapterRange),
      pages: part.pages,
      chapterRange: part.chapterRange,
      summary: part.summary,
      readingMinutes: estimateReadingMinutes(part.summary),
      sourceUrl: undefined
    })),
    ...book.chapters.map((chapter) => ({
      id: `chapter-${chapter.number}`,
      title: chapter.title,
      menuTitle: sectionMenuTitle(chapter.title, chapter.number),
      pages: chapter.pages,
      chapterRange: undefined,
      summary: chapter.summary,
      readingMinutes: estimateReadingMinutes(chapter.summary),
      sourceUrl: book.source.chapterUrl
    }))
  ]);

  let selection = $state<{ bookId: string; sectionId: string } | null>(null);
  let openBookId = $state<string | null>(null);
  let sectionHeading = $state<HTMLHeadingElement | null>(null);
  let contentsPanel = $state<HTMLDivElement | null>(null);
  let focusSectionOnClose = false;
  const sectionHeadingId = $props.id();
  const activeSection = $derived(
    (selection?.bookId === book.id
      ? sections.find((section) => section.id === selection?.sectionId)
      : undefined) ?? sections[0]
  );

  function selectSection(sectionId: string) {
    selection = { bookId: book.id, sectionId };
    focusSectionOnClose = true;
    openBookId = null;
  }

  function focusCurrentSection(event: Event) {
    const current = contentsPanel?.querySelector<HTMLButtonElement>('[aria-current="true"]');
    if (current) {
      event.preventDefault();
      current.focus({ preventScroll: true });
      current.scrollIntoView({ block: 'nearest' });
    }
  }

  async function handleContentsClose(event: Event) {
    if (!focusSectionOnClose) return;
    event.preventDefault();
    focusSectionOnClose = false;
    await tick();
    sectionHeading?.focus({ preventScroll: true });
    sectionHeading?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
</script>

<svelte:head>
  <title>{book.title} | Books | Produck</title>
  <meta name="description" content={`Book summaries of ${book.title} by ${book.author}.`} />
</svelte:head>

<div class="mx-auto max-w-2xl px-2 py-2 sm:py-6 md:px-0">
  <div class="flex items-center justify-between gap-4">
    <a
      href={page.url.searchParams.get('shelf') === 'misc' ? '/books?shelf=misc' : '/books'}
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

  <header class="mt-6 mb-7 text-right">
    <h1 class="text-3xl font-semibold tracking-tight text-cork-800">{book.title}</h1>
    <p class="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm text-cork-500">
      <span>{book.author}</span>
      {#if book.edition}
        <span class="text-cork-400">{book.edition.replace(/\bedition\b/i, 'ed.')}</span>
      {/if}
    </p>
  </header>

  {#if activeSection}
    {@const section = activeSection}
    <hr class="mb-6 border-cork-300/50" />
    <article aria-labelledby={sectionHeadingId} class="pb-20">
      <h2
        id={sectionHeadingId}
        bind:this={sectionHeading}
        tabindex="-1"
        class="scroll-mt-36 text-xl font-medium text-cork-800 outline-none"
      >
        {section.title}
      </h2>
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
    </article>

    {#key book.id}
      <Popover.Root
        open={openBookId === book.id}
        onOpenChange={(open) => (openBookId = open ? book.id : null)}
      >
        <Popover.Trigger
          aria-label="Show sections"
          title="Sections"
          class="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-cork-800 text-cork-50 shadow-lg transition-colors hover:bg-cork-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cork-700 md:right-8"
        >
          <List class="size-5" aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            bind:ref={contentsPanel}
            side="top"
            align="end"
            sideOffset={12}
            collisionPadding={16}
            aria-label="Book sections"
            role="dialog"
            onOpenAutoFocus={focusCurrentSection}
            onCloseAutoFocus={handleContentsClose}
            class="z-[60] flex max-h-[min(65dvh,var(--bits-popover-content-available-height))] w-[min(16rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-cork-300 bg-cork-50 text-cork-800 shadow-xl outline-none"
          >
            <nav
              aria-label="Book sections"
              class="sections-scroll min-h-0 overflow-y-auto overscroll-contain p-1.5"
            >
              <ol class="space-y-0.5">
                {#each sections as item (item.id)}
                  <li>
                    <button
                      type="button"
                      aria-current={item.id === activeSection.id ? 'true' : undefined}
                      onclick={() => selectSection(item.id)}
                      class="w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm leading-5 transition-colors hover:bg-cork-200/50 focus-visible:outline-2 focus-visible:outline-cork-700 {item.id ===
                      activeSection.id
                        ? 'bg-cork-200/70 text-cork-900'
                        : 'text-cork-700'}"
                    >
                      {item.menuTitle}
                    </button>
                  </li>
                {/each}
              </ol>
            </nav>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    {/key}
  {:else}
    <p class="text-sm text-cork-500">No summaries yet.</p>
  {/if}
</div>

<style>
  .sections-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--color-cork-300) transparent;
    scrollbar-gutter: stable;
  }

  .sections-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .sections-scroll::-webkit-scrollbar-track {
    margin-block: 0.375rem;
    background: transparent;
  }

  .sections-scroll::-webkit-scrollbar-thumb {
    border: 1px solid var(--color-cork-50);
    border-radius: 999px;
    background: var(--color-cork-300);
  }

  .sections-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--color-cork-400);
  }
</style>
