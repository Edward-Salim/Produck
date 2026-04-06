<script lang="ts">
  import {
    BookOpen,
    List,
    ArrowUpDown,
    Bookmark,
    Compass,
    Telescope,
    FlaskConical,
    Rocket,
    ChartBar,
    Settings,
    BrainCircuit
  } from '@lucide/svelte';
  import type { Component } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { invalidateAll } from '$app/navigation';
  import {
    BOOKS,
    ALL_CATEGORIES,
    type Artifact,
    type Category,
    type Book
  } from './artifacts-data.js';

  const CATEGORY_ICON: Record<Category, Component<{ class?: string }>> = {
    Strategy: Compass,
    Discovery: Telescope,
    Validation: FlaskConical,
    Delivery: Rocket,
    Measurement: ChartBar,
    Process: Settings,
    Analysis: BrainCircuit
  };

  const CATEGORY_DESC: Record<Category, string> = {
    Strategy: 'Vision, direction, and long-term planning',
    Discovery: 'Understanding users, problems, opportunities, and generating solutions',
    Validation: 'Testing assumptions and de-risking',
    Delivery: 'Planning, building, and shipping',
    Measurement: 'Tracking outcomes and learning',
    Process: 'Team rituals, templates, and ways of working',
    Analysis: 'Structured thinking and problem decomposition'
  };

  const TOTAL_ARTIFACTS = BOOKS.reduce((sum, b) => sum + b.artifacts.length, 0);

  let { data } = $props();

  // ── Picks ──
  let pickSet = $derived(
    new Set(
      data.picks.map(
        (p: { bookId: string; artifactName: string }) => `${p.bookId}::${p.artifactName}`
      )
    )
  );

  function isPicked(bookId: string, artifactName: string): boolean {
    return pickSet.has(`${bookId}::${artifactName}`);
  }

  async function togglePick(bookId: string, artifactName: string) {
    await fetch('/api/artifact-pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, artifactName })
    });
    invalidateAll();
  }

  // ── Views & filters ──
  let view = $state<'books' | 'catalog' | 'picks'>('books');
  let selectedCategory = $state<Category | 'all'>('all');

  interface FilteredBook extends Book {
    artifacts: Artifact[];
  }

  let selectedBook = $state<FilteredBook | null>(null);
  let modalSort = $state<{ col: 'name' | 'category'; dir: 'asc' | 'desc' } | null>(null);
  let catalogSort = $state<{ col: 'name' | 'category' | 'book'; dir: 'asc' | 'desc' }>({
    col: 'name',
    dir: 'asc'
  });

  const CATEGORY_ORDER: Record<Category, number> = Object.fromEntries(
    ALL_CATEGORIES.map((c, i) => [c, i])
  ) as Record<Category, number>;

  function toggleModalSort(col: 'name' | 'category') {
    if (modalSort?.col === col) {
      modalSort = { col, dir: modalSort.dir === 'asc' ? 'desc' : 'asc' };
    } else {
      modalSort = { col, dir: 'asc' };
    }
  }

  function toggleCatalogSort(col: 'name' | 'category' | 'book') {
    if (catalogSort.col === col) {
      catalogSort = { col, dir: catalogSort.dir === 'asc' ? 'desc' : 'asc' };
    } else {
      catalogSort = { col, dir: 'asc' };
    }
  }

  interface CatalogArtifact extends Artifact {
    bookId: string;
    bookTitle: string;
    bookAuthor: string;
    bookCover: string;
  }

  let filteredBooks = $derived.by(() => {
    return BOOKS.map((book) => {
      const artifacts =
        selectedCategory === 'all'
          ? book.artifacts
          : book.artifacts.filter((a) => a.category === selectedCategory);
      return { ...book, artifacts };
    }).filter((book) => book.artifacts.length > 0);
  });

  let allFilteredArtifacts = $derived.by((): CatalogArtifact[] => {
    const result: CatalogArtifact[] = [];
    for (const book of filteredBooks) {
      for (const artifact of book.artifacts) {
        result.push({
          ...artifact,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookCover: book.cover
        });
      }
    }
    return result;
  });

  let sortedCatalogArtifacts = $derived.by((): CatalogArtifact[] => {
    return [...allFilteredArtifacts].sort((a, b) => {
      const dir = catalogSort.dir === 'asc' ? 1 : -1;
      if (catalogSort.col === 'category') {
        return (CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]) * dir;
      }
      if (catalogSort.col === 'book') {
        return a.bookTitle.localeCompare(b.bookTitle) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
  });

  let sortedModalArtifacts = $derived.by(() => {
    if (!selectedBook) return [];
    if (!modalSort) return selectedBook.artifacts;
    const ms = modalSort;
    return [...selectedBook.artifacts].sort((a, b) => {
      const dir = ms.dir === 'asc' ? 1 : -1;
      if (ms.col === 'category') {
        return (CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
  });

  function getCategoryDots(artifacts: Artifact[]): { category: Category; count: number }[] {
    const map = new Map<Category, number>();
    for (const a of artifacts) {
      map.set(a.category, (map.get(a.category) ?? 0) + 1);
    }
    return ALL_CATEGORIES.filter((cat) => map.has(cat)).map((category) => ({
      category,
      count: map.get(category)!
    }));
  }

  // ── Picks view data ──
  interface PickedGroup {
    category: Category;
    artifacts: (Artifact & { bookId: string; bookCover: string; bookTitle: string })[];
  }

  let pickedGroups = $derived.by((): PickedGroup[] => {
    const groups: PickedGroup[] = [];
    for (const cat of ALL_CATEGORIES) {
      if (selectedCategory !== 'all' && selectedCategory !== cat) continue;
      const artifacts: PickedGroup['artifacts'] = [];
      for (const book of BOOKS) {
        for (const a of book.artifacts) {
          if (a.category === cat && isPicked(book.id, a.name)) {
            artifacts.push({ ...a, bookId: book.id, bookCover: book.cover, bookTitle: book.title });
          }
        }
      }
      if (artifacts.length > 0) groups.push({ category: cat, artifacts });
    }
    return groups;
  });

  let totalPicked = $derived(pickedGroups.reduce((sum, g) => sum + g.artifacts.length, 0));
</script>

<svelte:head>
  <title>PM Artifacts | Produck</title>
</svelte:head>

<div>
  <!-- Header -->
  <header class="mb-4">
    <h1 class="font-display text-2xl text-cork-800 md:text-4xl">PM Artifacts</h1>
    <p class="mt-0.5 text-sm text-cork-500">
      {TOTAL_ARTIFACTS} artifacts from {BOOKS.length} books
    </p>
  </header>

  <!-- Controls bar -->
  <div class="mb-5 flex items-center gap-3">
    <!-- Category filter pills -->
    <div class="flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="shrink-0 rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors {selectedCategory ===
          'all'
            ? 'bg-cork-700 text-cork-50'
            : 'bg-cork-200/50 text-cork-500 hover:bg-cork-300/50'}"
          onclick={() => (selectedCategory = 'all')}
        >
          All
        </button>
        {#each ALL_CATEGORIES as cat (cat)}
          {@const isActive = selectedCategory === cat}
          {@const Icon = CATEGORY_ICON[cat]}
          <button
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors {isActive
              ? 'bg-cork-700 text-cork-50'
              : 'bg-cork-200/50 text-cork-500 hover:bg-cork-300/50'}"
            onclick={() => (selectedCategory = cat)}
          >
            <Icon class="size-3" />
            {cat}
          </button>
        {/each}
      </div>
    </div>

    <!-- View toggle -->
    <div class="flex shrink-0 overflow-hidden rounded border border-cork-300">
      <button
        type="button"
        class="px-2 py-1 transition-colors {view === 'books'
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (view = 'books')}
        title="Books view"
      >
        <BookOpen class="size-3.5" />
      </button>
      <button
        type="button"
        class="px-2 py-1 transition-colors {view === 'catalog'
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (view = 'catalog')}
        title="Catalog view"
      >
        <List class="size-3.5" />
      </button>
      <button
        type="button"
        class="px-2 py-1 transition-colors {view === 'picks'
          ? 'bg-cork-700 text-cork-50'
          : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
        onclick={() => (view = 'picks')}
        title="My Picks"
      >
        <Bookmark class="size-3.5" />
      </button>
    </div>
  </div>

  <!-- Books View -->
  {#if view === 'books'}
    {#if selectedCategory !== 'all'}
      <p class="mb-4 text-xs text-cork-500">{CATEGORY_DESC[selectedCategory]}</p>
    {/if}
    {#if filteredBooks.length === 0}
      <p class="py-12 text-center text-sm text-cork-400">No artifacts match your filters.</p>
    {:else}
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredBooks as book (book.id)}
          {@const dots = getCategoryDots(book.artifacts)}
          {@const pickedCount = book.artifacts.filter((a) => isPicked(book.id, a.name)).length}

          <div class="col-span-1">
            <!-- Book card -->
            <button
              type="button"
              class="w-full cursor-pointer rounded-xl p-4 text-left transition-all hover:scale-[1.01]"
              style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
								box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
              onclick={() => {
                modalSort = null;
                selectedBook = book;
              }}
            >
              <div class="flex gap-4">
                <!-- Book cover -->
                <img
                  src={book.cover}
                  alt="{book.title} cover"
                  class="h-28 w-20 shrink-0 rounded-md border border-cork-300/50 object-cover shadow-md"
                />

                <!-- Book info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h2 class="truncate font-display text-lg leading-tight text-cork-800">
                        {book.title}
                      </h2>
                      <p class="mt-0.5 text-xs text-cork-500">{book.author} &middot; {book.year}</p>
                    </div>
                    {#if pickedCount > 0}
                      <span class="flex shrink-0 items-center gap-0.5 text-cork-600">
                        <Bookmark class="size-3" fill="currentColor" />
                        <span class="text-[10px] font-medium">{pickedCount}</span>
                      </span>
                    {/if}
                  </div>

                  <!-- Category icons -->
                  <div class="mt-3 flex items-center gap-2">
                    {#each dots as dot (dot.category)}
                      {@const Icon = CATEGORY_ICON[dot.category]}
                      <span class="text-cork-500" title="{dot.category} ({dot.count})">
                        <Icon class="size-3.5" />
                      </span>
                    {/each}
                  </div>
                </div>
              </div>
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Catalog View -->
  {:else if view === 'catalog'}
    <!-- Summary stats -->
    <p class="mb-3 text-xs text-cork-500">
      Showing {allFilteredArtifacts.length} of {TOTAL_ARTIFACTS} artifacts
    </p>

    {#if allFilteredArtifacts.length === 0}
      <p class="py-12 text-center text-sm text-cork-400">No artifacts match your filters.</p>
    {:else}
      <div
        class="overflow-hidden rounded-xl bg-cork-200"
        style="box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
      >
        <div
          class="grid grid-cols-[32px_28px_1fr_100px_28px] gap-2 border-b border-cork-400/20 bg-cork-300/60 px-4 py-2 md:grid-cols-[32px_28px_1fr_100px_1fr_28px]"
        >
          <span class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">#</span>
          <span></span>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase transition-colors hover:text-cork-700"
            onclick={() => toggleCatalogSort('name')}
          >
            Artifact
            <ArrowUpDown
              class="size-2.5 {catalogSort.col === 'name' ? 'text-cork-700' : 'text-cork-400'}"
            />
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase transition-colors hover:text-cork-700"
            onclick={() => toggleCatalogSort('category')}
          >
            Category
            <ArrowUpDown
              class="size-2.5 {catalogSort.col === 'category' ? 'text-cork-700' : 'text-cork-400'}"
            />
          </button>
          <span
            class="hidden text-[10px] font-bold tracking-widest text-cork-500 uppercase md:block"
            >Description</span
          >
          <span></span>
        </div>

        {#each sortedCatalogArtifacts as artifact, i (artifact.bookId + '-' + artifact.name)}
          {@const Icon = CATEGORY_ICON[artifact.category]}
          {@const picked = isPicked(artifact.bookId, artifact.name)}
          <div
            class="grid cursor-pointer grid-cols-[32px_28px_1fr_100px_28px] items-center gap-2 border-b border-cork-400/10 px-4 py-2 transition-colors hover:bg-cork-200/30 md:grid-cols-[32px_28px_1fr_100px_1fr_28px] {i %
              2 ===
            1
              ? 'bg-cork-200/15'
              : ''}"
            onclick={() => togglePick(artifact.bookId, artifact.name)}
          >
            <span class="font-mono text-xs text-cork-400">{i + 1}</span>
            <img
              src={artifact.bookCover}
              alt={artifact.bookTitle}
              title={artifact.bookTitle}
              class="size-6 rounded-sm object-cover shadow-sm"
            />
            <span class="text-sm font-medium text-cork-800">{artifact.name}</span>
            <span
              class="inline-flex w-fit items-center gap-1 rounded-full bg-cork-300/40 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-cork-600"
            >
              <Icon class="size-3" />
              {artifact.category}
            </span>
            <span class="line-clamp-2 hidden text-xs text-cork-600 md:block"
              >{artifact.description}</span
            >
            <span
              class="flex size-6 items-center justify-center transition-colors {picked
                ? 'text-cork-700'
                : 'text-cork-400'}"
            >
              <Bookmark class="size-3.5" fill={picked ? 'currentColor' : 'none'} />
            </span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- My Picks View -->
  {:else if totalPicked === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <Bookmark class="mb-3 size-8 text-cork-300" />
      <p class="text-sm text-cork-500">No artifacts picked yet.</p>
      <p class="mt-1 text-xs text-cork-400">
        Browse the catalog and bookmark artifacts for quick reference.
      </p>
    </div>
  {:else}
    <p class="mb-3 text-xs text-cork-500">
      {totalPicked} artifact{totalPicked === 1 ? '' : 's'} picked
    </p>

    <div class="space-y-4">
      {#each pickedGroups as group (group.category)}
        {@const CatIcon = CATEGORY_ICON[group.category]}
        <div
          class="overflow-hidden rounded-xl"
          style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
							box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.1);"
        >
          <!-- Category header -->
          <div class="flex items-center gap-2 border-b border-cork-400/20 px-4 py-2.5">
            <CatIcon class="size-4 text-cork-600" />
            <span class="text-sm font-bold text-cork-700">{group.category}</span>
            <span class="ml-1 text-[10px] text-cork-400">{group.artifacts.length}</span>
          </div>

          <!-- Artifact rows -->
          {#each group.artifacts as artifact, i (artifact.bookId + '-' + artifact.name)}
            <div
              class="flex items-start gap-3 border-b border-cork-400/10 px-4 py-2.5 {i % 2 === 1
                ? 'bg-cork-200/15'
                : ''}"
            >
              <img
                src={artifact.bookCover}
                alt={artifact.bookTitle}
                title={artifact.bookTitle}
                class="mt-0.5 size-6 shrink-0 rounded-sm object-cover shadow-sm"
              />
              <div class="min-w-0 flex-1">
                <span class="text-sm font-medium text-cork-800">{artifact.name}</span>
                <p class="mt-0.5 line-clamp-2 text-xs text-cork-500">{artifact.description}</p>
              </div>
              <button
                type="button"
                class="flex size-6 shrink-0 items-center justify-center rounded text-cork-700 transition-colors hover:text-cork-400"
                onclick={() => togglePick(artifact.bookId, artifact.name)}
                title="Remove from picks"
              >
                <Bookmark class="size-3.5" fill="currentColor" />
              </button>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Book artifacts dialog -->
  <Dialog.Root
    open={!!selectedBook}
    onOpenChange={(o) => {
      if (!o) selectedBook = null;
    }}
  >
    <Dialog.Content class="border-cork-300 bg-cork-50 text-cork-800 sm:max-w-2xl">
      {#if selectedBook}
        <Dialog.Header class="flex-row items-start gap-4">
          <img
            src={selectedBook.cover}
            alt="{selectedBook.title} cover"
            class="h-20 w-14 shrink-0 rounded-md object-cover shadow"
          />
          <div class="min-w-0">
            <Dialog.Title class="font-display text-xl text-cork-800"
              >{selectedBook.title}</Dialog.Title
            >
            <p class="mt-0.5 text-xs text-cork-500">{selectedBook.subtitle}</p>
            <p class="mt-0.5 text-xs text-cork-400">
              {selectedBook.author} &middot; {selectedBook.year}
            </p>
          </div>
        </Dialog.Header>
        <Dialog.Description class="sr-only">Artifacts list</Dialog.Description>

        <!-- Artifacts table -->
        <div
          class="max-h-[60vh] overflow-y-auto [scrollbar-color:theme(--color-cork-300)_transparent] [scrollbar-width:thin]"
        >
          <!-- Table header -->
          <div
            class="grid grid-cols-[24px_1fr_auto_28px] gap-2 border-b border-cork-400/20 px-2 py-2"
          >
            <span class="text-[10px] font-bold tracking-widest text-cork-500 uppercase">#</span>
            <button
              type="button"
              class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase transition-colors hover:text-cork-700"
              onclick={() => toggleModalSort('name')}
            >
              Artifact
              <ArrowUpDown
                class="size-2.5 {modalSort?.col === 'name' ? 'text-cork-700' : 'text-cork-400'}"
              />
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase transition-colors hover:text-cork-700"
              onclick={() => toggleModalSort('category')}
            >
              Category
              <ArrowUpDown
                class="size-2.5 {modalSort?.col === 'category' ? 'text-cork-700' : 'text-cork-400'}"
              />
            </button>
            <span></span>
          </div>

          <!-- Table rows -->
          {#each sortedModalArtifacts as artifact, i (artifact.name)}
            {@const Icon = CATEGORY_ICON[artifact.category]}
            {@const picked = isPicked(selectedBook.id, artifact.name)}
            <div
              class="grid cursor-pointer grid-cols-[24px_1fr_auto_28px] items-start gap-2 border-b border-cork-400/10 px-2 py-2 transition-colors hover:bg-cork-200/30 {i %
                2 ===
              1
                ? 'bg-cork-200/20'
                : ''}"
              onclick={() => togglePick(selectedBook!.id, artifact.name)}
            >
              <span class="pt-0.5 font-mono text-xs text-cork-400">{i + 1}</span>
              <div class="min-w-0">
                <span class="text-sm font-medium text-cork-800">{artifact.name}</span>
                <p class="mt-0.5 line-clamp-2 text-xs text-cork-500">{artifact.description}</p>
              </div>
              <span
                class="inline-flex w-fit items-center gap-1 rounded-full bg-cork-300/40 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-cork-600"
              >
                <Icon class="size-3" />
                {artifact.category}
              </span>
              <span
                class="flex size-6 items-center justify-center transition-colors {picked
                  ? 'text-cork-700'
                  : 'text-cork-300'}"
              >
                <Bookmark class="size-3.5" fill={picked ? 'currentColor' : 'none'} />
              </span>
            </div>
          {/each}
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>
