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
  import { ALL_CATEGORIES, PHASES, type Category } from './artifacts-data.js';
  import type { BookData, ArtifactData, MethodologyData } from './+page.server.js';

  const CATEGORY_ICON: Record<string, Component<{ class?: string }>> = {
    Strategy: Compass,
    Discovery: Telescope,
    Validation: FlaskConical,
    Delivery: Rocket,
    Measurement: ChartBar,
    Process: Settings,
    Analysis: BrainCircuit
  };

  const CATEGORY_DESC: Record<string, string> = {
    Strategy: 'Vision, direction, and long-term planning',
    Discovery: 'Understanding users, problems, opportunities, and generating solutions',
    Validation: 'Testing assumptions and de-risking',
    Delivery: 'Planning, building, and shipping',
    Measurement: 'Tracking outcomes and learning',
    Process: 'Team rituals, templates, and ways of working',
    Analysis: 'Structured thinking and problem decomposition'
  };

  let { data } = $props();

  const BOOKS = $derived(data.books as BookData[]);
  const METHODOLOGIES = $derived(data.methodologies as MethodologyData[]);

  const TOTAL_ARTIFACTS = $derived(BOOKS.reduce((sum, b) => sum + b.artifacts.length, 0));

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

  const PHASE_COLORS: Record<string, string> = {
    Learn: '#2471a3',
    Plan: '#7d3c98',
    Build: '#27ae60',
    Evaluate: '#ca6f1e',
    Align: '#148f77'
  };

  async function applyPreset(methodology: MethodologyData) {
    // Wipe all current picks, then add the related artifacts
    await fetch('/api/artifact-pick', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: methodology.relatedArtifacts })
    });
    activePreset = methodology.name;
    localStorage.setItem('produck_active_preset', methodology.name);
    invalidateAll();
  }

  let activePreset = $state<string | null>(null);
  let activeMethod = $derived(
    activePreset ? METHODOLOGIES.find((m) => m.name === activePreset) : null
  );

  // Load preset from storage on mount
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('produck_active_preset');
    if (saved) activePreset = saved;
  }

  // ── Views & filters ──
  let view = $state<'books' | 'catalog' | 'picks'>(
    (typeof window !== 'undefined' &&
      (localStorage.getItem('produck_artifacts_view') as 'books' | 'catalog' | 'picks')) ||
      'books'
  );
  $effect(() => {
    localStorage.setItem('produck_artifacts_view', view);
  });
  let selectedCategory = $state<Category | 'all'>('all');
  let searchQuery = $state('');
  let selectedArtifactKey = $state<string | null>(null);
  let currentPage = $state(1);
  const PAGE_SIZE = 15;

  function selectArtifact(key: string) {
    selectedArtifactKey = selectedArtifactKey === key ? null : key;
  }

  // Find the full artifact data for the selected key
  let selectedArtifactDetail = $derived.by(() => {
    if (!selectedArtifactKey) return null;
    return (
      (data.artifacts as ArtifactData[]).find(
        (a) => a.bookSlug + '-' + a.name === selectedArtifactKey
      ) ?? null
    );
  });

  // Auto-scroll left pane to selected artifact
  $effect(() => {
    if (selectedArtifactKey && selectedBook) {
      setTimeout(() => {
        const el = document.querySelector(`[data-artifact-key="${selectedArtifactKey}"]`);
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 200);
    }
  });

  // ── Methodologies ──
  let selectedBook = $state<BookData | null>(null);
  let modalSort = $state<{ col: 'name' | 'category'; dir: 'asc' | 'desc' }>({
    col: 'category',
    dir: 'asc'
  });
  let catalogSort = $state<{ col: 'name' | 'category' | 'book'; dir: 'asc' | 'desc' }>({
    col: 'category',
    dir: 'asc'
  });

  const CATEGORY_ORDER: Record<string, number> = Object.fromEntries(
    ALL_CATEGORIES.map((c, i) => [c, i])
  );

  function toggleCatalogSort(col: 'name' | 'category' | 'book') {
    if (catalogSort.col === col) {
      catalogSort = { col, dir: catalogSort.dir === 'asc' ? 'desc' : 'asc' };
    } else {
      catalogSort = { col, dir: 'asc' };
    }
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

  let allFilteredArtifacts = $derived.by((): ArtifactData[] => {
    let result = data.artifacts as ArtifactData[];
    if (selectedCategory !== 'all') result = result.filter((a) => a.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.bookTitle.toLowerCase().includes(q) ||
          a.howTo.some((step) => step.toLowerCase().includes(q))
      );
    }
    return result;
  });

  let sortedCatalogArtifacts = $derived.by((): ArtifactData[] => {
    return [...allFilteredArtifacts].sort((a, b) => {
      const dir = catalogSort.dir === 'asc' ? 1 : -1;
      if (catalogSort.col === 'category') {
        return ((CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)) * dir;
      }
      if (catalogSort.col === 'book') {
        return a.bookTitle.localeCompare(b.bookTitle) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
  });

  // Reset page when filters change
  $effect(() => {
    selectedCategory;
    searchQuery;
    currentPage = 1;
  });

  let totalPages = $derived(Math.ceil(sortedCatalogArtifacts.length / PAGE_SIZE));
  let paginatedArtifacts = $derived(
    sortedCatalogArtifacts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  );

  let sortedModalArtifacts = $derived.by(() => {
    if (!selectedBook) return [];
    const ms = modalSort ?? { col: 'category' as const, dir: 'asc' as const };
    return [...selectedBook.artifacts].sort((a, b) => {
      const dir = ms.dir === 'asc' ? 1 : -1;
      if (ms.col === 'category') {
        return ((CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)) * dir;
      }
      return a.name.localeCompare(b.name) * dir;
    });
  });

  function getCategoryDots(artifacts: ArtifactData[]): { category: Category; count: number }[] {
    const map = new Map<string, number>();
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
    artifacts: ArtifactData[];
  }

  let pickedGroups = $derived.by((): PickedGroup[] => {
    const groups: PickedGroup[] = [];
    for (const cat of ALL_CATEGORIES) {
      if (selectedCategory !== 'all' && selectedCategory !== cat) continue;
      const artifacts: PickedGroup['artifacts'] = [];
      for (const book of BOOKS) {
        for (const a of book.artifacts) {
          if (a.category === cat && isPicked(book.slug, a.name)) {
            artifacts.push({
              ...a,
              bookId: book.id,
              bookSlug: book.slug,
              bookCoverPath: book.coverPath,
              bookTitle: book.title
            });
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
  <div class="mb-5 flex flex-wrap items-center gap-3">
    <!-- Filter pills (hidden in picks view) -->
    <div
      class="flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] {view ===
      'picks'
        ? 'invisible'
        : ''}"
    >
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
          {@const pickedCount = book.artifacts.filter((a) => isPicked(book.slug, a.name)).length}

          <div class="col-span-1">
            <!-- Book card -->
            <button
              type="button"
              class="w-full cursor-pointer rounded-xl p-4 text-left transition-all hover:scale-[1.01]"
              style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
								box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
              onclick={() => {
                modalSort = { col: 'category', dir: 'asc' };
                selectedBook = book;
                selectedArtifactKey = null;
              }}
            >
              <div class="flex gap-4">
                <!-- Book cover -->
                <img
                  src={book.coverPath}
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
    <!-- Search + stats -->
    <div class="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
      <input
        type="text"
        placeholder="Search artifacts..."
        bind:value={searchQuery}
        class="w-full rounded-lg border border-cork-300 bg-cork-50 px-3 py-1.5 text-sm text-cork-800 outline-none placeholder:text-cork-400 sm:w-56"
      />
      <p class="text-xs text-cork-500">
        Showing {allFilteredArtifacts.length} of {TOTAL_ARTIFACTS}
      </p>
    </div>

    {#if allFilteredArtifacts.length === 0}
      <div class="flex flex-col gap-4 md:flex-row">
        <div
          class="min-w-0 flex-1 rounded-xl bg-cork-100"
          style="box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);"
        >
          <div
            class="grid grid-cols-[28px_1fr_100px_28px] gap-2 rounded-t-xl border-b border-cork-300 bg-cork-200 px-4 py-2"
          >
            <span></span>
            <span class="text-[10px] font-bold tracking-widest text-cork-500 uppercase"
              >Artifact</span
            >
            <span class="text-[10px] font-bold tracking-widest text-cork-500 uppercase"
              >Category</span
            >
            <span></span>
          </div>
          <div class="py-16 text-center">
            <p class="text-sm text-cork-400">No artifacts match "{searchQuery}"</p>
            <button
              type="button"
              class="mt-2 cursor-pointer text-xs text-cork-500 hover:text-cork-700"
              onclick={() => {
                searchQuery = '';
                selectedCategory = 'all';
              }}>Clear filters</button
            >
          </div>
        </div>
        <div
          class="w-full shrink-0 rounded-xl p-4 md:w-72"
          style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #ddd4c2;"
        >
          <p class="py-8 text-center text-sm text-cork-400 italic">
            Select an artifact to see details
          </p>
        </div>
      </div>
    {:else}
      <div class="flex flex-col gap-4 md:flex-row">
        <!-- Left: artifact table -->
        <div
          class="min-w-0 flex-1 rounded-xl bg-cork-100"
          style="box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);"
        >
          <!-- Header -->
          <div
            class="sticky top-0 z-5 grid grid-cols-[28px_1fr_100px_28px] gap-2 rounded-t-xl border-b border-cork-300 bg-cork-200 px-4 py-2"
          >
            <span></span>
            <button
              type="button"
              class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase hover:text-cork-700"
              onclick={() => toggleCatalogSort('name')}
            >
              Artifact <ArrowUpDown
                class="size-2.5 {catalogSort.col === 'name' ? 'text-cork-700' : 'text-cork-400'}"
              />
            </button>
            <button
              type="button"
              class="flex cursor-pointer items-center gap-1 text-left text-[10px] font-bold tracking-widest text-cork-500 uppercase hover:text-cork-700"
              onclick={() => toggleCatalogSort('category')}
            >
              Category <ArrowUpDown
                class="size-2.5 {catalogSort.col === 'category'
                  ? 'text-cork-700'
                  : 'text-cork-400'}"
              />
            </button>
            <span></span>
          </div>

          {#each paginatedArtifacts as artifact (artifact.bookSlug + '-' + artifact.name)}
            {@const Icon = CATEGORY_ICON[artifact.category]}
            {@const picked = isPicked(artifact.bookSlug, artifact.name)}
            {@const key = artifact.bookSlug + '-' + artifact.name}
            {@const isSelected = selectedArtifactKey === key}

            <div
              class="grid cursor-pointer grid-cols-[28px_1fr_100px_28px] items-center gap-2 border-b border-cork-400/10 px-4 py-2 transition-colors {isSelected
                ? 'bg-cork-200/50'
                : 'hover:bg-cork-200/30'}"
              role="button"
              tabindex="0"
              onclick={() => selectArtifact(key)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectArtifact(key);
                }
              }}
            >
              <img
                src={artifact.bookCoverPath}
                alt={artifact.bookTitle}
                title={artifact.bookTitle}
                class="size-6 rounded-sm object-cover shadow-sm"
              />
              <span class="text-sm font-medium text-cork-800">{artifact.name}</span>
              <span
                class="inline-flex w-fit items-center gap-1 rounded-full bg-cork-300/40 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-cork-600"
              >
                <Icon class="size-3" />{artifact.category}
              </span>
              <button
                type="button"
                class="flex size-6 cursor-pointer items-center justify-center transition-colors {picked
                  ? 'text-cork-700'
                  : 'text-cork-400 hover:text-cork-600'}"
                onclick={(e) => {
                  e.stopPropagation();
                  togglePick(artifact.bookSlug, artifact.name);
                }}
              >
                <Bookmark class="size-3.5" fill={picked ? 'currentColor' : 'none'} />
              </button>
            </div>
          {/each}

          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="flex items-center justify-between border-t border-cork-300 px-4 py-2">
              <button
                type="button"
                class="cursor-pointer text-xs font-medium text-cork-600 hover:text-cork-800 disabled:cursor-default disabled:text-cork-300"
                disabled={currentPage === 1}
                onclick={() => currentPage--}>&larr; Prev</button
              >
              <span class="text-xs text-cork-500">{currentPage} / {totalPages}</span>
              <button
                type="button"
                class="cursor-pointer text-xs font-medium text-cork-600 hover:text-cork-800 disabled:cursor-default disabled:text-cork-300"
                disabled={currentPage === totalPages}
                onclick={() => currentPage++}>Next &rarr;</button
              >
            </div>
          {/if}
        </div>

        <!-- Right: detail pane -->
        <div
          class="w-full shrink-0 overflow-y-auto rounded-xl p-4 [scrollbar-color:theme(--color-cork-300)_transparent] [scrollbar-width:thin] md:sticky md:top-14 md:max-h-[calc(100vh-80px)] md:w-72 md:self-start"
          style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #ddd4c2;"
        >
          {#if selectedArtifactDetail}
            <h3 class="mb-1 font-display text-lg text-cork-800">{selectedArtifactDetail.name}</h3>
            <p class="mb-2 text-[10px] text-cork-400">Source: {selectedArtifactDetail.bookTitle}</p>
            <p class="mb-3 text-xs text-cork-600">{selectedArtifactDetail.description}</p>

            {#if selectedArtifactDetail.figures?.length}
              {#each selectedArtifactDetail.figures as fig, fi (fi)}
                <img
                  src={fig}
                  alt="{selectedArtifactDetail.name} ({fi + 1})"
                  class="mb-3 w-full rounded-lg border border-cork-300/50 shadow-sm"
                />
              {/each}
            {:else if selectedArtifactDetail.figure}
              <img
                src={selectedArtifactDetail.figure}
                alt={selectedArtifactDetail.name}
                class="mb-3 w-full rounded-lg border border-cork-300/50 shadow-sm"
              />
            {/if}

            {#if selectedArtifactDetail.howTo && selectedArtifactDetail.howTo.length > 0}
              <p class="mb-1.5 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                How to create
              </p>
              <ol class="list-decimal space-y-1 pl-4">
                {#each selectedArtifactDetail.howTo as step, si (si)}
                  <li class="text-xs text-cork-700">{step}</li>
                {/each}
              </ol>
            {/if}

            {#if !selectedArtifactDetail.figures?.length && !selectedArtifactDetail.figure && (!selectedArtifactDetail.howTo || selectedArtifactDetail.howTo.length === 0)}
              <p class="py-8 text-center text-sm text-cork-400 italic">
                No figure or steps available
              </p>
            {/if}
          {:else}
            <p class="py-8 text-center text-sm text-cork-400 italic">
              Select an artifact to see details
            </p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- My Picks View -->
  {:else}
    <!-- Picked artifacts grouped by category -->
    {#if totalPicked === 0}
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <Bookmark class="mb-3 size-8 text-cork-300" />
        <p class="text-sm text-cork-500">No artifacts picked yet.</p>
        <p class="mt-1 text-xs text-cork-400">
          Browse the catalog and bookmark artifacts, or use a preset below.
        </p>
      </div>
    {:else}
      <!-- Category columns with picked artifacts -->
      <div class="mb-6">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {#each ALL_CATEGORIES as cat (cat)}
            {@const CatIcon = CATEGORY_ICON[cat]}
            {@const catArtifacts = pickedGroups.find((g) => g.category === cat)?.artifacts ?? []}

            <div>
              <!-- Category header -->
              <div class="mb-2 flex items-center gap-1">
                <CatIcon class="size-3.5 text-cork-500" />
                <span class="text-[10px] font-bold tracking-wider text-cork-500 uppercase"
                  >{cat}</span
                >
                {#if catArtifacts.length > 0}
                  <span class="text-[9px] text-cork-400">{catArtifacts.length}</span>
                {/if}
              </div>

              <!-- Artifact cards -->
              <div class="space-y-2">
                {#each catArtifacts as artifact (artifact.bookSlug + '-' + artifact.name)}
                  <div
                    class="group flex cursor-pointer items-center gap-1.5 rounded border border-cork-300/40 bg-cork-100 px-1.5 py-1 shadow-sm transition-colors hover:bg-cork-200/40"
                    role="button"
                    tabindex="0"
                    onclick={() => {
                      const book = BOOKS.find((b) => b.slug === artifact.bookSlug);
                      if (book) {
                        selectedBook = book;
                        selectedArtifactKey = artifact.bookSlug + '-' + artifact.name;
                      }
                    }}
                    onkeydown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const book = BOOKS.find((b) => b.slug === artifact.bookSlug);
                        if (book) {
                          selectedBook = book;
                          selectedArtifactKey = artifact.bookSlug + '-' + artifact.name;
                        }
                      }
                    }}
                  >
                    {#if artifact.bookCoverPath}
                      <img
                        src={artifact.bookCoverPath}
                        alt=""
                        class="size-5 shrink-0 rounded-sm object-cover"
                      />
                    {/if}
                    <p class="line-clamp-2 flex-1 text-xs leading-tight font-medium text-cork-800">
                      {artifact.name}
                    </p>
                    <button
                      type="button"
                      class="shrink-0 cursor-pointer text-cork-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-cork-700"
                      onclick={(e) => {
                        e.stopPropagation();
                        togglePick(artifact.bookSlug, artifact.name);
                      }}
                      title="Remove"
                    >
                      <Bookmark class="size-2.5" fill="currentColor" />
                    </button>
                  </div>
                {/each}

                {#if catArtifacts.length === 0}
                  <div class="rounded-lg border border-dashed border-cork-300/40 py-4">
                    <p class="text-center text-[9px] text-cork-400">—</p>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Presets (methodologies) -->
    <div>
      <p class="mb-2 text-[10px] font-bold tracking-wider text-cork-500 uppercase">Presets</p>
      {#if activeMethod}
        <p class="mb-1 text-xs text-cork-600">{activeMethod.description}</p>
        <p class="mb-3 text-[10px] text-cork-400">{activeMethod.origin}</p>
      {:else}
        <p class="mb-3 text-xs text-cork-400">
          Select a methodology to load its recommended artifacts.
        </p>
      {/if}
      <div class="flex flex-wrap gap-2">
        {#each PHASES as phase (phase)}
          {#each METHODOLOGIES.filter((m) => m.relatedArtifacts.length >= 3 && m.phase === phase) as m (m.name)}
            {@const isActive = activePreset === m.name}
            <button
              type="button"
              class="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors {isActive
                ? 'ring-2 ring-offset-1'
                : 'hover:opacity-80'}"
              style="border-color: {PHASE_COLORS[m.phase]}; color: {isActive
                ? 'white'
                : PHASE_COLORS[m.phase]}; background: {isActive
                ? PHASE_COLORS[m.phase]
                : PHASE_COLORS[m.phase] + '10'};"
              onclick={() => applyPreset(m)}
              title="{m.relatedArtifacts.length} artifacts: {m.relatedArtifacts.join(', ')}"
            >
              {m.name}
            </button>
          {/each}
        {/each}
      </div>
    </div>
  {/if}

  <!-- Book artifacts dialog -->
  <Dialog.Root
    open={!!selectedBook}
    onOpenChange={(o) => {
      if (!o) selectedBook = null;
    }}
  >
    <Dialog.Content class="flex max-h-[85vh] max-w-[95vw] flex-col border-cork-300 bg-cork-50 text-cork-800 sm:max-w-5xl">
      {#if selectedBook}
        <Dialog.Header class="flex-row items-start gap-4">
          {#if selectedBook.coverPath}
            <img
              src={selectedBook.coverPath}
              alt="{selectedBook.title} cover"
              class="h-20 w-14 shrink-0 rounded-md object-cover shadow"
            />
          {/if}
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

        <!-- Split pane: list left, detail right -->
        <div class="flex min-h-0 flex-1 flex-col gap-4 border-t border-cork-300/50 pt-3 sm:flex-row">
          <!-- Left: artifact list -->
          <div
            class="max-h-48 w-full shrink-0 overflow-y-auto border-cork-300/30 [scrollbar-color:theme(--color-cork-300)_transparent] [scrollbar-width:thin] sm:max-h-full sm:w-80 sm:border-r sm:pr-4"
          >
            {#each sortedModalArtifacts as artifact (artifact.name)}
              {@const Icon = CATEGORY_ICON[artifact.category]}
              {@const picked = isPicked(selectedBook.slug, artifact.name)}
              {@const mKey = selectedBook.slug + '-' + artifact.name}
              {@const isSelected = selectedArtifactKey === mKey}

              <div
                data-artifact-key={mKey}
                class="flex cursor-pointer items-center gap-1.5 border-b border-cork-400/10 px-2 py-1 transition-colors {isSelected
                  ? 'bg-cork-200/40'
                  : 'hover:bg-cork-200/20'}"
                role="button"
                tabindex="0"
                onclick={() => selectArtifact(mKey)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectArtifact(mKey);
                  }
                }}
              >
                <span class="flex-1 truncate text-sm font-medium text-cork-800"
                  >{artifact.name}</span
                >
                <span
                  class="inline-flex items-center gap-0.5 rounded-full bg-cork-300/40 px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap text-cork-600"
                >
                  <Icon class="size-2.5" />
                  {artifact.category}
                </span>
                <button
                  type="button"
                  class="flex size-5 shrink-0 cursor-pointer items-center justify-center transition-colors {picked
                    ? 'text-cork-700'
                    : 'text-cork-300 hover:text-cork-500'}"
                  onclick={(e) => {
                    e.stopPropagation();
                    togglePick(selectedBook!.slug, artifact.name);
                  }}
                >
                  <Bookmark class="size-3" fill={picked ? 'currentColor' : 'none'} />
                </button>
              </div>
            {/each}
          </div>

          <!-- Right: detail pane -->
          <div
            class="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-color:theme(--color-cork-300)_transparent] [scrollbar-width:thin]"
          >
            {#if selectedArtifactDetail}
              <h3 class="mb-1 font-display text-lg text-cork-800">{selectedArtifactDetail.name}</h3>
              <p class="mb-3 text-xs text-cork-600">{selectedArtifactDetail.description}</p>

              {#if selectedArtifactDetail.figures?.length}
                {#each selectedArtifactDetail.figures as fig, fi (fi)}
                  <img
                    src={fig}
                    alt="{selectedArtifactDetail.name} ({fi + 1})"
                    class="mb-2 max-h-64 max-w-xs rounded-lg border border-cork-300/50 object-contain shadow-sm"
                  />
                {/each}
              {:else if selectedArtifactDetail.figure}
                <img
                  src={selectedArtifactDetail.figure}
                  alt={selectedArtifactDetail.name}
                  class="mb-3 max-h-64 max-w-xs rounded-lg border border-cork-300/50 object-contain shadow-sm"
                />
              {/if}

              {#if selectedArtifactDetail.howTo && selectedArtifactDetail.howTo.length > 0}
                <p class="mb-1.5 text-[10px] font-bold tracking-wider text-cork-500 uppercase">
                  How to create
                </p>
                <ol class="list-decimal space-y-1 pl-4">
                  {#each selectedArtifactDetail.howTo as step, si (si)}
                    <li class="text-xs text-cork-700">{step}</li>
                  {/each}
                </ol>
              {/if}

              {#if !selectedArtifactDetail.figures?.length && !selectedArtifactDetail.figure && (!selectedArtifactDetail.howTo || selectedArtifactDetail.howTo.length === 0)}
                <p class="py-8 text-center text-sm text-cork-400 italic">
                  No figure or steps available
                </p>
              {/if}
            {:else}
              <p class="py-8 text-center text-sm text-cork-400 italic">
                Select an artifact to see details
              </p>
            {/if}
          </div>
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
</div>
