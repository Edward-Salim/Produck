<script lang="ts">
  import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
</script>

<div
  class="mx-auto max-w-7xl space-y-3 lg:max-w-[96rem] lg:space-y-4"
  role="status"
  aria-busy="true"
  aria-label="Loading financial tracker"
>
  <span class="sr-only">Loading financial data…</span>
  <div aria-hidden="true" class="space-y-4">
    <header class="mb-4 space-y-3 md:mb-6">
      <h1 class="font-display text-2xl text-cork-800 md:text-4xl">Financial Tracker</h1>
      <p class="text-sm text-cork-500">Track budgets, expenses and investments across accounts</p>
      <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Skeleton class="h-10 w-56 rounded-lg bg-cork-200/70 motion-reduce:animate-none" />
        <div class="flex gap-2">
          {#each [0, 1, 2] as month (month)}
            <Skeleton class="h-9 w-20 rounded-lg bg-cork-200/70 motion-reduce:animate-none" />
          {/each}
        </div>
      </div>
    </header>

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {#each [0, 1, 2, 3] as metric (metric)}
        <div class="loading-panel space-y-5">
          <div class="flex items-center justify-between gap-4">
            <Skeleton class="h-4 w-24 bg-cork-200/70 motion-reduce:animate-none" />
            <Skeleton class="size-8 rounded-lg bg-cork-200/70 motion-reduce:animate-none" />
          </div>
          <Skeleton class="h-8 w-3/4 bg-cork-200/70 motion-reduce:animate-none" />
        </div>
      {/each}
    </section>

    <section class="loading-panel space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-sm font-semibold text-cork-900 lg:text-base">Budget Performance</h2>
        <Skeleton class="h-7 w-48 bg-cork-200/70 motion-reduce:animate-none" />
      </div>
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-4 pb-2 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        {#each [0, 1, 2, 3] as column (column)}
          <Skeleton
            class={`h-3 w-2/3 bg-cork-200/60 motion-reduce:animate-none ${column === 3 ? 'hidden sm:block' : ''}`}
          />
        {/each}
      </div>
      {#each [0, 1, 2, 3, 4, 5, 6, 7] as row (row)}
        <div
          class="grid min-h-10 grid-cols-[2fr_1fr_1fr] items-center gap-4 sm:grid-cols-[2fr_1fr_1fr_1fr]"
        >
          <div class="flex items-center gap-3">
            <Skeleton
              class="size-7 shrink-0 rounded-lg bg-cork-200/60 motion-reduce:animate-none"
            />
            <Skeleton class="h-4 w-2/3 max-w-40 bg-cork-200/70 motion-reduce:animate-none" />
          </div>
          {#each [0, 1, 2] as value (value)}
            <Skeleton
              class={`h-4 w-3/4 bg-cork-200/60 motion-reduce:animate-none ${value === 2 ? 'hidden sm:block' : ''}`}
            />
          {/each}
        </div>
      {/each}
    </section>

    <section class="grid gap-3 lg:grid-cols-2">
      {#each ['Balance Reconciliation', 'Debt Detail'] as title (title)}
        <div class="loading-panel space-y-6">
          <h2 class="text-sm font-semibold text-cork-900 lg:text-base">{title}</h2>
          {#each [0, 1, 2] as row (row)}
            <div class="flex items-center justify-between gap-6 py-1">
              <Skeleton class="h-4 w-2/5 bg-cork-200/60 motion-reduce:animate-none" />
              <Skeleton class="h-5 w-1/4 bg-cork-200/70 motion-reduce:animate-none" />
            </div>
          {/each}
        </div>
      {/each}
    </section>
  </div>
</div>

<style>
  .loading-panel {
    border-radius: 1rem;
    background: var(--color-cork-50);
    padding: 1rem;
  }

  @media (min-width: 1024px) {
    .loading-panel {
      padding: 1.5rem;
    }
  }
</style>
