<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import { bookShelfCapacity, bookShelfSpan, fitBookShelves } from '$lib/data/book-shelves.js';
  import type { PageData } from './$types.js';
  import { longPress } from '$lib/attachments/long-press.js';
  import { horizontalSwipe } from '$lib/attachments/horizontal-swipe.js';
  import type { BookLibraryItem } from '$lib/data/book-summaries.js';

  let { data }: { data: PageData } = $props();
  let rackWidth = $state<number>();
  const categories = ['work', 'misc'] as const;
  const activeCategory = $derived(
    page.state.bookShelf ?? (page.url.searchParams.get('shelf') === 'misc' ? 'misc' : 'work')
  );
  const shelves = $derived({
    work: fitBookShelves(data.shelves.work, rackWidth),
    misc: fitBookShelves(data.shelves.misc, rackWidth)
  });
  const rowCount = $derived(Math.max(3, shelves.work.length, shelves.misc.length));
  const shelfSlots = $derived(bookShelfCapacity(rackWidth));
  let downloadStatus = $state('');

  function showShelf(direction: 'previous' | 'next') {
    const category = direction === 'next' ? 'misc' : 'work';
    if (category === activeCategory) return;
    const url = new URL(page.url);
    if (category === 'misc') url.searchParams.set('shelf', 'misc');
    else url.searchParams.delete('shelf');
    replaceState(url, { ...page.state, bookShelf: category });
  }

  function downloadBook(book: BookLibraryItem) {
    const link = document.createElement('a');
    link.href = `/api/books/${book.id}/download`;
    link.download = '';
    document.body.append(link);
    link.click();
    link.remove();
    downloadStatus = `Download started for ${book.title}.`;
  }
</script>

<svelte:head>
  <title>Books | Produck</title>
  <meta name="description" content="Your book library." />
</svelte:head>

