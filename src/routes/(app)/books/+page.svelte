<script lang="ts">
  import {
    bookShelfCapacity,
    bookShelfSlots,
    bookShelfSpan,
    fitBookShelves
  } from '$lib/data/book-shelves.js';
  import type { PageData } from './$types.js';

  let { data }: { data: PageData } = $props();
  let rackWidth = $state<number>();
  const shelves = $derived(fitBookShelves(data.shelves, rackWidth));
  const minimumSlots = $derived(Math.min(3, bookShelfCapacity(rackWidth)));
</script>

<svelte:head>
  <title>Books | Produck</title>
  <meta name="description" content="Your book library." />
</svelte:head>

<div class="library-backdrop -mx-4 -mt-6 -mb-6 md:-mx-6">
  <nav aria-label="Book library" class="bookcase" bind:clientWidth={rackWidth}>
    {#each shelves as shelf, index (index)}
      <div class="shelf-row">
        <div
          class="book-row"
          style={`--book-count: ${Math.max(minimumSlots, bookShelfSlots(shelf, rackWidth))};`}
        >
          {#each shelf as book, bookIndex (book.id)}
            <a
              href={`/books/${book.id}`}
              aria-label={`Open ${book.title}`}
              title={book.title}
              class="book focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cork-700"
              style={`--book-span: ${bookShelfSpan(book, rackWidth)}; --tilt: ${[-2, 1, -1.5][(index + bookIndex) % 3]}deg;`}
            >
              <img
                src={book.cover}
                alt={`${book.title} cover`}
                width={book.shelfSpan === 2 ? 400 : 128}
                height={book.shelfSpan === 2 ? 310 : 192}
                class={`h-auto w-full rounded-sm object-contain object-bottom ${book.shelfSpan === 2 ? 'aspect-auto' : 'aspect-[2/3]'}`}
              />
            </a>
          {/each}
        </div>
        <div class="retaining-rail" aria-hidden="true"></div>
        <div class="shelf" aria-hidden="true"></div>
      </div>
    {/each}
    <div class="base" aria-hidden="true"></div>
  </nav>
</div>

<style>
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
    width: 100%;
    max-width: 42rem;
    margin: 1.5rem auto 2rem;
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
    padding-top: clamp(1.25rem, 4vw, 2rem);
  }

  .shelf-row:first-child {
    padding-top: 0;
  }

  .book-row {
    --book-gap: clamp(0.4rem, 1.25vw, 1rem);
    display: grid;
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
    max-width: calc(8.5rem * var(--book-span) + (var(--book-span) - 1) * var(--book-gap));
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
    height: clamp(1.75rem, 5vw, 2.5rem);
    border-bottom: 2px solid #b98a54;
    background: var(--wood-grain), linear-gradient(90deg, #c79863, #dbb383 45%, #cfa373);
    box-shadow: inset 0 4px 5px rgb(94 59 28 / 0.12);
  }

  @media (prefers-reduced-motion: reduce) {
    .book {
      transition: none;
    }
  }
</style>
