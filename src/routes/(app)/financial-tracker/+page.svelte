<script lang="ts">
  import FinancialTracker from './FinancialTracker.svelte';
  import FinancialTrackerSkeleton from './FinancialTrackerSkeleton.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Financial Tracker | Produck</title>
</svelte:head>

{#await data.trackerData}
  <FinancialTrackerSkeleton />
{:then trackerData}
  <FinancialTracker data={{ trackerData }} />
{:catch}
  <div
    class="mx-auto max-w-7xl rounded-2xl bg-cork-50 p-6 text-cork-800 lg:max-w-[96rem]"
    role="alert"
  >
    <h1 class="font-display text-2xl">Financial Tracker</h1>
    <p class="mt-2 text-sm text-cork-600">Your financial data could not be loaded.</p>
    <button
      type="button"
      class="mt-4 inline-block rounded-lg bg-cork-200 px-4 py-2 text-sm font-medium"
      onclick={() => window.location.reload()}>Try again</button
    >
  </div>
{/await}