<div class="library-backdrop -mx-4 -mt-6 -mb-6 md:-mx-6">
  <h1 class="sr-only">Books</h1>
  <p class="sr-only" role="status">{activeCategory === 'work' ? 'Work' : 'Misc'} book shelf</p>
  <div class="shelf-controls">
    <button
      type="button"
      onclick={() => showShelf('previous')}
      aria-label="Previous shelf: Work"
      disabled={activeCategory === 'work'}
      aria-controls="library-shelves"
      class="shelf-arrow"
    >
      <ChevronLeft size={20} aria-hidden="true" />
    </button>
    <div
      class="shelf-viewport"
      bind:clientWidth={rackWidth}
      {@attach horizontalSwipe((direction) =>
        showShelf(direction === 'left' ? 'next' : 'previous')
      )}
    >
      <div id="library-shelves" class={['shelf-track', { 'show-misc': activeCategory === 'misc' }]}>
        {#each categories as category (category)}
          <nav
            aria-label={`${category === 'work' ? 'Work' : 'Misc'} book shelf`}
            aria-hidden={activeCategory !== category}
            inert={activeCategory !== category}
            class="bookcase"
            style={`--shelf-rows: ${rowCount};`}
          >
            {#each Array.from({ length: rowCount }, (_, index) => shelves[category][index] ?? []) as shelf, index (index)}
              <div class="shelf-row">
                <div class="book-row" style={`--book-count: ${shelfSlots};`}>
                  {#each shelf as book, bookIndex (book.id)}
                    <a
                      href={`/books/${book.id}${category === 'misc' ? '?shelf=misc' : ''}`}
                      aria-label={`Open ${book.title}`}
                      title={book.hasDownload
                        ? `${book.title}: click to read, hold or Alt+Enter to download PDF`
                        : book.title}
                      {@attach book.hasDownload && longPress(() => downloadBook(book))}
                      class={[
                        'book focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cork-700',
                        {
                          'trim-cover':
                            book.id === 'user-story-mapping' ||
                            book.id === 'storytelling-with-data' ||
                            book.id === 'founders-dilemmas' ||
                            book.id === 'psychology-of-money' ||
                            book.id === 'art-of-spending-money' ||
                            book.id === 'atomic-habits' ||
                            book.id === 'paytech',
                          'landscape-book': book.id === 'paytech',
                          'downloadable-book': book.hasDownload
                        }
                      ]}
                      style={`--book-span: ${bookShelfSpan(book, rackWidth)}; --landscape-width: ${bookShelfCapacity(rackWidth) > 1 ? '135%' : '100%'}; --tilt: ${[-2, 1, -1.5][(index + bookIndex) % 3]}deg;`}
                    >
                      <img
                        src={book.cover}
                        alt={`${book.title} cover`}
                        draggable="false"
                        class="block h-auto w-full rounded-[inherit]"
                      />
                    </a>
                  {/each}
                </div>
                <div class="retaining-rail" aria-hidden="true"></div>
                <div class="shelf" aria-hidden="true"></div>
              </div>
            {/each}
            <div class="base">
              <p class="engraving">
                {category === 'work' ? 'Make something people want' : 'Follow your curiosity'}
              </p>
            </div>
          </nav>
        {/each}
      </div>
    </div>
    <button
      type="button"
      onclick={() => showShelf('next')}
      aria-label="Next shelf: Misc"
      disabled={activeCategory === 'misc'}
      aria-controls="library-shelves"
      class="shelf-arrow"
    >
      <ChevronRight size={20} aria-hidden="true" />
    </button>
  </div>
  <p class="sr-only" role="status">{downloadStatus}</p>
</div>

<style>
  .shelf-controls {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) 2rem;
    max-width: 48rem;
    align-items: center;
    gap: clamp(0.25rem, 1vw, 0.75rem);
    margin: 1.5rem auto 2rem;
  }

  .shelf-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    color: var(--color-cork-600);
    cursor: pointer;
    transition: background 180ms ease;
  }

  .shelf-arrow:hover:not(:disabled) {
    background: var(--color-cork-200);
  }

  .shelf-arrow:disabled {
    opacity: 0.25;
    cursor: default;
  }

  .shelf-arrow:focus-visible {
    outline: 2px solid var(--color-cork-700);
    outline-offset: 4px;
  }

  .shelf-viewport {
    width: 100%;
    max-width: 42rem;
    justify-self: center;
    overflow: hidden;
    padding-block: 0.75rem;
    touch-action: pan-y pinch-zoom;
  }

  .shelf-track {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 200%;
    transition: transform 420ms cubic-bezier(0.22, 0.68, 0, 1);
  }

  .shelf-track.show-misc {
    transform: translateX(-50%);
  }

  .library-backdrop {
    min-height: calc(100dvh - 2.75rem);
    padding: 1.5rem 1rem;
    background-color: var(--color-cork-100);
    background-image:
      radial-gradient(circle, rgb(107 94 74 / 0.15) 0.8px, transparent 1px),
      repeating-linear-gradient(0deg, transparent 0 3px, rgb(107 94 74 / 0.025) 3px 4px);
    background-size:
      20px 20px,
      100% 4px;
  }

  @media (min-width: 768px) {
    .library-backdrop {
      padding-inline: 1.5rem;
    }
  }

  .bookcase {
    --post-width: clamp(0.65rem, 2vw, 1.1rem);
    --wood-grain: repeating-linear-gradient(
      2deg,
      transparent 0 5px,
      rgb(134 88 41 / 0.08) 5px 6px,
      transparent 6px 11px
    );
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-rows: repeat(var(--shelf-rows), 1fr) auto;
    width: 100%;
    max-width: 42rem;
    margin: 0;
    padding-inline: var(--post-width);
  }

  .bookcase::before,
  .bookcase::after {
    position: absolute;
    z-index: 4;
    top: clamp(1.5rem, 5vw, 3rem);
    bottom: 0;
    width: var(--post-width);
    content: '';
    pointer-events: none;
    border-radius: 7px 7px 2px 2px;
    background:
      repeating-linear-gradient(91deg, transparent 0 4px, rgb(134 88 41 / 0.12) 4px 5px),
      linear-gradient(90deg, #b98750, #e7c18c 28%, #d6a66e 70%, #bc8c56);
    box-shadow:
      inset 1px 0 0 rgb(255 244 220 / 0.6),
      2px 0 4px rgb(84 53 26 / 0.18);
  }

  .bookcase::before {
    left: 0;
  }
  .bookcase::after {
    right: 0;
  }

  .shelf-row {
    position: relative;
    display: flex;
    flex-direction: column;
    padding-top: clamp(1.25rem, 4vw, 2rem);
  }

  .shelf-row:first-child {
    padding-top: 0;
  }

  .book-row {
    --book-gap: clamp(0.4rem, 1.25vw, 1rem);
    --book-width: 7rem;
    display: grid;
    flex: 1;
    grid-template-columns: repeat(var(--book-count), minmax(0, 1fr));
    min-height: clamp(6.5rem, 20vw, 11rem);
    align-items: end;
    justify-items: center;
    gap: var(--book-gap);
    padding-inline: clamp(0.65rem, 3vw, 1.5rem);
  }

  .book {
    display: block;
    grid-column: span var(--book-span);
    width: 100%;
    max-width: calc(
      var(--book-width) * var(--book-span) + (var(--book-span) - 1) * var(--book-gap)
    );
    min-width: 0;
    border-radius: 2px;
    transform: rotate(var(--tilt));
    transform-origin: bottom center;
    box-shadow:
      -2px 1px 0 rgb(248 241 223 / 0.9),
      3px 3px 5px rgb(66 43 23 / 0.25),
      5px 8px 9px rgb(66 43 23 / 0.12);
    transition: transform 180ms ease;
  }

  .book:hover {
    transform: translateY(-5px) rotate(var(--tilt));
  }

  .trim-cover {
    overflow: hidden;
  }

  .downloadable-book {
    -webkit-touch-callout: none;
    user-select: none;
    touch-action: pan-y;
  }

  .trim-cover img {
    transform: scale(1.025);
  }

  .landscape-book {
    z-index: 1;
    width: var(--landscape-width);
    max-width: calc(var(--book-width) * 1.35);
  }

  .landscape-book:first-child {
    justify-self: start;
  }

  .landscape-book:last-child:not(:first-child) {
    justify-self: end;
  }

  .retaining-rail {
    position: absolute;
    z-index: 3;
    right: -3px;
    bottom: clamp(1.25rem, 3vw, 2rem);
    left: -3px;
    height: clamp(6px, 1vw, 10px);
    pointer-events: none;
    border-radius: 999px;
    background: var(--wood-grain), linear-gradient(180deg, #f2d4a9, #d4a36c 55%, #b78046);
    box-shadow:
      inset 0 1px 0 #f8e4c5,
      0 3px 3px rgb(61 35 17 / 0.25);
  }

  .shelf {
    position: relative;
    z-index: 2;
    height: clamp(10px, 1.8vw, 14px);
    pointer-events: none;
    border-radius: 2px;
    border-top: 2px solid #f4dcb8;
    background: var(--wood-grain), linear-gradient(90deg, #d4ac7d, #e8c79e 40%, #d6ae7e);
    box-shadow:
      inset 0 -2px 0 rgb(143 95 48 / 0.3),
      0 6px 6px -2px rgb(61 35 17 / 0.25);
  }

  .shelf::before {
    position: absolute;
    inset: -4px 0 auto;
    height: 3px;
    content: '';
    background: #e0bd93;
    border-radius: 2px 2px 0 0;
  }

  .base {
    display: flex;
    min-height: clamp(1.75rem, 4vw, 2.25rem);
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    border-bottom: 2px solid #b98a54;
    background: var(--wood-grain), linear-gradient(90deg, #c79863, #dbb383 45%, #cfa373);
    box-shadow: inset 0 4px 5px rgb(94 59 28 / 0.12);
  }

  .engraving {
    margin: 0;
    color: #76512f;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(0.7rem, 1.8vw, 0.9rem);
    font-style: italic;
    line-height: 1.2;
    text-align: center;
    text-shadow:
      0 1px 0 rgb(255 237 204 / 0.65),
      0 -1px 0 rgb(86 51 23 / 0.2);
  }

  @media (prefers-reduced-motion: reduce) {
    .book,
    .shelf-track,
    .shelf-arrow {
      transition: none;
    }
  }
</style>
