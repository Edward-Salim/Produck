<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Clock3 from '@lucide/svelte/icons/clock-3';
  import FileText from '@lucide/svelte/icons/file-text';
  import List from '@lucide/svelte/icons/list';
  import { Popover } from 'bits-ui';
  import { tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
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

  function sectionMenuNumber(number: number, chapterRange = '') {
    const chapterNumber = chapterRange.match(/\bChapter (\d+)\b/i)?.[1];
    const unnumbered =
      /^(Introduction|Preface|Conclusion|Epilogue|Postscript|Endnote|Appendix|Checklists)\b/i.test(
        chapterRange
      );
    return chapterNumber ?? (!unnumbered && number > 0 ? String(number) : undefined);
  }

  const sections = $derived([
    ...(book.parts ?? []).map((part) => ({
      id: `part-${part.number}`,
      title: part.title,
      menuNumber: sectionMenuNumber(part.number, part.chapterRange),
      pages: part.pages,
      chapterRange: part.chapterRange,
      summary: part.summary,
      stories: part.stories,
      readingMinutes: estimateReadingMinutes(part.summary),
      sourceUrl: undefined
    })),
    ...book.chapters.map((chapter) => ({
      id: `chapter-${chapter.number}`,
      title: chapter.title,
      menuNumber: sectionMenuNumber(chapter.number, chapter.label),
      pages: chapter.pages,
      chapterRange: undefined,
      summary: chapter.summary,
      stories: chapter.stories,
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
  const sectionStorageKey = $derived(
    `produck:book-section:${data.currentUser?.id ?? 'local'}:${book.id}`
  );
  const activeSection = $derived(
    (selection?.bookId === book.id
      ? sections.find((section) => section.id === selection?.sectionId)
      : undefined) ?? sections[0]
  );

  afterNavigate(() => {
    let sectionId: string | null = null;
    try {
      sectionId = window.localStorage.getItem(sectionStorageKey);
    } catch {
      // The reader remains usable when browser storage is unavailable.
    }
    selection =
      sectionId && sections.some((section) => section.id === sectionId)
        ? { bookId: book.id, sectionId }
        : null;
  });

  function selectSection(sectionId: string) {
    selection = { bookId: book.id, sectionId };
    focusSectionOnClose = true;
    openBookId = null;
    try {
      window.localStorage.setItem(sectionStorageKey, sectionId);
    } catch {
      // Selecting a section should still work if its position cannot be saved.
    }
  }

  function focusCurrentSection(event: Event) {
    event.preventDefault();
    const current = contentsPanel?.querySelector<HTMLButtonElement>('[aria-current="true"]');
    (current ?? contentsPanel)?.focus({ preventScroll: true });
    const list = current?.closest<HTMLElement>('.sections-scroll');
    if (!current || !list) return;

    requestAnimationFrame(() => {
      if (!current.isConnected || !list.isConnected) return;
      const itemBounds = current.getBoundingClientRect();
      const listBounds = list.getBoundingClientRect();
      if (itemBounds.top < listBounds.top) {
        list.scrollTop += itemBounds.top - listBounds.top;
      } else if (itemBounds.bottom > listBounds.bottom) {
        list.scrollTop += itemBounds.bottom - listBounds.bottom;
      }
    });
  }

  async function handleContentsClose(event: Event) {
    if (!focusSectionOnClose) return;
    event.preventDefault();
    focusSectionOnClose = false;
    await tick();
    if (!sectionHeading) return;
    sectionHeading.focus({ preventScroll: true });
    const scroller = sectionHeading.closest<HTMLElement>('[data-slot="sidebar-inset"]');
    if (!scroller) {
      sectionHeading.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    const toolbarHeight = scroller.querySelector<HTMLElement>(':scope > header')?.offsetHeight ?? 0;
    scroller.scrollTo({
      top:
        scroller.scrollTop +
        sectionHeading.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        toolbarHeight -
        16,
      behavior: 'instant'
    });
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
    <article aria-labelledby={sectionHeadingId} class="min-h-svh pb-20">
      <h2
        id={sectionHeadingId}
        bind:this={sectionHeading}
        tabindex="-1"
        class="text-xl font-medium text-cork-800 outline-none"
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
      {#key `${book.id}:${section.id}`}
        <div class="mt-5 space-y-4 text-justify text-sm leading-[25px] text-cork-700">
          {#each section.summary as block, blockIndex (blockIndex)}
            {#if typeof block === 'string'}
              <p><SummaryText text={block} stories={section.stories} /></p>
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
                      <SummaryText text={item} stories={section.stories} label />
                    </span>
                  </li>
                {/each}
              </svelte:element>
            {/if}
          {/each}
        </div>
      {/key}
    </article>

    {#key book.id}
      <Popover.Root
        open={openBookId === book.id}
        onOpenChange={(open) => (openBookId = open ? book.id : null)}
      >
        <Popover.Trigger
          aria-label="Show sections"
          title="Sections"
          class="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-40 flex size-12 cursor-pointer items-center justify-center rounded-lg bg-cork-100 text-cork-800 shadow-sm transition-colors hover:bg-cork-200 hover:text-cork-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cork-700 md:left-8"
        >
          <List class="size-6 drop-shadow-md" aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            bind:ref={contentsPanel}
            side="top"
            align="start"
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
              <ul role="list" class="list-none space-y-0.5">
                {#each sections as item (item.id)}
                  <li>
                    <button
                      type="button"
                      aria-current={item.id === activeSection.id ? 'true' : undefined}
                      onclick={() => selectSection(item.id)}
                      class="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm leading-5 transition-colors hover:bg-cork-200/50 focus-visible:outline-2 focus-visible:outline-cork-700 {item.id ===
                      activeSection.id
                        ? 'bg-cork-200/70 text-cork-900'
                        : 'text-cork-700'}"
                    >
                      <span class="flex size-5 shrink-0 items-center justify-center">
                        {#if item.menuNumber}
                          <span
                            class="flex size-5 items-center justify-center rounded-full border border-cork-300/70 text-[10px] leading-none font-medium tabular-nums"
                            >{item.menuNumber}</span
                          >
                        {:else}
                          <span aria-hidden="true" class="size-1 rounded-full bg-current"></span>
                        {/if}
                      </span>
                      <span class="min-w-0 flex-1">{item.title}</span>
                    </button>
                  </li>
                {/each}
              </ul>
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
